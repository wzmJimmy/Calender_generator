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
    bindNavigation();
    runDependencyCheck();
  }

  function bindNavigation() {
    const nextBtn = Utils.qs("#next-step");
    const downloadBtn = Utils.qs("#download-btn");

    nextBtn?.addEventListener("click", () => {
      console.info("Step navigation coming soon.");
    });
    downloadBtn?.addEventListener("click", () => {
      PdfGenerator.downloadDraft();
    });
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
