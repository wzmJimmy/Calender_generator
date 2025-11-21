(function () {
  if (!window.Utils) {
    console.error("[CalendarEngine] Utils module missing. Initialization aborted.");
    return;
  }

  if (!window.CalendarData) {
    console.error("[CalendarEngine] CalendarData module missing. Initialization aborted.");
    return;
  }

  const Utils = window.Utils;
  const CalendarData = window.CalendarData;

  const state = {
    initialized: false,
  };

  // Layout style registry
  const LAYOUT_STYLES = {
    cellular: "cellular",
    apple: "apple",
  };

  // Default layout style configuration
  // Change this to "cellular" to make Cellular style the default
  const DEFAULT_LAYOUT_STYLE = "apple";

  function init() {
    state.initialized = true;

    if (!window.LocalizationData) {
      console.warn("[CalendarEngine] Localization data missing. Falling back to English labels.");
    }

    if (!window.HolidayService) {
      console.warn("[CalendarEngine] HolidayService missing. Calendars will omit holiday metadata.");
    }
  }

  /**
   * Create a day cell element
   * @param {object} cellData - Cell data from CalendarData
   * @param {Document} doc - Document object
   * @returns {HTMLElement} Day cell element
   */
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

  /**
   * Calendar Renderer - handles rendering calendar grids with different layout styles
   */
  const CalendarRenderer = {
    /**
     * Render a calendar grid with the specified layout style
     * @param {object} grid - Calendar grid data from CalendarData.getMonthGrid()
     * @param {string} layoutStyle - Layout style ("cellular" or "apple")
     * @param {Document} doc - Document object (defaults to window.document)
     * @returns {HTMLElement} Calendar container element
     */
    render(grid, layoutStyle = DEFAULT_LAYOUT_STYLE, doc = window.document) {
      if (!doc?.createElement) {
        throw new Error("[CalendarRenderer] Cannot render calendar without a DOM implementation.");
      }

      const normalizedStyle = LAYOUT_STYLES[layoutStyle] || DEFAULT_LAYOUT_STYLE;

      const container = doc.createElement("section");
      container.className = "calendar-month calendar-layout--" + normalizedStyle;
      container.setAttribute("data-month-index", String(grid.monthIndex));
      container.setAttribute("data-year", String(grid.year));
      container.setAttribute("data-layout-style", normalizedStyle);

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

      return container;
    },
  };

  /**
   * Get month grid data (delegates to CalendarData)
   */
  function getMonthGrid(year, monthIndex, startDay = "sunday", options = {}) {
    return CalendarData.getMonthGrid(year, monthIndex, startDay, options);
  }

  /**
   * Render a calendar month (maintains backward compatibility)
   */
  function renderMonth(options = {}) {
    const { year = Utils.getCurrentYear(), monthIndex = 0, layoutStyle = DEFAULT_LAYOUT_STYLE } = options;
    const grid = getMonthGrid(year, monthIndex, options.startDay || "sunday", options);
    const element = CalendarRenderer.render(grid, layoutStyle);

    return {
      element,
      grid,
    };
  }

  // Maintain backward compatibility: CalendarEngine facade
  const CalendarEngine = {
    init,
    getMonthGrid,
    renderMonth,
    getWeekdayLabels(language, startDay, variant) {
      return CalendarData.getWeekdayLabels(language, startDay, variant);
    },
    // Expose renderer for advanced usage
    renderer: CalendarRenderer,
    // Expose layout styles
    LAYOUT_STYLES,
    // Expose default layout style config
    DEFAULT_LAYOUT_STYLE,
    _internals: {
      createDayCell,
    },
  };

  window.CalendarEngine = CalendarEngine;
  window.CalendarRenderer = CalendarRenderer;
})();
