(function () {
  if (!window.Utils) {
    console.error("[PreviewConfig] Utils module missing. Initialization aborted.");
    return;
  }

  const Utils = window.Utils;

  // Default configuration values
  const DEFAULTS = {
    splitRatio: 40, // 30-60%, default 40%
    paperType: "A4", // A4, Letter, Legal
    orientation: "portrait", // portrait, landscape
    imageFitMode: "cover", // cover, fill, contain, none
    layoutStyle: "apple", // cellular, apple
  };

  // Valid values
  const VALID_PAPER_TYPES = ["A4", "Letter", "Legal"];
  const VALID_ORIENTATIONS = ["portrait", "landscape"];
  const VALID_IMAGE_FIT_MODES = ["cover", "fill", "contain", "none"];
  const VALID_LAYOUT_STYLES = ["cellular", "apple"];

  // Paper dimensions in mm (portrait)
  const PAPER_DIMENSIONS = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    Legal: { width: 215.9, height: 355.6 },
  };

  const state = {
    splitRatio: DEFAULTS.splitRatio,
    paperType: DEFAULTS.paperType,
    orientation: DEFAULTS.orientation,
    imageFitMode: DEFAULTS.imageFitMode,
    layoutStyle: DEFAULTS.layoutStyle,
    initialized: false,
  };

  const subscribers = [];

  /**
   * Validate split ratio (30-60%)
   */
  function validateSplitRatio(value) {
    const num = Number(value);
    if (isNaN(num)) return DEFAULTS.splitRatio;
    return Math.max(30, Math.min(60, Math.round(num / 5) * 5)); // Round to nearest 5%
  }

  /**
   * Validate paper type
   */
  function validatePaperType(value) {
    return VALID_PAPER_TYPES.includes(value) ? value : DEFAULTS.paperType;
  }

  /**
   * Validate orientation
   */
  function validateOrientation(value) {
    return VALID_ORIENTATIONS.includes(value) ? value : DEFAULTS.orientation;
  }

  /**
   * Validate image fit mode
   */
  function validateImageFitMode(value) {
    return VALID_IMAGE_FIT_MODES.includes(value) ? value : DEFAULTS.imageFitMode;
  }

  /**
   * Validate layout style
   */
  function validateLayoutStyle(value) {
    return VALID_LAYOUT_STYLES.includes(value) ? value : DEFAULTS.layoutStyle;
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      splitRatio: state.splitRatio,
      paperType: state.paperType,
      orientation: state.orientation,
      imageFitMode: state.imageFitMode,
      layoutStyle: state.layoutStyle,
    };
  }

  /**
   * Set state (partial updates supported)
   */
  function setState(updates) {
    if (!updates || typeof updates !== "object") {
      console.warn("[PreviewConfig] setState called with invalid updates");
      return;
    }

    let changed = false;

    if (updates.splitRatio !== undefined) {
      const validated = validateSplitRatio(updates.splitRatio);
      if (validated !== state.splitRatio) {
        state.splitRatio = validated;
        changed = true;
      }
    }

    if (updates.paperType !== undefined) {
      const validated = validatePaperType(updates.paperType);
      if (validated !== state.paperType) {
        state.paperType = validated;
        changed = true;
      }
    }

    if (updates.orientation !== undefined) {
      const validated = validateOrientation(updates.orientation);
      if (validated !== state.orientation) {
        state.orientation = validated;
        changed = true;
      }
    }

    if (updates.imageFitMode !== undefined) {
      const validated = validateImageFitMode(updates.imageFitMode);
      if (validated !== state.imageFitMode) {
        state.imageFitMode = validated;
        changed = true;
      }
    }

    if (updates.layoutStyle !== undefined) {
      const validated = validateLayoutStyle(updates.layoutStyle);
      if (validated !== state.layoutStyle) {
        state.layoutStyle = validated;
        changed = true;
      }
    }

    if (changed) {
      notifySubscribers();
      saveToLocalStorage();
    }
  }

  /**
   * Subscribe to state changes
   */
  function subscribe(callback) {
    if (typeof callback !== "function") {
      console.warn("[PreviewConfig] subscribe called with non-function");
      return;
    }
    subscribers.push(callback);
    // Immediately call with current state
    callback(getState());
  }

  /**
   * Notify all subscribers
   */
  function notifySubscribers() {
    const currentState = getState();
    subscribers.forEach((callback) => {
      try {
        callback(currentState);
      } catch (error) {
        console.error("[PreviewConfig] Error in subscriber callback:", error);
      }
    });
  }

  /**
   * Get paper aspect ratio (width / height)
   * Returns the aspect ratio for the current orientation
   */
  function getPaperAspectRatio() {
    const dims = PAPER_DIMENSIONS[state.paperType];
    if (!dims) return 0.707; // Default to A4 portrait

    // For landscape, swap width and height (width becomes the longer dimension)
    const width = state.orientation === "landscape" ? dims.height : dims.width;
    const height = state.orientation === "landscape" ? dims.width : dims.height;
    
    // CSS aspect-ratio expects width / height
    return width / height;
  }

  /**
   * Get paper dimensions string (e.g., "A4 Portrait - 210×297mm")
   */
  function getPaperDimensionsString() {
    const dims = PAPER_DIMENSIONS[state.paperType];
    if (!dims) return `${state.paperType} ${state.orientation}`;

    const width = state.orientation === "landscape" ? dims.height : dims.width;
    const height = state.orientation === "landscape" ? dims.width : dims.height;
    const orientationLabel = state.orientation.charAt(0).toUpperCase() + state.orientation.slice(1);

    return `${state.paperType} ${orientationLabel} - ${width}×${height}mm`;
  }

  /**
   * Save to localStorage
   */
  function saveToLocalStorage() {
    try {
      localStorage.setItem("previewConfig", JSON.stringify(getState()));
    } catch (error) {
      console.warn("[PreviewConfig] Failed to save to localStorage:", error);
    }
  }

  /**
   * Load from localStorage
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem("previewConfig");
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch (error) {
      console.warn("[PreviewConfig] Failed to load from localStorage:", error);
    }
  }

  /**
   * Initialize
   */
  function init() {
    loadFromLocalStorage();
    state.initialized = true;
  }

  const PreviewConfig = {
    init,
    getState,
    setState,
    subscribe,
    getPaperAspectRatio,
    getPaperDimensionsString,
    DEFAULTS,
    VALID_PAPER_TYPES,
    VALID_ORIENTATIONS,
    VALID_IMAGE_FIT_MODES,
    VALID_LAYOUT_STYLES,
    PAPER_DIMENSIONS,
  };

  window.PreviewConfig = PreviewConfig;

  // Auto-initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


