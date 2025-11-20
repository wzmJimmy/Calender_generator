const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadScript(relativePath, sandbox) {
  const scriptPath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(scriptPath, "utf8");
  vm.runInNewContext(code, sandbox, { filename: relativePath });
}

const sandboxWindow = {
  document: {},
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

sandboxWindow.document = {
  createElement() {
    return {
      children: [],
      className: "",
      attributes: {},
      classList: {
        add() {},
      },
      setAttribute(key, value) {
        this.attributes[key] = value;
      },
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      textContent: "",
    };
  },
};

class HolidaysStub {
  constructor(country) {
    this.country = country;
    this.languages = [];
  }

  setLanguages(language) {
    this.languages.push(language);
  }

  getHolidays(year) {
    if (this.country === "US" && year === 2024) {
      return [
        { date: "2024-01-01 00:00:00", name: "New Year" },
        { date: "2024-01-15 00:00:00", name: "Founders Day" },
      ];
    }
    return [];
  }
}

sandboxWindow.Holidays = HolidaysStub;

loadScript("js/utils.js", sandbox);
loadScript("js/localization-data.js", sandbox);
loadScript("js/holiday-data.js", sandbox);
loadScript("js/calendar.js", sandbox);

const { CalendarEngine, HolidayService } = sandboxWindow;

HolidayService.init();
CalendarEngine.init();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const gridResult = CalendarEngine.getMonthGrid(2024, 0, "monday", {
  country: "US",
  language: "en",
});

assert(gridResult.cells.length === 35, "January 2024 should produce 35 cells when week starts Monday.");
assert(
  gridResult.weekdayLabels[0] === "Mon",
  "Weekday labels should respect configured start day."
);

const firstCell = gridResult.cells[0];
assert(firstCell.day === 1 && firstCell.isCurrentMonth, "Grid should begin on January 1st for Monday start.");

const holidayCell = gridResult.cells.find((cell) => cell.isoDate === "2024-01-01");
assert(holidayCell?.isHoliday, "New Year should be marked as a holiday.");

const secondHoliday = gridResult.cells.find((cell) => cell.isoDate === "2024-01-15");
assert(secondHoliday?.holidays?.length === 1, "Holiday metadata should be attached to cells.");

assert(gridResult.weeks.length === gridResult.cells.length / 7, "Grid should form full week rows.");

console.log("Calendar engine grid tests passed.");

