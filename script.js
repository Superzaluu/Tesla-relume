// Navbar: transparent over the hero, solid once the page scrolls or the menu is open
(function () {
  var navbar = document.querySelector("[data-navbar]");
  var toggle = document.querySelector(".navbar__toggle");
  var links = document.getElementById("nav-links");
  if (!navbar) return;

  function isOpen() { return !!links && links.classList.contains("is-open"); }
  function update() { navbar.classList.toggle("is-solid", window.scrollY > 8 || isOpen()); }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Хаах" : "Цэс";
      update();
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// Poll card: swap the poster for the cold-test video on click
document.querySelectorAll(".poll-card__media[data-video]").forEach(function (media) {
  media.addEventListener("click", function () {
    var video = document.createElement("video");
    video.className = "poll-card__video";
    video.src = media.getAttribute("data-video");
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("aria-label", media.getAttribute("aria-label") || "");

    var wrap = document.createElement("div");
    wrap.className = "poll-card__media";
    wrap.appendChild(video);
    media.replaceWith(wrap);
    video.focus();
  });
});

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
