/*
 * PERSONALIZAÇÃO:
 * 1. Insira o link verdadeiro do Instagram.
 * 2. Confira todos os textos e serviços com a profissional antes de publicar.
 */
const CONFIG = {
  whatsappUrl: "https://api.whatsapp.com/send?phone=5583993293517&text=Vim%20atrav%C3%A9s%20do%20Instagram%20para%20psic%C3%B3loga%20Thain%C3%A1",
  instagramUrl: ""    // Ex.: "https://www.instagram.com/usuario/"
};

const whatsappLink = document.querySelector("#whatsapp-link");
const instagramLink = document.querySelector("#instagram-link");

function configureContactLinks() {
  whatsappLink.href = CONFIG.whatsappUrl;
  whatsappLink.setAttribute("aria-label", "Entrar em contato com Thainá Farias pelo WhatsApp");

  if (CONFIG.instagramUrl.trim()) {
    instagramLink.href = CONFIG.instagramUrl.trim();
  } else {
    instagramLink.href = "#";
    instagramLink.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Insira o link oficial do Instagram no arquivo script.js antes de publicar.");
    });
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  });
});

function setupScrollAnimations() {
  const revealItems = document.querySelectorAll(
    ".about-grid > *, .center-heading, .area-card, .process-grid > *, .faq-grid > *, .contact-box > *, .footer-main, .footer-bottom"
  );
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  revealItems.forEach((item) => {
    item.classList.add("scroll-reveal");
    observer.observe(item);
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();
configureContactLinks();
setupScrollAnimations();
