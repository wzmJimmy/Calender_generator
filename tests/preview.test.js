const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadScript(relativePath, sandbox) {
  const scriptPath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(scriptPath, "utf8");
  vm.runInNewContext(code, sandbox, { filename: relativePath });
}

function createElement(tag) {
  const element = {
    tagName: tag,
    children: [],
    className: "",
    innerHTML: "",
    textContent: "",
    value: "",
    disabled: false,
    attributes: {},
    style: {},
    classList: {
      add(cls) {
        if (!this.contains(cls)) {
          this._classes = this._classes || [];
          this._classes.push(cls);
        }
      },
      remove(cls) {
        if (this._classes) {
          this._classes = this._classes.filter((c) => c !== cls);
        }
      },
      contains(cls) {
        return this._classes && this._classes.includes(cls);
      },
    },
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    getAttribute(key) {
      return this.attributes[key];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener(event, callback) {
      this._listeners = this._listeners || {};
      this._listeners[event] = this._listeners[event] || [];
      this._listeners[event].push(callback);
    },
    dispatchEvent(event) {
      const listeners = this._listeners?.[event.type] || [];
      listeners.forEach((cb) => cb(event));
    },
  };
  return element;
}

const sandboxWindow = {
  document: {
    createElement,
    querySelector(selector) {
      return elements[selector] || null;
    },
  },
  console,
  setTimeout,
  clearTimeout,
};

const sandbox = {
  window: sandboxWindow,
  document: sandboxWindow.document,
  console,
  setTimeout,
  clearTimeout,
};

// Create mock DOM elements
const previewGrid = createElement("div");
previewGrid.className = "preview__grid";

const prevBtn = createElement("button");
prevBtn.id = "preview-prev";
prevBtn.textContent = "Previous";

const nextBtn = createElement("button");
nextBtn.id = "preview-next";
nextBtn.textContent = "Next";

const monthSelector = createElement("select");
monthSelector.id = "preview-month-selector";
monthSelector.options = [];
// Add 12 option elements
for (let i = 0; i < 12; i++) {
  const option = createElement("option");
  option.value = String(i);
  option.textContent = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"][i];
  monthSelector.appendChild(option);
  monthSelector.options.push(option);
}

const elements = {
  ".preview__grid": previewGrid,
  "#preview-prev": prevBtn,
  "#preview-next": nextBtn,
  "#preview-month-selector": monthSelector,
};

// Mock CalendarEngine
const calendarRenderResult = {
  element: createElement("section"),
  grid: {
    monthIndex: 0,
    year: 2024,
    metadata: { title: "January 2024" },
  },
};

sandboxWindow.CalendarEngine = {
  init() {},
  renderMonth(options) {
    const result = { ...calendarRenderResult };
    result.grid = {
      ...result.grid,
      monthIndex: options.monthIndex || 0,
      year: options.year || 2024,
    };
    return result;
  },
};

// Mock ConfigForm
const configState = {
  year: 2024,
  startDay: "sunday",
  country: "US",
  language: "en",
};

sandboxWindow.ConfigForm = {
  getState() {
    return { ...configState };
  },
  subscribe(callback) {
    configSubscribers.push(callback);
    return () => {
      const index = configSubscribers.indexOf(callback);
      if (index > -1) configSubscribers.splice(index, 1);
    };
  },
};

const configSubscribers = [];

// Mock ImageHandler
const imageState = Array.from({ length: 12 }, (_, i) => ({
  id: ["january", "february", "march", "april", "may", "june",
       "july", "august", "september", "october", "november", "december"][i],
  label: ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"][i],
  asset: {
    url: `assets/default-images/${["january", "february", "march", "april", "may", "june",
                                     "july", "august", "september", "october", "november", "december"][i]}.jpg`,
  },
}));

sandboxWindow.ImageHandler = {
  getImages() {
    return [...imageState];
  },
  subscribe(callback) {
    imageSubscribers.push(callback);
    return () => {
      const index = imageSubscribers.indexOf(callback);
      if (index > -1) imageSubscribers.splice(index, 1);
    };
  },
};

const imageSubscribers = [];

// Mock StepNavigation
sandboxWindow.StepNavigation = {
  subscribe(callback) {
    stepSubscribers.push(callback);
    return () => {
      const index = stepSubscribers.indexOf(callback);
      if (index > -1) stepSubscribers.splice(index, 1);
    };
  },
};

const stepSubscribers = [];

// Mock LocalizationData
sandboxWindow.LocalizationData = {
  getMonthName(language, monthIndex) {
    const names = {
      en: ["January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December"],
    };
    return names[language]?.[monthIndex] || names.en[monthIndex];
  },
};

// Load dependencies
loadScript("js/utils.js", sandbox);
sandbox.Utils = sandboxWindow.Utils;

// Load preview module
loadScript("js/preview.js", sandbox);

const { Preview } = sandboxWindow;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Initialize Preview
Preview.init();

// Test 1: Initial state
assert(Preview.getCurrentMonth() === 0, "Preview should start at month 0 (January)");

// Test 2: Navigate to next month
Preview.setCurrentMonth(1);
assert(Preview.getCurrentMonth() === 1, "Preview should navigate to February (month 1)");
assert(prevBtn.disabled === false, "Previous button should be enabled when not on first month");
assert(nextBtn.disabled === false, "Next button should be enabled when not on last month");

// Test 3: Navigate to last month
Preview.setCurrentMonth(11);
assert(Preview.getCurrentMonth() === 11, "Preview should navigate to December (month 11)");
assert(nextBtn.disabled === true, "Next button should be disabled on last month");

// Test 4: Navigate to first month
Preview.setCurrentMonth(0);
assert(Preview.getCurrentMonth() === 0, "Preview should navigate back to January");
assert(prevBtn.disabled === true, "Previous button should be disabled on first month");

// Test 5: Month selector updates current month
const changeEvent = { target: monthSelector };
monthSelector.value = "5";
monthSelector._listeners?.change?.forEach((cb) => cb(changeEvent));
assert(Preview.getCurrentMonth() === 5, "Month selector should update current month to June (5)");

// Test 6: Render current month creates preview card
Preview.renderCurrentMonth();
assert(previewGrid.children.length > 0, "Rendering should add content to preview grid");
const previewCard = previewGrid.children.find((child) => child.className.includes("preview-card"));
assert(previewCard !== undefined, "Rendered content should include a preview card");

// Test 7: Verify subscriptions are set up
setTimeout(() => {
  assert(configSubscribers.length > 0, "ConfigForm subscription should be registered");
  assert(imageSubscribers.length > 0, "ImageHandler subscription should be registered");
  assert(stepSubscribers.length > 0, "StepNavigation subscription should be registered");
  
  console.log("Preview tests passed: pagination, rendering, and subscriptions working correctly");
}, 300);

