const API_BASE = new URLSearchParams(window.location.search).get("api") === "local"
  ? "http://127.0.0.1:8080"
  : "https://ddslot777-api.vercel.app";
const AUTH_STORAGE_KEY = "ddslot-auth-session";

const body = document.body;
const modals = document.querySelectorAll(".modal-backdrop");
const walletPage = document.querySelector("#walletPage");
const activityPage = document.querySelector("#activityPage");
const walletTabs = document.querySelectorAll("[data-wallet-tab]");
const walletPanels = document.querySelectorAll("[data-wallet-panel]");
const amountCards = document.querySelectorAll(".amount-card");
const rechargeNote = document.querySelector("[data-recharge-note]");
const homeBalance = document.querySelector("[data-home-balance]");
const walletBalance = document.querySelector("[data-wallet-balance]");
const activityBalance = document.querySelector("[data-activity-balance]");
const walletTopBalance = document.querySelector("[data-wallet-top-balance]");
const globalBalance = document.querySelector("[data-global-balance]");
const profileBalance = document.querySelector("[data-profile-balance]");
const depositSuccess = document.querySelector("[data-deposit-success]");
const successAmount = document.querySelector("[data-success-amount]");
const successBalance = document.querySelector("[data-success-balance]");
const profilePanel = document.querySelector("[data-profile-panel]");
const appToast = document.querySelector("[data-app-toast]");
const toastTitle = document.querySelector("[data-toast-title]");
const toastMessage = document.querySelector("[data-toast-message]");
const activityDetailModal = document.querySelector("[data-activity-detail-modal]");
const detailKicker = document.querySelector("[data-detail-kicker]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailCopy = document.querySelector("[data-detail-copy]");
const detailRuleOne = document.querySelector("[data-detail-rule-one]");
const detailRuleTwo = document.querySelector("[data-detail-rule-two]");
const detailCta = document.querySelector("[data-detail-cta]");
const promoSlides = Array.from(document.querySelectorAll(".promo-slide"));
const promoDots = Array.from(document.querySelectorAll(".promo-dots span"));
const promoCarousel = document.querySelector(".custom-hero-carousel");
const activityHero = document.querySelector("[data-activity-hero-carousel]");
const activityHeroTitle = document.querySelector("[data-activity-hero-title]");
const activityHeroSubtitle = document.querySelector("[data-activity-hero-subtitle]");
const activityHeroDetail = document.querySelector("[data-activity-hero-detail]");
const activityHeroDots = Array.from(document.querySelectorAll("[data-activity-hero-dot]"));
const authModal = document.querySelector(".auth-modal");
const authTitle = document.querySelector(".auth-title");
const authTabs = Array.from(document.querySelectorAll("[data-auth-mode]"));
const authMethods = Array.from(document.querySelectorAll("[data-auth-method]"));
const authPhoneField = document.querySelector('[data-auth-field="phone"]');
const authEmailField = document.querySelector('[data-auth-field="email"]');
const authPhoneInput = document.querySelector("[data-auth-phone]");
const authEmailInput = document.querySelector("[data-auth-email]");
const authPassword = document.querySelector("[data-auth-password]");
const authPasswordToggle = document.querySelector("[data-auth-toggle-password]");
const authSubmit = document.querySelector("[data-auth-submit]");
const authMessage = document.querySelector("[data-auth-message]");
const authRules = document.querySelector("[data-auth-rules]");
const authRuleCase = document.querySelector('[data-rule="case"]');
const authRuleNumber = document.querySelector('[data-rule="number"]');
const authRuleLength = document.querySelector('[data-rule="length"]');
let walletBalanceValue = 0.5;
let activePromo = 0;
let activeActivityHero = 0;
let authMode = "login";
let authMethod = "phone";
let authSession = readAuthSession();
let currentUser = authSession?.user || null;
let isAuthenticated = Boolean(authSession?.token && authSession?.user);

const activityHeroSlides = [
  {
    title: "FREE SPIN - EASY",
    subtitle: "SPIN EASY $10 WIN!",
    image: "assets/promo-5.webp",
    detail: "free-spin",
  },
  {
    title: "DEPOSIT BONUS",
    subtitle: "UP TO 125% REWARDS",
    image: "assets/promo-4.webp",
    detail: "deposit",
  },
  {
    title: "REFER & EARN",
    subtitle: "INVITE FRIENDS. CLAIM REWARDS.",
    image: "assets/promo-6.webp",
    detail: "refer",
  },
];

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
  if (activityBalance) activityBalance.textContent = formatUsd(walletBalanceValue);
  if (walletTopBalance) walletTopBalance.textContent = formatUsd(walletBalanceValue);
  if (globalBalance && isAuthenticated) globalBalance.textContent = formatUsd(walletBalanceValue);
  if (profileBalance) profileBalance.textContent = formatUsd(walletBalanceValue);
}

function readAuthSession() {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function saveAuthSession(session) {
  authSession = session;
  currentUser = session?.user || null;
  isAuthenticated = Boolean(session?.token && session?.user);
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.localStorage.setItem("ddslot-auth-state", "signed-in");
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("ddslot-auth-state");
  }
}

function renderAuthState() {
  body.classList.toggle("is-authenticated", isAuthenticated);
  if (globalBalance && isAuthenticated) globalBalance.textContent = formatUsd(walletBalanceValue);
}

function applyAuthenticatedUser(user) {
  if (user && typeof user.balance === "number") {
    updateWalletBalance(user.balance);
  }
  renderAuthState();
  closeModals();
}

async function requestApi(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authSession?.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${authSession.token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `api_${response.status}`);
  }
  return data;
}

async function syncWalletFromApi() {
  if (!authSession?.token) {
    saveAuthSession(null);
    renderAuthState();
    return;
  }
  try {
    const data = await requestApi("/api/auth/me");
    if (typeof data.user?.balance === "number") {
      saveAuthSession({ token: authSession.token, user: data.user });
      updateWalletBalance(data.user.balance);
      renderAuthState();
    }
  } catch (error) {
    saveAuthSession(null);
    renderAuthState();
    console.warn("Wallet API sync failed", error);
  }
}

async function syncDepositSuccessToApi(amount) {
  return requestApi("/api/wallet/deposit/success", {
    method: "POST",
    body: JSON.stringify({
      userId: currentUser?.id,
      amount,
      channel: "demo-wallet",
    }),
  });
}

function setAuthMessage(message, type = "error") {
  if (!authMessage) return;
  authMessage.textContent = message || "";
  authMessage.classList.toggle("is-visible", Boolean(message));
  authMessage.classList.toggle("is-success", type === "success");
}

function getAuthIdentifier() {
  return authMethod === "email" ? authEmailInput?.value.trim() || "" : authPhoneInput?.value.trim() || "";
}

function authErrorMessage(error) {
  const message = error?.message || "";
  const map = {
    invalid_credentials: "Account or password is incorrect.",
    missing_credentials: "Enter your account and password.",
    missing_identifier: "Enter your phone number or email.",
    weak_password: "Password must match all rules.",
    user_exists: "This account is already registered.",
  };
  return map[message] || "Unable to connect. Please try again.";
}

async function submitAuthForm() {
  const identifier = getAuthIdentifier();
  const password = authPassword?.value || "";
  const passwordReady = /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && password.length >= 6;

  if (!identifier || !password) {
    setAuthMessage("Enter your account and password.");
    return;
  }
  if (!passwordReady) {
    setAuthMessage("Password must match all rules.");
    return;
  }

  const isSignup = authMode === "signup";
  const payload = {
    password,
    ...(authMethod === "email" ? { email: identifier } : { phone: identifier }),
  };
  if (isSignup) {
    payload.username = authMethod === "email" ? identifier.split("@")[0] : identifier.replace(/\D/g, "");
  } else {
    payload.identifier = identifier;
  }

  if (authSubmit) {
    authSubmit.disabled = true;
    authSubmit.textContent = isSignup ? "Creating..." : "Logging in...";
  }
  setAuthMessage(isSignup ? "Creating account..." : "Checking account...", "success");
  try {
    const data = await requestApi(isSignup ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAuthSession({ token: data.token, user: data.user });
    applyAuthenticatedUser(data.user);
  } catch (error) {
    setAuthMessage(authErrorMessage(error));
  } finally {
    if (authSubmit) {
      authSubmit.disabled = false;
      authSubmit.textContent = isSignup ? "Sign Up" : "Log In";
    }
  }
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

function showToast(title, message) {
  if (!appToast) return;
  window.clearTimeout(showToast.timeoutId);
  if (toastTitle) toastTitle.textContent = title;
  if (toastMessage) toastMessage.textContent = message;
  appToast.classList.add("is-visible");
  appToast.setAttribute("aria-hidden", "false");
  showToast.timeoutId = window.setTimeout(() => {
    appToast.classList.remove("is-visible");
    appToast.setAttribute("aria-hidden", "true");
  }, 2600);
}

function openProfilePanel() {
  if (!isAuthenticated) {
    setAuthMode("login");
    openModal("signin");
    return;
  }
  closeModals();
  closeActivityDetail();
  profilePanel?.classList.add("is-open");
  profilePanel?.setAttribute("aria-hidden", "false");
}

function closeProfilePanel() {
  profilePanel?.classList.remove("is-open");
  profilePanel?.setAttribute("aria-hidden", "true");
}

function setAuthMode(mode) {
  authMode = mode;
  setAuthMessage("");
  const isSignup = mode === "signup";
  authTabs.forEach((tab) => {
    const active = tab.dataset.authMode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  if (authTitle) authTitle.textContent = isSignup ? "Sign Up" : "Log In";
  if (authSubmit) authSubmit.textContent = isSignup ? "Sign Up" : "Log In";
}

function setAuthMethod(method) {
  authMethod = method;
  setAuthMessage("");
  authMethods.forEach((tab) => {
    const active = tab.dataset.authMethod === method;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  if (authPhoneField) authPhoneField.hidden = method !== "phone";
  if (authEmailField) authEmailField.hidden = method !== "email";
}

function updatePasswordRules() {
  const value = authPassword?.value || "";
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  authRules?.classList.toggle("is-visible", value.length > 0);
  authRuleCase?.classList.toggle("is-valid", hasUpper && hasLower);
  authRuleNumber?.classList.toggle("is-valid", hasNumber);
  authRuleLength?.classList.toggle("is-valid", value.length >= 6);
}

function openModal(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);
  if (!modal) return;
  closeProfilePanel();

  if (name === "signin" && authPassword) {
    authPassword.value = "";
    authPassword.type = "password";
    authPasswordToggle?.classList.remove("is-visible");
    authPasswordToggle?.setAttribute("aria-label", "Show password");
    setAuthMessage("");
    updatePasswordRules();
  }

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
  closeProfilePanel();
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
  closeProfilePanel();
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

function goHome() {
  closeActivityDetail();
  closeDepositSuccess();
  closeProfilePanel();
  closeWallet();
  closeActivity();
  closeModals();
  window.scrollTo({ top: 0, behavior: "smooth" });
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

function selectStep(step) {
  const group = step.closest(".bonus-steps, .activity-bonus-steps");
  if (!group) return;
  group.querySelectorAll(".bonus-step, .activity-bonus-step").forEach((item) => {
    item.classList.toggle("active", item === step);
  });
}

function showActivityHeroSlide(index) {
  if (!activityHero || !activityHeroSlides.length) return;

  activeActivityHero = (index + activityHeroSlides.length) % activityHeroSlides.length;
  const slide = activityHeroSlides[activeActivityHero];

  activityHero.style.setProperty("--activity-hero-image", `url("${slide.image}")`);
  if (activityHeroTitle) activityHeroTitle.textContent = slide.title;
  if (activityHeroSubtitle) activityHeroSubtitle.textContent = slide.subtitle;
  if (activityHeroDetail) activityHeroDetail.dataset.activityDetail = slide.detail;

  activityHeroDots.forEach((dot, dotIndex) => {
    const active = dotIndex === activeActivityHero;
    dot.classList.toggle("active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
}

function attachSwipe(element, onNext, onPrevious) {
  if (!element) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  element.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a, input, textarea, select")) return;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  element.addEventListener("pointerup", (event) => {
    if (!tracking) return;
    tracking = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    if (deltaX < 0) {
      onNext();
    } else {
      onPrevious();
    }
  });

  element.addEventListener("pointercancel", () => {
    tracking = false;
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
  const walletTab = event.target.closest("[data-wallet-tab]");
  const amountCard = event.target.closest(".amount-card");
  const rechargeButton = event.target.closest("[data-recharge-submit]");
  const closeSuccessButton = event.target.closest("[data-close-success]");
  const promoDot = event.target.closest(".promo-dots span");
  const activityHeroDot = event.target.closest("[data-activity-hero-dot]");
  const goHomeButton = event.target.closest("[data-go-home]");
  const authModeButton = event.target.closest("[data-auth-mode]");
  const authMethodButton = event.target.closest("[data-auth-method]");
  const authPasswordButton = event.target.closest("[data-auth-toggle-password]");
  const authEntryButton = event.target.closest("[data-auth-entry]");
  const authProfileButton = event.target.closest("[data-auth-profile]");
  const closeProfileButton = event.target.closest("[data-close-profile]");
  const notificationsButton = event.target.closest("[data-open-notifications]");
  const searchButton = event.target.closest("[data-open-search]");
  const menuPreviewButton = event.target.closest("[data-menu-preview]");
  const casinoPreviewButton = event.target.closest("[data-casino-preview]");
  const walletHistoryButton = event.target.closest("[data-wallet-history]");
  const supportButton = event.target.closest("[data-contact-support]");
  const bonusStep = event.target.closest(".bonus-step, .activity-bonus-step");

  if (goHomeButton) {
    goHome();
    return;
  }

  if (authModeButton) {
    setAuthMode(authModeButton.dataset.authMode);
  }

  if (authEntryButton) {
    setAuthMode(authEntryButton.dataset.authEntry || "login");
  }

  if (authMethodButton) {
    setAuthMethod(authMethodButton.dataset.authMethod);
  }

  if (authPasswordButton && authPassword) {
    const showPassword = authPassword.type === "password";
    authPassword.type = showPassword ? "text" : "password";
    authPasswordButton.classList.toggle("is-visible", showPassword);
    authPasswordButton.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
  }

  if (authProfileButton) {
    openProfilePanel();
    return;
  }

  if (closeProfileButton || event.target === profilePanel) {
    closeProfilePanel();
    return;
  }

  if (notificationsButton) {
    showToast("Notifications", "You have 1 bonus reminder and no urgent wallet alerts.");
    return;
  }

  if (searchButton) {
    showToast("Search", "Search is ready for the next game-provider catalog.");
    return;
  }

  if (menuPreviewButton) {
    goHome();
    showToast("Menu", "Home lobby restored. Full side menu can be added next.");
    return;
  }

  if (casinoPreviewButton) {
    goHome();
    showToast("Casino", "Casino lobby is the next best section to build out.");
    return;
  }

  if (walletHistoryButton) {
    showToast("Wallet history", "Deposit records are syncing through the API for admin review.");
    return;
  }

  if (supportButton) {
    showToast("Support", "Live chat placeholder ready. Add WhatsApp/Telegram link next.");
    return;
  }

  if (bonusStep) {
    selectStep(bonusStep);
    return;
  }

  if (promoDot) {
    const index = promoDots.indexOf(promoDot);
    if (index >= 0) showPromoSlide(index);
  }

  if (activityHeroDot) {
    showActivityHeroSlide(Number(activityHeroDot.dataset.activityHeroDot || 0));
  }

  if (walletButton) {
    if (!isAuthenticated) {
      closeActivity();
      closeActivityDetail();
      openModal("signin");
      return;
    }
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
    if (isAuthenticated && openButton.dataset.openModal === "signin") {
      openActivity();
      showToast("Bonus center", "You are already signed in. Bonus offers are open.");
      return;
    }
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

    window.setTimeout(async () => {
      try {
        const result = await syncDepositSuccessToApi(depositValue);
        const nextBalance = typeof result.balance === "number" ? result.balance : walletBalanceValue + depositValue;
        updateWalletBalance(nextBalance);
        rechargeButton.classList.remove("is-processing");
        rechargeButton.classList.add("is-success");
        rechargeButton.textContent = "Deposit Success";
        rechargeNote.innerHTML = `API synced: <strong>+${formatUsd(depositValue)}</strong> credited. Balance: <strong>${formatUsd(walletBalanceValue)}</strong>`;
        showDepositSuccess(depositValue);

        window.setTimeout(() => {
          rechargeButton.classList.remove("is-success");
          rechargeButton.textContent = "Deposit Now";
          rechargeButton.disabled = false;
        }, 1400);
      } catch (error) {
        rechargeButton.classList.remove("is-processing");
        rechargeButton.textContent = "Retry Deposit";
        rechargeButton.disabled = false;
        rechargeNote.innerHTML = `API sync failed: <strong>${error.message}</strong>. Please try again.`;
      }
    }, 850);
  }
});

authPassword?.addEventListener("input", updatePasswordRules);
authModal?.querySelector(".auth-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuthForm();
});
setAuthMode("login");
setAuthMethod("phone");
updatePasswordRules();
renderAuthState();
syncWalletFromApi();

document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.closest?.("[data-go-home]")) {
    event.preventDefault();
    goHome();
    return;
  }

  if (event.key === "Escape") {
    closeActivityDetail();
    closeDepositSuccess();
    closeProfilePanel();
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

showActivityHeroSlide(0);

attachSwipe(promoCarousel, () => showPromoSlide(activePromo + 1), () => showPromoSlide(activePromo - 1));
attachSwipe(activityHero, () => showActivityHeroSlide(activeActivityHero + 1), () => showActivityHeroSlide(activeActivityHero - 1));

window.setInterval(() => {
  showPromoSlide(activePromo + 1);
}, 2800);
