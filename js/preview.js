(function () {
  if (!window.Utils || !window.CalendarEngine) {
    console.error("[Preview] Required dependencies missing.");
    return;
  }

  const Utils = window.Utils;
  const CalendarEngine = window.CalendarEngine;

  const state = {
    currentMonthIndex: 0, // 0-11
    initialized: false,
  };

  let previewGridEl;
  let prevBtn;
  let nextBtn;
  let monthSelector;
  let currentConfig;
  let currentImages;
  let renderCurrentMonthDebounced;
  let previewConfig;
  let previewConfigToggle;
  let previewConfigContent;
  let previewConfigControls;
  let calendarImageCache = new Map(); // Cache for calendar images


  // Clean up temporary container
  function cleanupTempContainer(container) {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }

  // Remove loading indicator
  function removeLoadingIndicator(indicator, body) {
    if (indicator && indicator.parentNode === body) {
      body.removeChild(indicator);
    }
  }

  function init() {
    if (!CalendarEngine) {
      console.warn("[Preview] CalendarEngine not available.");
      return;
    }

    CalendarEngine.init();

    previewGridEl = Utils.qs(".preview__grid");
    prevBtn = Utils.qs("#preview-prev");
    nextBtn = Utils.qs("#preview-next");
    monthSelector = Utils.qs("#preview-month-selector");
    previewConfigToggle = Utils.qs("#preview-config-toggle");
    previewConfigContent = Utils.qs("#preview-config-content");

    if (!previewGridEl) {
      console.warn("[Preview] Preview grid element not found.");
      return;
    }

    bindPaginationControls();
    
    // Wait for PreviewConfig to be available
    if (window.PreviewConfig) {
      bindPreviewConfigControls();
      window.PreviewConfig.subscribe(handlePreviewConfigChange);
      previewConfig = window.PreviewConfig.getState();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.PreviewConfig) {
          bindPreviewConfigControls();
          window.PreviewConfig.subscribe(handlePreviewConfigChange);
          previewConfig = window.PreviewConfig.getState();
        }
      }, 100);
    }
    
    updateMonthSelectorOptions();
    renderCurrentMonthDebounced = Utils.debounce(renderCurrentMonth, 300);
    state.initialized = true;

    // Initial render will be triggered when step 2 is shown
    if (window.StepNavigation) {
      window.StepNavigation.subscribe(handleStepChange);
    }
  }

  function handleStepChange({ step }) {
    if (step === 2 && state.initialized) {
      // Step 2 (Preview) is shown, render the preview
      renderCurrentMonth();
    }
  }

  function bindPaginationControls() {
    if (prevBtn) {
      prevBtn.addEventListener("click", () => navigateMonth(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => navigateMonth(1));
    }
    if (monthSelector) {
      monthSelector.addEventListener("change", (e) => {
        const monthIndex = parseInt(e.target.value, 10);
        if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
          setCurrentMonth(monthIndex);
        }
      });
      updateMonthSelectorOptions();
    }
  }

  function bindPreviewConfigControls() {
    // Toggle button
    if (previewConfigToggle) {
      previewConfigToggle.addEventListener("click", () => {
        const isExpanded = previewConfigToggle.getAttribute("aria-expanded") === "true";
        previewConfigToggle.setAttribute("aria-expanded", !isExpanded);
        if (previewConfigContent) {
          previewConfigContent.setAttribute("aria-hidden", isExpanded);
        }
      });
    }

    // Split ratio slider
    const splitRatioSlider = Utils.qs("#preview-split-ratio");
    const splitRatioValue = Utils.qs("#preview-split-ratio-value");
    if (splitRatioSlider && splitRatioValue) {
      splitRatioSlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value, 10);
        splitRatioValue.textContent = `${value}%`;
        if (window.PreviewConfig) {
          window.PreviewConfig.setState({ splitRatio: value });
        }
      });
    }

    // Paper type
    const paperTypeSelect = Utils.qs("#preview-paper-type");
    if (paperTypeSelect) {
      paperTypeSelect.addEventListener("change", (e) => {
        if (window.PreviewConfig) {
          window.PreviewConfig.setState({ paperType: e.target.value });
        }
      });
    }

    // Orientation
    const orientationSelect = Utils.qs("#preview-orientation");
    if (orientationSelect) {
      orientationSelect.addEventListener("change", (e) => {
        if (window.PreviewConfig) {
          window.PreviewConfig.setState({ orientation: e.target.value });
        }
      });
    }

    // Image fit mode
    const imageFitSelect = Utils.qs("#preview-image-fit");
    if (imageFitSelect) {
      imageFitSelect.addEventListener("change", (e) => {
        if (window.PreviewConfig) {
          window.PreviewConfig.setState({ imageFitMode: e.target.value });
        }
      });
    }

    // Layout style
    const layoutStyleSelect = Utils.qs("#preview-layout-style");
    if (layoutStyleSelect) {
      layoutStyleSelect.addEventListener("change", (e) => {
        if (window.PreviewConfig) {
          window.PreviewConfig.setState({ layoutStyle: e.target.value });
        }
      });
    }

    // Initialize controls from PreviewConfig state
    if (window.PreviewConfig) {
      const config = window.PreviewConfig.getState();
      if (splitRatioSlider) splitRatioSlider.value = config.splitRatio;
      if (splitRatioValue) splitRatioValue.textContent = `${config.splitRatio}%`;
      if (paperTypeSelect) paperTypeSelect.value = config.paperType;
      if (orientationSelect) orientationSelect.value = config.orientation;
      if (imageFitSelect) imageFitSelect.value = config.imageFitMode;
      if (layoutStyleSelect) layoutStyleSelect.value = config.layoutStyle;
      updatePaperIndicator();
    }
  }

  function handlePreviewConfigChange(newConfig) {
    previewConfig = newConfig;
    updatePaperIndicator();
    if (renderCurrentMonthDebounced) {
      renderCurrentMonthDebounced();
    }
  }

  function updatePaperIndicator() {
    const indicator = Utils.qs("#preview-paper-indicator");
    if (indicator && window.PreviewConfig) {
      const dims = window.PreviewConfig.getPaperDimensionsString();
      indicator.textContent = dims;
    }
  }

  function updateMonthSelectorOptions() {
    if (!monthSelector) return;
    const config = getConfig();
    const language = config.language || "en";
    const LocalizationData = window.LocalizationData;

    // Update options with localized month names
    for (let i = 0; i < 12; i++) {
      const option = monthSelector.options[i];
      if (option) {
        const monthName = LocalizationData?.getMonthName?.(language, i) || 
                         ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"][i];
        option.textContent = monthName;
      }
    }
  }

  function navigateMonth(delta) {
    const newIndex = state.currentMonthIndex + delta;
    if (newIndex >= 0 && newIndex <= 11) {
      setCurrentMonth(newIndex);
    }
  }

  function setCurrentMonth(monthIndex) {
    if (monthIndex < 0 || monthIndex > 11) return;
    state.currentMonthIndex = monthIndex;
    renderCurrentMonth();
    updatePaginationControls();
  }

  function updatePaginationControls() {
    if (prevBtn) {
      prevBtn.disabled = state.currentMonthIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = state.currentMonthIndex === 11;
    }
    if (monthSelector) {
      monthSelector.value = String(state.currentMonthIndex);
    }
  }

  function getConfig() {
    if (window.ConfigForm && window.ConfigForm.getState) {
      return window.ConfigForm.getState();
    }
    return {
      year: Utils.getCurrentYear(),
      startDay: "sunday",
      country: "US",
      language: "en",
    };
  }

  function getImages() {
    if (window.ImageHandler && window.ImageHandler.getImages) {
      return window.ImageHandler.getImages();
    }
    return [];
  }

  async function renderCurrentMonth() {
    if (!previewGridEl || !state.initialized) return;

    currentConfig = getConfig();
    currentImages = getImages();

    // Get preview config (with defaults)
    const config = previewConfig || (window.PreviewConfig ? window.PreviewConfig.getState() : null);
    const splitRatio = config?.splitRatio || 40;
    const imageFitMode = config?.imageFitMode || "cover";
    const layoutStyle = config?.layoutStyle || CalendarEngine.DEFAULT_LAYOUT_STYLE;
    const aspectRatio = config && window.PreviewConfig ? window.PreviewConfig.getPaperAspectRatio() : 0.707; // Default A4 portrait

    const monthIndex = state.currentMonthIndex;
    const imageData = currentImages[monthIndex] || null;

    // Clear existing content
    previewGridEl.innerHTML = "";

    // Create preview card
    const card = document.createElement("article");
    card.className = "preview-card";
    
    // Apply aspect ratio to card (CSS aspect-ratio expects width/height)
    // aspectRatio from getPaperAspectRatio() is already width/height
    card.style.aspectRatio = `${aspectRatio}`;

    // Add image container with split ratio
    const imageContainer = document.createElement("div");
    imageContainer.className = "preview-card__image";
    imageContainer.style.height = `${splitRatio}%`;
    imageContainer.style.flexShrink = "0";
    
    const img = document.createElement("img");
    img.alt = `${imageData?.label || "Month"} preview image`;

    if (imageData && imageData.asset) {
      // Use dataUrl if available (uploaded image), otherwise use url (default)
      img.src = imageData.asset.dataUrl || imageData.asset.url || "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = imageFitMode;
    } else {
      // Fallback placeholder
      imageContainer.style.background = "#e2e8f0";
      imageContainer.style.display = "flex";
      imageContainer.style.alignItems = "center";
      imageContainer.style.justifyContent = "center";
      imageContainer.textContent = "No image";
    }

    if (img.src) {
      imageContainer.appendChild(img);
    }
    card.appendChild(imageContainer);

    // Add calendar body with remaining height
    const body = document.createElement("div");
    body.className = "preview-card__body";
    body.style.height = `${100 - splitRatio}%`;
    body.style.flex = "1";
    body.style.overflow = "hidden"; // Changed from "auto" to "hidden" for image display
    body.style.position = "relative";

    // Show loading state
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "preview-card__loading";
    loadingIndicator.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      color: var(--muted, #475467);
      font-size: 0.9rem;
    `;
    loadingIndicator.textContent = "Generating calendar preview...";
    body.appendChild(loadingIndicator);

    let calendarResult = null;
    try {
      // Render calendar using CalendarEngine with selected layout style
      calendarResult = CalendarEngine.renderMonth({
        year: currentConfig.year,
        monthIndex: monthIndex,
        startDay: currentConfig.startDay,
        language: currentConfig.language,
        country: currentConfig.country,
        layoutStyle: layoutStyle,
      });

      if (!calendarResult || !calendarResult.element) {
        // Fallback if rendering fails
        loadingIndicator.textContent = "Calendar preview unavailable.";
        card.appendChild(body);
        previewGridEl.appendChild(card);
        return;
      }

      // First, append body to card to get actual container width
      card.appendChild(body);
      previewGridEl.appendChild(card);
      
      // Wait for layout to calculate body width
      await Utils.waitForLayout(50);
      const bodyWidth = body.offsetWidth || 400;
      
      // Create temporary container with the actual body width
      const tempMeasureContainer = document.createElement("div");
      tempMeasureContainer.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        background: #ffffff;
        z-index: -1;
        width: ${bodyWidth}px;
      `;
      document.body.appendChild(tempMeasureContainer);
      
      const measureCalendar = calendarResult.element.cloneNode(true);
      tempMeasureContainer.appendChild(measureCalendar);
      
      // Wait for layout and fonts
      await Utils.waitForLayout(100);
      
      // Get initial dimensions
      let { height: calendarHeight } = Utils.getCalendarDimensions(measureCalendar);
      
      // Set explicit dimensions to match actual content
      tempMeasureContainer.style.height = `${calendarHeight}px`;
      tempMeasureContainer.style.overflow = "visible";
      measureCalendar.style.width = "100%";
      
      // Wait and re-measure after final layout
      await Utils.waitForLayout(50);
      calendarHeight = Utils.getCalendarDimensions(measureCalendar).height;
      tempMeasureContainer.style.height = `${calendarHeight}px`;
      
      // Generate calendar image and replace HTML with image
      generateCalendarImage(tempMeasureContainer, {
        year: currentConfig.year,
        monthIndex: monthIndex,
        layoutStyle: layoutStyle,
        splitRatio: splitRatio,
        imageFitMode: imageFitMode,
        language: currentConfig.language,
        startDay: currentConfig.startDay,
        country: currentConfig.country,
      })
        .then((imageDataUrl) => {
          cleanupTempContainer(tempMeasureContainer);
          removeLoadingIndicator(loadingIndicator, body);

          if (imageDataUrl && imageDataUrl !== "data:,") {
            // Create and display the calendar image
            const calendarImg = document.createElement("img");
            calendarImg.src = imageDataUrl;
            calendarImg.alt = `Calendar for ${currentConfig.year} month ${monthIndex + 1}`;
            calendarImg.style.cssText = `
              width: 100%;
              height: 100%;
              object-fit: fill;
              display: block;
            `;
            calendarImg.onerror = () => {
              console.warn("[Preview] Image load failed, falling back to HTML");
              body.removeChild(calendarImg);
              body.appendChild(calendarResult.element);
            };
            body.appendChild(calendarImg);
          } else {
            // Fallback to HTML if image generation fails
            console.warn("[Preview] Image generation failed, falling back to HTML");
            body.appendChild(calendarResult.element);
          }
        })
        .catch((error) => {
          console.error("[Preview] Error generating calendar image:", error);
          cleanupTempContainer(tempMeasureContainer);
          removeLoadingIndicator(loadingIndicator, body);
          body.appendChild(calendarResult.element);
        });

    } catch (error) {
      console.error("[Preview] Error rendering calendar:", error);
      loadingIndicator.textContent = "Error rendering calendar.";
    }

    card.appendChild(body);
    previewGridEl.appendChild(card);
  }

  /**
   * Generate calendar image using html2canvas
   * @param {HTMLElement} containerElement - Container with calendar DOM element
   * @param {object} options - Options for caching key
   * @returns {Promise<string>} Data URL of the calendar image
   */
  async function generateCalendarImage(containerElement, options = {}) {
    if (!containerElement || typeof window.html2canvas !== "function") {
      return null;
    }

    // Get initial dimensions from the container
    const { width: initialWidth, height: initialHeight } = Utils.getCalendarDimensions(containerElement);

    // Create cache key (include dimensions and config that affect rendering)
    const cacheKey = JSON.stringify({
      year: options.year,
      monthIndex: options.monthIndex,
      layoutStyle: options.layoutStyle,
      language: options.language || "en",
      startDay: options.startDay || "sunday",
      country: options.country || "US",
      width: Math.round(initialWidth),
      height: Math.round(initialHeight),
    });

    // Check cache
    if (calendarImageCache.has(cacheKey)) {
      return calendarImageCache.get(cacheKey);
    }

    try {
      // Wait for fonts and layout to be ready
      await Utils.waitForLayout(300);
      
      // Re-measure after waiting (dimensions might have changed)
      const calendarElement = containerElement.querySelector('.calendar-month') || containerElement.firstElementChild;
      const finalWidth = containerElement.offsetWidth || initialWidth;
      const finalHeight = calendarElement 
        ? Utils.getCalendarDimensions(calendarElement).height
        : Utils.getCalendarDimensions(containerElement).height;

      // Generate canvas with proper dimensions
      const canvas = await window.html2canvas(containerElement, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        width: finalWidth,
        height: finalHeight,
        windowWidth: finalWidth,
        windowHeight: finalHeight,
        allowTaint: false,
        foreignObjectRendering: false, // Better compatibility
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png", 0.95);

      // Cache the result
      calendarImageCache.set(cacheKey, dataUrl);

      // Limit cache size (keep last 12 entries)
      if (calendarImageCache.size > 12) {
        const firstKey = calendarImageCache.keys().next().value;
        calendarImageCache.delete(firstKey);
      }

      return dataUrl;
    } catch (error) {
      console.error("[Preview] Error generating calendar image:", error);
      return null;
    }
  }

  /**
   * Clear calendar image cache
   */
  function clearCalendarImageCache() {
    calendarImageCache.clear();
  }

  function subscribeToConfigChanges() {
    if (window.ConfigForm && window.ConfigForm.subscribe) {
      window.ConfigForm.subscribe((config) => {
        // Check if any calendar-affecting config changed
        const configChanged = currentConfig && (
          currentConfig.language !== config.language ||
          currentConfig.startDay !== config.startDay ||
          currentConfig.country !== config.country ||
          currentConfig.year !== config.year
        );
        
        currentConfig = config;
        if (state.initialized) {
          updateMonthSelectorOptions();
          // Clear cache if calendar-affecting config changed
          if (configChanged) {
            clearCalendarImageCache();
          }
          // Debounce re-rendering to avoid excessive updates
          if (renderCurrentMonthDebounced) {
            renderCurrentMonthDebounced();
          }
        }
      });
    }
  }

  function subscribeToImageChanges() {
    if (window.ImageHandler && window.ImageHandler.subscribe) {
      window.ImageHandler.subscribe((images) => {
        currentImages = images;
        if (state.initialized) {
          renderCurrentMonth();
        }
      });
    }
  }

  // Initialize subscriptions after a short delay to ensure other modules are ready
  setTimeout(() => {
    subscribeToConfigChanges();
    subscribeToImageChanges();
  }, 100);

  const Preview = {
    init,
    renderCurrentMonth,
    setCurrentMonth,
    getCurrentMonth() {
      return state.currentMonthIndex;
    },
    generateCalendarImage,
    clearCalendarImageCache,
  };

  window.Preview = Preview;
})();

