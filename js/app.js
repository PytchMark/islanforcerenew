const WHATSAPP_NUMBER = "1876XXXXXXX";

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const waMessages = {
  hero_primary: "Hi Island Force Renewables — I’m ready to take control of my power. Can we talk about going solar?",
  hero_secondary: "Hi — I want to join the solar movement. What’s the best first step?",
  mobile_chat: "Hi — I’d like to chat on WhatsApp about solar for my home.",
  mobile_recommendation: "Hi — I’m ready for a recommendation. What should I share to get started?",
  see_difference: "Hi — I clicked ‘See the Difference’. Can you explain the monthly payment comparison for my home?",
  modal_complete: "Hi — I reviewed the utility vs solar breakdown. Okay, show me what’s possible for my home.",
  savings: "Hi — I want to see my potential savings. My estimated monthly light bill is: ____ and I’m located in ____.",
  financing_qualify: "Hi — I’d like to check financing options I may qualify for. I prefer: (lower monthly payment / deposit / both).",
  cash_saving: "Hi — I’m planning my solar project. I’m currently saving up and want guidance on timing.",
  cash_partial: "Hi — I have part of my solar budget ready and want guidance on the next steps.",
  cash_timing: "Hi — I want guidance on the right timing for my solar project.",
  final_reco: "Hi — I’d like a solar recommendation. Parish: ____. Residential/Commercial: ____. Monthly bill range: ____. Financing interest: ____."
};

const waElements = document.querySelectorAll("[data-wa]");
waElements.forEach((el) => {
  const key = el.getAttribute("data-wa");
  const message = waMessages[key];
  if (!message) return;
  if (el.tagName.toLowerCase() === "a") {
    el.setAttribute("href", waLink(message));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  } else {
    el.addEventListener("click", () => {
      window.open(waLink(message), "_blank", "noopener,noreferrer");
    });
  }
});

const modal = document.getElementById("education-modal");
const modalOpeners = document.querySelectorAll("[data-modal-open]");
const modalClosers = document.querySelectorAll("[data-modal-close]");
let lastFocusedElement = null;

const openModal = (event) => {
  if (!modal) return;
  event.preventDefault();
  lastFocusedElement = event.currentTarget;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const focusable = modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
  if (focusable) focusable.focus();
};

const closeModal = () => {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocusedElement) lastFocusedElement.focus();
};

modalOpeners.forEach((btn) => btn.addEventListener("click", openModal));
modalClosers.forEach((btn) => btn.addEventListener("click", closeModal));

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
  if (event.key === "Tab" && modal && modal.getAttribute("aria-hidden") === "false") {
    const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const focusableArray = Array.from(focusable);
    if (focusableArray.length === 0) return;
    const first = focusableArray[0];
    const last = focusableArray[focusableArray.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

const toggleCards = document.querySelectorAll(".toggle-card");
toggleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const expanded = card.getAttribute("aria-expanded") === "true";
    card.setAttribute("aria-expanded", String(!expanded));
  });
});

const selectorButtons = document.querySelectorAll(".selector-btn");
const selectorOutput = document.querySelector(".selector-output");
const selectorCopy = {
  lower: "We can prioritize the lowest monthly payment while keeping performance strong.",
  deposit: "A stronger deposit can reduce financing pressure and shorten the payoff horizon.",
  both: "We can model both paths and compare total lifetime savings."
};

selectorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectorButtons.forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    const key = btn.getAttribute("data-selector");
    if (selectorOutput) selectorOutput.textContent = selectorCopy[key] || "";
  });
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
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
  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const typingContainer = document.querySelector("[data-typing]");
if (typingContainer) {
  const finalText = typingContainer.getAttribute("data-final");
  const typingTextEl = typingContainer.querySelector(".typing-text");
  const lines = [
    "You already pay monthly for electricity…",
    "What if your electricity bill built something?",
    "Most people rent power without realizing it.",
    "Stop renting power."
  ];

  if (prefersReducedMotion) {
    typingTextEl.textContent = finalText;
  } else {
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeSpeed = 55;
    const deleteSpeed = 40;
    const pause = 1200;

    const typeLoop = () => {
      const currentLine = lines[lineIndex];
      if (!deleting) {
        typingTextEl.textContent = currentLine.slice(0, charIndex + 1);
        charIndex += 1;
        if (charIndex === currentLine.length) {
          deleting = true;
          setTimeout(typeLoop, pause);
          return;
        }
        setTimeout(typeLoop, typeSpeed);
      } else {
        typingTextEl.textContent = currentLine.slice(0, charIndex - 1);
        charIndex -= 1;
        if (charIndex === 0) {
          deleting = false;
          lineIndex += 1;
          if (lineIndex >= lines.length) {
            typingTextEl.textContent = finalText;
            return;
          }
        }
        setTimeout(typeLoop, deleteSpeed);
      }
    };

    typeLoop();
  }
}
