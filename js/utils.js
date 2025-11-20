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
    formatISODate(date) {
      if (!(date instanceof Date)) {
        return null;
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatBytes(bytes) {
      if (!bytes || bytes === 0) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
      );
      const value = bytes / Math.pow(1024, exponent);
      return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    },
    preventDefault(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    chunkArray(array, chunkSize) {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    },
    debounce(func, wait) {
      let timeout = null;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  };

  window.Utils = Utils;
})();
