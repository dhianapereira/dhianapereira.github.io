(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var backLinks = document.querySelectorAll(".back-link");

    if (!backLinks.length) {
      return;
    }

    backLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (window.history.length <= 1) {
          return;
        }

        event.preventDefault();
        window.history.back();
      });
    });
  });
}());
