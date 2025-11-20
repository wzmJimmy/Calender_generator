(function () {
  if (!window.Utils) {
    console.error("[StepNavigation] Utils module missing.");
    return;
  }

  const STEP_COUNT = 3;
  let currentStep = 1;
  const subscribers = new Set();

  const stepElements = [];
  const stepContentElements = [];
  let prevButtons = [];
  let nextButtons = [];
  let startOverButtons = [];

  function init() {
    // Find all step indicators
    const stepper = Utils.qs(".stepper");
    if (!stepper) {
      console.warn("[StepNavigation] Stepper not found.");
      return;
    }

    // Find all step content sections
    for (let i = 1; i <= STEP_COUNT; i++) {
      const stepEl = Utils.qs(`.step[data-step="${i}"]`);
      const contentEl = Utils.qs(`.step-content[data-step-content="${i}"]`);
      if (stepEl) stepElements.push({ element: stepEl, step: i });
      if (contentEl) stepContentElements.push({ element: contentEl, step: i });
    }

    // Find all navigation buttons using class selectors
    prevButtons = Array.from(document.querySelectorAll(".step-nav-prev"));
    nextButtons = Array.from(document.querySelectorAll(".step-nav-next"));
    startOverButtons = Array.from(document.querySelectorAll(".step-nav-start-over"));

    // Bind navigation buttons
    prevButtons.forEach((btn) => {
      btn.addEventListener("click", goToPreviousStep);
    });

    nextButtons.forEach((btn) => {
      btn.addEventListener("click", goToNextStep);
    });

    startOverButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        goToStep(1);
      });
    });

    // Initialize UI
    updateStepUI();
  }

  function goToStep(step) {
    if (step < 1 || step > STEP_COUNT) {
      console.warn(`[StepNavigation] Invalid step: ${step}`);
      return;
    }

    const previousStep = currentStep;
    currentStep = step;
    updateStepUI();
    notifySubscribers({ step: currentStep, previousStep });
  }

  function goToNextStep() {
    if (currentStep < STEP_COUNT) {
      goToStep(currentStep + 1);
    }
  }

  function goToPreviousStep() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  function updateStepUI() {
    // Update step indicators
    stepElements.forEach(({ element, step }) => {
      const isActive = step === currentStep;
      element.classList.toggle("active", isActive);
      element.setAttribute("aria-current", isActive ? "step" : "false");
    });

    // Update step content visibility
    stepContentElements.forEach(({ element, step }) => {
      const isVisible = step === currentStep;
      element.setAttribute("aria-hidden", String(!isVisible));
    });

    // Update navigation buttons (consolidated for all prev/next buttons)
    prevButtons.forEach((btn) => {
      btn.disabled = currentStep === 1;
    });

    nextButtons.forEach((btn) => {
      btn.disabled = currentStep >= STEP_COUNT;
    });
  }

  function subscribe(callback) {
    if (typeof callback === "function") {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
  }

  function notifySubscribers(data) {
    subscribers.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[StepNavigation] Subscriber error:", error);
      }
    });
  }

  function validateStep(step) {
    // Step 1: Images - always valid (defaults are available)
    if (step === 1) return true;

    // Step 2: Preview - valid if we have images
    if (step === 2) {
      // For now, always valid. Can add image validation later
      return true;
    }

    // Step 3: Download - valid if preview is ready
    if (step === 3) {
      // For now, always valid. Can add preview validation later
      return true;
    }

    return false;
  }

  window.StepNavigation = {
    init,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    getCurrentStep() {
      return currentStep;
    },
    subscribe,
    validateStep,
  };
})();

