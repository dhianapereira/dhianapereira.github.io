(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var elements = document.querySelectorAll(".reveal-on-scroll");
    var observer;

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
