(function () {
  const Utils = {
    qs(selector, scope = document) {
      return scope.querySelector(selector);
    },
    qsa(selector, scope = document) {
      return Array.from(scope.querySelectorAll(selector));
    },
    clampYear(year) {
      const min = 2020;
      const max = 2030;
      return Math.min(Math.max(year, min), max);
    },
    getCurrentYear() {
      return new Date().getFullYear();
    },
    formatISODate(date) {
      if (!(date instanceof Date)) {
        return null;
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatBytes(bytes) {
      if (!bytes || bytes === 0) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
      );
      const value = bytes / Math.pow(1024, exponent);
      return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    },
    preventDefault(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    chunkArray(array, chunkSize) {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    },
    debounce(func, wait) {
      let timeout = null;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    /**
     * Get accurate calendar dimensions
     * @param {HTMLElement} calendarElement - Calendar element
     * @returns {{width: number, height: number}} Dimensions in pixels
     */
    getCalendarDimensions(calendarElement) {
      return {
        width: calendarElement.offsetWidth || 400,
        height: Math.max(
          calendarElement.scrollHeight || calendarElement.offsetHeight,
          calendarElement.offsetHeight || 600
        ),
      };
    },
    /**
     * Wait for layout and fonts to load
     * @param {number} waitTime - Additional wait time in ms
     * @returns {Promise<void>}
     */
    async waitForLayout(waitTime = 100) {
      // Wait for fonts to load, especially important for Chinese characters
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      
      // Force a reflow
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    },
    /**
     * Convert an Image element to data URL using canvas
     * @param {HTMLImageElement} img - Loaded image element
     * @returns {string} Data URL
     */
    _imageToDataUrl(img) {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.9);
    },

    /**
     * Load an image and convert it to data URL using Image element
     * @param {string} imageUrl - Image URL
     * @param {object} options - Options for loading
     * @param {boolean} options.setCrossOrigin - Whether to set crossOrigin attribute
     * @param {string|Function} options.errorMessage - Custom error message for canvas conversion failures (can be a function that receives the error)
     * @returns {Promise<string>} Data URL of the image
     */
    _loadImageToDataUrl(imageUrl, options = {}) {
      const { setCrossOrigin = false, errorMessage } = options;
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        if (setCrossOrigin) {
          // Only set crossOrigin for cross-origin http/https images
          if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            try {
              const url = new URL(imageUrl, window.location.href);
              if (url.origin !== window.location.origin) {
                img.crossOrigin = "anonymous";
              }
            } catch (e) {
              // Invalid URL, skip crossOrigin
            }
          }
        }
        
        img.onload = () => {
          try {
            const dataUrl = this._imageToDataUrl(img);
            resolve(dataUrl);
          } catch (error) {
            const errorMsg = typeof errorMessage === "function"
              ? errorMessage(error)
              : (errorMessage || `Canvas conversion failed: ${error.message}. Image may be from a different origin.`);
            reject(new Error(errorMsg));
          }
        };

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${imageUrl}`));
        };

        img.src = imageUrl;
      });
    },

    /**
     * Convert image URL/path to data URL to avoid CORS issues
     * For file:// protocol, we use Image element without crossOrigin (same-origin)
     * For http/https, we try fetch first, then Image element
     * @param {string} imageUrl - Image URL or path
     * @returns {Promise<string>} Data URL of the image
     */
    async convertImageToDataUrl(imageUrl) {
      // If it's already a data URL, return it
      if (imageUrl.startsWith("data:")) {
        return imageUrl;
      }

      const isFileProtocol = window.location.protocol === "file:";

      // For file:// protocol, resolve relative paths to absolute
      if (isFileProtocol && !imageUrl.startsWith("file://") && !imageUrl.startsWith("/")) {
        // Resolve relative path to absolute file:// URL
        const basePath = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
        imageUrl = new URL(imageUrl, basePath).href;
      }

      // For file:// protocol, we MUST use Image element without crossOrigin
      // XMLHttpRequest and fetch don't work with file://
      // Same-origin file:// images won't taint the canvas if we don't set crossOrigin
      if (isFileProtocol) {
        const baseErrorMessage = `Canvas conversion failed due to browser security restrictions. ` +
          `For file:// protocol, please use a local web server. ` +
          `You can run: python -m http.server 8000 (or npx serve) in the project directory.`;
        
        return this._loadImageToDataUrl(imageUrl, {
          setCrossOrigin: false,
          errorMessage: (error) => `${baseErrorMessage} Original error: ${error.message}`,
        });
      }

      // For http/https, try fetch first (most reliable)
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to convert blob to data URL"));
            reader.readAsDataURL(blob);
          });
        }
      } catch (fetchError) {
        // Fetch failed, try using Image element as fallback
        console.warn("[Utils] Fetch failed, trying Image element:", fetchError);
      }

      // Fallback: Use Image element (for http/https with CORS issues)
      return this._loadImageToDataUrl(imageUrl, {
        setCrossOrigin: true,
      });
    },
  };

  window.Utils = Utils;
})();
