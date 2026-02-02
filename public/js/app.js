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
    "savings-cta": "Hi Island Force Renewables! My bill is JMD {bill} ({type}). Please design options and I'll attach my bill.",
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
  const type = document.querySelector(".toggle__btn.active")?.dataset.plan || "residential";
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
    "Stop renting power.",
  ];
  const typingEl = document.getElementById("typing-line");
  if (!typingEl || prefersReducedMotion) {
    typingEl.textContent = lines.at(-1);
    return;
  }
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
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
        lineIndex = (lineIndex + 1) % lines.length;
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
  const blocks = document.querySelectorAll(".diagram__block");
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
  const toggleButtons = document.querySelectorAll(".toggle__btn");

  const calculate = () => {
    const bill = Number(range.value);
    valueEl.textContent = bill.toLocaleString();
    const plan = document.querySelector(".toggle__btn.active")?.dataset.plan || "residential";
    const rate = plan === "commercial" ? 0.5 : 0.4;
    const savings = Math.round(bill * rate);
    savingsEl.textContent = savings.toLocaleString();
    band.style.width = `${rate * 100}%`;
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

const initVideoSources = (config) => {
  const mappings = {
    hero: {
      src: config.heroVideoUrl || "/assets/video/hero.mp4",
      poster: config.heroPosterUrl || "/assets/img/hero-poster.svg",
    },
    financing: {
      src: config.financingVideoUrl || "/assets/video/financing.mp4",
      poster: config.financingPosterUrl || "/assets/img/financing-poster.svg",
    },
    projects: {
      src: config.projectsVideoUrl || "/assets/video/projects.mp4",
      poster: config.projectsPosterUrl || "/assets/img/projects-poster.svg",
    },
  };

  document.querySelectorAll("video[data-video]").forEach((video) => {
    const key = video.dataset.video;
    if (!mappings[key]) return;
    video.src = mappings[key].src;
    video.poster = mappings[key].poster;
  });
};

const init = async () => {
  try {
    const response = await fetch("/api/config");
    state.config = await response.json();
  } catch (error) {
    state.config = {};
  }
  initVideoSources(state.config);
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
