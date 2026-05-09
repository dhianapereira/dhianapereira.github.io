(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".site-header__toggle");
    var siteHeader = document.querySelector(".site-header");
    var navigationLinks = document.querySelectorAll(".site-header__nav a");
    var elements = document.querySelectorAll(".reveal-on-scroll");
    var observer;

    if (menuToggle && siteHeader) {
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
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("reveal-on-scroll--visible");
      });
      return;
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-on-scroll--visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16
    });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  });
}());
