(function () {
  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "it", label: "Italian" },
  ];

  const countries = [
    { code: "US", label: "United States", defaultLanguage: "en" },
    { code: "CA", label: "Canada", defaultLanguage: "en" },
    { code: "GB", label: "United Kingdom", defaultLanguage: "en" },
    { code: "AU", label: "Australia", defaultLanguage: "en" },
    { code: "DE", label: "Germany", defaultLanguage: "de" },
    { code: "FR", label: "France", defaultLanguage: "fr" },
    { code: "ES", label: "Spain", defaultLanguage: "es" },
    { code: "IT", label: "Italy", defaultLanguage: "it" },
    { code: "MX", label: "Mexico", defaultLanguage: "es" },
    { code: "JP", label: "Japan", defaultLanguage: "ja" },
    { code: "CN", label: "China", defaultLanguage: "zh" },
  ];

  function findLanguage(code) {
    return languages.find((lang) => lang.code === code);
  }

  function findCountry(code) {
    return countries.find((country) => country.code === code);
  }

  const monthNames = {
    en: [
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
    ],
    es: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    fr: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    de: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    zh: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    ja: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    it: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
  };

  const dayNames = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    zh: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    ja: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
    it: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  };

  function getMonthNames(code) {
    return monthNames[code] || monthNames.en;
  }

  function getMonthName(code, index) {
    const list = getMonthNames(code);
    return list[index] || list[0];
  }

  function getDayNames(code) {
    return dayNames[code] || dayNames.en;
  }

  function getDayAbbreviations(code) {
    return getDayNames(code).map((name) => (name?.length > 3 ? name.slice(0, 3) : name));
  }

  const holidayTemplates = {
    DEFAULT: [
      { month: 0, day: 1, name: "New Year's Day" },
      { month: 4, day: 1, name: "Labor Day" },
      { month: 11, day: 25, name: "Holiday Celebration" },
    ],
    US: [
      { month: 0, day: 1, name: "New Year's Day" },
      { month: 6, day: 4, name: "Independence Day" },
      { month: 10, day: 11, name: "Veterans Day" },
      { month: 11, day: 25, name: "Christmas Day" },
    ],
    CA: [
      { month: 0, day: 1, name: "New Year's Day" },
      { month: 6, day: 1, name: "Canada Day" },
      { month: 8, day: 4, name: "Labour Day (1st Monday)", rule: "nth-weekday", weekday: 1, occurrence: 1 },
      { month: 11, day: 25, name: "Christmas Day" },
    ],
    GB: [
      { month: 0, day: 1, name: "New Year's Day" },
      { month: 4, day: 1, name: "Early May Bank Holiday" },
      { month: 7, day: 28, name: "Summer Bank Holiday" },
      { month: 11, day: 25, name: "Christmas Day" },
    ],
    AU: [
      { month: 0, day: 26, name: "Australia Day" },
      { month: 3, day: 25, name: "ANZAC Day" },
      { month: 11, day: 25, name: "Christmas Day" },
    ],
    DE: [
      { month: 0, day: 1, name: "Neujahrstag" },
      { month: 4, day: 1, name: "Tag der Arbeit" },
      { month: 9, day: 3, name: "Tag der Deutschen Einheit" },
      { month: 11, day: 25, name: "Erster Weihnachtstag" },
    ],
    FR: [
      { month: 0, day: 1, name: "Jour de l'An" },
      { month: 4, day: 1, name: "Fête du Travail" },
      { month: 6, day: 14, name: "Fête Nationale" },
      { month: 11, day: 25, name: "Noël" },
    ],
    ES: [
      { month: 0, day: 6, name: "Día de Reyes" },
      { month: 4, day: 1, name: "Día del Trabajo" },
      { month: 9, day: 12, name: "Fiesta Nacional de España" },
      { month: 11, day: 25, name: "Navidad" },
    ],
    IT: [
      { month: 0, day: 6, name: "Epifania" },
      { month: 3, day: 25, name: "Liberazione" },
      { month: 5, day: 2, name: "Festa della Repubblica" },
      { month: 11, day: 25, name: "Natale" },
    ],
    CN: [
      { month: 0, day: 1, name: "元旦" },
      { month: 4, day: 1, name: "劳动节" },
      { month: 9, day: 1, name: "国庆节" },
    ],
    JP: [
      { month: 0, day: 1, name: "元日" },
      { month: 1, day: 11, name: "建国記念の日" },
      { month: 10, day: 3, name: "文化の日" },
      { month: 11, day: 23, name: "天皇誕生日" },
    ],
  };

  function getHolidayTemplates(code) {
    if (!code) return holidayTemplates.DEFAULT;
    return holidayTemplates[code] || holidayTemplates.DEFAULT;
  }

  const LocalizationData = {
    languages,
    countries,
    getDefaultLanguageForCountry(code) {
      return findCountry(code)?.defaultLanguage || null;
    },
    getLanguageLabel(code) {
      return findLanguage(code)?.label || code;
    },
    getCountryLabel(code) {
      return findCountry(code)?.label || code;
    },
    getMonthNames,
    getMonthName,
    getDayNames,
    getDayAbbreviations,
    getHolidayTemplates,
  };

  window.LocalizationData = LocalizationData;
})();

