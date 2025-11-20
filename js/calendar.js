(function () {
  if (!window.Utils) {
    console.error("[CalendarEngine] Utils module missing. Initialization aborted.");
    return;
  }

  const Utils = window.Utils;
  const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const DAY_INDEX = DAY_ORDER.reduce((acc, key, index) => {
    acc[key] = index;
    return acc;
  }, {});

  const fallbackMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const state = {
    initialized: false,
  };

  function init() {
    state.initialized = true;

    if (!window.LocalizationData) {
      console.warn("[CalendarEngine] Localization data missing. Falling back to English labels.");
    }

    if (!window.HolidayService) {
      console.warn("[CalendarEngine] HolidayService missing. Calendars will omit holiday metadata.");
    }
  }

  function normalizeInputs(year, monthIndex, startDay, options = {}) {
    let normalizedStart = typeof startDay === "string" ? startDay.toLowerCase() : "sunday";
    if (!DAY_ORDER.includes(normalizedStart)) {
      normalizedStart = "sunday";
    }

    const numericYear = Number.isFinite(year) ? year : Utils.getCurrentYear();
    const numericMonth = Number.isFinite(monthIndex) ? Math.min(Math.max(monthIndex, 0), 11) : 0;

    const localization = window.LocalizationData;
    const defaultLanguage = localization?.languages?.[0]?.code || "en";
    const defaultCountry = localization?.countries?.[0]?.code || "US";

    const language = options.language || defaultLanguage;
    const country = options.country || defaultCountry;

    return {
      year: numericYear,
      monthIndex: numericMonth,
      startDayKey: normalizedStart,
      startDayIndex: DAY_INDEX[normalizedStart] ?? 0,
      language,
      country,
      showWeekNumbers: Boolean(options.showWeekNumbers),
    };
  }


  function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function getLeadingDayCount(year, monthIndex, startDayIndex) {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    return (firstDay - startDayIndex + 7) % 7;
  }

  function buildCells(config, holidayMap) {
    const { year, monthIndex, startDayIndex } = config;
    const firstOfMonth = new Date(year, monthIndex, 1);
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const leading = getLeadingDayCount(year, monthIndex, startDayIndex);
    const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;
    const today = new Date();

    return Array.from({ length: totalCells }, (_, index) => {
      const dayOffset = index - leading;
      const cellDate = new Date(year, monthIndex, 1 + dayOffset);
      const isoDate = Utils.formatISODate(cellDate);
      const holidays = holidayMap[isoDate] || [];
      const isCurrentMonth =
        cellDate.getFullYear() === year && cellDate.getMonth() === monthIndex;

      return {
        date: cellDate,
        isoDate,
        day: cellDate.getDate(),
        isCurrentMonth,
        monthOffset: isCurrentMonth ? 0 : cellDate < firstOfMonth ? -1 : 1,
        isToday:
          cellDate.getFullYear() === today.getFullYear() &&
          cellDate.getMonth() === today.getMonth() &&
          cellDate.getDate() === today.getDate(),
        isHoliday: holidays.length > 0,
        holidays,
      };
    });
  }

  function chunkIntoWeeks(cells) {
    return Utils.chunkArray(cells, 7);
  }

  function getLocalizedMonthName(language, monthIndex) {
    return (
      window.LocalizationData?.getMonthName?.(language, monthIndex) ||
      fallbackMonthNames[monthIndex] ||
      fallbackMonthNames[0]
    );
  }

  function getLocalizedWeekdayLabels(language, startDayKey, variant = "short") {
    const localization = window.LocalizationData;
    const labelsSource =
      variant === "long"
        ? localization?.getDayNames?.(language)
        : localization?.getDayAbbreviations?.(language);

    const labels = Array.isArray(labelsSource) && labelsSource.length === 7
      ? labelsSource.slice()
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const startIndex = DAY_INDEX[startDayKey] ?? 0;
    return labels.slice(startIndex).concat(labels.slice(0, startIndex));
  }

  function formatMonthTitle({ year, monthIndex, language }) {
    const referenceDate = new Date(year, monthIndex, 1);
    try {
      return new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(
        referenceDate
      );
    } catch (_error) {
      return `${getLocalizedMonthName(language, monthIndex)} ${year}`;
    }
  }

  function getMonthGrid(year, monthIndex, startDay = "sunday", options = {}) {
    if (typeof startDay === "object") {
      options = startDay;
      startDay = options.startDay || "sunday";
    }

    const config = normalizeInputs(year, monthIndex, startDay, options);

    const holidayMap =
      window.HolidayService?.getMonthHolidayMap?.({
        year: config.year,
        monthIndex: config.monthIndex,
        country: config.country,
        language: config.language,
      }) || {};

    const cells = buildCells(config, holidayMap);
    const weeks = chunkIntoWeeks(cells);
    const weekdayLabels = getLocalizedWeekdayLabels(config.language, config.startDayKey, "short");
    const weekdayLabelsLong = getLocalizedWeekdayLabels(config.language, config.startDayKey, "long");

    return {
      ...config,
      cells,
      weeks,
      weekdayLabels,
      weekdayLabelsLong,
      holidays: holidayMap,
      metadata: {
        monthName: getLocalizedMonthName(config.language, config.monthIndex),
        title: formatMonthTitle(config),
      },
    };
  }

  function renderMonth(options = {}) {
    const { year = Utils.getCurrentYear(), monthIndex = 0 } = options;
    const grid = getMonthGrid(year, monthIndex, options.startDay || "sunday", options);
    const doc = window.document;

    if (!doc?.createElement) {
      throw new Error("[CalendarEngine] Cannot render calendar without a DOM implementation.");
    }

    const container = doc.createElement("section");
    container.className = "calendar-month";
    container.setAttribute("data-month-index", String(grid.monthIndex));
    container.setAttribute("data-year", String(grid.year));

    const header = doc.createElement("header");
    header.className = "calendar-month__header";

    const title = doc.createElement("h3");
    title.className = "calendar-month__title";
    title.textContent = grid.metadata.title;

    header.appendChild(title);
    container.appendChild(header);

    const weekLabelRow = doc.createElement("div");
    weekLabelRow.className = "calendar-grid calendar-grid--labels";
    grid.weekdayLabels.forEach((label) => {
      const cell = doc.createElement("div");
      cell.className = "calendar-grid__label";
      cell.textContent = label;
      weekLabelRow.appendChild(cell);
    });
    container.appendChild(weekLabelRow);

    const gridEl = doc.createElement("div");
    gridEl.className = "calendar-grid";

    grid.cells.forEach((cell) => {
      gridEl.appendChild(createDayCell(cell, doc));
    });

    container.appendChild(gridEl);

    return {
      element: container,
      grid,
    };
  }

  function createDayCell(cellData, doc) {
    const cell = doc.createElement("div");
    cell.className = "calendar-cell";
    cell.setAttribute("data-date", cellData.isoDate);

    if (!cellData.isCurrentMonth) {
      cell.classList.add("calendar-cell--muted");
    }

    if (cellData.isToday) {
      cell.classList.add("calendar-cell--today");
    }

    if (cellData.isHoliday) {
      cell.classList.add("calendar-cell--holiday");
    }

    const dayLabel = doc.createElement("span");
    dayLabel.className = "calendar-cell__date";
    dayLabel.textContent = String(cellData.day);
    cell.appendChild(dayLabel);

    if (cellData.isHoliday && Array.isArray(cellData.holidays)) {
      const holidayList = doc.createElement("ul");
      holidayList.className = "calendar-cell__holidays";
      cellData.holidays.forEach((holiday) => {
        const item = doc.createElement("li");
        item.className = "calendar-cell__holiday-tag";
        item.textContent = holiday.name;
        holidayList.appendChild(item);
      });
      cell.appendChild(holidayList);
    }

    return cell;
  }

  const CalendarEngine = {
    init,
    getMonthGrid,
    renderMonth,
    getWeekdayLabels(language, startDay, variant) {
      return getLocalizedWeekdayLabels(language || "en", startDay || "sunday", variant || "short");
    },
    _internals: {
      normalizeInputs,
      buildCells,
      chunkIntoWeeks,
      getDaysInMonth,
      getLeadingDayCount,
      createDayCell,
    },
  };

  window.CalendarEngine = CalendarEngine;
})();
