(function () {
  if (!window.Utils || !window.LocalizationData) {
    console.error("ConfigForm dependencies missing.");
    return;
  }

  const {
    countries,
    languages,
    getDefaultLanguageForCountry,
    getCountryLabel,
    getLanguageLabel,
  } = window.LocalizationData;

  const defaultCountry = countries[0]?.code || "US";
  const defaultLanguage =
    getDefaultLanguageForCountry(defaultCountry) || languages[0]?.code || "en";

  const appState = {
    year: Utils.clampYear(Utils.getCurrentYear()),
    startDay: "sunday",
    country: defaultCountry,
    language: defaultLanguage,
  };

  const stateFlags = {
    languageAuto: true,
    isModified: false,
  };

  const subscribers = new Set();
  let configPanelEl;
  let configIndicatorEl;
  let notifySubscribersDebounced;

  function init() {
    configPanelEl = Utils.qs(".config-panel");
    configIndicatorEl = Utils.qs("#config-indicator");
    hydrateSelectOptions();
    hydrateForm();
    bindEvents();
    runInitialHints();
  }

  function hydrateSelectOptions() {
    populateSelect("#country", countries);
    populateSelect("#language", languages);
  }

  function populateSelect(selector, options) {
    const select = Utils.qs(selector);
    if (!select || !Array.isArray(options)) return;
    const previousValue = select.value;
    const markup = options
      .map(({ code, label }) => `<option value="${code}">${label}</option>`)
      .join("");
    select.innerHTML = markup;
    if (options.some((option) => option.code === previousValue)) {
      select.value = previousValue;
    }
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
    form?.addEventListener("input", handleInputChange);
  }

  function runInitialHints() {
    updateYearHint({ status: "init" });
    autoSelectLanguageFromCountry({ silent: true });
  }

  function handleInputChange(event) {
    const target = event.target;
    if (!target?.name) return;
    const { name, value } = target;

    if (name === "year") {
      const normalized = normalizeYear(value);
      appState.year = normalized.value;
      target.value = normalized.value;
      updateYearHint(normalized);
      toggleFieldError(target, !normalized.isValid);
    } else if (name === "language") {
      appState.language = value;
      stateFlags.languageAuto = false;
      updateLanguageHint();
    } else if (name === "country") {
      appState.country = value;
      autoSelectLanguageFromCountry();
    } else {
      appState[name] = value;
    }

    markAsModified();
    notifySubscribersDebounced();
    console.debug("[ConfigForm][AppState]", { ...appState });
  }

  function markAsModified() {
    if (!stateFlags.isModified) {
      stateFlags.isModified = true;
      updateConfigIndicator();
    }
  }

  function updateConfigIndicator() {
    if (configPanelEl) {
      configPanelEl.classList.toggle("config-panel--modified", stateFlags.isModified);
    }

    if (configIndicatorEl) {
      if (stateFlags.isModified) {
        configIndicatorEl.textContent = "Settings updated. Changes will apply to preview and PDF.";
      } else {
        configIndicatorEl.textContent = "";
      }
    }
  }

  function notifySubscribers() {
    const state = { ...appState };
    subscribers.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error("[ConfigForm] Subscriber error:", error);
      }
    });
  }

  // Initialize debounced version after notifySubscribers is defined
  notifySubscribersDebounced = Utils.debounce(notifySubscribers, 300);

  function normalizeYear(inputValue) {
    const fallback = appState.year || Utils.getCurrentYear();
    const parsed = Number(inputValue);
    if (!Number.isFinite(parsed)) {
      return {
        value: fallback,
        isValid: false,
        status: "invalid",
        message: "Enter a year between 2020 and 2030.",
      };
    }

    const rounded = Math.round(parsed);
    const clamped = Utils.clampYear(rounded);
    if (clamped !== rounded) {
      return {
        value: clamped,
        isValid: true,
        status: rounded < clamped ? "below-range" : "above-range",
        message:
          rounded < clamped
            ? "Minimum supported year is 2020. Adjusted automatically."
            : "Maximum supported year is 2030. Adjusted automatically.",
      };
    }

    return {
      value: clamped,
      isValid: true,
      status: "ok",
      message: `Planning for ${clamped}.`,
    };
  }

  function toggleFieldError(element, hasError) {
    const field = element?.closest(".field");
    if (!field) return;
    field.classList.toggle("field--error", Boolean(hasError));
  }

  function updateYearHint({
    message = "Select a year between 2020 and 2030.",
    status = "init",
  }) {
    const hint = Utils.qs("#year-hint");
    if (!hint) return;
    hint.textContent = message;
    const warningStatuses = ["invalid", "above-range", "below-range"];
    const variant = status === "ok" ? "success" : warningStatuses.includes(status) ? "warning" : "info";
    setHintVariant(hint, variant);
  }

  function autoSelectLanguageFromCountry({ silent = false } = {}) {
    const detected = getDefaultLanguageForCountry(appState.country);
    const languageSelect = Utils.qs("#language");

    if (detected && languageSelect) {
      languageSelect.value = detected;
      appState.language = detected;
      stateFlags.languageAuto = true;
    } else {
      stateFlags.languageAuto = false;
    }

    if (!silent) {
      updateLanguageHint();
    } else {
      updateLanguageHint({ isInitial: true });
    }
  }

  function updateLanguageHint({ isInitial = false } = {}) {
    const hint = Utils.qs("#language-hint");
    if (!hint) return;
    const countryLabel = getCountryLabel(appState.country);
    const languageLabel = getLanguageLabel(appState.language);

    let message = "";
    let variant = "info";

    if (stateFlags.languageAuto) {
      message = `Auto-selected ${languageLabel} based on ${countryLabel}.`;
      variant = "info";
    } else if (isInitial) {
      message = `Default language set to ${languageLabel}.`;
    } else {
      message = `${languageLabel} selected manually.`;
      variant = "success";
    }

    hint.textContent = message;
    setHintVariant(hint, variant);
  }

  function setHintVariant(element, variant) {
    if (!element) return;
    const variants = ["field__hint--info", "field__hint--warning", "field__hint--success"];
    element.classList.remove(...variants);
    if (variant) {
      element.classList.add(`field__hint--${variant}`);
    }
  }

  function subscribe(callback) {
    if (typeof callback === "function") {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
  }

  window.ConfigForm = {
    init,
    getState() {
      return { ...appState };
    },
    subscribe,
  };
})();

