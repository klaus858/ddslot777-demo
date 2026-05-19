const tokenKey = "ddslot777_admin_token";
const apiBase = "/api";

const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginError = document.querySelector("[data-login-error]");
const sessionLabel = document.querySelector("[data-session-label]");
const pageTitle = document.querySelector("[data-page-title]");
const toast = document.querySelector("[data-toast]");
const sectionButtons = Array.from(document.querySelectorAll("[data-section]"));
const panels = Array.from(document.querySelectorAll("[data-section-panel]"));

let activeSection = "overview";
let toastTimer = 0;

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusPill(status) {
  return `<span class="status ${status}">${status}</span>`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Request failed");
  }
  return payload;
}

function setLoggedIn(loggedIn) {
  loginPanel.hidden = loggedIn;
  dashboard.hidden = !loggedIn;
  sessionLabel.textContent = loggedIn ? "admin 已登录" : "未登录";
}

async function loadOverview() {
  const data = await api("/admin/overview");
  Object.entries(data).forEach(([key, value]) => {
    const target = document.querySelector(`[data-stat="${key}"]`);
    if (!target) return;
    target.textContent = key.toLowerCase().includes("balance") || key.toLowerCase().includes("amount") ? money(value) : value;
  });
}

async function loadMembers() {
  const data = await api("/admin/members");
  const tbody = document.querySelector("[data-members-table]");
  tbody.innerHTML = data.members
    .map(
      (member) => `
        <tr>
          <td>
            <strong>${member.displayName}</strong>
            <small>${member.username} / ${member.id}</small>
          </td>
          <td>${member.phone}</td>
          <td>${money(member.balance)}</td>
          <td>${statusPill(member.status)}</td>
          <td>
            <form class="balance-form" data-balance-form data-member-id="${member.id}">
              <input name="amount" inputmode="decimal" placeholder="+10 or -5">
              <button name="mode" value="adjust" type="submit">调整</button>
              <button name="mode" value="set" type="submit">设定</button>
            </form>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function loadDeposits() {
  const data = await api("/admin/deposits");
  const tbody = document.querySelector("[data-deposits-table]");
  tbody.innerHTML = data.deposits
    .map(
      (order) => `
        <tr>
          <td>
            <strong>${order.order}</strong>
            <small>${new Date(order.createdAt).toLocaleString()}</small>
          </td>
          <td>
            ${order.member?.displayName || "-"}
            <small>${order.member?.username || ""}</small>
          </td>
          <td>${money(order.amount)}</td>
          <td>${money(order.bonus)}</td>
          <td>${statusPill(order.status)}</td>
          <td>
            <div class="row-actions">
              <button type="button" data-confirm-deposit="${order.order}" ${order.status !== "pending" ? "disabled" : ""}>确认</button>
              <button class="danger" type="button" data-reject-deposit="${order.order}" ${order.status !== "pending" ? "disabled" : ""}>拒绝</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function loadWithdrawals() {
  const data = await api("/admin/withdrawals");
  const tbody = document.querySelector("[data-withdrawals-table]");
  tbody.innerHTML = data.withdrawals
    .map(
      (order) => `
        <tr>
          <td>
            <strong>${order.order}</strong>
            <small>${new Date(order.createdAt).toLocaleString()}</small>
          </td>
          <td>
            ${order.member?.displayName || "-"}
            <small>${order.member?.username || ""}</small>
          </td>
          <td>${money(order.amount)}</td>
          <td>${order.method}<small>${order.account}</small></td>
          <td>${statusPill(order.status)}</td>
          <td>
            <div class="row-actions">
              <button type="button" data-review-withdrawal="${order.order}" data-action="approve" ${order.status !== "pending" ? "disabled" : ""}>通过</button>
              <button class="danger" type="button" data-review-withdrawal="${order.order}" data-action="reject" ${order.status !== "pending" ? "disabled" : ""}>拒绝</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function loadLogs() {
  const data = await api("/admin/logs");
  const tbody = document.querySelector("[data-logs-table]");
  tbody.innerHTML = data.logs
    .map(
      (log) => `
        <tr>
          <td>${new Date(log.at).toLocaleString()}</td>
          <td>${log.actor}</td>
          <td>${log.action}</td>
          <td>${log.target}</td>
          <td>${log.detail}</td>
        </tr>
      `,
    )
    .join("");
}

async function refresh() {
  await loadOverview();
  if (activeSection === "members") await loadMembers();
  if (activeSection === "deposits") await loadDeposits();
  if (activeSection === "withdrawals") await loadWithdrawals();
  if (activeSection === "logs") await loadLogs();
}

async function showSection(section) {
  activeSection = section;
  sectionButtons.forEach((button) => button.classList.toggle("active", button.dataset.section === section));
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.sectionPanel !== section;
  });
  pageTitle.textContent = sectionButtons.find((button) => button.dataset.section === section)?.textContent || "总览";
  await refresh();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const formData = new FormData(loginForm);

  try {
    const data = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "登录失败");
      return payload;
    });

    localStorage.setItem(tokenKey, data.token);
    setLoggedIn(true);
    await showSection("overview");
    showToast("登录成功");
  } catch (error) {
    loginError.textContent = error.message;
  }
});

document.addEventListener("click", async (event) => {
  const sectionButton = event.target.closest("[data-section]");
  const refreshButton = event.target.closest("[data-refresh]");
  const logoutButton = event.target.closest("[data-logout]");
  const confirmDeposit = event.target.closest("[data-confirm-deposit]");
  const rejectDeposit = event.target.closest("[data-reject-deposit]");
  const reviewWithdrawal = event.target.closest("[data-review-withdrawal]");

  try {
    if (sectionButton) {
      await showSection(sectionButton.dataset.section);
    }

    if (refreshButton) {
      await refresh();
      showToast("已刷新");
    }

    if (logoutButton) {
      localStorage.removeItem(tokenKey);
      setLoggedIn(false);
    }

    if (confirmDeposit) {
      await api("/admin/deposits/confirm", {
        method: "POST",
        body: JSON.stringify({ order: confirmDeposit.dataset.confirmDeposit }),
      });
      await refresh();
      showToast("充值已确认，余额已增加");
    }

    if (rejectDeposit) {
      await api("/admin/deposits/reject", {
        method: "POST",
        body: JSON.stringify({ order: rejectDeposit.dataset.rejectDeposit, note: "Rejected from admin panel." }),
      });
      await refresh();
      showToast("充值已拒绝");
    }

    if (reviewWithdrawal) {
      await api("/admin/withdrawals/review", {
        method: "POST",
        body: JSON.stringify({ order: reviewWithdrawal.dataset.reviewWithdrawal, action: reviewWithdrawal.dataset.action }),
      });
      await refresh();
      showToast(reviewWithdrawal.dataset.action === "approve" ? "提现已通过，余额已扣除" : "提现已拒绝");
    }
  } catch (error) {
    showToast(error.message);
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-balance-form]");
  if (!form) return;

  event.preventDefault();
  const submitter = event.submitter;
  const amount = Number(form.elements.amount.value);
  if (!Number.isFinite(amount)) {
    showToast("请输入有效金额");
    return;
  }

  try {
    await api("/admin/members/balance", {
      method: "POST",
      body: JSON.stringify({
        memberId: form.dataset.memberId,
        amount,
        mode: submitter?.value || "adjust",
        note: "Changed from admin panel.",
      }),
    });
    form.reset();
    await refresh();
    showToast("余额已更新");
  } catch (error) {
    showToast(error.message);
  }
});

if (localStorage.getItem(tokenKey)) {
  setLoggedIn(true);
  showSection("overview").catch((error) => {
    localStorage.removeItem(tokenKey);
    setLoggedIn(false);
    showToast(error.message);
  });
} else {
  setLoggedIn(false);
}
