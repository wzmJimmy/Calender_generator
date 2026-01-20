(function () {
  if (!window.Utils) {
    console.error("Utils module missing. Ensure scripts load correctly.");
    return;
  }

  function init() {
    CalendarEngine.init();
    ImageHandler.init();
    HolidayService.init();
    PdfGenerator.init();
    ConfigForm?.init?.();
    StepNavigation?.init?.();
    Preview?.init?.();
    bindNavigation();
    setupConfigChangeListener();
    setupStepNavigationListener();
    runDependencyCheck();
    updateConfigSummary();
  }

  function bindNavigation() {
    const downloadBtn = Utils.qs("#download-btn");
    const generatePdfBtn = Utils.qs("#generate-pdf-btn");

    downloadBtn?.addEventListener("click", () => {
      PdfGenerator.download();
    });

    generatePdfBtn?.addEventListener("click", () => {
      PdfGenerator.download();
    });
  }

  function setupConfigChangeListener() {
    if (ConfigForm && ConfigForm.subscribe) {
      ConfigForm.subscribe((configState) => {
        console.debug("[Main] Config changed, triggering preview update");
        updateConfigSummary();
        // Trigger preview update when config changes
        // This will be implemented when preview functionality is ready
      });
    }
    
    // Subscribe to preview config changes
    if (window.PreviewConfig && window.PreviewConfig.subscribe) {
      window.PreviewConfig.subscribe(() => {
        updateConfigSummary();
      });
    }
  }

  function setupStepNavigationListener() {
    if (StepNavigation && StepNavigation.subscribe) {
      StepNavigation.subscribe(({ step }) => {
        if (step === 3) {
          updateConfigSummary();
        }
      });
    }
  }

  function updateConfigSummary() {
    const summaryEl = Utils.qs("#config-summary");
    if (!summaryEl) return;

    const config = ConfigForm?.getState?.();
    if (!config) return;

    const { getCountryLabel, getLanguageLabel } = window.LocalizationData || {};
    const countryLabel = getCountryLabel ? getCountryLabel(config.country) : config.country;
    const languageLabel = getLanguageLabel ? getLanguageLabel(config.language) : config.language;

    const startDayLabels = {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
    };

    // Get preview config
    const previewConfig = window.PreviewConfig?.getState?.();
    const imageFitLabels = {
      cover: "Cover",
      fill: "Fill",
      contain: "Contain",
      none: "None",
    };
    const layoutStyleLabels = {
      cellular: "Cellular",
      apple: "Apple",
    };

    let previewSection = "";
    if (previewConfig) {
      const paperDims = window.PreviewConfig?.getPaperDimensionsString?.() || "";
      previewSection = `
        <h3>Preview Settings</h3>
        <dl>
          <dt>Split Ratio:</dt>
          <dd>${previewConfig.splitRatio}%</dd>
          <dt>Paper Type:</dt>
          <dd>${paperDims}</dd>
          <dt>Image Fit Mode:</dt>
          <dd>${imageFitLabels[previewConfig.imageFitMode] || previewConfig.imageFitMode}</dd>
          <dt>Layout Style:</dt>
          <dd>${layoutStyleLabels[previewConfig.layoutStyle] || previewConfig.layoutStyle}</dd>
        </dl>
      `;
    }

    summaryEl.innerHTML = `
      <h3>Calendar Configuration Summary</h3>
      <dl>
        <dt>Year:</dt>
        <dd>${config.year}</dd>
        <dt>Start Day:</dt>
        <dd>${startDayLabels[config.startDay] || config.startDay}</dd>
        <dt>Country/Region:</dt>
        <dd>${countryLabel}</dd>
        <dt>Language:</dt>
        <dd>${languageLabel}</dd>
      </dl>
      ${previewSection}
    `;
  }

  // Removed handlePdfGeneration() - PdfGenerator.download() now handles all UI updates

  function runDependencyCheck() {
    const statusEl = Utils.qs("#dependency-status");
    const checks = [
      { label: "jsPDF", passed: !!(window.jspdf && window.jspdf.jsPDF) },
      { label: "html2canvas", passed: typeof window.html2canvas === "function" },
      { label: "date-fns", passed: !!window.dateFns },
      { label: "date-holidays", passed: !!window.Holidays },
    ];

    const allGood = checks.every((check) => check.passed);
    if (statusEl) {
      if (allGood) {
        statusEl.textContent = "All dependencies loaded successfully.";
        statusEl.classList.remove("hero__status--error");
      } else {
        const failing = checks.filter((check) => !check.passed).map((check) => check.label);
        statusEl.textContent = `Issues loading: ${failing.join(", ")}`;
        statusEl.classList.add("hero__status--error");
      }
    }
    console.table(checks);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
