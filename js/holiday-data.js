(function () {
  const DEFAULT_COUNTRY = "US";
  const DEFAULT_LANGUAGE = "en";
  const cache = new Map();
  let hasLibrary = false;
  let HolidaysConstructor = null;

  function init() {
    HolidaysConstructor = resolveHolidaysConstructor();
    hasLibrary = Boolean(HolidaysConstructor);
    if (!hasLibrary) {
      console.warn(
        "[HolidayService] date-holidays library missing. Holiday highlighting will use fallback data."
      );
    }
  }

  function resolveHolidaysConstructor() {
    const candidates = [
      window.Holidays,
      window.dateHolidays,
      window.Holidays?.default,
      window.dateHolidays?.default,
    ];
    return candidates.find((candidate) => typeof candidate === "function") || null;
  }

  function buildCacheKey({ year, country, language }) {
    return `${country || DEFAULT_COUNTRY}-${year}-${language || DEFAULT_LANGUAGE}`;
  }

  function normalizeHolidayEntry(entry) {
    const iso = extractIsoDate(entry.date);
    if (!iso) return null;

    const dateParts = iso.split("-").map((segment) => Number(segment));
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    return {
      isoDate: iso,
      date: dateObj,
      name: entry.name || entry.nameEn || entry.nameLocal || "Holiday",
      type: entry.type || "public",
      substitute: Boolean(entry.substitute),
      rule: entry.rule || "",
      raw: entry,
    };
  }

  function extractIsoDate(value) {
    if (!value) return null;
    if (typeof value === "string") {
      return value.slice(0, 10);
    }
    if (value instanceof Date) {
      return window.Utils?.formatISODate?.(value) || null;
    }
    return null;
  }

  function fetchNormalizedHolidays({ year, country = DEFAULT_COUNTRY, language = DEFAULT_LANGUAGE }) {
    const cacheKey = buildCacheKey({ year, country, language });
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const ctor = HolidaysConstructor || resolveHolidaysConstructor();
    if (!ctor) {
      const fallback = useFallbackHolidays({ year, country, language, cacheKey });
      return fallback;
    }

    try {
      const holidaysLib = new ctor(country);
      if (language && typeof holidaysLib.setLanguages === "function") {
        holidaysLib.setLanguages(language);
      }
      const results = holidaysLib.getHolidays(year) || [];
      let normalized = results.map(normalizeHolidayEntry).filter(Boolean);

      if (!normalized.length) {
        normalized = useFallbackHolidays({ year, country, language, cacheKey, skipCache: true });
      } else {
        cache.set(cacheKey, normalized);
      }
      return normalized;
    } catch (error) {
      console.error("[HolidayService] Failed to fetch holidays:", error);
      const fallback = useFallbackHolidays({ year, country, language, cacheKey });
      return fallback;
    }
  }

  function useFallbackHolidays({ year, country, language, cacheKey, skipCache = false }) {
    const fallback = buildFallbackHolidays(year, country, language);
    if (!skipCache) {
      cache.set(cacheKey, fallback);
    }
    return fallback;
  }

  function buildFallbackHolidays(year, country, language) {
    const getTemplates = window.LocalizationData?.getHolidayTemplates;
    const templates =
      (typeof getTemplates === "function" && getTemplates(country)) || [];
    if (!templates.length) {
      return [];
    }

    return templates
      .map((definition) => {
        const date = createFallbackDate(year, definition);
        return normalizeHolidayEntry({
          date,
          name: definition.name,
          nameLocal: definition.localized?.[language],
          type: "public",
        });
      })
      .filter(Boolean);
  }

  function createFallbackDate(year, definition) {
    if (definition.rule === "nth-weekday") {
      return getNthWeekdayOfMonth(year, definition.month, definition.weekday, definition.occurrence);
    }
    return new Date(year, definition.month, definition.day);
  }

  function getNthWeekdayOfMonth(year, monthIndex, weekdayIndex, occurrence) {
    const firstOfMonth = new Date(year, monthIndex, 1);
    const firstWeekdayOffset = (weekdayIndex - firstOfMonth.getDay() + 7) % 7;
    const day = 1 + firstWeekdayOffset + (occurrence - 1) * 7;
    return new Date(year, monthIndex, day);
  }

  function getMonthHolidayMap({ year, monthIndex, country, language } = {}) {
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
      return {};
    }

    const holidays = fetchNormalizedHolidays({ year, country, language });
    return holidays.reduce((acc, holiday) => {
      if (
        holiday.date.getFullYear() !== year ||
        holiday.date.getMonth() !== monthIndex
      ) {
        return acc;
      }

      if (!acc[holiday.isoDate]) {
        acc[holiday.isoDate] = [];
      }
      acc[holiday.isoDate].push(holiday);
      return acc;
    }, {});
  }

  function getHolidaysForYear({ year, country, language } = {}) {
    if (!Number.isFinite(year)) {
      return [];
    }
    return fetchNormalizedHolidays({ year, country, language });
  }

  function getHolidayListForDate({ date, country, language } = {}) {
    if (!(date instanceof Date)) {
      return [];
    }

    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const iso = window.Utils?.formatISODate?.(date) || null;
    const monthMap = getMonthHolidayMap({ year, monthIndex, country, language });
    return monthMap[iso] || [];
  }

  function clearCache() {
    cache.clear();
  }

  const HolidayService = {
    init,
    getHolidaysForYear,
    getMonthHolidayMap,
    getHolidayListForDate,
    clearCache,
    _internals: {
      cache,
      buildCacheKey,
      extractIsoDate,
      normalizeHolidayEntry,
      resolveHolidaysConstructor,
      buildFallbackHolidays,
      getNthWeekdayOfMonth,
    },
  };

  window.HolidayService = HolidayService;
})();
