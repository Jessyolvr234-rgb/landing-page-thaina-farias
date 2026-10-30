/*
 * PERSONALIZAÇÃO:
 * 1. Insira o link verdadeiro do Instagram.
 * 2. Confira todos os textos e serviços com a profissional antes de publicar.
 */
const CONFIG = {
  whatsappUrl: "https://api.whatsapp.com/send?phone=5583993293517&text=Vim%20atrav%C3%A9s%20do%20Instagram%20para%20psic%C3%B3loga%20Thain%C3%A1",
  instagramUrl: "https://www.instagram.com/psithainafarias?mdxt=a2JnMWFobDJtemNm"
};

const whatsappLink = document.querySelector("#whatsapp-link");
const instagramLink = document.querySelector("#instagram-link");
const opinionMessage = document.querySelector("#opinion-message");
const opinionForm = document.querySelector("#opinion-form");
const opinionSubmit = document.querySelector("#opinion-submit");
const opinionCount = document.querySelector("#opinion-count");
const opinionStatus = document.querySelector("#opinion-status");
const opinionList = document.querySelector("#opinion-list");
const opinionEmpty = document.querySelector("#opinion-empty");
let feedbackClient;

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

function createOpinionCard(message) {
  const article = document.createElement("article");
  article.className = "opinion-entry";

  const quote = document.createElement("blockquote");
  quote.textContent = message;

  const attribution = document.createElement("p");
  attribution.className = "opinion-attribution";
  attribution.textContent = "Comentário anônimo";

  article.append(quote, attribution);
  return article;
}

async function loadApprovedOpinions() {
  const { data, error } = await feedbackClient
    .from("feedback")
    .select("id, message")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Could not load approved feedback:", error);
    opinionEmpty.hidden = false;
    opinionEmpty.querySelector("h3").textContent = "Não foi possível carregar os feedbacks";
    opinionEmpty.querySelector("p").textContent = "Tente novamente mais tarde.";
    return;
  }

  opinionList.replaceChildren(...data.map((item) => createOpinionCard(item.message)));
  opinionEmpty.hidden = data.length > 0;
}

async function configureOpinionForm() {
  opinionMessage.addEventListener("input", () => {
    opinionCount.textContent = `${opinionMessage.value.length}/1000`;
  });

  if (!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.publicKey) {
    opinionStatus.textContent = "O envio de feedbacks será ativado após a configuração do serviço.";
    return;
  }

  if (!window.supabase?.createClient) {
    opinionStatus.textContent = "Não foi possível carregar o serviço de feedbacks. Verifique sua conexão.";
    return;
  }

  feedbackClient = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.publicKey
  );
  await loadApprovedOpinions();
  opinionSubmit.disabled = false;

  opinionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!opinionForm.reportValidity()) return;

    opinionSubmit.disabled = true;
    opinionStatus.textContent = "Enviando seu comentário para moderação...";

    const { error } = await feedbackClient.from("feedback").insert({
      message: opinionMessage.value.trim(),
      publication_consent: true
    });

    if (error) {
      console.error("Could not submit feedback:", error);
      opinionStatus.textContent = "Não foi possível enviar o comentário. Tente novamente mais tarde.";
      opinionSubmit.disabled = false;
      return;
    }

    opinionForm.reset();
    opinionCount.textContent = "0/1000";
    opinionStatus.textContent = "Obrigado! Seu comentário foi recebido e será revisado antes de uma possível publicação.";
    opinionSubmit.disabled = false;
  });
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
    ".about-grid > *, .center-heading, .area-card, .care-card, .opinion-heading, .opinion-empty, .opinion-card, .process-grid > *, .faq-grid > *, .contact-box > *, .footer-main, .footer-bottom"
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
configureOpinionForm();
setupScrollAnimations();
