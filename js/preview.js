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

    if (!previewGridEl) {
      console.warn("[Preview] Preview grid element not found.");
      return;
    }

    bindPaginationControls();
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

  function renderCurrentMonth() {
    if (!previewGridEl || !state.initialized) return;

    currentConfig = getConfig();
    currentImages = getImages();

    const monthIndex = state.currentMonthIndex;
    const imageData = currentImages[monthIndex] || null;

    // Clear existing content
    previewGridEl.innerHTML = "";

    // Create preview card
    const card = document.createElement("article");
    card.className = "preview-card";

    // Add image
    const imageContainer = document.createElement("div");
    imageContainer.className = "preview-card__image";
    const img = document.createElement("img");
    img.alt = `${imageData?.label || "Month"} preview image`;

    if (imageData && imageData.asset) {
      // Use dataUrl if available (uploaded image), otherwise use url (default)
      img.src = imageData.asset.dataUrl || imageData.asset.url || "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
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

    // Add calendar body
    const body = document.createElement("div");
    body.className = "preview-card__body";

    try {
      // Render calendar using CalendarEngine with Apple style layout
      const calendarResult = CalendarEngine.renderMonth({
        year: currentConfig.year,
        monthIndex: monthIndex,
        startDay: currentConfig.startDay,
        language: currentConfig.language,
        country: currentConfig.country,
        layoutStyle: "apple",
      });

      if (calendarResult && calendarResult.element) {
        // Add the calendar element to the body
        body.appendChild(calendarResult.element);
      } else {
        // Fallback if rendering fails
        const fallback = document.createElement("p");
        fallback.className = "placeholder";
        fallback.textContent = "Calendar preview unavailable.";
        body.appendChild(fallback);
      }
    } catch (error) {
      console.error("[Preview] Error rendering calendar:", error);
      const errorMsg = document.createElement("p");
      errorMsg.className = "placeholder";
      errorMsg.textContent = "Error rendering calendar.";
      body.appendChild(errorMsg);
    }

    card.appendChild(body);
    previewGridEl.appendChild(card);
  }

  function subscribeToConfigChanges() {
    if (window.ConfigForm && window.ConfigForm.subscribe) {
      window.ConfigForm.subscribe((config) => {
        currentConfig = config;
        if (state.initialized) {
          updateMonthSelectorOptions();
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
  };

  window.Preview = Preview;
})();

