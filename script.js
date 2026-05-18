const walletPolishStylesheet = document.createElement("link");
walletPolishStylesheet.rel = "stylesheet";
walletPolishStylesheet.href = "wallet-polish.css?v=gift-popup-1";
document.head.appendChild(walletPolishStylesheet);

const body = document.body;
const modals = document.querySelectorAll(".modal-backdrop");
const navButtons = document.querySelectorAll("[data-nav]");
const walletPage = document.querySelector("#walletPage");
const activityPage = document.querySelector("#activityPage");
const walletTabs = document.querySelectorAll("[data-wallet-tab]");
const walletPanels = document.querySelectorAll("[data-wallet-panel]");
const amountCards = document.querySelectorAll(".amount-card");
const rechargeNote = document.querySelector("[data-recharge-note]");
const homeBalance = document.querySelector("[data-home-balance]");
const walletBalance = document.querySelector("[data-wallet-balance]");
const depositSuccess = document.querySelector("[data-deposit-success]");
const successAmount = document.querySelector("[data-success-amount]");
const successBalance = document.querySelector("[data-success-balance]");
const activityDetailModal = document.querySelector("[data-activity-detail-modal]");
const detailKicker = document.querySelector("[data-detail-kicker]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailCopy = document.querySelector("[data-detail-copy]");
const detailRuleOne = document.querySelector("[data-detail-rule-one]");
const detailRuleTwo = document.querySelector("[data-detail-rule-two]");
const detailCta = document.querySelector("[data-detail-cta]");
const promoSlides = Array.from(document.querySelectorAll(".promo-slide"));
const promoDots = Array.from(document.querySelectorAll(".promo-dots span"));
let walletBalanceValue = 0.5;
let activePromo = 0;

const activityDetails = {
  deposit: {
    kicker: "Deposit Bonus",
    title: "5th Deposit Bonus 125%",
    copy: "Unlock staged bonus rewards across your first five demo deposits.",
    ruleOne: "First deposit starts with a 30% reward.",
    ruleTwo: "Bonus levels update automatically in the wallet preview.",
    cta: "Deposit Now",
    opensWallet: true,
  },
  "daily-rebate": {
    kicker: "Free Bonus",
    title: "Daily Rebate 0.5%",
    copy: "The more you play in the demo, the more cashback your account preview can show.",
    ruleOne: "Calculated from eligible demo wagers.",
    ruleTwo: "Designed for retention and daily return flow.",
    cta: "Go Play",
  },
  login: {
    kicker: "Daily Rewards",
    title: "Daily Login Rewards",
    copy: "Show a simple daily claim flow that gives players a reason to come back.",
    ruleOne: "One claim per demo day.",
    ruleTwo: "Reward copy and amount can be changed later.",
    cta: "Claim Reward",
  },
  "free-spin": {
    kicker: "Free Spin",
    title: "Free Spin - Easy Win",
    copy: "Spin once every day and claim demo bonus credits instantly.",
    ruleOne: "Available once per demo day.",
    ruleTwo: "Rewards are credited to the demo wallet.",
    cta: "Check Now",
  },
  "loss-rescue": {
    kicker: "Rescue Bonus",
    title: "Loss Rescue 10%",
    copy: "A comeback-style offer for users after tough sessions.",
    ruleOne: "Shows a percentage rescue reward in the activity center.",
    ruleTwo: "Can later be linked to wager history and VIP level.",
    cta: "Deposit",
    opensWallet: true,
  },
  refer: {
    kicker: "Referral",
    title: "Refer & Earn",
    copy: "Invite friends and unlock a referral rewards preview.",
    ruleOne: "Share flow can be connected to tracking links later.",
    ruleTwo: "Reward tiers can be configured from your backend later.",
    cta: "Invite Now",
  },
};

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

function showDepositSuccess(depositValue) {
  if (successAmount) successAmount.textContent = `+${formatUsd(depositValue)}`;
  if (successBalance) successBalance.textContent = formatUsd(walletBalanceValue);
  depositSuccess?.classList.add("is-open");
  depositSuccess?.setAttribute("aria-hidden", "false");
}

function closeDepositSuccess() {
  depositSuccess?.classList.remove("is-open");
  depositSuccess?.setAttribute("aria-hidden", "true");
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

function openActivity() {
  closeModals();
  closeWallet();
  activityPage?.classList.add("is-open");
  activityPage?.setAttribute("aria-hidden", "false");
  body.classList.add("wallet-open");
  activityPage?.scrollTo({ top: 0, behavior: "instant" });
}

function closeActivity() {
  activityPage?.classList.remove("is-open");
  activityPage?.setAttribute("aria-hidden", "true");
  body.classList.remove("wallet-open");
}

function openActivityDetail(detailKey) {
  const detail = activityDetails[detailKey] || activityDetails["free-spin"];
  if (detailKicker) detailKicker.textContent = detail.kicker;
  if (detailTitle) detailTitle.textContent = detail.title;
  if (detailCopy) detailCopy.textContent = detail.copy;
  if (detailRuleOne) detailRuleOne.textContent = detail.ruleOne;
  if (detailRuleTwo) detailRuleTwo.textContent = detail.ruleTwo;
  if (detailCta) {
    detailCta.textContent = detail.cta;
    detailCta.dataset.opensWallet = detail.opensWallet ? "true" : "false";
  }
  activityDetailModal?.classList.add("is-open");
  activityDetailModal?.setAttribute("aria-hidden", "false");
}

function closeActivityDetail() {
  activityDetailModal?.classList.remove("is-open");
  activityDetailModal?.setAttribute("aria-hidden", "true");
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
  const activityButton = event.target.closest("[data-open-activity]");
  const closeActivityButton = event.target.closest("[data-close-activity]");
  const activityDetailButton = event.target.closest("[data-activity-detail]");
  const closeActivityDetailButton = event.target.closest("[data-close-activity-detail]");
  const detailCtaButton = event.target.closest("[data-detail-cta]");
  const openButton = event.target.closest("[data-open-modal]");
  const closeButton = event.target.closest("[data-close-modal]");
  const scrollButton = event.target.closest("[data-scroll-target]");
  const navButton = event.target.closest("[data-nav]");
  const walletTab = event.target.closest("[data-wallet-tab]");
  const amountCard = event.target.closest(".amount-card");
  const rechargeButton = event.target.closest("[data-recharge-submit]");
  const closeSuccessButton = event.target.closest("[data-close-success]");

  if (walletButton) {
    closeActivity();
    closeActivityDetail();
    openWallet();
  }

  if (closeWalletButton) {
    closeWallet();
  }

  if (activityButton) {
    openActivity();
  }

  if (closeActivityButton) {
    closeActivity();
  }

  if (activityDetailButton) {
    openActivityDetail(activityDetailButton.dataset.activityDetail);
  }

  if (closeActivityDetailButton || event.target === activityDetailModal) {
    closeActivityDetail();
  }

  if (detailCtaButton) {
    if (detailCtaButton.dataset.opensWallet === "true") {
      closeActivityDetail();
      closeActivity();
      openWallet();
    } else {
      closeActivityDetail();
    }
  }

  if (openButton) {
    openModal(openButton.dataset.openModal);
  }

  if (closeButton || event.target.classList.contains("modal-backdrop")) {
    closeModals();
  }

  if (closeSuccessButton || event.target === depositSuccess) {
    closeDepositSuccess();
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
      showDepositSuccess(depositValue);

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
    closeActivityDetail();
    closeDepositSuccess();
    closeWallet();
    closeActivity();
    closeModals();
  }
});

function showPromoSlide(index) {
  if (!promoSlides.length) return;

  activePromo = index % promoSlides.length;
  promoSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activePromo);
  });
  promoDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activePromo);
  });
}

window.setInterval(() => {
  showPromoSlide(activePromo + 1);
}, 2800);
