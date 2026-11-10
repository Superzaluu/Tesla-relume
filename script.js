// Navbar: transparent over the hero, solid once the page scrolls or the menu is open
(function () {
  var navbar = document.querySelector("[data-navbar]");
  var toggle = document.querySelector(".navbar__toggle");
  var links = document.getElementById("nav-links");
  if (!navbar) return;

  var menus = Array.prototype.slice.call(document.querySelectorAll("[data-navmenu]"));
  var desktop = window.matchMedia("(min-width: 1200px) and (hover: hover)");
  var hoverTimer = null;

  function isOpen() { return !!links && links.classList.contains("is-open"); }
  function anyMenuOpen() { return menus.some(function (m) { return m.classList.contains("is-open"); }); }
  function update() { navbar.classList.toggle("is-solid", window.scrollY > 8 || isOpen() || anyMenuOpen()); }

  // Category dropdowns: click/tap toggles; on desktop hover also opens
  function setMenu(menu, open) {
    menu.classList.toggle("is-open", open);
    menu.querySelector(".navmenu__trigger").setAttribute("aria-expanded", String(open));
  }
  function closeMenus(except) { menus.forEach(function (m) { if (m !== except) setMenu(m, false); }); update(); }

  menus.forEach(function (menu) {
    var trigger = menu.querySelector(".navmenu__trigger");
    trigger.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      closeMenus(menu);
      setMenu(menu, open);
      update();
    });
    menu.addEventListener("mouseenter", function () {
      if (!desktop.matches) return;
      clearTimeout(hoverTimer);
      closeMenus(menu); setMenu(menu, true); update();
    });
    menu.addEventListener("mouseleave", function () {
      if (!desktop.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { setMenu(menu, false); update(); }, 180);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && anyMenuOpen()) {
      var open = menus.filter(function (m) { return m.classList.contains("is-open"); })[0];
      closeMenus();
      if (open) open.querySelector(".navmenu__trigger").focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (anyMenuOpen() && !navbar.contains(e.target)) closeMenus();
  });

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Хаах" : "Цэс";
      if (!open) closeMenus();
      update();
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// Нүүр хуудасны тогтмол холбоос, маягт болон footer-ийн жижиг засварууд.
(function () {
  if (document.body && document.querySelector("[data-hero-carousel]")) document.title = "Ruichi — Цахилгаан автомашин";

  document.querySelectorAll('.hero__actions a[href="#"]').forEach(function (link) {
    link.href = "#test-drive";
  });

  var copyright = document.querySelector(".site-footer__bottom p");
  if (copyright) copyright.innerHTML = "© " + new Date().getFullYear() + ". Бүх эрх хуулиар хамгаалагдсан.";

  var form = document.querySelector("[data-test-drive-form]");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.querySelector("[data-test-drive-success]").hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
    // TODO: Маягтын мэдээллийг серверийн API руу илгээнэ.
  });
})();

// Hero quick-spec icons: visually identify vehicle type, drive type, dimensions and range.
(function () {
  // Superseded by the approved PNG-icon implementation below.
  return;
  var icons = {
    van: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 16V9c0-2 2-4 4-4h13c2 0 3 1 4 3l3 5h3c1 0 2 1 2 2v1h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2Zm5-9v5h6V7H7Zm8 0v5h7l-3-5h-4Z"/></svg>',
    flatbed: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 16V9h10v5h14v2h3v2h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2Zm12-8h8v5h-8V8Zm-7 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm17 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>',
    box: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 16V9h10v7h12V5h4v11h2v2h-3a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2Zm5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm17 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>',
    refrigerated: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 16V9h10v7h12V5h4v11h2v2h-3a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2Zm5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm17 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM27 7h3v3h-3Z"/></svg>',
    special: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 16V9h10v7h12v-7h4v7h2v2h-3a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2Zm5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm17 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM18 5h7v3h-7Z"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 22V3h10v19H5Zm3-15v4h4V7H8Zm7 2 3 3v6a2 2 0 0 0 4 0v-7l-4-4-2 2v2l1-1 2 2v6c0 1 1 2 2 2s2-1 2-2v-7l-4-4-2 2v-4Z"/></svg>',
    charge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h10c1 0 2 1 2 2v14c0 1-1 2-2 2H6c-1 0-2-1-2-2V5c0-1 1-2 2-2Zm5 3-3 7h3l-1 5 5-8h-3l2-4h-3Z M19 8h2v6c0 1 1 2 2 2v2c-2 0-4-2-4-4V8Z"/></svg>',
    size: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V4h2v2h12V4h2v16h-2v-2H6v2H4Zm3-9h10v2H7v-2Zm1-3 3-3 3 3h-2v5h2l-3 3-3-3h2V8H8Z"/></svg>',
    range: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18L17 6l-3 3-2-4-3 4-2-3-4 12Zm6-3 3-6 3 6H9Zm3-12 3 3-3 3-3-3 3-3Z"/></svg>'
  };
  var data = {
    'ec75': { type: 'van', label: 'Van', fuel: 'BEV', size: '5130 × 1860 × 2020 мм', range: '420 км' },
    'r5': { type: 'van', label: 'Van', fuel: 'BEV', size: '5170 × 1860 × 2020 мм', range: '420 км' },
    'ec75pro-passenger': { type: 'van', label: 'Passenger Van', fuel: 'BEV', size: '5130 × 1860 × 2020 мм', range: '430 км' },
    'ec75pro-cargo': { type: 'van', label: 'Cargo Van', fuel: 'BEV', size: '5130 × 1860 × 2020 мм', range: '420 км' },
    'r5pro-passenger': { type: 'van', label: 'Passenger Van', fuel: 'BEV', size: '5170 × 1860 × 2020 мм', range: '430 км' },
    'r5pro-cargo': { type: 'van', label: 'Cargo Van', fuel: 'BEV', size: '5170 × 1860 × 2020 мм', range: '420 км' },
    'ec35': { type: 'van', label: 'Cargo Van', fuel: 'BEV', size: '4500 × 1680 × 2000 мм', range: '282 км' },
    'c3': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'BEV', size: '5330 × 1785 × 2010 мм', range: '327 км' },
    'c3-cold': { type: 'refrigerated', label: 'Refrigerator Truck', fuel: 'BEV', size: '5330 × 1790 × 2600 мм', range: '320 км' },
    'c5': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'BEV', size: '5990 × 1880 × 2015 мм', range: '326 км' },
    'c5-cng': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'EREV / CNG', size: '5990 × 1880 × 2030 мм', range: '70 км EV' },
    'c5-reev': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'EREV', size: '5990 × 1880 × 2030 мм', range: '1200+ км' },
    'c5l': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'BEV', size: '5995 × 1920 × 2035 мм', range: '415 км' },
    'c9': { type: 'box', label: 'Light Truck', fuel: 'BEV', size: '5995 × 2170 × 3180 мм', range: '403 км' },
    'ec31': { type: 'box', label: 'Box Truck', fuel: 'BEV', size: '4735 × 1655 × 2430 мм', range: '275 км' },
    'ec31l': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'BEV', size: '4855 × 1660 × 1985 мм', range: '295 км' },
    'ec31s': { type: 'flatbed', label: 'Flatbed Truck', fuel: 'BEV', size: '5035 × 1680 × 2420 мм', range: '240 км' },
    'ed71s': { type: 'flatbed', label: 'Light Truck', fuel: 'BEV', size: '5995 × 1870 × 2025 мм', range: '313 км' },
    'r5-service': { type: 'special', label: 'Service Vehicle', fuel: 'EREV', size: '5990 × 1880 × 2030 мм', range: '1200 км' },
    'c5-drone': { type: 'special', label: 'Drone Service Truck', fuel: 'EREV', size: '5990 × 1880 × 2030 мм', range: '1200 км' }
  };
  function item(icon, label, value) { return '<span class="hero__quick-spec"><span class="hero__quick-icon">' + icons[icon] + '</span><span><small>' + label + '</small><strong>' + value + '</strong></span></span>'; }
  function render(spec) { return '<div class="hero__quick-specs" aria-label="Загварын шуурхай үзүүлэлтүүд">' + item(spec.type, 'Загвар', spec.label) + item(spec.fuel === 'BEV' ? 'charge' : 'fuel', 'Хөтлөгч', spec.fuel) + item('size', 'L × W × H', spec.size) + item('range', 'Range', spec.range) + '</div>'; }
  document.querySelectorAll('[data-hero-carousel] .hero__slide').forEach(function (slide) {
    var spec = data[(slide.id || '').replace('hero-', '')], content = slide.querySelector('.hero__content');
    if (spec && content && !content.querySelector('.hero__quick-specs')) content.insertAdjacentHTML('beforeend', render(spec));
  });
  var slug = location.pathname.split('/').pop().replace(/\.html$/i, '') || 'index';
  var pageSpec = data[slug], pageHero = document.querySelector('.mhero'), pageContent = pageHero && pageHero.querySelector('.hero__content');
  if (pageSpec && pageContent && !pageContent.querySelector('.hero__quick-specs')) pageContent.insertAdjacentHTML('beforeend', render(pageSpec));
})();

// User-provided PNG icons for hero quick specifications.
(function () {
  var iconRoot = 'assets/icons/';
  var icons = {
    van: '01_van.png', flatbed: '02_light_flatbed_truck.png', box: '03_light_box_truck.png',
    refrigerator: '04_refrigerator_truck.png', flatbed4: '05_flatbed_4door_truck.png',
    fwd: '06_FWD.png', awd: '07_AWD.png', rwd: '08_RWD.png', dimension: '10_dimension.png',
    doors: '11_doors.png', charging: '12_charging.png', range: '13_range.png',
    engine: '14_fuel EREV машинд ашиглах.png', seats: '15_seats.png', payload: '16_payload.svg'
  };
  function vehicle(type, label, size, range, options) {
    options = options || {};
    return { type: type, label: label, size: size, range: range, drive: options.drive || 'RWD', doors: options.doors || '2 хаалга', doorLabel: options.doorLabel || 'Хаалганы тоо', charge: options.charge || 'DC - 30 мин', seats: options.seats || '2 суудал', payload: options.payload || 'Тохируулгаас хамаарна', engine: options.engine || '' };
  }
  var data = {
    'ec75': vehicle('van', 'Фургон', '5130 x 1860 x 2020 мм', '420 км', { drive: 'FWD', doors: '5 хаалга', seats: '2–14 суудал' }),
    'r5': vehicle('van', 'Фургон', '5170 x 1860 x 2020 мм', '403 км', { drive: 'FWD', doors: '5 хаалга', seats: '2–9 суудал' }),
    'ec75pro-passenger': vehicle('van', 'Зорчигч фургон', '5130 x 1860 x 2020 мм', '430 км', { drive: 'FWD', doors: '5 хаалга', seats: '6–9 суудал' }),
    'ec75pro-cargo': vehicle('van', 'Ачааны фургон', '5130 x 1860 x 2020 мм', '420 км', { drive: 'FWD', doors: '5 хаалга', seats: '2 суудал' }),
    'r5pro-passenger': vehicle('van', 'Зорчигч фургон', '5170 x 1860 x 2020 мм', '430 км', { drive: 'FWD', doors: '5 хаалга', seats: '6–9 суудал' }),
    'r5pro-cargo': vehicle('van', 'Ачааны фургон', '5170 x 1860 x 2020 мм', '420 км', { drive: 'FWD', doors: '5 хаалга', seats: '2 суудал' }),
    'ec35': vehicle('van', 'Ачааны фургон', '4500 x 1680 x 2000 мм', '282 км', { drive: 'RWD', doors: '5 хаалга', seats: '2–5 суудал' }),
    'c3': vehicle('flatbed', 'Задгай тэвш', '5330 x 1785 x 2010 мм', '327 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал' }),
    'c3-cold': vehicle('refrigerator', 'Хөргүүртэй тэвш', '5330 x 1790 x 2600 мм', '320 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал' }),
    'c5': vehicle('flatbed', 'Задгай тэвш', '5990 x 1880 x 2015 мм', '326 км', { drive: 'FWD', doors: '2 хаалга', seats: '2 суудал', payload: '2–2.5 т' }),
    'c5-cng': vehicle('flatbed', 'Задгай тэвш', '5990 x 1880 x 2030 мм', '70 км EV', { drive: 'FWD', doors: '2–4 хаалга', seats: '2–5 суудал', payload: '2–2.5 т', charge: 'AC/DC - 30 мин', engine: '1,499 cc' }),
    'c5-reev': vehicle('flatbed', 'Задгай тэвш', '5990 x 1880 x 2030 мм', '1200+ км', { drive: 'FWD', doors: '2–4 хаалга', seats: '2–5 суудал', payload: '2–2.5 т', charge: 'AC/DC - 30 мин', engine: '1,499 cc' }),
    'c5l': vehicle('flatbed', 'Задгай тэвш', '5995 x 1920 x 2035 мм', '415 км', { drive: 'RWD', seats: '2 суудал' }),
    'c9': vehicle('box', 'Битүү тэвш', '5995 x 2170 x 3180 мм', '403 км', { drive: 'RWD', doors: '2–4 хаалга', doorLabel: 'Ачааны хажуугийн хаалга', seats: '3 суудал', payload: '1,075–1,115 кг' }),
    'ec31': vehicle('box', 'Битүү тэвш', '4735 x 1655 x 2430 мм', '275 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал', payload: '1,055–1,080 кг' }),
    'ec31l': vehicle('flatbed', 'Задгай тэвш', '4855 x 1660 x 1985 мм', '295 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал', payload: '1,080–1,200 кг' }),
    'ec31s': vehicle('flatbed', 'Задгай тэвш', '5035 x 1680 x 2420 мм', '240 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал', payload: '1,100–1,270 кг' }),
    'ed71s': vehicle('flatbed', 'Хөнгөн ачааны машин', '5995 x 1870 x 2025 мм', '313 км', { drive: 'RWD', doors: '2 хаалга', seats: '2 суудал' }),
    'r5-service': vehicle('box', 'Тусгай зориулалт', '5990 x 1880 x 2030 мм', '1200 км', { drive: 'FWD', doors: '5 хаалга', seats: '2 суудал', charge: 'AC/DC - 30 мин', engine: '1,499 cc' }),
    'c5-drone': vehicle('flatbed', 'Дроны үйлчилгээ', '5990 x 1880 x 2030 мм', '1200 км', { drive: 'FWD', doors: '2–4 хаалга', seats: '2–5 суудал', payload: '2–2.5 т', charge: 'AC/DC - 30 мин', engine: '1,499 cc' })
  };
  function item(icon, label, value) {
    return '<span class="hero__quick-spec"><span class="hero__quick-icon"><img src="' + iconRoot + icons[icon] + '" alt="" aria-hidden="true"></span><span><small>' + label + '</small><strong>' + value + '</strong></span></span>';
  }
  function render(spec) {
    var html = item(spec.type, 'Загвар', spec.label) + item(spec.drive.toLowerCase(), 'Хөтлөгч', spec.drive) + item('dimension', 'Хэмжээ', spec.size) + item('doors', spec.doorLabel, spec.doors) + item('charging', 'Цэнэглэх хугацаа', spec.charge) + item('range', 'Туулах зай', spec.range) + item('seats', 'Суудлын тоо', spec.seats) + item('payload', 'Даац', spec.payload);
    if (spec.engine) html += item('engine', 'Хөдөлгүүр', spec.engine);
    return '<div class="hero__quick-specs" aria-label="Загварын шуурхай үзүүлэлтүүд">' + html + '</div>';
  }
  document.querySelectorAll('[data-hero-carousel] .hero__slide').forEach(function (slide) {
    var spec = data[(slide.id || '').replace('hero-', '')], content = slide.querySelector('.hero__content');
    if (spec && content && !slide.querySelector('.hero__quick-specs')) slide.insertAdjacentHTML('beforeend', render(spec));
  });
  var slug = location.pathname.split('/').pop().replace(/\.html$/i, '') || 'index';
  var pageSpec = data[slug];
  var modelHero = document.querySelector('.mhero');
  if (pageSpec && modelHero && !modelHero.querySelector('.hero__quick-specs')) {
    modelHero.insertAdjacentHTML('beforeend', render(pageSpec));
  }
  var introImage = document.querySelector('.mintro .mintro__image');
  if (pageSpec && introImage && !document.querySelector('.mintro__hero-frame')) {
    var frame = document.createElement('div');
    frame.className = 'mintro__hero-frame';
    introImage.parentNode.insertBefore(frame, introImage);
    frame.appendChild(introImage);
    frame.insertAdjacentHTML('beforeend', render(pageSpec));
  }
})();

// Bonus registration page: restore the calculator values and enforce one
// vehicle group with a maximum of two selected models.
(function () {
  var form = document.querySelector("[data-registration-form]");
  if (!form) return;
  var saved;
  try { saved = JSON.parse(sessionStorage.getItem("savingsVehicle") || "null"); } catch (error) { saved = null; }
  if (saved) {
    form.querySelector("#reg-maker").value = saved.maker || "";
    form.querySelector("#reg-model").value = saved.model || "";
    form.querySelector("#reg-year").value = saved.year || "";
    form.querySelector("#reg-consumption").value = saved.consumption ? saved.consumption + " л/100 км" : "";
    form.querySelector("#reg-distance").value = saved.distance ? saved.distance + " км" : "";
  }
  var groups = Array.prototype.slice.call(form.querySelectorAll("[data-model-group]"));
  var error = form.querySelector("[data-registration-error]");
  function selected(group) { return Array.prototype.slice.call(group.querySelectorAll("input:checked")); }
  function updateGroups() {
    var active = groups.filter(function (group) { return selected(group).length > 0; })[0];
    groups.forEach(function (group) {
      var blocked = active && group !== active;
      group.classList.toggle("is-disabled", !!blocked);
      group.querySelectorAll("input").forEach(function (input) { input.disabled = !!blocked; });
    });
  }
  groups.forEach(function (group) {
    group.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("change", function () {
        if (selected(group).length > 2) {
          input.checked = false;
          error.textContent = "Нэг ангиллаас хамгийн ихдээ 2 загвар сонгоно.";
        } else { error.textContent = ""; }
        updateGroups();
      });
    });
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!groups.some(function (group) { return selected(group).length; })) {
      error.textContent = "Сонирхож буй дор хаяж нэг загвараа сонгоно уу.";
      return;
    }
    error.textContent = "";
    form.querySelector("[data-registration-success]").hidden = false;
    form.querySelector("button[type=submit]").disabled = true;
  });
})();

// Hero carousel: arrows, dots, swipe, keyboard and autoplay (paused on hover/focus,
// off for reduced motion). Light slides switch the navbar and controls to dark.
(function () {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root) return;
  var track = root.querySelector("[data-hero-track]");
  ["hero-c9", "hero-ec35", "hero-special"].forEach(function (id) {
    var slide = document.getElementById(id);
    if (slide) slide.remove();
  });
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
    dot.setAttribute("aria-label", "Слайд " + (i + 1) + " / " + slides.length);
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

// Homepage-only enhancements: carousel choices, voting and content cleanup.
(function () {
  var homeCarousel = document.querySelector("[data-hero-carousel]");
  if (!homeCarousel) return;
  ["hero-c9", "hero-ec35", "hero-special"].forEach(function (id) { var slide = document.getElementById(id); if (slide) slide.remove(); });

  var poll = document.querySelector(".poll-card");
  if (poll) {
    var resultWrap = poll.querySelector(".poll-card__results"), actionWrap = poll.querySelector(".actions");
    var choices = ["Асуудалгүй", "Мэдэхгүй", "Муу байх"], votes = [0, 0, 0], voted = null;
    try {
      var savedVote = JSON.parse(localStorage.getItem("ruichi-home-poll") || "null");
      if (savedVote && Array.isArray(savedVote.votes) && savedVote.votes.length === 3) { votes = savedVote.votes; voted = savedVote.choice; }
    } catch (error) { /* TODO: Серверийн статистик ашиглах үед энд алдааг бүртгэнэ. */ }
    resultWrap.innerHTML = choices.map(function (label, index) { return '<div class="poll-card__result"><p class="h2" data-poll-percent="' + index + '">0%</p><p class="text-regular"><span data-poll-count="' + index + '">0</span> · ' + label + "</p></div>"; }).join("");
    actionWrap.innerHTML = choices.map(function (label, index) { return '<button class="btn btn--secondary" type="button" data-poll-vote="' + index + '">' + label + "</button>"; }).join("");
    function renderVotes() { var total = votes.reduce(function (sum, vote) { return sum + vote; }, 0); votes.forEach(function (vote, index) { resultWrap.querySelector('[data-poll-count="' + index + '"]').textContent = vote; resultWrap.querySelector('[data-poll-percent="' + index + '"]').textContent = total ? Math.round(vote / total * 100) + "%" : "0%"; }); actionWrap.querySelectorAll("[data-poll-vote]").forEach(function (button) { button.disabled = voted !== null; }); }
    actionWrap.querySelectorAll("[data-poll-vote]").forEach(function (button) { button.addEventListener("click", function () { if (voted !== null) return; voted = Number(button.dataset.pollVote); votes[voted] += 1; try { localStorage.setItem("ruichi-home-poll", JSON.stringify({ votes: votes, choice: voted })); } catch (error) { /* TODO: Серверийн статистик ашиглах үед localStorage-ийг орлуулна. */ } renderVotes(); }); });
    renderVotes();
  }

  var heading = document.querySelector("#models .h2"), subheading = document.querySelector("#models .text-medium");
  if (heading) heading.textContent = "Бүх загвар";
  if (subheading) subheading.textContent = "Таны хэрэгцээнд тохирох цахилгаан автомашинаа сонгоорой";
  var modelsTrack = document.querySelector("#models [data-slider-track]");
  if (modelsTrack) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".navbar__links .navmenu__card"));
    modelsTrack.innerHTML = cards.map(function (card) { var image = card.querySelector("img"), name = card.querySelector(".navmenu__name"), desc = card.querySelector(".navmenu__desc"); return '<article class="vcard vcard--model"><img class="vcard__bg" src="' + image.getAttribute("src") + '" alt="' + name.textContent + '" loading="lazy"><div class="vcard__content"><div class="vcard__heading"><p class="vcard__title">' + desc.textContent + '</p><h3 class="vcard__model">' + name.textContent + '</h3></div><div class="vcard__actions"><a class="btn btn--light" href="' + card.getAttribute("href") + '">Дэлгэрэнгүй</a></div></div></article>'; }).join("");
  }

  var orderTitle = Array.prototype.slice.call(document.querySelectorAll(".cta .h2")).filter(function (node) { return node.textContent.indexOf("Захиалгаар") !== -1; })[0];
  if (orderTitle) { var cta = orderTitle.closest(".cta"), copy = cta.querySelector(".text-medium"), image = cta.querySelector("img"); orderTitle.textContent = "Баталгаат хугацаа"; if (copy) copy.textContent = "Зайны багц болон автомашины баталгааны нөхцөлийг харна уу."; cta.querySelectorAll(".actions").forEach(function (actions) { actions.innerHTML = '<a class="btn btn--primary" href="warranty.html">Баталгааг харах</a>'; }); if (image) { image.alt = "Баталгаат хугацаа"; cta.classList.add("cta--warranty"); } }

  Array.prototype.slice.call(document.querySelectorAll("main > .section")).forEach(function (section) { var h2 = section.querySelector(".h2"); if (h2 && h2.textContent.trim() === "Other products") section.remove(); });
  var galleryHeading = Array.prototype.slice.call(document.querySelectorAll(".section-title .h2")).filter(function (node) { return node.textContent.trim() === "Зургийн цомог"; })[0];
  if (galleryHeading) { var galleryCopy = galleryHeading.parentElement.parentElement.querySelector(".text-medium"); if (galleryCopy) galleryCopy.textContent = "Манай автомашины зургийн цомгийг үзнэ үү."; }
})();

// Savings calculator: injected once because every page shares this script.
(function () {
  var homeCarousel = document.querySelector("[data-hero-carousel]");
  var modelHero = document.querySelector(".mhero");
  if (!homeCarousel && !modelHero) return;

  var triggers = [];
  function addTrigger(container) {
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "btn btn--secondary saving-calculator__trigger";
    trigger.textContent = "Хэмнэлтийн тооцоолуур";
    trigger.setAttribute("aria-haspopup", "dialog");
    container.appendChild(trigger);
    triggers.push(trigger);
  }
  if (homeCarousel) {
    homeCarousel.querySelectorAll(".hero__actions").forEach(addTrigger);
  } else {
    addTrigger(modelHero);
  }

  var modal = document.createElement("div");
  modal.className = "savings-modal";
  modal.hidden = true;
  modal.innerHTML = [
    '<div class="savings-modal__backdrop" data-savings-close></div>',
    '<section class="savings-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="savings-title">',
      '<button class="savings-modal__close" type="button" aria-label="Хаах" data-savings-close>×</button>',
      '<header class="savings-modal__header"><h2 class="savings-modal__title" id="savings-title">Хэмнэлтийн тооцоолуур</h2><p class="savings-modal__intro">Одоогийн машиныхаа мэдээллийг оруулаад цахилгаан машинд шилжихэд гарах ойролцоох хэмнэлтээ тооцоолоорой.</p></header>',
      '<form class="savings-form" data-savings-form>',
        '<div class="savings-field"><label for="saving-maker">Үйлдвэрлэгч</label><select id="saving-maker" name="maker" required><option value="">Сонгоно уу</option><option value="Toyota">Toyota</option><option value="Nissan">Nissan</option><option value="Kia">Kia</option><option value="Hyundai">Hyundai</option><option value="Mazda">Mazda</option><option value="Mitsubishi">Mitsubishi</option></select></div>',
        '<div class="savings-field"><label for="saving-model">Загвар</label><select id="saving-model" name="model" required disabled><option value="">Эхлээд үйлдвэрлэгчээ сонгоно уу</option></select></div>',
        '<div class="savings-field"><label for="saving-year">Он</label><input id="saving-year" name="year" type="number" min="1980" max="2026" placeholder="Жишээ: 2018" required></div>',
        '<div class="savings-field"><label for="saving-consumption">Түлш зарцуулалт (л/100 км)</label><input id="saving-consumption" name="consumption" type="number" min="1" max="50" step=".1" inputmode="decimal" placeholder="Жишээ: 10.5" required></div>',
        '<div class="savings-field savings-field--full"><label for="saving-distance">Өдөр таны явдаг зай (км)</label><input id="saving-distance" name="distance" type="number" min="1" max="2000" inputmode="decimal" placeholder="Жишээ: 60" required></div>',
        '<button class="btn btn--primary savings-form__submit" type="submit">ТООЦОО ГАРГАХ</button>',
      '</form>',
      '<div class="savings-results" data-savings-results hidden aria-live="polite"></div>',
    '</section>'
  ].join("");
  document.body.appendChild(modal);

  var dialog = modal.querySelector(".savings-modal__dialog");
  var form = modal.querySelector("[data-savings-form]");
  var results = modal.querySelector("[data-savings-results]");
  var maker = modal.querySelector("#saving-maker");
  var model = modal.querySelector("#saving-model");
  var validationMessages = { maker: "Үйлдвэрлэгчээ сонгоно уу.", model: "Эхлээд үйлдвэрлэгчээ сонгоод, дараа нь загвараа сонгоно уу.", year: "Үйлдвэрлэсэн оноо оруулна уу.", consumption: "Түлшний зарцуулалтаа оруулна уу.", distance: "Өдөрт явдаг зайгаа оруулна уу." };
  Array.prototype.slice.call(form.elements).forEach(function (field) {
    if (!field.name || !validationMessages[field.name]) return;
    field.addEventListener("invalid", function () { field.setCustomValidity(validationMessages[field.name]); });
    field.addEventListener("input", function () { field.setCustomValidity(""); });
    field.addEventListener("change", function () { field.setCustomValidity(""); });
  });
  var models = {
    Toyota: ["Prius", "Camry", "Crown", "Harrier", "RAV4", "Land Cruiser", "Alphard", "Sienta"],
    Nissan: ["Leaf", "Note", "X-Trail", "Serena", "Tiida", "March", "Patrol", "Vanette"],
    Kia: ["K5", "K7", "Sportage", "Sorento", "Bongo", "Morning", "Carnival", "Rio"],
    Hyundai: ["Porter", "Tucson", "Santa Fe", "Sonata", "Accent", "Starex", "Avante", "Mighty"],
    Mazda: ["Demio", "CX-5", "CX-9", "Axela", "Atenza", "Bongo", "Familia"],
    Mitsubishi: ["Outlander", "Pajero", "Delica", "Lancer", "RVR", "Fuso Canter", "L200"]
  };
  maker.addEventListener("change", function () {
    var list = models[maker.value] || [];
    model.innerHTML = '<option value="">Сонгоно уу</option>' + list.map(function (item) { return '<option value="' + item + '">' + item + "</option>"; }).join("");
    model.disabled = !list.length;
  });
  var lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    form.reset();
    model.innerHTML = '<option value="">Эхлээд үйлдвэрлэгчээ сонгоно уу</option>';
    model.disabled = true;
    form.hidden = false;
    results.hidden = true;
    modal.hidden = false;
    document.body.classList.add("savings-modal-open");
    maker.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("savings-modal-open");
    if (lastFocus) lastFocus.focus();
  }
  triggers.forEach(function (trigger) { trigger.addEventListener("click", openModal); });
  modal.querySelectorAll("[data-savings-close]").forEach(function (button) { button.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (event) { if (!modal.hidden && event.key === "Escape") closeModal(); });

  function money(value) { return new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(Math.round(value)) + " ₮"; }
  function number(value) { return new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(Math.round(value)); }
  function coins() {
    var html = '<div class="savings-coins" aria-hidden="true">';
    for (var i = 0; i < 18; i++) html += '<i class="savings-coin" style="--coin-left:' + (i * 5 + 1) + '%;--coin-delay:' + (i % 6) * .22 + 's;--coin-duration:' + (1.8 + (i % 4) * .3) + 's"></i>';
    return html + "</div>";
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var values = new FormData(form), dailyKm = Number(values.get("distance")), consumption = Number(values.get("consumption"));
    var monthlyKm = dailyKm * 30, yearlyKm = dailyKm * 365;
    var monthlyLitres = monthlyKm * consumption / 100, yearlyLitres = yearlyKm * consumption / 100;
    var fuelCost = monthlyLitres * 3700, electricityCost = monthlyKm * .22 * 280;
    var monthlySaving = Math.max(0, fuelCost - electricityCost), yearlySaving = monthlySaving * 12;
    var serviceSaving = yearlyKm * 45;
    var queueHours = monthlyLitres / 50 * .5, yearlyHours = queueHours * 12;
    var vehicle = values.get("maker") + " " + values.get("model") + " (" + values.get("year") + ")";
    form.hidden = true;
    results.hidden = false;
    results.innerHTML = [
      '<p class="savings-results__vehicle">Таны машин: <strong>' + vehicle.replace(/[&<>"']/g, function (x) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[x]; }) + '</strong></p>',
      '<h3 class="savings-results__title">Та энэ загвараар ойролцоогоор хэмнэнэ</h3>',
      '<div class="savings-results__grid">',
        '<div class="savings-result"><span class="savings-result__label">Сарын түлшний хэрэглээ</span><strong class="savings-result__value">' + number(monthlyLitres) + ' л</strong></div>',
        '<div class="savings-result"><span class="savings-result__label">Жилийн түлшний хэрэглээ</span><strong class="savings-result__value">' + number(yearlyLitres) + ' л</strong></div>',
        '<div class="savings-result"><span class="savings-result__label">Сарын мөнгөн хэмнэлт</span><strong class="savings-result__value">' + money(monthlySaving) + '</strong></div>',
        '<div class="savings-result"><span class="savings-result__label">Жилийн мөнгөн хэмнэлт</span><strong class="savings-result__value">' + money(yearlySaving) + '</strong></div>',
        '<div class="savings-result"><span class="savings-result__label">Үйлчилгээний зардлын хэмнэлт</span><strong class="savings-result__value">' + money(serviceSaving) + ' / жил</strong></div>',
        '<div class="savings-result"><span class="savings-result__label">Колонкид очерлох цагийн хэмнэлт</span><strong class="savings-result__value">' + number(yearlyHours) + ' цаг / жил</strong></div>',
      '</div>',
      '<p class="savings-results__note">Тооцоо нь таны оруулсан түлшний зарцуулалт, шатахууны жишиг үнэ 3,700 ₮/л, цахилгаан зарцуулалт 22 кВт·ц/100 км, цэнэгийн үнэ 280 ₮/кВт·ц гэсэн таамагт үндэслэнэ.</p>',
      '<div class="savings-choice"><p class="savings-choice__text">Та энэ мэдээллээ бүртгүүлж 100,000 ₮ бонус эрх аваарай</p><div class="savings-choice__buttons"><button class="btn btn--primary" type="button" data-savings-yes>БОНУС АВАХ</button><button class="btn btn--secondary" type="button" data-savings-no>ГАРАХ</button></div></div>'
    ].join("");
    results.querySelector("[data-savings-yes]").addEventListener("click", function () {
      sessionStorage.setItem("savingsVehicle", JSON.stringify({ maker: values.get("maker"), model: values.get("model"), year: values.get("year"), consumption: values.get("consumption"), distance: values.get("distance") }));
      window.location.href = "register.html";
    });
    results.querySelector("[data-savings-no]").addEventListener("click", function () { closeModal(); });
  });
})();
