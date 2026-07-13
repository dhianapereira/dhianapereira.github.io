(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  if (!toggle) return;

  var syncToggle = function () {
    var isDark = root.dataset.theme === "dark";
    var label = isDark ? toggle.dataset.labelLight : toggle.dataset.labelDark;
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("title", label);
    toggle.setAttribute("aria-pressed", String(isDark));
  };

  toggle.addEventListener("click", function () {
    var theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try { localStorage.setItem("site-theme", theme); } catch (error) {}
    syncToggle();
  });

  syncToggle();
}());
