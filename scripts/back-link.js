(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var backLinks = document.querySelectorAll(".back-link");

    if (!backLinks.length) {
      return;
    }

    function hasInternalReferrer() {
      if (!document.referrer) {
        return false;
      }

      try {
        var referrerUrl = new URL(document.referrer);

        return referrerUrl.origin === window.location.origin
          && referrerUrl.pathname !== window.location.pathname;
      } catch (error) {
        return false;
      }
    }

    backLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!hasInternalReferrer() || window.history.length <= 1) {
          return;
        }

        event.preventDefault();
        window.history.back();
      });
    });
  });
}());
