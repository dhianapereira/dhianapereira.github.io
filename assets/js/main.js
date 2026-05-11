(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".site-header__toggle");
    var siteHeader = document.querySelector(".site-header");
    var navigationLinks = document.querySelectorAll(".site-header__nav a");
    var carousels = document.querySelectorAll("[data-carousel]");
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
    }

    carousels.forEach(function (carousel) {
      var viewport = carousel.querySelector("[data-carousel-viewport]");
      var slides = Array.prototype.slice.call(
        carousel.querySelectorAll("[data-carousel-slide]")
      );
      var dots = Array.prototype.slice.call(
        carousel.querySelectorAll("[data-carousel-dot]")
      );
      var previousButton = carousel.querySelector("[data-carousel-prev]");
      var nextButton = carousel.querySelector("[data-carousel-next]");
      var scrollTimer;
      var currentIndex = 0;

      if (!viewport || slides.length < 2) {
        return;
      }

      var updateControls = function (index) {
        currentIndex = index;

        if (previousButton) {
          previousButton.disabled = currentIndex === 0;
        }

        if (nextButton) {
          nextButton.disabled = currentIndex === slides.length - 1;
        }

        dots.forEach(function (dot, dotIndex) {
          var isActive = dotIndex === currentIndex;

          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
      };

      var scrollToIndex = function (index) {
        var boundedIndex = Math.max(0, Math.min(index, slides.length - 1));

        slides[boundedIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start"
        });

        updateControls(boundedIndex);
      };

      var getNearestIndex = function () {
        var closestIndex = 0;
        var smallestDistance = Number.POSITIVE_INFINITY;

        slides.forEach(function (slide, slideIndex) {
          var distance = Math.abs(slide.offsetLeft - viewport.scrollLeft);

          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestIndex = slideIndex;
          }
        });

        return closestIndex;
      };

      if (previousButton) {
        previousButton.addEventListener("click", function () {
          scrollToIndex(currentIndex - 1);
        });
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          scrollToIndex(currentIndex + 1);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          scrollToIndex(dotIndex);
        });
      });

      viewport.addEventListener("scroll", function () {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(function () {
          updateControls(getNearestIndex());
        }, 90);
      });

      viewport.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollToIndex(currentIndex - 1);
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollToIndex(currentIndex + 1);
        }
      });

      window.addEventListener("resize", function () {
        updateControls(getNearestIndex());
      });

      updateControls(0);
    });

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
