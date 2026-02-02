// =====================
// ASSETS (single source of truth)
// =====================
const ASSETS = {
  logoUrl:
    "https://res.cloudinary.com/dd8pjjxsm/image/upload/v1770020328/ChatGPT_Image_Jan_20_2026_11_48_57_AM_ibqw3k.png",

  // Background videos (Cloud Run env vars preferred; fallback to placeholders)
  heroBgVideoUrl: window.__ENV__?.HERO_VIDEO_URL || "",
  heroPosterUrl: window.__ENV__?.HERO_POSTER_URL || "",

  projectsStripVideoUrl: window.__ENV__?.PROJECTS_VIDEO_URL || "",
  projectsStripPosterUrl: window.__ENV__?.PROJECTS_POSTER_URL || "",

  // Block 2 should NOT be video background (per your rule)
  financingImageUrl: window.__ENV__?.FINANCING_IMAGE_URL || "",

  // Inline explainer video (with voice over)
  solarExplainerVideoUrl:
    "https://res.cloudinary.com/dd8pjjxsm/video/upload/v1770020838/From_KlickPin_CF_Operation_process_of_energy-saving_solar_energy_system_batteryenergystoragesystem_Video___Solar_energy_projects_Solar_energy_system_Solar_power_calculator_vwxk7s.mp4",
  solarExplainerPosterUrl: window.__ENV__?.SOLAR_EXPLAINER_POSTER_URL || "",

  // “Why go solar” image
  whyGoSolarImageUrl:
    "https://res.cloudinary.com/dd8pjjxsm/image/upload/v1770020328/ChatGPT_Image_Jan_20_2026_09_58_37_AM_clnnrw.png",

  // Optional alternation images for other blocks
  savingsSideImageUrl: window.__ENV__?.SAVINGS_SIDE_IMAGE_URL || "",
  processImageUrl: window.__ENV__?.PROCESS_IMAGE_URL || "",
};

function bindAssets() {
  // Logo
  const logo = document.querySelector('[data-asset="logo"]');
  if (logo && ASSETS.logoUrl) {
    logo.src = ASSETS.logoUrl;
    logo.alt = "Island Force Renewables";
    logo.loading = "eager";
    logo.decoding = "async";
  }

  // Hero background video
  const heroVideo = document.querySelector('[data-asset="hero-video"]');
  const heroPoster = document.querySelector('[data-asset="hero-poster"]');
  if (heroVideo && ASSETS.heroBgVideoUrl) heroVideo.src = ASSETS.heroBgVideoUrl;
  if (heroPoster && ASSETS.heroPosterUrl) heroPoster.src = ASSETS.heroPosterUrl;

  // Financing image (Block 2 image panel)
  const financeImg = document.querySelector('[data-asset="financing-image"]');
  if (financeImg && ASSETS.financingImageUrl) financeImg.src = ASSETS.financingImageUrl;

  // Solar explainer inline video
  const explainerVideo = document.querySelector('[data-asset="solar-explainer-video"]');
  const explainerPoster = document.querySelector('[data-asset="solar-explainer-poster"]');
  if (explainerVideo && ASSETS.solarExplainerVideoUrl) explainerVideo.src = ASSETS.solarExplainerVideoUrl;
  if (explainerPoster && ASSETS.solarExplainerPosterUrl) explainerPoster.src = ASSETS.solarExplainerPosterUrl;

  // Why go solar image (alternating media)
  const whyImg = document.querySelector('[data-asset="why-go-solar"]');
  if (whyImg && ASSETS.whyGoSolarImageUrl) whyImg.src = ASSETS.whyGoSolarImageUrl;

  // Projects strip video
  const projectsVideo = document.querySelector('[data-asset="projects-strip-video"]');
  const projectsPoster = document.querySelector('[data-asset="projects-strip-poster"]');
  if (projectsVideo && ASSETS.projectsStripVideoUrl) projectsVideo.src = ASSETS.projectsStripVideoUrl;
  if (projectsPoster && ASSETS.projectsStripPosterUrl) projectsPoster.src = ASSETS.projectsStripPosterUrl;

  // Optional side images
  const savingsImg = document.querySelector('[data-asset="savings-image"]');
  if (savingsImg && ASSETS.savingsSideImageUrl) savingsImg.src = ASSETS.savingsSideImageUrl;

  const processImg = document.querySelector('[data-asset="process-image"]');
  if (processImg && ASSETS.processImageUrl) processImg.src = ASSETS.processImageUrl;
}

// Run once DOM is ready
document.addEventListener("DOMContentLoaded", bindAssets);

function setupExplainerAudio() {
  const video = document.querySelector('[data-asset="solar-explainer-video"]');
  const btn = document.querySelector('[data-action="toggle-explainer-audio"]');
  const chip = document.querySelector('[data-ui="sound-chip"]');
  if (!video || !btn) return;

  // Autoplay rules: must start muted
  video.muted = true;
  video.playsInline = true;

  const updateBtn = () => {
    btn.textContent = video.muted ? "Unmute" : "Mute";
    btn.setAttribute("aria-pressed", String(!video.muted));
  };

  btn.addEventListener("click", async () => {
    // Some browsers require play() after user gesture
    try {
      await video.play();
    } catch (error) {
      // no-op
    }
    video.muted = !video.muted;
    updateBtn();

    if (!video.muted && chip) {
      chip.classList.add("show");
      setTimeout(() => chip.classList.remove("show"), 1800);
    }
  });

  updateBtn();
}

document.addEventListener("DOMContentLoaded", setupExplainerAudio);

const state = {
  gallery: [],
  lightboxIndex: 0,
  config: {},
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const utmParams = () => {
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const entries = keys
    .map((key) => [key, params.get(key)])
    .filter(([, value]) => value);
  return new URLSearchParams(entries);
};

const waLink = (message) => {
  const number = state.config.whatsappNumber || "";
  const base = `https://wa.me/${number}`;
  const params = new URLSearchParams({ text: message });
  const utm = utmParams();
  utm.forEach((value, key) => {
    params.append(key, value);
  });
  return `${base}?${params.toString()}`;
};

const setWaLinks = () => {
  const linkMap = {
    "hero-primary": "Hi Island Force Renewables! I'm ready to go solar. Please share next steps.",
    "hero-secondary": "Hi Island Force Renewables! I'd like to join the Solar Power Movement.",
    "mobile-cta": "Hi Island Force Renewables! I'm ready to go solar. Please share next steps.",
    "savings-cta":
      "Hi Island Force Renewables! My bill is JMD {bill} ({type}). I'm sending my bill photo so you can size my system.",
    "location-cta": "Hi Island Force Renewables! I'm located in {parish}, {town}. Can you confirm eligibility?",
    "final-cta":
      "Hi Island Force Renewables! I'd like a solar design. Roof type: ____. Average bill: ____. Timeline: ____.",
  };

  document.querySelectorAll("[data-wa]").forEach((el) => {
    const key = el.getAttribute("data-wa");
    const template = linkMap[key];
    if (!template) return;
    el.dataset.waTemplate = template;
    el.setAttribute("href", waLink(template));
  });
};

const updateDynamicLinks = () => {
  const bill = document.getElementById("bill-value").textContent.replace(/,/g, "");
  const plan = document.querySelector(".toggle__btn.active")?.dataset.plan || "residential";
  const type = plan === "commercial" ? "Commercial" : "Residential";
  const savingsLink = document.querySelector('[data-wa="savings-cta"]');
  if (savingsLink?.dataset.waTemplate) {
    const message = savingsLink.dataset.waTemplate
      .replace("{bill}", bill)
      .replace("{type}", type);
    savingsLink.setAttribute("href", waLink(message));
  }

  const parish = document.getElementById("parish-select").value || "your parish";
  const town = document.getElementById("town-input").value || "";
  const locationLink = document.querySelector('[data-wa="location-cta"]');
  if (locationLink?.dataset.waTemplate) {
    const message = locationLink.dataset.waTemplate
      .replace("{parish}", parish)
      .replace("{town}", town || "your town");
    locationLink.setAttribute("href", waLink(message));
  }
};

const initTyping = () => {
  const lines = [
    "You already pay monthly for electricity…",
    "What if your electricity bill built something?",
    "Most people rent power without realizing it.",
  ];
  const typingEl = document.getElementById("typing-line");
  const lockLine = document.getElementById("lock-line");
  if (!typingEl || !lockLine) return;
  lockLine.classList.remove("active");
  if (prefersReducedMotion) {
    typingEl.textContent = "";
    lockLine.classList.add("active");
    return;
  }
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    if (lineIndex >= lines.length) {
      typingEl.textContent = "";
      lockLine.classList.add("active");
      return;
    }
    const line = lines[lineIndex];
    if (!deleting) {
      typingEl.textContent = line.slice(0, charIndex + 1);
      charIndex += 1;
      if (charIndex === line.length) {
        deleting = true;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      typingEl.textContent = line.slice(0, charIndex - 1);
      charIndex -= 1;
      if (charIndex === 0) {
        deleting = false;
        lineIndex += 1;
      }
    }
    setTimeout(tick, deleting ? 40 : 70);
  };
  tick();
};

const initReveal = () => {
  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

const initAccordion = () => {
  document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
    });
  });
};

const initDiagram = () => {
  const blocks = document.querySelectorAll(".diagram__step");
  if (!blocks.length) return;
  const activate = () => {
    blocks.forEach((block, index) => {
      setTimeout(() => block.classList.add("active"), index * 350);
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(blocks[0]);
};

const initSavings = () => {
  const range = document.getElementById("bill-range");
  const valueEl = document.getElementById("bill-value");
  const savingsEl = document.getElementById("savings-amount");
  const band = document.getElementById("savings-band");
  const summary = document.getElementById("savings-summary");
  const toggleButtons = document.querySelectorAll(".toggle__btn");

  const calculate = () => {
    const bill = Number(range.value);
    valueEl.textContent = bill.toLocaleString();
    const plan = document.querySelector(".toggle__btn.active")?.dataset.plan || "residential";
    const planLabel = plan === "commercial" ? "commercial" : "residential";
    const rate = plan === "commercial" ? 0.5 : 0.4;
    const savings = Math.round(bill * rate);
    savingsEl.textContent = savings.toLocaleString();
    band.style.width = `${rate * 100}%`;
    if (summary) {
      summary.textContent = `Based on a JMD ${bill.toLocaleString()} ${planLabel} bill, your estimated savings shift.`;
    }
    updateDynamicLinks();
  };

  range.addEventListener("input", calculate);
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      calculate();
    });
  });
  calculate();
};

const initLocation = () => {
  const parishes = [
    "Kingston",
    "St. Andrew",
    "St. Catherine",
    "Clarendon",
    "Manchester",
    "St. Elizabeth",
    "Westmoreland",
    "Hanover",
    "St. James",
    "Trelawny",
    "St. Ann",
    "St. Mary",
    "Portland",
    "St. Thomas",
  ];
  const select = document.getElementById("parish-select");
  const result = document.getElementById("location-result");
  parishes.forEach((parish) => {
    const option = document.createElement("option");
    option.value = parish;
    option.textContent = parish;
    select.appendChild(option);
  });
  const update = () => {
    if (select.value) {
      result.classList.add("active");
    }
    updateDynamicLinks();
  };
  select.addEventListener("change", update);
  document.getElementById("town-input").addEventListener("input", update);
};

let lastFocusedElement = null;

const trapFocus = (modal) => {
  const focusables = modal.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeModal(modal);
      return;
    }
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener("keydown", handleKeydown);
  modal.dataset.trapHandler = handleKeydown;
};

const openModal = (modal) => {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  trapFocus(modal);
  const focusTarget = modal.querySelector("button, [href]");
  focusTarget?.focus();
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  const handler = modal.dataset.trapHandler;
  if (handler) {
    modal.removeEventListener("keydown", handler);
  }
  lastFocusedElement?.focus();
};

const initModal = () => {
  const openButtons = document.querySelectorAll("[data-modal-open]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal-open");
      openModal(document.getElementById(`${modalId}-modal`));
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });
};

const renderGalleryCard = (item) => {
  const card = document.createElement("div");
  card.className = "gallery-card";
  card.dataset.id = item.id;
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("poster", item.thumb);
    card.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.thumb;
    img.alt = item.title;
    card.appendChild(img);
  }
  card.addEventListener("click", () => openLightbox(item.id));
  return card;
};

const openLightbox = (id) => {
  const modal = document.getElementById("lightbox");
  const mediaWrap = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const index = state.gallery.findIndex((item) => item.id === id);
  if (index < 0) return;
  state.lightboxIndex = index;
  const item = state.gallery[index];
  mediaWrap.innerHTML = "";
  let element;
  if (item.type === "video") {
    element = document.createElement("video");
    element.src = item.src;
    element.controls = true;
  } else {
    element = document.createElement("img");
    element.src = item.src;
    element.alt = item.title;
  }
  mediaWrap.appendChild(element);
  caption.textContent = item.title;
  openModal(modal);
};

const moveLightbox = (direction) => {
  if (!state.gallery.length) return;
  const nextIndex = (state.lightboxIndex + direction + state.gallery.length) % state.gallery.length;
  openLightbox(state.gallery[nextIndex].id);
};

const initLightbox = () => {
  const modal = document.getElementById("lightbox");
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
  document.querySelector("[data-lightbox-prev]").addEventListener("click", () => moveLightbox(-1));
  document.querySelector("[data-lightbox-next]").addEventListener("click", () => moveLightbox(1));
  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) return;
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
};

const initGallery = async () => {
  try {
    const response = await fetch("/api/gallery");
    const data = await response.json();
    state.gallery = data;
    const featured = data[Math.floor(Math.random() * data.length)];
    const recent = data.sort(() => 0.5 - Math.random()).slice(0, 6);

    const featuredCard = document.getElementById("featured-card");
    if (featured && featuredCard) {
      featuredCard.appendChild(renderGalleryCard(featured));
    }
    const recentGrid = document.getElementById("recent-grid");
    recent.forEach((item) => recentGrid.appendChild(renderGalleryCard(item)));
    const allGrid = document.getElementById("all-grid");
    data.forEach((item) => allGrid.appendChild(renderGalleryCard(item)));
  } catch (error) {
    // no-op
  }
};

const init = async () => {
  try {
    const response = await fetch("/api/config");
    state.config = await response.json();
  } catch (error) {
    state.config = {};
  }
  setWaLinks();
  initTyping();
  initReveal();
  initAccordion();
  initDiagram();
  initSavings();
  initLocation();
  initModal();
  initLightbox();
  initGallery();
  updateDynamicLinks();
};

init();
