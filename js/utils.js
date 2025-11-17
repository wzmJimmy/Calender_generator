(function () {
  const Utils = {
    qs(selector, scope = document) {
      return scope.querySelector(selector);
    },
    qsa(selector, scope = document) {
      return Array.from(scope.querySelectorAll(selector));
    },
    clampYear(year) {
      const min = 2020;
      const max = 2030;
      return Math.min(Math.max(year, min), max);
    },
    getCurrentYear() {
      return new Date().getFullYear();
    },
  };

  window.Utils = Utils;
})();
