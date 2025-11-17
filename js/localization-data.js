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
  };

  window.LocalizationData = LocalizationData;
})();

