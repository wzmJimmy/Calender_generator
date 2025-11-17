const fs = require("fs");
const path = require("path");
const vm = require("vm");

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...classes) => classes.forEach((cls) => set.add(cls)),
    remove: (...classes) => classes.forEach((cls) => set.delete(cls)),
    toggle: (cls, force) => {
      if (typeof force === "boolean") {
        force ? set.add(cls) : set.delete(cls);
        return force;
      }
      if (set.has(cls)) {
        set.delete(cls);
        return false;
      }
      set.add(cls);
      return true;
    },
    contains: (cls) => set.has(cls),
    toArray: () => Array.from(set),
  };
}

function createFieldElement() {
  const classList = createClassList(["field"]);
  return { classList };
}

function createInputElement({ id, name, field }) {
  const classList = createClassList();
  const element = {
    id,
    name,
    value: "",
    classList,
    closest: () => field,
  };
  return element;
}

function createSelectElement({ id, name }) {
  const options = [];
  return {
    id,
    name,
    value: "",
    options,
    _innerHTML: "",
    set innerHTML(value) {
      this._innerHTML = value;
      this.options.length = 0;
    },
    get innerHTML() {
      return this._innerHTML;
    },
    appendChild(option) {
      this.options.push(option);
    },
  };
}

function createHintElement(id) {
  return {
    id,
    textContent: "",
    classList: createClassList(["field__hint"]),
  };
}

const yearField = createFieldElement();

const elements = {
  "#year-input": createInputElement({ id: "year-input", name: "year", field: yearField }),
  "#start-day": { id: "start-day", name: "start-day", value: "sunday" },
  "#language": createSelectElement({ id: "language", name: "language" }),
  "#country": createSelectElement({ id: "country", name: "country" }),
  "#year-hint": createHintElement("year-hint"),
  "#language-hint": createHintElement("language-hint"),
  "#dependency-status": {
    id: "dependency-status",
    textContent: "",
    classList: createClassList(["status-banner"]),
  },
  "#next-step": { addEventListener: () => {} },
  "#download-btn": { addEventListener: () => {} },
};

const formListeners = {};
const formElement = {
  addEventListener: (event, callback) => {
    formListeners[event] = callback;
  },
};

elements[".form"] = formElement;

const documentMock = {
  querySelector(selector) {
    return elements[selector] || null;
  },
  addEventListener(event, callback) {
    if (event === "DOMContentLoaded") {
      callback();
    }
  },
  createElement: (tag) => {
    if (tag === "option") {
      return { value: "", textContent: "" };
    }
    return {};
  },
};

const windowMock = {
  document: documentMock,
  Utils: undefined,
  jspdf: { jsPDF: function () {} },
  html2canvas: function () {},
  dateFns: {},
  Holidays: function () {},
};

const sandbox = {
  window: windowMock,
  document: documentMock,
  console,
  setTimeout,
  clearTimeout,
};

["CalendarEngine", "ImageHandler", "HolidayService", "PdfGenerator"].forEach((key) => {
  const stub = { init() {} };
  if (key === "PdfGenerator") {
    stub.downloadDraft = () => {};
  }
  windowMock[key] = stub;
  sandbox[key] = stub;
});

const runScript = (relativePath) => {
  const scriptPath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(scriptPath, "utf8");
  vm.runInNewContext(code, sandbox, { filename: relativePath });
};

runScript("js/utils.js");
sandbox.Utils = sandbox.window.Utils;
runScript("js/localization-data.js");
runScript("js/config-form.js");

windowMock.ConfigForm.init();

const inputHandler = formListeners.input;

function emitInput(element) {
  if (typeof inputHandler === "function") {
    inputHandler({ target: element });
  }
}

const assertions = [];
function assert(description, condition) {
  const passed = Boolean(condition);
  assertions.push({ description, passed });
  if (!passed) {
    throw new Error(`Assertion failed: ${description}`);
  }
}

const currentYear = new Date().getFullYear();
const expectedYear = Math.min(Math.max(currentYear, 2020), 2030);
assert("Year input defaults to clamped current year", elements["#year-input"].value === expectedYear);

elements["#year-input"].value = "2035";
emitInput(elements["#year-input"]);
assert("Year upper bound enforced", String(elements["#year-input"].value) === "2030");
assert(
  "Year hint warns when clamped high",
  elements["#year-hint"].textContent.includes("Maximum supported year")
);

elements["#year-input"].value = "abcd";
emitInput(elements["#year-input"]);
assert("Invalid year keeps field in error state", yearField.classList.contains("field--error"));
assert(
  "Invalid year shows guidance message",
  elements["#year-hint"].textContent.includes("Enter a year")
);

elements["#country"].value = "FR";
emitInput(elements["#country"]);
assert("Country change auto-selects French", elements["#language"].value === "fr");
assert(
  "Language hint reflects auto-detect",
  elements["#language-hint"].textContent.includes("France")
);

elements["#language"].value = "es";
emitInput(elements["#language"]);
assert(
  "Manual language override confirmed",
  elements["#language-hint"].textContent.includes("manually")
);

console.log("Phase 2 configuration tests passed:", assertions.length);

