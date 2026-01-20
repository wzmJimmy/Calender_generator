(function () {
  if (!window.Utils) {
    console.error("[PdfGenerator] Utils module missing.");
    return;
  }

  const Utils = window.Utils;

  // Constants
  const DEFAULT_MARGIN_MM = 0; // No margins - calendar uses full page
  const MM_TO_PX = 3.779527559; // 1mm = 3.779527559 pixels at 96 DPI (for html2canvas)


  /**
   * Get paper dimensions in mm
   * @param {string} paperType - A4, Letter, or Legal
   * @param {string} orientation - portrait or landscape
   * @returns {{width: number, height: number}} Dimensions in mm
   */
  function getPaperDimensionsInMm(paperType, orientation) {
    const PreviewConfig = window.PreviewConfig;
    if (!PreviewConfig || !PreviewConfig.PAPER_DIMENSIONS) {
      // Fallback to A4 portrait
      return {
        width: 210,
        height: 297,
      };
    }

    const dims = PreviewConfig.PAPER_DIMENSIONS[paperType];
    if (!dims) {
      // Fallback to A4
      return {
        width: 210,
        height: 297,
      };
    }

    if (orientation === "landscape") {
      return {
        width: dims.height,
        height: dims.width,
      };
    }

    return {
      width: dims.width,
      height: dims.height,
    };
  }

  /**
   * Calculate page layout dimensions
   * @param {object} options - Layout options
   * @returns {object} Layout dimensions (all in mm)
   */
  function calculatePageLayout(options = {}) {
    const PreviewConfig = window.PreviewConfig;
    const previewConfig = PreviewConfig ? PreviewConfig.getState() : null;

    const paperType = previewConfig?.paperType || "A4";
    const orientation = previewConfig?.orientation || "portrait";
    const splitRatio = previewConfig?.splitRatio || 40;
    const marginMm = options.marginMm || DEFAULT_MARGIN_MM;

    // Get paper dimensions in mm
    const paperDims = getPaperDimensionsInMm(paperType, orientation);

    // Calculate usable area (full page, no margins)
    const usableWidth = paperDims.width;
    const usableHeight = paperDims.height;

    // Calculate image and calendar heights based on split ratio
    const imageHeightMm = (usableHeight * splitRatio) / 100;
    const calendarHeightMm = usableHeight - imageHeightMm;

    return {
      paperType,
      orientation,
      paperWidth: paperDims.width,
      paperHeight: paperDims.height,
      marginMm,
      usableWidth,
      usableHeight,
      imageHeightMm,
      calendarHeightMm,
      splitRatio,
      imageFitMode: previewConfig?.imageFitMode || "cover",
      layoutStyle: previewConfig?.layoutStyle || "apple",
    };
  }


  /**
   * Generate calendar image for PDF (reuses preview infrastructure)
   * @param {object} options - Calendar generation options
   * @returns {Promise<{dataUrl: string, heightMm: number}>} Data URL and actual height
   */
  async function generateCalendarImageForPdf(options) {
    const {
      year,
      monthIndex,
      startDay,
      language,
      country,
      layoutStyle,
      width,
      maxHeight, // Maximum height available (in pixels)
    } = options;

    // Render calendar using CalendarEngine
    if (!window.CalendarEngine) {
      console.error("[PdfGenerator] CalendarEngine not available");
      return null;
    }

    const calendarResult = window.CalendarEngine.renderMonth({
      year,
      monthIndex,
      startDay,
      language,
      country,
      layoutStyle,
    });

    if (!calendarResult || !calendarResult.element) {
      console.error("[PdfGenerator] Failed to render calendar");
      return null;
    }

    // Create temporary container with specified width (height will be measured)
    const tempContainer = document.createElement("div");
    tempContainer.style.cssText = `
      position: fixed;
      left: -10000px;
      top: 0;
      background: #ffffff;
      z-index: -1;
      width: ${width}px;
      overflow: visible;
      box-sizing: border-box;
    `;
    document.body.appendChild(tempContainer);

    // Clone calendar element and add to container
    const calendarClone = calendarResult.element.cloneNode(true);
    calendarClone.style.width = "100%";
    calendarClone.style.maxWidth = `${width}px`; // Ensure it doesn't exceed container width
    calendarClone.style.boxSizing = "border-box"; // Include padding/borders in width
    tempContainer.appendChild(calendarClone);

    // Wait for layout
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    // Wait for fonts (especially important for Chinese)
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Measure actual calendar height FIRST (before any constraints)
    // This gives us the natural height of the calendar
    let { height: naturalHeight, width: naturalWidth } = Utils.getCalendarDimensions(calendarClone);
    
    // Calculate scale factors for both width and height independently
    // This allows the calendar to fit the available space, even if aspect ratio changes
    let widthScale = 1;
    let heightScale = 1;
    
    // Calculate scale to fit width (scale to fill available space)
    if (naturalWidth !== width) {
      widthScale = width / naturalWidth;
    }
    
    // Calculate scale to fit height (scale to fill available space)
    if (naturalHeight !== maxHeight) {
      heightScale = maxHeight / naturalHeight;
    }
    
    // Declare variables for actual dimensions
    let actualHeight;
    let actualWidth;
    
    // Apply independent scaling to fit both dimensions (may change aspect ratio)
    // Use CSS transform with scaleX and scaleY separately
    if (widthScale !== 1 || heightScale !== 1) {
      calendarClone.style.transform = `scaleX(${widthScale}) scaleY(${heightScale})`;
      calendarClone.style.transformOrigin = "top left";
      
      // Calculate scaled dimensions manually (CSS transform doesn't change offsetHeight)
      actualHeight = naturalHeight * heightScale;
      actualWidth = naturalWidth * widthScale;
      
      // Wait for transform to apply
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    } else {
      actualHeight = naturalHeight;
      actualWidth = naturalWidth;
    }
    
    // Set container to fit the scaled calendar
    // CRITICAL: When using CSS transform scale, the element's bounding box doesn't change
    // The calendar element still occupies naturalHeight space, but visually appears scaled
    // We need to set container to the SCALED visual size and clip overflow
    const needsScaling = widthScale !== 1 || heightScale !== 1;
    
    if (needsScaling) {
      // For scaled calendars: container should be the scaled visual size
      // The calendar element will visually appear scaled, but its box is still natural size
      // Use overflow: hidden to clip the parts that extend beyond the container
      tempContainer.style.height = `${actualHeight}px`; // Scaled visual height
      tempContainer.style.width = `${actualWidth}px`; // Scaled visual width (may differ from target width)
      tempContainer.style.overflow = "hidden"; // CRITICAL: Clip overflow from transform
      tempContainer.style.position = "relative"; // Ensure clipping works
    } else {
      // For non-scaled calendars: use natural height
      tempContainer.style.height = `${actualHeight}px`;
      tempContainer.style.width = `${width}px`;
      tempContainer.style.overflow = "visible";
    }
    
    // Wait for layout to settle
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
    
    // For scaled calendars, we already have the correct height
    // For non-scaled, verify the actual rendered height
    if (!needsScaling) {
      const finalDims = Utils.getCalendarDimensions(calendarClone);
      actualHeight = finalDims.height;
      actualWidth = finalDims.width;
      
      // Update container to final measured height
      tempContainer.style.height = `${actualHeight}px`;
    }
    // For scaled calendars, actualHeight and actualWidth are already correct (natural * scale)

    // Generate image using html2canvas
    if (typeof window.html2canvas !== "function") {
      console.error("[PdfGenerator] html2canvas not available");
      document.body.removeChild(tempContainer);
      return null;
    }

    try {
      // Before capturing, convert any image URLs in the calendar to data URLs
      // This prevents CORS/tainted canvas issues
      const images = tempContainer.querySelectorAll("img");
      const imagePromises = [];
      for (const img of images) {
        if (img.src && !img.src.startsWith("data:")) {
          const promise = Utils.convertImageToDataUrl(img.src)
            .then((dataUrl) => {
              img.src = dataUrl;
              // Wait for image to load
              return new Promise((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = resolve;
                  img.onerror = resolve; // Continue even if image fails
                  setTimeout(resolve, 2000); // Timeout after 2 seconds
                }
              });
            })
            .catch((err) => {
              console.warn("[PdfGenerator] Failed to convert image, removing it:", err);
              // Remove the image if conversion fails to avoid tainted canvas
              img.style.display = "none";
            });
          imagePromises.push(promise);
        }
      }
      
      // Wait for all images to be converted and loaded
      await Promise.all(imagePromises);
      
      // Wait a bit more for layout to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Ensure we have valid dimensions
      // Use the actual measured height (which may be scaled down if it exceeded maxHeight)
      const canvasWidth = Math.max(1, Math.round(width));
      const canvasHeight = Math.max(1, Math.round(actualHeight));
      
      const canvas = await window.html2canvas(tempContainer, {
        backgroundColor: "#ffffff",
        scale: 1.5, // Reduced from 2 for smaller file size (still good quality)
        logging: false,
        useCORS: true,
        width: canvasWidth,
        height: canvasHeight,
        windowWidth: canvasWidth,
        windowHeight: canvasHeight,
        allowTaint: false, // Must be false to use toDataURL - we convert images to data URLs first
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Ensure the cloned container has the correct dimensions and overflow
          const clonedContainer = clonedDoc.querySelector(`[style*="left: -10000px"]`);
          if (clonedContainer) {
            clonedContainer.style.width = `${canvasWidth}px`;
            clonedContainer.style.height = `${canvasHeight}px`;
            // Preserve overflow setting for scaled calendars
            if (needsScaling) {
              clonedContainer.style.overflow = "hidden";
            }
          }
        },
      });

      // Use JPEG instead of PNG for smaller file size (calendar doesn't need transparency)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      document.body.removeChild(tempContainer);
      
      // Convert actual height from pixels to mm
      // actualHeight is in pixels, divide by MM_TO_PX to get mm
      const actualHeightMm = actualHeight / MM_TO_PX;
      
      return {
        dataUrl,
        heightMm: actualHeightMm,
      };
    } catch (error) {
      console.error("[PdfGenerator] Error generating calendar image:", error);
      document.body.removeChild(tempContainer);
      return null;
    }
  }

  /**
   * Process image for PDF (resize and apply fit mode)
   * @param {string} imageDataUrl - Image data URL
   * @param {number} targetWidthMm - Target width in mm
   * @param {number} targetHeightMm - Target height in mm
   * @param {string} fitMode - cover, fill, contain, none
   * @returns {Promise<{dataUrl: string, widthMm: number, heightMm: number}>}
   */
  async function processImageForPdf(imageDataUrl, targetWidthMm, targetHeightMm, fitMode) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let drawWidth, drawHeight, x, y;

        // Convert mm to pixels for canvas (reduced scale for smaller file size)
        const scale = 1.5; // Reduced from 2 for compression
        const targetWidthPx = targetWidthMm * MM_TO_PX * scale;
        const targetHeightPx = targetHeightMm * MM_TO_PX * scale;

        switch (fitMode) {
          case "fill":
            // Fill entire area, may distort
            drawWidth = targetWidthPx;
            drawHeight = targetHeightPx;
            x = 0;
            y = 0;
            break;

          case "contain":
            // Fit within area, maintain aspect ratio
            const containRatio = Math.min(
              targetWidthPx / img.width,
              targetHeightPx / img.height
            );
            drawWidth = img.width * containRatio;
            drawHeight = img.height * containRatio;
            x = (targetWidthPx - drawWidth) / 2;
            y = (targetHeightPx - drawHeight) / 2;
            break;

          case "none":
            // Use original size, center it
            drawWidth = img.width;
            drawHeight = img.height;
            x = (targetWidthPx - drawWidth) / 2;
            y = (targetHeightPx - drawHeight) / 2;
            break;

          case "cover":
          default:
            // Cover entire area, maintain aspect ratio, may crop
            const coverRatio = Math.max(
              targetWidthPx / img.width,
              targetHeightPx / img.height
            );
            drawWidth = img.width * coverRatio;
            drawHeight = img.height * coverRatio;
            x = (targetWidthPx - drawWidth) / 2;
            y = (targetHeightPx - drawHeight) / 2;
            break;
        }

        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;

        // Fill with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);

        // Draw image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // Reduced quality for smaller file size

        resolve({
          dataUrl,
          widthMm: targetWidthMm,
          heightMm: targetHeightMm,
        });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageDataUrl;
    });
  }

  /**
   * Generate PDF with all 12 months
   * @param {Function} progressCallback - Callback for progress updates (monthIndex, total)
   * @returns {Promise<Blob>} PDF blob
   */
  async function generatePdf(progressCallback) {
    // Check dependencies
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF library not available");
    }

    // Get configuration
    const ConfigForm = window.ConfigForm;
    const ImageHandler = window.ImageHandler;
    const PreviewConfig = window.PreviewConfig;

    if (!ConfigForm || !ImageHandler || !PreviewConfig) {
      throw new Error("Required modules not available");
    }

    const config = ConfigForm.getState();
    const images = ImageHandler.getImages();
    const previewConfig = PreviewConfig.getState();

    // Calculate page layout
    const layout = calculatePageLayout();

    // Create PDF document
    const { jsPDF } = window.jspdf;
    
    // Map paper type to jsPDF format
    const formatMap = {
      "A4": "a4",
      "Letter": "letter",
      "Legal": "legal",
    };
    const pdfFormat = formatMap[layout.paperType] || "a4";
    
    const doc = new jsPDF({
      orientation: layout.orientation === "landscape" ? "landscape" : "portrait",
      unit: "mm",
      format: pdfFormat,
      compress: true, // Enable PDF compression
    });

    // Set PDF metadata
    doc.setProperties({
      title: `Calendar ${config.year}`,
      subject: "Generated calendar",
      author: "Calendar PDF Generator",
      keywords: "calendar, " + config.year,
    });

    // Generate each month
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      if (progressCallback) {
        progressCallback(monthIndex + 1, 12);
      }

      // Add new page (except for first month)
      if (monthIndex > 0) {
        doc.addPage();
      }

      // Get month image
      const monthImage = images[monthIndex];
      let imageDataUrl = monthImage?.asset?.dataUrl || monthImage?.asset?.url;

      // Convert to data URL if it's a file path (to avoid CORS issues)
      if (imageDataUrl && !imageDataUrl.startsWith("data:")) {
        try {
          imageDataUrl = await Utils.convertImageToDataUrl(imageDataUrl);
          // Verify it's now a data URL
          if (!imageDataUrl.startsWith("data:")) {
            throw new Error("Conversion did not produce a data URL");
          }
        } catch (error) {
          console.error(`[PdfGenerator] Failed to convert image for month ${monthIndex + 1}:`, error);
          // Skip this image if conversion fails
          imageDataUrl = null;
        }
      }

      // Process and add image (only if we have a valid data URL)
      if (imageDataUrl && imageDataUrl.startsWith("data:")) {
        try {
          const imageLayout = await processImageForPdf(
            imageDataUrl,
            layout.usableWidth,
            layout.imageHeightMm,
            layout.imageFitMode
          );

          // Add image to PDF (jsPDF uses mm when unit: "mm" is set)
          // No margins - image starts at top-left corner (0, 0)
          doc.addImage(
            imageLayout.dataUrl,
            "JPEG",
            0, // x position (no margin)
            0, // y position (no margin)
            imageLayout.widthMm,
            imageLayout.heightMm
          );
        } catch (error) {
          console.error(`[PdfGenerator] Failed to process image for month ${monthIndex + 1}:`, error);
          // Continue without image
        }
      } else if (imageDataUrl) {
        console.warn(`[PdfGenerator] Skipping image for month ${monthIndex + 1}: not a valid data URL`);
      }

      // Generate calendar image (convert mm to pixels for html2canvas)
      const calendarWidthPx = Math.round(layout.usableWidth * MM_TO_PX);
      const maxCalendarHeightPx = Math.round(layout.calendarHeightMm * MM_TO_PX);

      const calendarImageResult = await generateCalendarImageForPdf({
        year: config.year,
        monthIndex,
        startDay: config.startDay,
        language: config.language,
        country: config.country,
        layoutStyle: layout.layoutStyle,
        width: calendarWidthPx,
        maxHeight: maxCalendarHeightPx, // Maximum available height
      });

      if (calendarImageResult && calendarImageResult.dataUrl) {
        // Calculate position for calendar (below image)
        // No margins - image starts at 0, so calendar starts right below it
        const imageBottom = layout.imageHeightMm;
        
        // Use the full calendar height from layout (this is the available space)
        // The calendar image was already scaled to fit this space in generateCalendarImageForPdf
        // We use layout.calendarHeightMm to ensure we fill the entire available space
        const calendarHeightMm = layout.calendarHeightMm;
        
        // Ensure we have valid dimensions
        if (calendarHeightMm > 0 && layout.usableWidth > 0) {
          // Add calendar image to PDF (using JPEG format for smaller file size)
          // No margins - calendar starts at left edge (x=0) and below image
          // Use full calendarHeightMm to eliminate blank space (calendar was scaled to fit this)
          doc.addImage(
            calendarImageResult.dataUrl,
            "JPEG", // Changed from PNG to JPEG for compression
            0, // x position (no margin)
            imageBottom, // y position (below image)
            layout.usableWidth,
            calendarHeightMm // Use full available height (calendar was scaled to fit this)
          );
        } else {
          console.error(`[PdfGenerator] Invalid calendar dimensions for month ${monthIndex + 1}: width=${layout.usableWidth}mm, height=${calendarHeightMm}mm`);
        }
      }
    }

    // Return PDF as blob
    return doc.output("blob");
  }

  /**
   * Download PDF
   */
  async function downloadPdf() {
    const statusEl = Utils.qs("#download-status");
    const generateBtn = Utils.qs("#generate-pdf-btn");

    if (!statusEl || !generateBtn) {
      console.error("[PdfGenerator] Download UI elements not found");
      return;
    }

    // Update UI
    statusEl.textContent = "Preparing PDF generation...";
    statusEl.setAttribute("data-status", "loading");
    generateBtn.disabled = true;

    try {
      // Get year for filename
      const ConfigForm = window.ConfigForm;
      const config = ConfigForm ? ConfigForm.getState() : null;
      const year = config?.year || new Date().getFullYear();

      // Generate PDF with progress updates
      const pdfBlob = await generatePdf((current, total) => {
        statusEl.textContent = `Generating page ${current}/${total}...`;
      });

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `calendar-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Success message
      statusEl.textContent = `PDF generated successfully! (calendar-${year}.pdf)`;
      statusEl.setAttribute("data-status", "success");
    } catch (error) {
      console.error("[PdfGenerator] Error generating PDF:", error);
      let errorMessage = error.message;
      
      // Provide helpful message for file:// protocol issues
      if (window.location.protocol === "file:" && errorMessage.includes("Canvas conversion failed")) {
        errorMessage = "Browser security restrictions prevent PDF generation from file:// protocol. " +
          "Please use a local web server instead. " +
          "Run: python -m http.server 8000 (or npx serve) in the project directory, then open http://localhost:8000";
      }
      
      statusEl.textContent = `Error generating PDF: ${errorMessage}`;
      statusEl.setAttribute("data-status", "error");
    } finally {
      generateBtn.disabled = false;
      // Clear status after 5 seconds
      setTimeout(() => {
        statusEl.textContent = "";
        statusEl.removeAttribute("data-status");
      }, 5000);
    }
  }

  const PdfGenerator = {
    init() {
      console.info("[PdfGenerator] Initialized.");
    },
    downloadDraft() {
      downloadPdf();
    },
    generate: generatePdf,
    download: downloadPdf,
  };

  // Expose internals for testing (when running in Node.js test environment)
  if (typeof process !== "undefined") {
    PdfGenerator._internals = {
      getPaperDimensionsInMm,
      calculatePageLayout,
      processImageForPdf,
    };
  }

  window.PdfGenerator = PdfGenerator;
})();
