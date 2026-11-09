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

// Hero carousel: arrows, dots, swipe, keyboard and autoplay (paused on hover/focus,
// off for reduced motion). Light slides switch the navbar and controls to dark.
(function () {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root) return;
  var track = root.querySelector("[data-hero-track]");
  var slides = Array.prototype.slice.call(track.children);
  var dotsWrap = root.querySelector("[data-hero-dots]");
  var navbar = document.querySelector("[data-navbar]");
  var stacked = window.matchMedia("(max-width: 991px), (max-aspect-ratio: 6/5)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var index = 0;
  var timer = null;
  var DELAY = 7000;

  var dots = slides.map(function (slide, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-carousel__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", slide.getAttribute("aria-label") || String(i + 1));
    dot.addEventListener("click", function () { go(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function themeOf(slide) {
    if (stacked.matches && slide.dataset.themeSm) return slide.dataset.themeSm;
    return slide.dataset.theme || "dark";
  }

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    slides.forEach(function (s, n) {
      var on = n === index;
      s.setAttribute("aria-hidden", String(!on));
      if (on) s.removeAttribute("inert"); else s.setAttribute("inert", "");
      dots[n].setAttribute("aria-selected", String(on));
    });
    var light = themeOf(slides[index]) === "light";
    root.classList.toggle("is-light", light);
    if (navbar) navbar.classList.toggle("is-on-light", light);
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }
  function stop() { clearInterval(timer); timer = null; }
  function start() { if (!reduceMotion.matches && !timer) timer = setInterval(next, DELAY); }
  function restart() { stop(); start(); }

  root.querySelector("[data-hero-next]").addEventListener("click", function () { next(); restart(); });
  root.querySelector("[data-hero-prev]").addEventListener("click", function () { prev(); restart(); });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { next(); }
    else if (e.key === "ArrowLeft") { prev(); }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  // Swipe / drag
  var startX = null, deltaX = 0;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX = e.clientX; deltaX = 0;
  });
  track.addEventListener("pointermove", function (e) {
    if (startX === null) return;
    deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 8) {
      track.classList.add("is-dragging");
      track.style.transform = "translateX(calc(" + (-index * 100) + "% + " + deltaX + "px))";
    }
  });
  function endDrag() {
    if (startX === null) return;
    track.classList.remove("is-dragging");
    if (deltaX < -50) next(); else if (deltaX > 50) prev(); else go(index);
    startX = null;
    restart();
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("pointerleave", endDrag);
  // a drag should not trigger the link underneath
  track.addEventListener("click", function (e) { if (Math.abs(deltaX) > 8) { e.preventDefault(); deltaX = 0; } }, true);

  stacked.addEventListener("change", function () { go(index); });

  // index.html#hero-c9 opens on that slide (used by footer model links)
  function slideFromHash() {
    var id = window.location.hash.slice(1);
    for (var i = 0; i < slides.length; i++) if (slides[i].id && slides[i].id === id) return i;
    return -1;
  }
  window.addEventListener("hashchange", function () {
    var i = slideFromHash();
    if (i !== -1) { go(i); window.scrollTo(0, 0); restart(); }
  });

  var initial = slideFromHash();
  track.style.transition = "none";            // no slide-in animation on first paint
  go(initial === -1 ? 0 : initial);
  track.getBoundingClientRect();
  track.style.transition = "";
  start();
})();

// Video posters (poll card, EC75 page): swap the poster for the video on click
document.querySelectorAll("[data-video]").forEach(function (media) {
  media.addEventListener("click", function () {
    var video = document.createElement("video");
    video.className = "poll-card__video";
    video.src = media.getAttribute("data-video");
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("aria-label", media.getAttribute("aria-label") || "");

    var wrap = document.createElement("div");
    wrap.className = media.className;
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
