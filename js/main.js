(function () {
  if (!window.Utils) {
    console.error("Utils module missing. Ensure scripts load correctly.");
    return;
  }

  const appState = {
    year: Utils.clampYear(Utils.getCurrentYear()),
    startDay: "sunday",
    language: "en",
    country: "US",
  };

  function init() {
    CalendarEngine.init();
    ImageHandler.init();
    HolidayService.init();
    PdfGenerator.init();
    hydrateForm();
    bindEvents();
    runDependencyCheck();
  }

  function hydrateForm() {
    const yearInput = Utils.qs("#year-input");
    const startDaySelect = Utils.qs("#start-day");
    const languageSelect = Utils.qs("#language");
    const countrySelect = Utils.qs("#country");

    if (yearInput) yearInput.value = appState.year;
    if (startDaySelect) startDaySelect.value = appState.startDay;
    if (languageSelect) languageSelect.value = appState.language;
    if (countrySelect) countrySelect.value = appState.country;
  }

  function bindEvents() {
    const form = Utils.qs(".form");
    const nextBtn = Utils.qs("#next-step");
    const downloadBtn = Utils.qs("#download-btn");

    form?.addEventListener("input", handleInputChange);
    nextBtn?.addEventListener("click", () => {
      console.info("Step navigation coming soon.");
    });
    downloadBtn?.addEventListener("click", () => {
      PdfGenerator.downloadDraft();
    });
  }

  function handleInputChange(event) {
    const target = event.target;
    if (!target.name) return;
    const { name, value } = target;
    if (name === "year") {
      appState.year = Utils.clampYear(Number(value) || appState.year);
      target.value = appState.year;
    } else {
      appState[name] = value;
    }
    console.debug("[AppState]", appState);
  }

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
      } else {
        const failing = checks.filter((check) => !check.passed).map((check) => check.label);
        statusEl.textContent = `Issues loading: ${failing.join(", ")}`;
        statusEl.classList.add("status-banner--error");
      }
    }
    console.table(checks);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
