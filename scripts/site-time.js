(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var currentDate = document.querySelector("[data-current-date]");
    var currentYear = document.querySelector("[data-current-year]");

    var updateCurrentDate = function () {
      if (!currentDate) {
        return;
      }

      var timeZone = currentDate.getAttribute("data-time-zone") || "America/Fortaleza";
      var locale = currentDate.getAttribute("data-locale") || "pt-BR";
      var formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timeZone,
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      currentDate.textContent = formatter.format(new Date()).toUpperCase();
    };

    updateCurrentDate();
    window.setInterval(updateCurrentDate, 60000);

    if (currentYear) {
      currentYear.textContent = String(new Date().getFullYear());
    }
  });
}());
