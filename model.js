// Model pages (ec75.html, r5.html): cargo / passenger variant switch and
// driver-assist tabs. Everything variant-specific lives in data attributes:
//   [data-variant-btn]            toggle buttons
//   [data-v-cargo|passenger]      text swapped per variant
//   [data-v-cargo-html|...-html]  markup swapped per variant
//   [data-src-cargo|passenger]    image src (+ optional data-alt-*)
//   [data-variant-hero][data-sky-cargo|passenger]  stacked-hero background colour

(function () {
  var VARIANTS = ["cargo", "passenger"];
  var hero = document.querySelector("[data-variant-hero]");
  var buttons = document.querySelectorAll("[data-variant-btn]");

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function apply(variant, updateHash) {
    if (VARIANTS.indexOf(variant) === -1) variant = "cargo";
    var key = cap(variant);

    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-variant-btn") === variant;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });

    document.querySelectorAll("[data-v-cargo]").forEach(function (el) {
      el.textContent = el.dataset["v" + key];
    });
    document.querySelectorAll("[data-v-cargo-html]").forEach(function (el) {
      el.innerHTML = el.dataset["v" + key + "Html"];
    });
    document.querySelectorAll("[data-src-cargo]").forEach(function (img) {
      img.src = img.dataset["src" + key];
      if (img.dataset["alt" + key]) img.alt = img.dataset["alt" + key];
    });
    if (hero && hero.dataset["sky" + key]) {
      hero.style.setProperty("--color-hero-sky", hero.dataset["sky" + key]);
    }

    if (updateHash && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + variant);
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(btn.getAttribute("data-variant-btn"), true);
    });
  });

  // Preload the other hero photo so the switch is instant
  var heroImg = hero && hero.querySelector("[data-src-passenger]");
  if (heroImg) VARIANTS.forEach(function (v) { new Image().src = heroImg.dataset["src" + cap(v)]; });

  // #cargo / #passenger pick the variant; other anchors (#specs, #test-drive) leave it alone
  function fromHash(isInitial) {
    var h = window.location.hash.replace("#", "");
    if (VARIANTS.indexOf(h) !== -1) apply(h, false);
    else if (isInitial) apply("cargo", false);
  }
  window.addEventListener("hashchange", function () { fromHash(false); });
  fromHash(true);
})();

// Driver-assist feature list: selecting an item swaps the picture
document.querySelectorAll("[data-tabs]").forEach(function (root) {
  var tabs = root.querySelectorAll("[data-tab]");
  var panels = root.querySelectorAll("[data-tab-panel]");

  function select(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    panels.forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === id);
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { select(t.getAttribute("data-tab")); });
  });
});
