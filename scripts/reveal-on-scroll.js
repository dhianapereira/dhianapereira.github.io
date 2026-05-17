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
      // A threshold of 0.16 works for small blocks, but very tall sections
      // may never have 16% of their height visible at once.
      threshold: 0,
      rootMargin: "0px 0px -8% 0px"
    });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  });
}());
