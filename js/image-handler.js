(function () {
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_EDGE = 1800;
  const COMPRESSION_QUALITY = 0.82;
  const DEFAULT_IMAGE_BASE_PATH = "assets/default-images/";

  const MONTH_MANIFEST = [
    { key: "january", label: "January", file: "january.jpg", description: "Fresh Beginnings" },
    { key: "february", label: "February", file: "february.jpg", description: "Cozy Moments" },
    { key: "march", label: "March", file: "march.jpg", description: "Spring Greens" },
    { key: "april", label: "April", file: "april.jpg", description: "Gentle Showers" },
    { key: "may", label: "May", file: "may.jpg", description: "Bloom & Shine" },
    { key: "june", label: "June", file: "june.jpg", description: "Ocean Breezes" },
    { key: "july", label: "July", file: "july.jpg", description: "Summer Bursts" },
    { key: "august", label: "August", file: "august.jpg", description: "Sunset Trails" },
    { key: "september", label: "September", file: "september.jpg", description: "Crisp Transitions" },
    { key: "october", label: "October", file: "october.jpg", description: "Harvest Glow" },
    { key: "november", label: "November", file: "november.jpg", description: "Cozy Twilight" },
    { key: "december", label: "December", file: "december.jpg", description: "Festive Lights" },
  ];

  const state = {
    slots: [],
  };

  const subscribers = new Set();
  let gridEl;
  let summaryEl;
  let resetBtn;

  if (!window.Utils) {
    console.error("[ImageHandler] Utils module missing.");
  }
  const Utils = window.Utils || {};

  function init() {
    if (!window.Utils) {
      return;
    }
    gridEl = Utils.qs("#image-grid");
    summaryEl = Utils.qs("#image-summary");
    resetBtn = Utils.qs("#reset-images");

    if (!gridEl) {
      console.warn("[ImageHandler] #image-grid not found. Skipping setup.");
      return;
    }

    bootstrapState();
    renderSlots();
    updateSummary();
    bindResetButton();
  }

  function bootstrapState() {
    state.slots = MONTH_MANIFEST.map((entry, index) => {
      const defaultPath = `${DEFAULT_IMAGE_BASE_PATH}${entry.file}`;
      return {
        id: entry.key,
        label: entry.label,
        description: entry.description,
        monthIndex: index,
        asset: {
          type: "default",
          url: defaultPath,
          dataUrl: defaultPath,
          mimeType: "image/jpeg",
          size: null,
          width: null,
          height: null,
          name: `${entry.label} default`,
        },
        status: "",
        elements: {},
      };
    });
  }

  function renderSlots() {
    gridEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    state.slots.forEach((slot) => {
      const slotEl = createSlotElement(slot);
      fragment.appendChild(slotEl);
    });

    gridEl.appendChild(fragment);
  }

  function createSlotElement(slot) {
    const root = document.createElement("article");
    root.className = "image-slot";
    root.dataset.monthIndex = slot.monthIndex;

    const header = document.createElement("div");
    header.className = "image-slot__header";

    const title = document.createElement("p");
    title.className = "image-slot__title";
    title.textContent = slot.label;

    const badge = document.createElement("span");
    badge.className = "image-slot__badge";
    badge.textContent = slot.asset.type === "default" ? "Default" : "Custom";

    header.appendChild(title);
    header.appendChild(badge);

    const dropzone = document.createElement("div");
    dropzone.className = "image-slot__dropzone";
    dropzone.tabIndex = 0;
    dropzone.setAttribute("role", "button");
    dropzone.setAttribute("aria-label", `Upload or drop image for ${slot.label}`);

    const preview = document.createElement("img");
    preview.className = "image-slot__preview";
    preview.src = slot.asset.dataUrl;
    preview.alt = `${slot.label} preview`;

    const hint = document.createElement("p");
    hint.className = "image-slot__hint";
    hint.innerHTML = `Drop image here or <button type="button" class="slot-action" data-action="trigger-input">browse</button>`;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_TYPES.join(",");
    input.hidden = true;
    input.setAttribute("data-month-index", slot.monthIndex);
    input.setAttribute("aria-label", `Select image file for ${slot.label}`);

    dropzone.appendChild(preview);
    dropzone.appendChild(hint);
    dropzone.appendChild(input);

    const status = document.createElement("p");
    status.className = "image-slot__status";
    status.textContent = slot.status;

    const actions = document.createElement("div");
    actions.className = "image-slot__actions";

    const uploadBtn = document.createElement("button");
    uploadBtn.type = "button";
    uploadBtn.className = "btn small primary";
    uploadBtn.dataset.action = "trigger-input";
    uploadBtn.textContent = "Upload image";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "slot-action";
    deleteBtn.dataset.action = "delete-image";
    deleteBtn.dataset.variant = "danger";
    deleteBtn.textContent = "Delete";

    actions.appendChild(uploadBtn);
    actions.appendChild(deleteBtn);

    root.appendChild(header);
    root.appendChild(dropzone);
    root.appendChild(actions);
    root.appendChild(status);

    attachSlotInteractions(slot, { root, badge, dropzone, preview, input, status, deleteBtn });
    
    // Initially hide "Delete" button if using default
    updateButtonVisibility(slot);

    return root;
  }

  function updateButtonVisibility(slot) {
    if (!slot.elements.deleteBtn) return;
    const isCustom = slot.asset.type === "custom";
    slot.elements.deleteBtn.style.display = isCustom ? "" : "none";
  }

  function attachSlotInteractions(slot, elements) {
    slot.elements = elements;

    elements.dropzone.addEventListener("dragenter", (event) => {
      Utils.preventDefault(event);
      elements.dropzone.classList.add("is-dragging");
    });

    elements.dropzone.addEventListener("dragover", (event) => {
      Utils.preventDefault(event);
    });

    elements.dropzone.addEventListener("dragleave", () => {
      elements.dropzone.classList.remove("is-dragging");
    });

    elements.dropzone.addEventListener("drop", (event) => {
      Utils.preventDefault(event);
      elements.dropzone.classList.remove("is-dragging");
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        processFile(slot, file);
      } else {
        setStatus(slot, "Drop a supported image to replace this month.", "warning");
      }
    });

    elements.dropzone.addEventListener("click", (event) => {
      // Don't trigger if clicking on a button or other interactive element
      if (event.target.tagName === "BUTTON" || event.target.closest("button")) {
        return;
      }
      elements.input.click();
    });

    elements.input.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(slot, file);
      }
      event.target.value = "";
    });

    elements.root.addEventListener("click", (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      if (action === "trigger-input") {
        event.preventDefault();
        event.stopPropagation();
        elements.input.click();
        return;
      }
      if (action === "delete-image") {
        event.preventDefault();
        event.stopPropagation();
        resetSlotToDefault(slot);
      }
    });
  }


  function processFile(slot, file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      setStatus(slot, validation.message, "error");
      flashDropzone(slot.elements.dropzone, "error");
      return;
    }

    setStatus(slot, "Optimizing image...", "info");
    flashDropzone(slot.elements.dropzone, "processing");

    compressImage(file)
      .then((result) => {
        slot.asset = {
          type: "custom",
          url: result.dataUrl,
          dataUrl: result.dataUrl,
          mimeType: result.mimeType,
          size: result.size,
          width: result.width,
          height: result.height,
          name: file.name,
        };
        slot.status = `Loaded ${file.name} (${Utils.formatBytes(result.size)})`;
        slot.elements.preview.src = slot.asset.dataUrl;
        slot.elements.badge.textContent = "Custom";
        slot.elements.dropzone.classList.remove("is-dragging");
        setStatus(slot, slot.status, "success");
        updateButtonVisibility(slot);
        updateSummary();
        emitChange();
      })
      .catch((error) => {
        console.error("[ImageHandler] Compression failed", error);
        setStatus(slot, "We couldn't process that image. Try a different file.", "error");
        flashDropzone(slot.elements.dropzone, "error");
      });
  }

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: "Unsupported file type. Use JPG, PNG, or WebP.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File too large (${Utils.formatBytes(file.size)}). Max size is ${Utils.formatBytes(MAX_FILE_SIZE)}.`,
      };
    }

    return { valid: true };
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const { width, height } = calculateResizeDimensions(img);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Canvas context unavailable"));
            return;
          }

          canvas.width = width;
          canvas.height = height;
          context.drawImage(img, 0, 0, width, height);

          const handleDataUrl = (dataUrl) => {
            const size = dataUrl.length * (3 / 4);
            resolve({
              dataUrl,
              width,
              height,
              size,
              mimeType: "image/jpeg",
            });
          };

          if (canvas.toBlob) {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Compression produced empty blob"));
                  return;
                }
                const blobReader = new FileReader();
                blobReader.onloadend = () => {
                  handleDataUrl(blobReader.result);
                };
                blobReader.readAsDataURL(blob);
              },
              "image/jpeg",
              COMPRESSION_QUALITY
            );
          } else {
            handleDataUrl(canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY));
          }
        };

        img.onerror = () => reject(new Error("Could not load image to compress"));
        img.src = reader.result;
      };

      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }

  function calculateResizeDimensions(img) {
    const ratio = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    if (ratio === 1) {
      return { width: img.width, height: img.height };
    }
    return {
      width: Math.round(img.width * ratio),
      height: Math.round(img.height * ratio),
    };
  }


  function setStatus(slot, message, variant = "muted") {
    slot.status = message;
    if (!slot.elements.status) return;
    slot.elements.status.textContent = message;
    slot.elements.status.dataset.variant = variant;
  }

  function flashDropzone(dropzone, type) {
    dropzone.classList.remove("is-error", "is-success");
    if (type === "error") {
      dropzone.classList.add("is-error");
      setTimeout(() => dropzone.classList.remove("is-error"), 500);
    }
    if (type === "processing") {
      dropzone.classList.add("is-processing");
      setTimeout(() => dropzone.classList.remove("is-processing"), 500);
    }
  }

  function clearSlot(slot) {
    slot.asset = {
      type: "default",
      url: `${DEFAULT_IMAGE_BASE_PATH}${MONTH_MANIFEST[slot.monthIndex].file}`,
      dataUrl: `${DEFAULT_IMAGE_BASE_PATH}${MONTH_MANIFEST[slot.monthIndex].file}`,
      mimeType: "image/jepg",
      size: null,
      width: null,
      height: null,
      name: `${slot.label} default`,
    };
    slot.elements.preview.src = slot.asset.dataUrl;
    slot.elements.badge.textContent = "Default";
    updateButtonVisibility(slot);
    setStatus(slot, "", "muted");
    updateSummary();
    emitChange();
  }

  function resetSlotToDefault(slot) {
    const wasCustom = slot.asset.type === "custom";
    clearSlot(slot);
    if (wasCustom) {
      setStatus(slot, "Reverted to default artwork.", "info");
    }
  }

  function resetAllSlots() {
    state.slots.forEach((slot) => {
      clearSlot(slot);
    });
    updateSummary();
  }

  function bindResetButton() {
    if (!resetBtn) return;
    resetBtn.addEventListener("click", () => {
      resetAllSlots();
      setSummaryMessage("All image slots have been reset to the default artwork set.");
      emitChange();
    });
  }

  function updateSummary() {
    const customCount = state.slots.filter((slot) => slot.asset.type === "custom").length;
    if (!summaryEl) return;

    if (customCount === 0) {
      setSummaryMessage("All 12 months are currently using the default artwork set.");
      return;
    }

    if (customCount === state.slots.length) {
      setSummaryMessage("Great work! Every month has a custom image.");
      return;
    }

    const remaining = state.slots.length - customCount;
    setSummaryMessage(`${customCount} month${customCount === 1 ? "" : "s"} customized. ${remaining} to go.`);
  }

  function setSummaryMessage(message) {
    if (summaryEl) {
      summaryEl.textContent = message;
    }
  }

  function emitChange() {
    const payload = getImages();
    subscribers.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error("[ImageHandler] Subscriber error", error);
      }
    });
    document.dispatchEvent(
      new CustomEvent("image-handler:change", {
        detail: payload,
      })
    );
  }

  function getImages() {
    return state.slots.map((slot) => ({
      id: slot.id,
      label: slot.label,
      description: slot.description,
      asset: { ...slot.asset },
    }));
  }

  function subscribe(callback) {
    if (typeof callback === "function") {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
    return () => {};
  }

  const ImageHandler = {
    init,
    getImages,
    subscribe,
    resetAll: resetAllSlots,
  };

  const internals = {
    ACCEPTED_TYPES,
    MAX_FILE_SIZE,
    MAX_EDGE,
    validateFile,
    calculateResizeDimensions,
    manifest: MONTH_MANIFEST.map((entry) => ({ ...entry })),
    getDefaultPathForKey(key) {
      const entry = MONTH_MANIFEST.find((item) => item.key === key);
      return entry ? `${DEFAULT_IMAGE_BASE_PATH}${entry.file}` : null;
    },
  };

  Object.defineProperty(ImageHandler, "_internals", {
    value: internals,
    enumerable: false,
    writable: false,
  });

  window.ImageHandler = ImageHandler;
})();
