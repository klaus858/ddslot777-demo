const { addLog, loadState, money, nextOrder, nowIso, resetState, saveState } = require("./state");

const USER_TOKEN = "demo-user-token";
const ADMIN_TOKEN = "demo-admin-token";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
  });
}

function routeParts(req) {
  const url = new URL(req.url, "http://localhost");
  return url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
}

function publicMember(member) {
  return {
    id: member.id,
    username: member.username,
    displayName: member.displayName,
    phone: member.phone,
    balance: money(member.balance),
    status: member.status,
    createdAt: member.createdAt,
    lastLoginAt: member.lastLoginAt,
  };
}

function decorateOrder(state, order) {
  const member = state.members.find((item) => item.id === order.memberId);
  return {
    ...order,
    member: member ? publicMember(member) : null,
  };
}

function requireAdmin(req, res) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token !== ADMIN_TOKEN) {
    sendJson(res, 401, { error: "ADMIN_AUTH_REQUIRED", message: "Admin token required." });
    return false;
  }
  return true;
}

function requireUser(req, res) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token !== USER_TOKEN && token !== ADMIN_TOKEN) {
    sendJson(res, 401, { error: "USER_AUTH_REQUIRED", message: "User token required." });
    return null;
  }

  const state = loadState();
  return state.members.find((member) => member.id === "u-demo") || state.members[0];
}

function bonusForDeposit(amount) {
  if (amount >= 500) return money(amount * 0.3);
  if (amount >= 100) return money(amount * 0.25);
  if (amount >= 50) return money(amount * 0.2);
  return money(amount * 0.1);
}

function overview(state) {
  return {
    memberCount: state.members.length,
    totalBalance: money(state.members.reduce((sum, member) => sum + Number(member.balance || 0), 0)),
    pendingDeposits: state.deposits.filter((order) => order.status === "pending").length,
    pendingWithdrawals: state.withdrawals.filter((order) => order.status === "pending").length,
    confirmedDepositAmount: money(
      state.deposits
        .filter((order) => order.status === "confirmed")
        .reduce((sum, order) => sum + Number(order.amount || 0) + Number(order.bonus || 0), 0),
    ),
  };
}

async function handleApiRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const parts = routeParts(req);
  const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : {};
  const state = loadState();

  try {
    if (req.method === "GET" && parts[0] === "health") {
      sendJson(res, 200, { ok: true, service: "ddslot777-demo-api", time: nowIso() });
      return;
    }

    if (req.method === "POST" && parts.join("/") === "auth/login") {
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const admin = state.admins.find((item) => item.username === username && item.password === password);

      if (admin) {
        addLog(state, admin.username, "auth.admin_login", admin.id, "Admin signed in.");
        saveState(state);
        sendJson(res, 200, {
          token: ADMIN_TOKEN,
          role: "admin",
          admin: { id: admin.id, username: admin.username, displayName: admin.displayName },
        });
        return;
      }

      if (username === "demo" && password === "demo123") {
        sendJson(res, 200, { token: USER_TOKEN, role: "user", member: publicMember(state.members[0]) });
        return;
      }

      sendJson(res, 401, { error: "INVALID_LOGIN", message: "Invalid username or password." });
      return;
    }

    if (req.method === "GET" && parts[0] === "wallet") {
      const member = requireUser(req, res);
      if (!member) return;
      sendJson(res, 200, {
        member: publicMember(member),
        deposits: state.deposits.filter((order) => order.memberId === member.id).map((order) => decorateOrder(state, order)),
        withdrawals: state.withdrawals.filter((order) => order.memberId === member.id).map((order) => decorateOrder(state, order)),
      });
      return;
    }

    if (req.method === "POST" && parts[0] === "deposits") {
      const member = requireUser(req, res);
      if (!member) return;

      const amount = money(body.amount);
      if (amount <= 0) {
        sendJson(res, 400, { error: "INVALID_AMOUNT", message: "Deposit amount must be greater than zero." });
        return;
      }

      const order = {
        order: nextOrder(state, "deposit"),
        memberId: member.id,
        amount,
        bonus: bonusForDeposit(amount),
        method: String(body.method || "Demo Pay"),
        status: "pending",
        createdAt: nowIso(),
        confirmedAt: null,
        reviewedBy: null,
        note: "Created from wallet.",
      };

      state.deposits.unshift(order);
      addLog(state, member.username, "deposit.created", order.order, `Deposit ${amount.toFixed(2)} submitted.`);
      saveState(state);
      sendJson(res, 201, { order: decorateOrder(state, order), member: publicMember(member) });
      return;
    }

    if (req.method === "POST" && parts[0] === "withdrawals") {
      const member = requireUser(req, res);
      if (!member) return;

      const amount = money(body.amount);
      if (amount <= 0) {
        sendJson(res, 400, { error: "INVALID_AMOUNT", message: "Withdrawal amount must be greater than zero." });
        return;
      }
      if (amount > Number(member.balance || 0)) {
        sendJson(res, 400, { error: "INSUFFICIENT_BALANCE", message: "Withdrawal amount exceeds available balance." });
        return;
      }

      const order = {
        order: nextOrder(state, "withdrawal"),
        memberId: member.id,
        amount,
        method: String(body.method || "Bank Transfer"),
        account: String(body.account || "Demo account"),
        status: "pending",
        createdAt: nowIso(),
        reviewedAt: null,
        reviewedBy: null,
        note: "Created from wallet.",
      };

      state.withdrawals.unshift(order);
      addLog(state, member.username, "withdrawal.created", order.order, `Withdrawal ${amount.toFixed(2)} submitted.`);
      saveState(state);
      sendJson(res, 201, { order: decorateOrder(state, order), member: publicMember(member) });
      return;
    }

    if (parts[0] === "admin") {
      if (!requireAdmin(req, res)) return;
      const adminPath = parts.slice(1).join("/");

      if (req.method === "GET" && parts[1] === "overview") {
        sendJson(res, 200, overview(state));
        return;
      }

      if (req.method === "GET" && parts[1] === "members") {
        sendJson(res, 200, { members: state.members.map(publicMember) });
        return;
      }

      if (req.method === "POST" && adminPath === "members/balance") {
        const member = state.members.find((item) => item.id === body.memberId);
        if (!member) {
          sendJson(res, 404, { error: "MEMBER_NOT_FOUND", message: "Member not found." });
          return;
        }

        const amount = money(body.amount);
        if (!Number.isFinite(amount)) {
          sendJson(res, 400, { error: "INVALID_AMOUNT", message: "Amount is invalid." });
          return;
        }

        const before = money(member.balance);
        if (body.mode === "set") {
          member.balance = money(amount);
        } else {
          member.balance = money(before + amount);
        }

        addLog(
          state,
          "admin",
          body.mode === "set" ? "member.balance_set" : "member.balance_adjusted",
          member.id,
          `Balance ${before.toFixed(2)} -> ${money(member.balance).toFixed(2)}. ${String(body.note || "").trim()}`,
        );
        saveState(state);
        sendJson(res, 200, { member: publicMember(member) });
        return;
      }

      if (req.method === "GET" && parts[1] === "deposits") {
        sendJson(res, 200, { deposits: state.deposits.map((order) => decorateOrder(state, order)) });
        return;
      }

      if (req.method === "POST" && adminPath === "deposits/confirm") {
        const order = state.deposits.find((item) => item.order === body.order);
        if (!order) {
          sendJson(res, 404, { error: "ORDER_NOT_FOUND", message: "Deposit order not found." });
          return;
        }
        if (order.status !== "pending") {
          sendJson(res, 409, { error: "ORDER_NOT_PENDING", message: "Deposit order already reviewed." });
          return;
        }

        const member = state.members.find((item) => item.id === order.memberId);
        order.status = "confirmed";
        order.confirmedAt = nowIso();
        order.reviewedBy = "admin";
        order.note = String(body.note || order.note || "");
        member.balance = money(Number(member.balance || 0) + Number(order.amount || 0) + Number(order.bonus || 0));
        addLog(state, "admin", "deposit.confirmed", order.order, `Credited ${money(order.amount + order.bonus).toFixed(2)} to ${member.username}.`);
        saveState(state);
        sendJson(res, 200, { order: decorateOrder(state, order), member: publicMember(member) });
        return;
      }

      if (req.method === "POST" && adminPath === "deposits/reject") {
        const order = state.deposits.find((item) => item.order === body.order);
        if (!order) {
          sendJson(res, 404, { error: "ORDER_NOT_FOUND", message: "Deposit order not found." });
          return;
        }
        if (order.status !== "pending") {
          sendJson(res, 409, { error: "ORDER_NOT_PENDING", message: "Deposit order already reviewed." });
          return;
        }

        order.status = "rejected";
        order.confirmedAt = nowIso();
        order.reviewedBy = "admin";
        order.note = String(body.note || "Rejected by admin.");
        addLog(state, "admin", "deposit.rejected", order.order, order.note);
        saveState(state);
        sendJson(res, 200, { order: decorateOrder(state, order) });
        return;
      }

      if (req.method === "GET" && parts[1] === "withdrawals") {
        sendJson(res, 200, { withdrawals: state.withdrawals.map((order) => decorateOrder(state, order)) });
        return;
      }

      if (req.method === "POST" && adminPath === "withdrawals/review") {
        const order = state.withdrawals.find((item) => item.order === body.order);
        if (!order) {
          sendJson(res, 404, { error: "ORDER_NOT_FOUND", message: "Withdrawal order not found." });
          return;
        }
        if (order.status !== "pending") {
          sendJson(res, 409, { error: "ORDER_NOT_PENDING", message: "Withdrawal order already reviewed." });
          return;
        }

        const action = body.action === "approve" ? "approved" : "rejected";
        const member = state.members.find((item) => item.id === order.memberId);
        if (action === "approved") {
          if (Number(member.balance || 0) < Number(order.amount || 0)) {
            sendJson(res, 409, { error: "INSUFFICIENT_BALANCE", message: "Member balance is not enough to approve." });
            return;
          }
          member.balance = money(Number(member.balance || 0) - Number(order.amount || 0));
        }

        order.status = action;
        order.reviewedAt = nowIso();
        order.reviewedBy = "admin";
        order.note = String(body.note || "");
        addLog(state, "admin", `withdrawal.${action}`, order.order, `${action} ${order.amount.toFixed(2)} for ${member.username}.`);
        saveState(state);
        sendJson(res, 200, { order: decorateOrder(state, order), member: publicMember(member) });
        return;
      }

      if (req.method === "GET" && parts[1] === "logs") {
        sendJson(res, 200, { logs: state.logs });
        return;
      }

      if (req.method === "POST" && parts[1] === "reset") {
        const nextState = resetState();
        sendJson(res, 200, { ok: true, overview: overview(nextState) });
        return;
      }
    }

    sendJson(res, 404, { error: "NOT_FOUND", message: "API route not found." });
  } catch (error) {
    sendJson(res, 500, { error: "SERVER_ERROR", message: error.message || "Unexpected server error." });
  }
}

module.exports = {
  ADMIN_TOKEN,
  USER_TOKEN,
  handleApiRequest,
};
