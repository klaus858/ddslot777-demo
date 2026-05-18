const body = document.body;
const modals = document.querySelectorAll(".modal-backdrop");
const navButtons = document.querySelectorAll("[data-nav]");

function openModal(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeModals() {
  modals.forEach((modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });
  body.classList.remove("modal-open");
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-modal]");
  const closeButton = event.target.closest("[data-close-modal]");
  const scrollButton = event.target.closest("[data-scroll-target]");
  const navButton = event.target.closest("[data-nav]");

  if (openButton) {
    openModal(openButton.dataset.openModal);
  }

  if (closeButton || event.target.classList.contains("modal-backdrop")) {
    closeModals();
  }

  if (scrollButton) {
    document.querySelector(scrollButton.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth" });
  }

  if (navButton) {
    navButtons.forEach((button) => button.classList.remove("active"));
    navButton.classList.add("active");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModals();
});

const dots = Array.from(document.querySelectorAll(".hero-dots span"));
let activeDot = 0;

window.setInterval(() => {
  dots[activeDot]?.classList.remove("active");
  activeDot = (activeDot + 1) % dots.length;
  dots[activeDot]?.classList.add("active");
}, 1800);
