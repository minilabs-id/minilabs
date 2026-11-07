(function () {
  "use strict";

  var elements = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if (!elements.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(el) {
    el.classList.add("is-visible");
  }

  if (reduced || !("IntersectionObserver" in window)) {
    elements.forEach(show);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();