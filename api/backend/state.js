const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "ddslot777") : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "demo-backend.json");

const seedState = {
  version: 1,
  counters: {
    deposit: 3,
    withdrawal: 2,
    log: 5,
  },
  admins: [
    {
      id: "admin-1",
      username: "admin",
      password: "admin123",
      displayName: "Demo Admin",
    },
  ],
  members: [
    {
      id: "u-demo",
      username: "demo",
      displayName: "Demo Player",
      phone: "+66 900 000 001",
      balance: 0.5,
      status: "active",
      createdAt: "2026-05-18T10:00:00.000Z",
      lastLoginAt: "2026-05-20T00:00:00.000Z",
    },
    {
      id: "u-1002",
      username: "lucky777",
      displayName: "Lucky 777",
      phone: "+66 900 000 777",
      balance: 88,
      status: "active",
      createdAt: "2026-05-18T11:15:00.000Z",
      lastLoginAt: "2026-05-19T22:20:00.000Z",
    },
    {
      id: "u-1003",
      username: "slotking",
      displayName: "Slot King",
      phone: "+66 900 000 888",
      balance: 120.25,
      status: "active",
      createdAt: "2026-05-19T08:30:00.000Z",
      lastLoginAt: "2026-05-19T23:10:00.000Z",
    },
  ],
  deposits: [
    {
      order: "D20260520001",
      memberId: "u-demo",
      amount: 20,
      bonus: 2,
      method: "Demo Pay",
      status: "pending",
      createdAt: "2026-05-20T00:20:00.000Z",
      confirmedAt: null,
      reviewedBy: null,
      note: "Seed pending deposit",
    },
    {
      order: "D20260519002",
      memberId: "u-1002",
      amount: 50,
      bonus: 10,
      method: "Demo Pay",
      status: "confirmed",
      createdAt: "2026-05-19T21:40:00.000Z",
      confirmedAt: "2026-05-19T21:43:00.000Z",
      reviewedBy: "admin",
      note: "Demo confirmed deposit",
    },
  ],
  withdrawals: [
    {
      order: "W20260520001",
      memberId: "u-1003",
      amount: 30,
      method: "Bank Transfer",
      account: "Bangkok Bank **** 0888",
      status: "pending",
      createdAt: "2026-05-20T00:24:00.000Z",
      reviewedAt: null,
      reviewedBy: null,
      note: "Seed pending withdrawal",
    },
  ],
  logs: [
    {
      id: "L20260520001",
      at: "2026-05-20T00:20:00.000Z",
      actor: "system",
      action: "deposit.created",
      target: "D20260520001",
      detail: "Seed deposit order created.",
    },
    {
      id: "L20260519002",
      at: "2026-05-19T21:43:00.000Z",
      actor: "admin",
      action: "deposit.confirmed",
      target: "D20260519002",
      detail: "Confirmed 50.00 deposit with 10.00 bonus.",
    },
  ],
};

let memoryState = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureStorageDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    return false;
  }
  return true;
}

function loadState() {
  if (memoryState) return memoryState;

  try {
    if (fs.existsSync(DATA_FILE)) {
      memoryState = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      return memoryState;
    }
  } catch (error) {
    memoryState = clone(seedState);
    return memoryState;
  }

  memoryState = clone(seedState);
  saveState(memoryState);
  return memoryState;
}

function saveState(state) {
  memoryState = state;

  if (!ensureStorageDir()) return;

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    // Vercel demo storage can be temporary/read-only. Memory still keeps warm-instance state.
  }
}

function resetState() {
  memoryState = clone(seedState);
  saveState(memoryState);
  return memoryState;
}

function nowIso() {
  return new Date().toISOString();
}

function money(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100) / 100;
}

function nextOrder(state, kind) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  state.counters[kind] = (state.counters[kind] || 0) + 1;
  const prefix = kind === "withdrawal" ? "W" : "D";
  return `${prefix}${date}${String(state.counters[kind]).padStart(3, "0")}`;
}

function addLog(state, actor, action, target, detail) {
  state.counters.log = (state.counters.log || 0) + 1;
  const id = `L${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(state.counters.log).padStart(3, "0")}`;
  const entry = {
    id,
    at: nowIso(),
    actor,
    action,
    target,
    detail,
  };
  state.logs.unshift(entry);
  state.logs = state.logs.slice(0, 200);
  return entry;
}

module.exports = {
  addLog,
  loadState,
  money,
  nextOrder,
  nowIso,
  resetState,
  saveState,
};
