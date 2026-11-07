// Mobile navbar toggle
(function () {
  var toggle = document.querySelector(".navbar__toggle");
  var links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Цэс хаах" : "Цэс нээх");
  });
})();

// Horizontal sliders: arrow buttons scroll the track by one item
document.querySelectorAll("[data-slider]").forEach(function (slider) {
  var track = slider.querySelector("[data-slider-track]");
  var prev = slider.querySelector("[data-slider-prev]");
  var next = slider.querySelector("[data-slider-next]");
  if (!track) return;

  function step() {
    var item = track.firstElementChild;
    if (!item) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth - 1;
    if (prev) prev.disabled = track.scrollLeft <= 0;
    if (next) next.disabled = track.scrollLeft >= max;
  }

  if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step() }); });
  if (next) next.addEventListener("click", function () { track.scrollBy({ left: step() }); });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
});
