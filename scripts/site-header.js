(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".site-header__toggle");
    var siteHeader = document.querySelector(".site-header");
    var navigationLinks = document.querySelectorAll(".site-header__nav a");
    var currentDate = document.querySelector("[data-current-date]");

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

    if (!menuToggle || !siteHeader) {
      return;
    }

    var syncMenuState = function (isOpen) {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      siteHeader.classList.toggle("is-menu-open", isOpen);
    };

    menuToggle.addEventListener("click", function () {
      var expanded = menuToggle.getAttribute("aria-expanded") === "true";
      syncMenuState(!expanded);
    });

    navigationLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        syncMenuState(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) {
        syncMenuState(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (!siteHeader.contains(event.target)) {
        syncMenuState(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        syncMenuState(false);
      }
    });
  });
}());
