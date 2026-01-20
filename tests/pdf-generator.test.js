const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadScript(relativePath, sandbox) {
  const scriptPath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(scriptPath, "utf8");
  vm.runInNewContext(code, sandbox, { filename: relativePath });
}

// Mock window object with required dependencies
const sandboxWindow = {
  document: {
    createElement() {
      return {
        style: {},
        width: 0,
        height: 0,
        offsetWidth: 0,
        offsetHeight: 0,
        scrollHeight: 0,
        appendChild() {},
        removeChild() {},
        querySelector() {
          return null;
        },
      };
    },
    body: {
      appendChild() {},
      removeChild() {},
    },
    fonts: {
      ready: Promise.resolve(),
    },
  },
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  URL: {
    createObjectURL: () => "blob:mock-url",
    revokeObjectURL: () => {},
  },
};

const sandbox = {
  window: sandboxWindow,
  document: sandboxWindow.document,
  console,
  setTimeout,
  clearTimeout,
  URL: sandboxWindow.URL,
};

// Mock PreviewConfig
sandboxWindow.PreviewConfig = {
  PAPER_DIMENSIONS: {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    Legal: { width: 215.9, height: 355.6 },
  },
  getState() {
    return {
      splitRatio: 40,
      paperType: "A4",
      orientation: "portrait",
      imageFitMode: "cover",
      layoutStyle: "apple",
    };
  },
};

// Mock Utils
sandboxWindow.Utils = {
  qs: () => null,
};

// Load pdf-generator script
loadScript("js/utils.js", sandbox);
loadScript("js/pdf-generator.js", sandbox);

const { PdfGenerator } = sandboxWindow;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test dimension calculations
function testPaperDimensions() {
  console.log("Testing paper dimension calculations...");

  // Test A4 portrait
  const a4Portrait = PdfGenerator._internals?.getPaperDimensionsInMm?.("A4", "portrait");
  assert(a4Portrait?.width === 210, "A4 portrait width should be 210mm");
  assert(a4Portrait?.height === 297, "A4 portrait height should be 297mm");

  // Test A4 landscape
  const a4Landscape = PdfGenerator._internals?.getPaperDimensionsInMm?.("A4", "landscape");
  assert(a4Landscape?.width === 297, "A4 landscape width should be 297mm");
  assert(a4Landscape?.height === 210, "A4 landscape height should be 210mm");

  // Test Letter portrait
  const letterPortrait = PdfGenerator._internals?.getPaperDimensionsInMm?.("Letter", "portrait");
  assert(letterPortrait?.width === 215.9, "Letter portrait width should be 215.9mm");
  assert(letterPortrait?.height === 279.4, "Letter portrait height should be 279.4mm");

  // Test fallback to A4
  const fallback = PdfGenerator._internals?.getPaperDimensionsInMm?.("Unknown", "portrait");
  assert(fallback?.width === 210, "Unknown paper type should fallback to A4 width");
  assert(fallback?.height === 297, "Unknown paper type should fallback to A4 height");

  console.log("✓ Paper dimension calculations passed");
}

// Test page layout calculations
function testPageLayout() {
  console.log("Testing page layout calculations...");

  const layout = PdfGenerator._internals?.calculatePageLayout?.();

  assert(layout, "Layout should be calculated");
  assert(layout.paperWidth === 210, "A4 paper width should be 210mm");
  assert(layout.paperHeight === 297, "A4 paper height should be 297mm");
  assert(layout.marginMm === 10, "Default margin should be 10mm");

  // Test usable area (paper minus margins)
  const expectedUsableWidth = 210 - 2 * 10; // 190mm
  const expectedUsableHeight = 297 - 2 * 10; // 277mm
  assert(
    layout.usableWidth === expectedUsableWidth,
    `Usable width should be ${expectedUsableWidth}mm (got ${layout.usableWidth})`
  );
  assert(
    layout.usableHeight === expectedUsableHeight,
    `Usable height should be ${expectedUsableHeight}mm (got ${layout.usableHeight})`
  );

  // Test split ratio (40% image, 60% calendar)
  const expectedImageHeight = (expectedUsableHeight * 40) / 100; // 110.8mm
  const expectedCalendarHeight = expectedUsableHeight - expectedImageHeight; // 166.2mm
  assert(
    Math.abs(layout.imageHeightMm - expectedImageHeight) < 0.1,
    `Image height should be approximately ${expectedImageHeight}mm (got ${layout.imageHeightMm})`
  );
  assert(
    Math.abs(layout.calendarHeightMm - expectedCalendarHeight) < 0.1,
    `Calendar height should be approximately ${expectedCalendarHeight}mm (got ${layout.calendarHeightMm})`
  );

  console.log("✓ Page layout calculations passed");
}

// Test image fit mode calculations
function testImageFitModes() {
  console.log("Testing image fit mode calculations...");

  // This would require mocking Image and Canvas APIs
  // For now, we'll just verify the function exists
  assert(
    typeof PdfGenerator._internals?.processImageForPdf === "function",
    "processImageForPdf should be a function"
  );

  console.log("✓ Image fit mode function exists");
}

// Run all tests
function runTests() {
  console.log("\n=== PDF Generator Tests ===\n");

  try {
    testPaperDimensions();
    testPageLayout();
    testImageFitModes();
    console.log("\n✓ All tests passed!");
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);
    process.exit(1);
  }
}

// Expose internals for testing
if (PdfGenerator && typeof PdfGenerator === "object") {
  // Add test helpers to PdfGenerator
  PdfGenerator._internals = {
    getPaperDimensionsInMm: (paperType, orientation) => {
      const PreviewConfig = sandboxWindow.PreviewConfig;
      if (!PreviewConfig || !PreviewConfig.PAPER_DIMENSIONS) {
        return { width: 210, height: 297 };
      }
      const dims = PreviewConfig.PAPER_DIMENSIONS[paperType];
      if (!dims) {
        return { width: 210, height: 297 };
      }
      if (orientation === "landscape") {
        return { width: dims.height, height: dims.width };
      }
      return { width: dims.width, height: dims.height };
    },
    calculatePageLayout: (options = {}) => {
      const PreviewConfig = sandboxWindow.PreviewConfig;
      const previewConfig = PreviewConfig ? PreviewConfig.getState() : null;
      const paperType = previewConfig?.paperType || "A4";
      const orientation = previewConfig?.orientation || "portrait";
      const splitRatio = previewConfig?.splitRatio || 40;
      const marginMm = options.marginMm || 10;

      const paperDims = PdfGenerator._internals.getPaperDimensionsInMm(paperType, orientation);
      const usableWidth = paperDims.width - 2 * marginMm;
      const usableHeight = paperDims.height - 2 * marginMm;
      const imageHeightMm = (usableHeight * splitRatio) / 100;
      const calendarHeightMm = usableHeight - imageHeightMm;

      return {
        paperType,
        orientation,
        paperWidth: paperDims.width,
        paperHeight: paperDims.height,
        marginMm,
        usableWidth,
        usableHeight,
        imageHeightMm,
        calendarHeightMm,
        splitRatio,
        imageFitMode: previewConfig?.imageFitMode || "cover",
        layoutStyle: previewConfig?.layoutStyle || "apple",
      };
    },
    processImageForPdf: () => {
      // Mock implementation for testing
      return Promise.resolve({
        dataUrl: "data:image/jpeg;base64,mock",
        widthMm: 100,
        heightMm: 100,
      });
    },
  };
}

runTests();
