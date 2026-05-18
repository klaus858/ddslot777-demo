const body = document.body;
const modals = document.querySelectorAll(".modal-backdrop");
const navButtons = document.querySelectorAll("[data-nav]");
const walletPage = document.querySelector("#walletPage");
const walletTabs = document.querySelectorAll("[data-wallet-tab]");
const walletPanels = document.querySelectorAll("[data-wallet-panel]");
const amountCards = document.querySelectorAll(".amount-card");
const rechargeNote = document.querySelector("[data-recharge-note]");
const homeBalance = document.querySelector("[data-home-balance]");
const walletBalance = document.querySelector("[data-wallet-balance]");
let walletBalanceValue = 0.5;

function getAmountText(card) {
  return Array.from(card.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent.trim())
    .find(Boolean) || "$ 10,00";
}

function parseAmountValue(amountText) {
  const normalized = amountText.replace(/\$/g, "").replace(/\s/g, "").toUpperCase();
  const multiplier = normalized.includes("K") ? 1000 : 1;
  const numeric = Number.parseFloat(normalized.replace("K", "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric * multiplier : 0;
}

function formatUsd(value) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function updateWalletBalance(value) {
  walletBalanceValue = value;
  if (walletBalance) walletBalance.textContent = formatUsd(walletBalanceValue);
  if (homeBalance) homeBalance.textContent = formatUsd(walletBalanceValue);
}

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

function openWallet() {
  closeModals();
  walletPage?.classList.add("is-open");
  walletPage?.setAttribute("aria-hidden", "false");
  body.classList.add("wallet-open");
  walletPage?.scrollTo({ top: 0, behavior: "instant" });
}

function closeWallet() {
  walletPage?.classList.remove("is-open");
  walletPage?.setAttribute("aria-hidden", "true");
  body.classList.remove("wallet-open");
}

function selectWalletTab(tabName) {
  walletTabs.forEach((tab) => {
    const active = tab.dataset.walletTab === tabName;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  walletPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.walletPanel === tabName);
  });
}

document.addEventListener("click", (event) => {
  const walletButton = event.target.closest("[data-open-wallet]");
  const closeWalletButton = event.target.closest("[data-close-wallet]");
  const openButton = event.target.closest("[data-open-modal]");
  const closeButton = event.target.closest("[data-close-modal]");
  const scrollButton = event.target.closest("[data-scroll-target]");
  const navButton = event.target.closest("[data-nav]");
  const walletTab = event.target.closest("[data-wallet-tab]");
  const amountCard = event.target.closest(".amount-card");
  const rechargeButton = event.target.closest("[data-recharge-submit]");

  if (walletButton) {
    openWallet();
  }

  if (closeWalletButton) {
    closeWallet();
  }

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

  if (walletTab) {
    selectWalletTab(walletTab.dataset.walletTab);
  }

  if (amountCard) {
    amountCards.forEach((card) => card.classList.remove("selected"));
    amountCard.classList.add("selected");
    if (rechargeNote) {
      const selectedAmount = getAmountText(amountCard);
      rechargeNote.innerHTML = `Selected amount: <strong>${selectedAmount}</strong>`;
    }
  }

  if (rechargeButton && rechargeNote) {
    const selectedCard = document.querySelector(".amount-card.selected");
    const selectedAmount = selectedCard ? getAmountText(selectedCard) : "$ 10,00";
    const depositValue = parseAmountValue(selectedAmount);

    rechargeButton.classList.add("is-processing");
    rechargeButton.textContent = "Processing...";
    rechargeButton.disabled = true;
    rechargeNote.innerHTML = `Waiting for test callback: <strong>${selectedAmount}</strong>`;

    window.setTimeout(() => {
      updateWalletBalance(walletBalanceValue + depositValue);
      rechargeButton.classList.remove("is-processing");
      rechargeButton.classList.add("is-success");
      rechargeButton.textContent = "Deposit Success";
      rechargeNote.innerHTML = `Callback success: <strong>+${formatUsd(depositValue)}</strong> credited. Balance: <strong>${formatUsd(walletBalanceValue)}</strong>`;

      window.setTimeout(() => {
        rechargeButton.classList.remove("is-success");
        rechargeButton.textContent = "Deposit Now";
        rechargeButton.disabled = false;
      }, 1400);
    }, 850);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeWallet();
    closeModals();
  }
});

const dots = Array.from(document.querySelectorAll(".hero-dots span"));
let activeDot = 0;

window.setInterval(() => {
  dots[activeDot]?.classList.remove("active");
  activeDot = (activeDot + 1) % dots.length;
  dots[activeDot]?.classList.add("active");
}, 1800);
