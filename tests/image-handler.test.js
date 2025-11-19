const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sandboxWindow = {
  document: {},
  CustomEvent: function CustomEvent(type, detail) {
    this.type = type;
    this.detail = detail;
  },
};

const sandbox = {
  window: sandboxWindow,
  document: sandboxWindow.document,
  console,
  setTimeout,
  clearTimeout,
};

const handlerPath = path.join(__dirname, "..", "js", "image-handler.js");
const handlerCode = fs.readFileSync(handlerPath, "utf8");
vm.runInNewContext(handlerCode, sandbox, { filename: "image-handler.js" });

const internals = sandbox.window.ImageHandler._internals;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(Array.isArray(internals.manifest), "Manifest should be an array");
assert(internals.manifest.length === 12, "Manifest must contain 12 months");

internals.manifest.forEach((entry) => {
  const assetPath = path.join(__dirname, "..", "assets", "default-images", entry.file);
  assert(fs.existsSync(assetPath), `Missing default asset for ${entry.key}`);
});

const goodFile = { type: "image/png", size: internals.MAX_FILE_SIZE - 1024 };
const largeFile = { type: "image/png", size: internals.MAX_FILE_SIZE + 1 };
const wrongTypeFile = { type: "application/pdf", size: 1024 };

assert(internals.validateFile(goodFile).valid, "PNG under limit should be valid");
assert(!internals.validateFile(largeFile).valid, "Files exceeding limit should be invalid");
assert(!internals.validateFile(wrongTypeFile).valid, "Unsupported mime types should be rejected");

const resized = internals.calculateResizeDimensions({ width: 4000, height: 2000 });
assert(resized.width === internals.MAX_EDGE, "Wider dimension should clamp to MAX_EDGE");
assert(resized.height === Math.round(2000 * (internals.MAX_EDGE / 4000)), "Height should scale proportionally");

console.log("Image handler manifest and validation tests passed.");

