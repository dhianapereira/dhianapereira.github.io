(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".site-header__toggle");
    var siteHeader = document.querySelector(".site-header");
    var navigationLinks = document.querySelectorAll(".site-header__nav a");

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
