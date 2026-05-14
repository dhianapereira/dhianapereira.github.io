(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var carousels = document.querySelectorAll("[data-carousel]");
    var galleryModal = document.querySelector("[data-gallery-modal]");
    var galleryTriggers = Array.prototype.slice.call(
      document.querySelectorAll("[data-gallery-open]")
    );
    var modalImage = galleryModal
      ? galleryModal.querySelector("[data-gallery-modal-image]")
      : null;
    var modalCaption = galleryModal
      ? galleryModal.querySelector("[data-gallery-modal-caption]")
      : null;
    var modalDialog = galleryModal
      ? galleryModal.querySelector("[data-gallery-modal-dialog]")
      : null;
    var modalCloseControls = galleryModal
      ? Array.prototype.slice.call(
          galleryModal.querySelectorAll("[data-gallery-close]")
        )
      : [];
    var lastFocusedTrigger = null;

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

    if (!galleryModal || !modalImage || !modalDialog || !galleryTriggers.length) {
      return;
    }

    var closeModal = function () {
      if (galleryModal.hasAttribute("hidden")) {
        return;
      }

      galleryModal.setAttribute("hidden", "");
      document.body.classList.remove("has-gallery-modal-open");
      modalImage.setAttribute("src", "");
      modalImage.setAttribute("alt", "");

      if (modalCaption) {
        modalCaption.textContent = "";
        modalCaption.hidden = true;
      }

      if (lastFocusedTrigger) {
        lastFocusedTrigger.focus();
      }
    };

    var openModal = function (trigger) {
      var imageSrc = trigger.getAttribute("data-gallery-src");
      var imageAlt = trigger.getAttribute("data-gallery-alt") || "";
      var imageCaption = trigger.getAttribute("data-gallery-caption") || "";

      if (!imageSrc) {
        return;
      }

      lastFocusedTrigger = trigger;
      modalImage.setAttribute("src", imageSrc);
      modalImage.setAttribute("alt", imageAlt);

      if (modalCaption) {
        if (imageCaption) {
          modalCaption.textContent = imageCaption;
          modalCaption.hidden = false;
        } else {
          modalCaption.textContent = "";
          modalCaption.hidden = true;
        }
      }

      galleryModal.removeAttribute("hidden");
      document.body.classList.add("has-gallery-modal-open");

      window.requestAnimationFrame(function () {
        var closeButton = galleryModal.querySelector(".detail-gallery-modal__close");

        if (closeButton) {
          closeButton.focus();
        }
      });
    };

    galleryTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openModal(trigger);
      });
    });

    modalCloseControls.forEach(function (control) {
      control.addEventListener("click", closeModal);
    });

    modalDialog.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  });
}());
