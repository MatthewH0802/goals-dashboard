// M&M Goals Dashboard - Firebase-synced app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc, writeBatch,
  addDoc, collection, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAd2NcNqkltXHumBBXOGRXzSfF6cfKsUuM",
  authDomain: "goals-dashboard-ee34e.firebaseapp.com",
  projectId: "goals-dashboard-ee34e",
  storageBucket: "goals-dashboard-ee34e.firebasestorage.app",
  messagingSenderId: "538945369053",
  appId: "1:538945369053:web:70bdd45a9b3e34935e7c34"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);
const storage = getStorage(fbApp);
const DOC_REF = doc(db, "dashboard", "main");

// ---- Built-in defaults (used to seed config/* on first run) -------------
const DEFAULT_START_DATE = "2026-05-18";

const DEFAULT_PROFILES = {
  matthew: { displayName: "Matthew", color: "#000000" },
  marie:   { displayName: "Marie",   color: "#000000" }
};

const DEFAULT_VISITS = {
  items: [
    { id: "v-may2026", name: "Marie visit", start: "2026-05-25", end: "2026-05-29" }
  ]
};

const DEFAULT_OUTCOMES = {
  matthew: [
    { id: "mw-gm", cat: "career", name: "Hire Zecto GM", target: "Jun 1, 2026", focus: true },
    { id: "mw-realestate", cat: "career", name: "Real estate license", target: "Sept 1, 2026", focus: false },
    { id: "mw-zecto", cat: "career", name: "Zecto sales +10%", target: "Aug 18 (90 days)", focus: false },
    { id: "mw-mba", cat: "career", name: "MBA application", target: "Next round", focus: false },
    { id: "mw-openquad", cat: "career", name: "OpenQuad CSUF launch", target: "Sep 30", focus: false },
    { id: "mw-linkedin", cat: "career", name: "Update LinkedIn", target: "Jun 18", focus: false },
    { id: "mw-weight", cat: "health", name: "160lb lean", target: "Dec 31", focus: false },
    { id: "mw-wake", cat: "personal", name: "Wake 6am consistently", target: "Aug 18", focus: true },
    { id: "mw-relationship", cat: "relationship", name: "Relationship satisfaction", target: "Ongoing", focus: true }
  ],
  marie: [
    { id: "mr-grades", cat: "career", name: "No Cs in dental school", target: "End of semester", focus: false },
    { id: "mr-studentgov", cat: "career", name: "Student gov position", target: "When elections open", focus: false },
    { id: "mr-linkedin", cat: "career", name: "Update LinkedIn", target: "Jun 18", focus: false },
    { id: "mr-influence", cat: "career", name: "Launch influencing", target: "Aug 18", focus: false },
    { id: "mr-weight", cat: "health", name: "115lb toned", target: "Dec 31", focus: false },
    { id: "mr-health", cat: "health", name: "Health consistency", target: "Ongoing", focus: true },
    { id: "mr-relationship", cat: "relationship", name: "Relationship satisfaction", target: "Ongoing", focus: true }
  ],
  shared: [
    { id: "sh-pascha", cat: "spiritual", name: "Finish Contemplations book", target: "10pp/day", focus: false }
  ]
};

const DEFAULT_HABITS = {
  matthew: [
    { id: "mw-gym", name: "Gym", emoji: "🏋️", target: "4-7x/week" },
    { id: "mw-run", name: "Run", emoji: "🏃", target: "1x/week" },
    { id: "mw-vitamins", name: "Vitamins", emoji: "💊", target: "Daily" },
    { id: "mw-water", name: "Water", emoji: "💧", target: "¾ gallon" },
    { id: "mw-bedtime", name: "Bed 10:30", emoji: "🌙", target: "Daily" },
    { id: "mw-wake6", name: "Up 6am", emoji: "☀️", target: "Daily" },
    { id: "mw-screen", name: "Screen <5h", emoji: "📵", target: "Daily" },
    { id: "mw-chess", name: "Chess", emoji: "♟️", target: "Daily" },
    { id: "mw-agpeya", name: "Agpeya 1h", emoji: "🙏", target: "Daily" }
  ],
  marie: [
    { id: "mr-gym", name: "Gym", emoji: "🏋️", target: "4x/week" },
    { id: "mr-wake", name: "Up 6:30am", emoji: "☀️", target: "Daily" },
    { id: "mr-vitamins", name: "Vitamins", emoji: "💊", target: "Daily" },
    { id: "mr-water", name: "Water 80oz", emoji: "💧", target: "Daily" },
    { id: "mr-sweets", name: "≤1 sweet", emoji: "🍬", target: "Daily" },
    { id: "mr-screen", name: "Screen <5h", emoji: "📵", target: "Daily" },
    { id: "mr-ig-inf", name: "IG influence", emoji: "📸", target: "Daily" },
    { id: "mr-agpeya", name: "Agpeya 1h", emoji: "🙏", target: "Daily" }
  ],
  shared: [
    { id: "sh-prayer", name: "Pray together", emoji: "🕊️", target: "Sat night" },
    { id: "sh-reading", name: "Read 10pg", emoji: "📖", target: "Daily" },
    { id: "sh-checkin", name: "Check-in", emoji: "💬", target: "Sundays" },
    { id: "sh-datenight", name: "Date night", emoji: "💖", target: "2x/month" },
    { id: "sh-watch", name: "Teleparty", emoji: "🎬", target: "Nightly" },
    { id: "sh-communion", name: "Communion", emoji: "✝️", target: "4x/month" },
    { id: "sh-confession", name: "Confession", emoji: "🙏", target: "Monthly" }
  ]
};

const DEFAULT_HABIT_SECTIONS = {
  body: { title: "Body", ids: ["mw-gym","mw-run","mw-vitamins","mw-water","mw-bedtime","mw-wake6","mw-screen","mr-gym","mr-wake","mr-vitamins","mr-water","mr-sweets","mr-screen"] },
  mind: { title: "Mind & Spirit", ids: ["mw-chess","mw-agpeya","mr-agpeya","mr-ig-inf","sh-reading","sh-communion","sh-confession"] },
  together: { title: "Together", ids: ["sh-prayer","sh-checkin","sh-datenight","sh-watch"] }
};

const DEFAULT_STANDARDS = {
  marie: [
    { id: "s-mr-tone", name: "Mindful of tone & delivery", ctx: "How she says things" },
    { id: "s-mr-direct", name: "Lovingly direct", ctx: "Straightforward, not hinting" },
    { id: "s-mr-absolutes", name: "No absolutes", ctx: "No 'never' or 'always'" },
    { id: "s-mr-actions", name: "Love through actions", ctx: "Not only words" },
    { id: "s-mr-collab", name: "Collaborates on solutions", ctx: "Us vs the problem" },
    { id: "s-mr-team", name: "Team mindset", ctx: "We're a team" }
  ],
  matthew: [
    { id: "s-mw-concerns", name: "Takes concerns seriously", ctx: "Doesn't dismiss" },
    { id: "s-mw-voice", name: "Calm voice", ctx: "Especially during tension" },
    { id: "s-mw-curious", name: "Asks her questions", ctx: "Learning about her" },
    { id: "s-mw-detail", name: "Goes into detail", ctx: "On things she wants to know" },
    { id: "s-mw-team", name: "Team mindset", ctx: "Us vs the problem" }
  ]
};

const DEFAULT_QUESTIONS = {
  items: [
    "What's one thing I did this week that made you feel loved?",
    "Anything you've been holding back?",
    "Highlight of your week?",
    "Something I could do more of?",
    "Something I could do less of?",
    "How are you feeling about us, 1-10?",
    "A worry I don't know about?",
    "When did you feel closest to me this week?",
    "When did you feel distant this week?",
    "What's one commitment I made that I haven't followed through on?",
    "What should we keep doing because it works?",
    "What's something you appreciated about how I handled something?",
    "What's something hard you'd want my support with?"
  ]
};

// ---- Runtime config (mirrors Firestore /config/*) ------------------------
let config = {
  app:            { startDate: DEFAULT_START_DATE, schemaVersion: 0 },
  profiles:       JSON.parse(JSON.stringify(DEFAULT_PROFILES)),
  habits:         JSON.parse(JSON.stringify(DEFAULT_HABITS)),
  habit_sections: JSON.parse(JSON.stringify(DEFAULT_HABIT_SECTIONS)),
  outcomes:       JSON.parse(JSON.stringify(DEFAULT_OUTCOMES)),
  standards:      JSON.parse(JSON.stringify(DEFAULT_STANDARDS)),
  questions:      JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
  visits:         JSON.parse(JSON.stringify(DEFAULT_VISITS))
};

let state = {
  outcomeProgress: {},
  habitLog: {},
  standardsLog: {},
  currentCheckin: { gratitude: "", issues: "", goals: "", ahead: "" },
  checkinArchive: [],
  qIndex: 0
};

// Always require an explicit pick on every app open (no auto-login).
let currentUser = null;
let currentUid = null;
let currentOutcomeView = "matthew";
let currentHabitView = "matthew";
let writeTimer = null;

// Settings UI state
let settingsState = {
  open: { profiles: false, visits: false, habits: false, goals: false, standards: false, questions: false, app: false, danger: false },
  habitsTab: "matthew",
  goalsTab: "matthew",
  standardsTab: "marie"
};

// Photos state
let photos = []; // [{ id, url, caption, takenAt (YYYY-MM-DD), uploadedAt, uploader }]
let photosUnsub = null;
let pendingPhotoFile = null;
let pendingPhotoDataUrl = null;
let viewerIndex = 0;

// Config subscription handles
let configUnsubs = [];

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

function pad2(n){return String(n).padStart(2,"0");}
function todayISO() { const d=new Date(); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
function isoDate(d) { return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
function daysBetween(a, b) {
  return Math.floor((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}
function startDate() { return (config.app && config.app.startDate) || DEFAULT_START_DATE; }
function profileName(role) {
  if (!role) return "";
  const p = (config.profiles && config.profiles[role]) || {};
  return p.displayName || (role.charAt(0).toUpperCase() + role.slice(1));
}
function getCurrentWeek() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
function getStreak(habitId) {
  let streak = 0;
  const today = new Date();
  const sd = startDate();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = isoDate(d);
    if (dStr < sd) break;
    const k = dStr + "_" + habitId;
    if (state.habitLog[k] === "done") streak++;
    else if (i === 0 && state.habitLog[k] !== "miss") continue;
    else break;
  }
  return streak;
}

function setSyncStatus(status) {
  const el = document.getElementById("sync-indicator");
  if (!el) return;
  el.textContent = status;
  el.classList.toggle("syncing", status === "syncing");
}

function showToast(msg, kind) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  el.classList.toggle("error", kind === "error");
  // Force reflow then fade in
  void el.offsetWidth;
  el.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.classList.remove("visible");
    setTimeout(() => el.classList.add("hidden"), 250);
  }, 2400);
}

function pushToFirebase() {
  setSyncStatus("syncing");
  clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    try {
      await setDoc(DOC_REF, state);
      setSyncStatus("synced");
    } catch (e) {
      setSyncStatus("offline");
      console.error("Save failed:", e);
    }
  }, 400);
}

function subscribeToData() {
  onSnapshot(DOC_REF, (snap) => {
    if (snap.exists()) {
      state = Object.assign(state, snap.data());
      if (currentUser) renderAll();
      setSyncStatus("synced");
    }
  }, (err) => {
    console.error("Sync error:", err);
    setSyncStatus("offline");
  });
}

// ---- Config: seed + subscribe -------------------------------------------

async function seedConfigIfMissing() {
  try {
    const appRef = doc(db, "config", "app");
    const snap = await getDoc(appRef);
    if (snap.exists()) return false;
    const batch = writeBatch(db);
    batch.set(doc(db, "config", "app"),            { startDate: DEFAULT_START_DATE, schemaVersion: 1 });
    batch.set(doc(db, "config", "profiles"),       DEFAULT_PROFILES);
    batch.set(doc(db, "config", "habits"),         DEFAULT_HABITS);
    batch.set(doc(db, "config", "habit_sections"), DEFAULT_HABIT_SECTIONS);
    batch.set(doc(db, "config", "outcomes"),       DEFAULT_OUTCOMES);
    batch.set(doc(db, "config", "standards"),      DEFAULT_STANDARDS);
    batch.set(doc(db, "config", "questions"),      DEFAULT_QUESTIONS);
    batch.set(doc(db, "config", "visits"),         DEFAULT_VISITS);
    await batch.commit();
    console.log("Config seeded.");
    return true;
  } catch (e) {
    console.error("Config seed failed:", e);
    return false;
  }
}

const CONFIG_DOCS = ["app","profiles","habits","habit_sections","outcomes","standards","questions","visits"];

function subscribeConfig() {
  // Tear down any prior subscriptions (defensive)
  configUnsubs.forEach(u => { try { u(); } catch(e){} });
  configUnsubs = [];
  CONFIG_DOCS.forEach(name => {
    const ref = doc(db, "config", name);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      config[name] = snap.data();
      // Rerender if app is up
      if (currentUser) renderAll();
      const overlay = document.getElementById("settings-overlay");
      if (overlay && !overlay.classList.contains("hidden")) renderSettings();
      // Refresh login name labels regardless (visible before pick)
      applyNameLabels();
    }, (err) => {
      console.error("Config sync error (" + name + "):", err);
    });
    configUnsubs.push(unsub);
  });
}

async function saveConfigDoc(name, data) {
  try {
    setSyncStatus("syncing");
    await setDoc(doc(db, "config", name), data, { merge: false });
    setSyncStatus("synced");
    return true;
  } catch (e) {
    console.error("Config save failed (" + name + "):", e);
    setSyncStatus("offline");
    showToast("Couldn't save changes. Try again.", "error");
    return false;
  }
}

async function patchConfigDoc(name, patch) {
  try {
    setSyncStatus("syncing");
    await setDoc(doc(db, "config", name), patch, { merge: true });
    setSyncStatus("synced");
    return true;
  } catch (e) {
    console.error("Config patch failed (" + name + "):", e);
    setSyncStatus("offline");
    showToast("Couldn't save changes. Try again.", "error");
    return false;
  }
}

function showLogin() {
  document.getElementById("login-screen").classList.add("active");
  document.getElementById("app-screen").classList.remove("active");
  const denied = document.getElementById("denied-screen");
  if (denied) denied.classList.remove("active");
}

function showAccessDenied() {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app-screen").classList.remove("active");
  const denied = document.getElementById("denied-screen");
  if (denied) denied.classList.add("active");
}

// Set true the first time a successful claim resolves and we kick off
// Firestore subscriptions. Subsequent calls to showApp() must NOT re-subscribe.
let _dataBootstrapped = false;

async function showApp() {
  document.getElementById("login-screen").classList.remove("active");
  const denied = document.getElementById("denied-screen");
  if (denied) denied.classList.remove("active");
  document.getElementById("app-screen").classList.add("active");
  document.getElementById("current-user").textContent = profileName(currentUser);
  currentOutcomeView = currentUser;
  currentHabitView = currentUser;

  // First time only: seed config (if missing) and start Firestore subscriptions.
  // These were previously kicked off in the auth bootstrap, but security rules
  // now require an allowlisted UID for /config/* and /dashboard/main reads —
  // so subscribing before ensureRoleClaim() would spam permission-denied
  // errors. We defer until the claim has succeeded.
  if (!_dataBootstrapped) {
    _dataBootstrapped = true;
    try { await seedConfigIfMissing(); } catch (e) { console.error("Seed err:", e); }
    subscribeConfig();
    subscribeToData();
  }

  renderAll();
  startPresence();
  ensureAuthAndPhotos();
}

// ---- Role claim (UID allowlist) -----------------------------------------
//
// /config/allowlist holds { matthew: <uid|null>, marie: <uid|null>, updatedAt }.
// The doc is the single source of truth for which two Firebase Auth UIDs are
// allowed to read/write everything else. On first claim per role, the slot is
// written under the allowlist's permissive write rule (any authed user). After
// both slots are filled, anyone else tapping "I'm Matthew/Marie" lands on the
// denied screen and no other subscriptions are started.
async function ensureRoleClaim() {
  if (!currentUser || !currentUid) return false;
  const ref = doc(db, "config", "allowlist");
  try {
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    const claimedUid = data[currentUser];

    if (!claimedUid) {
      // Slot is empty — claim it for this device.
      await setDoc(ref, {
        [currentUser]: currentUid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    }
    if (claimedUid === currentUid) {
      return true; // Already ours, fine.
    }
    // Someone else already claimed this role.
    return false;
  } catch (e) {
    console.error("Role claim check failed:", e);
    return false;
  }
}

async function resetRoleClaim(role) {
  if (role !== "matthew" && role !== "marie") return false;
  const ref = doc(db, "config", "allowlist");
  try {
    await updateDoc(ref, {
      [role]: null,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (e) {
    console.error("Reset role claim failed (" + role + "):", e);
    return false;
  }
}

// ---- Firebase Auth (Anonymous) -------------------------------------------

async function ensureAuthAndPhotos() {
  if (!currentUser) return;
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      // currentUid is set by onAuthStateChanged listener
    } else {
      currentUid = auth.currentUser.uid;
    }
    await bindRoleToUid();
    subscribeToPhotos();
  } catch (e) {
    console.error("Auth error:", e);
  }
}

async function bindRoleToUid() {
  if (!currentUid || !currentUser) return;
  try {
    await setDoc(
      doc(db, "users", currentUid),
      { role: currentUser, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("Failed to bind role to uid:", e);
  }
}

let _presenceHeartbeat = null;
let _presenceUnsub = null;
function startPresence() {
  if (!currentUser) return;
  // Clean up any prior listener (e.g. on user switch)
  if (_presenceHeartbeat) clearInterval(_presenceHeartbeat);
  if (typeof _presenceUnsub === "function") { try { _presenceUnsub(); } catch(e){} }

  const presenceRef = doc(db, "presence", currentUser);
  const ping = () => setDoc(presenceRef, { lastActive: Date.now(), user: currentUser }, { merge: true });
  ping();
  _presenceHeartbeat = setInterval(ping, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) ping(); });
  window.addEventListener("beforeunload", () => {
    try { setDoc(presenceRef, { lastActive: 0 }, { merge: true }); } catch(e) {}
  });

  const partner = currentUser === "matthew" ? "marie" : "matthew";
  const partnerRef = doc(db, "presence", partner);
  _presenceUnsub = onSnapshot(partnerRef, (snap) => {
    const data = snap.data();
    const online = data && data.lastActive && (Date.now() - data.lastActive < 60000);
    const el = document.getElementById("partner-presence");
    if (!el) return;
    el.classList.toggle("hidden", !online);
    el.textContent = profileName(partner);
  });
}

// Wherever we render the literal "Matthew"/"Marie" text from data attributes,
// keep it in sync with config.profiles.
function applyNameLabels() {
  document.querySelectorAll("[data-name]").forEach(el => {
    const role = el.dataset.name;
    if (role === "matthew" || role === "marie") {
      el.textContent = profileName(role);
    }
  });
}

function renderAll() {
  applyNameLabels();
  renderHeader();
  renderToday();
  renderHabitsWeek();
  renderOutcomes();
  renderStandards();
  renderCheckin();
  renderUs();
}

function formatVisitRange(v) {
  if (!v || !v.start) return "";
  const [ys, ms, ds] = v.start.split("-").map(Number);
  const [ye, me, de] = (v.end || v.start).split("-").map(Number);
  const sd = new Date(ys, (ms || 1) - 1, ds || 1);
  const ed = new Date(ye, (me || 1) - 1, de || 1);
  const sStr = sd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const eStr = ed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (v.start === v.end) return sStr;
  return sStr + " – " + eStr;
}

function pickActiveVisit(today) {
  const items = (config.visits && Array.isArray(config.visits.items)) ? config.visits.items.slice() : [];
  // Soonest upcoming or currently active (today <= end). Sort by start ascending.
  const upcoming = items
    .filter(v => v && v.end && today <= v.end)
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  return upcoming[0] || null;
}

function renderHeader() {
  const today = todayISO();
  const dayEl = document.getElementById("day-counter");
  const sd = startDate();
  if (today < sd) {
    const [y, m, d] = sd.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dayEl.textContent = "starts " + dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {
    dayEl.textContent = "Day " + (daysBetween(sd, today) + 1);
  }

  const banner = document.getElementById("visit-banner");
  const v = pickActiveVisit(today);
  if (!v) {
    banner.classList.add("hidden");
    banner.innerHTML = "";
    return;
  }
  const range = formatVisitRange(v);
  const name = v.name || "Visit";
  const partnerName = currentUser
    ? profileName(currentUser === "matthew" ? "marie" : "matthew")
    : name;
  if (today >= v.start && today <= v.end) {
    banner.classList.remove("hidden");
    banner.innerHTML = `<span class="visit-heart">❤</span>
      <span class="visit-headline">${escapeHtml(partnerName)} is here</span>
      <span class="visit-label">Book the next trip before she leaves</span>
      <span class="visit-dates">${escapeHtml(range)}</span>`;
  } else if (today < v.start) {
    const d = daysBetween(today, v.start);
    banner.classList.remove("hidden");
    banner.innerHTML = `<span class="visit-heart">❤</span>
      <span class="visit-count">${d}</span>
      <span class="visit-label">${d === 1 ? "day" : "days"} until ${escapeHtml(name)}</span>
      <span class="visit-dates">${escapeHtml(range)}</span>`;
  } else {
    banner.classList.add("hidden");
    banner.innerHTML = "";
  }
}

function sectionFor(id) {
  const s = config.habit_sections || {};
  if (s.body && Array.isArray(s.body.ids) && s.body.ids.includes(id)) return "body";
  if (s.mind && Array.isArray(s.mind.ids) && s.mind.ids.includes(id)) return "mind";
  if (s.together && Array.isArray(s.together.ids) && s.together.ids.includes(id)) return "together";
  return "body";
}

function habitCardHtml(h, today, locked) {
  const k = today + "_" + h.id;
  const done = state.habitLog[k] === "done";
  const streak = getStreak(h.id);
  return `<button class="quick-log-btn ${done ? "done" : ""}" data-habit="${h.id}" ${locked ? "disabled" : ""}>
    <span class="qlog-emoji">${h.emoji || ""}</span>
    <span class="qlog-check">✓</span>
    ${streak > 0 ? `<span class="qlog-streak">${streak} day${streak === 1 ? "" : "s"}</span>` : ""}
    <span class="qlog-name">${escapeHtml(h.name || "")}</span>
    <span class="qlog-meta">${escapeHtml(h.target || "")}</span>
  </button>`;
}

function renderToday() {
  const today = todayISO();
  document.getElementById("today-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const habits = config.habits || { matthew: [], marie: [], shared: [] };
  const myHabits = habits[currentUser] || [];
  const sharedHabits = habits.shared || [];
  const allMine = [...myHabits, ...sharedHabits];
  const locked = today < startDate();

  // Group by section
  const groups = { body: [], mind: [], together: [] };
  allMine.forEach(h => groups[sectionFor(h.id)].push(h));

  const sections = config.habit_sections || {};
  let html = "";
  ["body","mind","together"].forEach(key => {
    const list = groups[key];
    if (!list.length) return;
    const title = (sections[key] && sections[key].title) || key;
    html += `<div class="habit-section">
      <h3 class="habit-section-title">${escapeHtml(title)}</h3>
      <div class="quick-log-grid">${list.map(h => habitCardHtml(h, today, locked)).join("")}</div>
    </div>`;
  });
  document.getElementById("today-habits").innerHTML = html;

  // Hero line: You: done/total today
  const myDone = allMine.filter(h => state.habitLog[today + "_" + h.id] === "done").length;
  const myTotal = allMine.length;
  const partner = currentUser === "matthew" ? "marie" : "matthew";
  const partnerHabits = [...(habits[partner] || []), ...sharedHabits];
  const partnerDone = partnerHabits.filter(h => state.habitLog[today + "_" + h.id] === "done").length;
  const partnerTotal = partnerHabits.length;
  const hero = document.getElementById("hero-line");
  if (hero) {
    if (locked) {
      hero.classList.add("empty");
      hero.innerHTML = "";
    } else {
      hero.classList.remove("empty");
      hero.innerHTML = `<strong>You: ${myDone}/${myTotal}</strong> &middot; ${escapeHtml(profileName(partner))}: ${partnerDone}/${partnerTotal}`;
    }
  }

  document.querySelectorAll(".quick-log-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (locked) return;
      const k = today + "_" + btn.dataset.habit;
      const cur = state.habitLog[k];
      if (!cur) state.habitLog[k] = "done";
      else if (cur === "done") delete state.habitLog[k];
      pushToFirebase();
      renderToday();
    });
  });

  const outcomes = config.outcomes || { matthew: [], marie: [], shared: [] };
  const myOutcomes = outcomes[currentUser] || [];
  const sharedOutcomes = outcomes.shared || [];
  const myFocus = [...myOutcomes, ...sharedOutcomes].filter(o => o && o.focus);
  document.getElementById("today-focus").innerHTML = myFocus.map(o => {
    const pct = state.outcomeProgress[o.id] || 0;
    return `<div class="focus-card">
      <div class="focus-name">${escapeHtml(o.name || "")}</div>
      <div class="focus-meta">${escapeHtml(o.target || "")} · ${pct}%</div>
      <div class="focus-bar"><div class="focus-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

function renderHabitsWeek() {
  document.querySelectorAll("#tab-habits .person-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.person === currentHabitView);
    b.onclick = () => { currentHabitView = b.dataset.person; renderHabitsWeek(); };
  });

  const habits = (config.habits && config.habits[currentHabitView]) || [];
  const week = getCurrentWeek();
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  const today = todayISO();
  const sd = startDate();

  let html = `<div class="habit-row header">
    <div></div>
    ${week.map((d, i) => `<div class="habit-day-label">${dayNames[i]}<br>${d.getDate()}</div>`).join("")}
    <div class="habit-day-label">🔥</div>
  </div>`;

  habits.forEach(h => {
    const streak = getStreak(h.id);
    html += `<div class="habit-row">
      <div class="habit-name">${h.emoji || ""} ${escapeHtml(h.name || "")}<span class="sub">${escapeHtml(h.target || "")}</span></div>
      ${week.map(d => {
        const dStr = isoDate(d);
        const k = dStr + "_" + h.id;
        const v = state.habitLog[k];
        const isToday = dStr === today;
        const locked = dStr < sd;
        if (locked) return `<button class="habit-cell locked" disabled></button>`;
        const cls = v === "done" ? "done" : v === "miss" ? "miss" : "";
        const ico = v === "done" ? "✓" : v === "miss" ? "✗" : "";
        return `<button class="habit-cell ${cls} ${isToday ? "today" : ""}" data-key="${k}">${ico}</button>`;
      }).join("")}
      <div class="habit-streak-num">${streak}</div>
    </div>`;
  });

  document.getElementById("habits-week-grid").innerHTML = html;
  document.querySelectorAll(".habit-cell:not(.locked)").forEach(c => {
    c.addEventListener("click", () => {
      const k = c.dataset.key;
      const cur = state.habitLog[k];
      if (!cur) state.habitLog[k] = "done";
      else if (cur === "done") state.habitLog[k] = "miss";
      else delete state.habitLog[k];
      pushToFirebase();
      renderHabitsWeek();
      renderToday();
    });
  });
}

function renderOutcomes() {
  document.querySelectorAll("#tab-outcomes .person-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.person === currentOutcomeView);
    b.onclick = () => { currentOutcomeView = b.dataset.person; renderOutcomes(); };
  });

  const list = (config.outcomes && config.outcomes[currentOutcomeView]) || [];
  document.getElementById("outcomes-list").innerHTML = list.map(o => {
    const pct = state.outcomeProgress[o.id] || 0;
    return `<div class="outcome-card">
      <div class="outcome-header">
        <div>
          <div class="outcome-name">${escapeHtml(o.name || "")}${o.focus ? '<span class="focus-star">★</span>' : ""}</div>
          <div class="outcome-target">${escapeHtml(o.target || "")}</div>
        </div>
        <div class="outcome-pct">${pct}%</div>
      </div>
      <div class="outcome-bar"><div class="outcome-bar-fill" style="width:${pct}%"></div></div>
      <div class="outcome-controls">
        <input type="number" min="0" max="100" value="${pct}" class="outcome-input" data-id="${o.id}">
        <span style="font-size:12px;color:var(--text-muted)">% complete</span>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll(".outcome-input").forEach(inp => {
    inp.addEventListener("change", e => {
      const v = Math.max(0, Math.min(100, parseInt(e.target.value || 0)));
      state.outcomeProgress[e.target.dataset.id] = v;
      pushToFirebase();
      renderOutcomes();
      renderToday();
    });
  });
}

function renderStandards() {
  const renderSec = (containerId, list) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = (list || []).map(s => {
      const k = "std_" + s.id;
      const log = state.standardsLog[k] || [];
      const last = log.length ? log[log.length - 1].rating : null;
      return `<div class="standard-card">
        <div class="standard-name">${escapeHtml(s.name || "")}</div>
        <div class="rating-row">
          ${[1, 2, 3, 4, 5].map(n => `<button class="rating-btn ${last === n ? "selected" : ""}" data-id="${s.id}" data-r="${n}">${n}</button>`).join("")}
        </div>
        <div class="standard-context">${escapeHtml(s.ctx || "")}${log.length ? ` · ${log.length} ratings` : ""}</div>
      </div>`;
    }).join("");
  };
  const stds = config.standards || { marie: [], matthew: [] };
  renderSec("standards-marie", stds.marie || []);
  renderSec("standards-matthew", stds.matthew || []);

  document.querySelectorAll(".rating-btn").forEach(b => {
    b.addEventListener("click", () => {
      const k = "std_" + b.dataset.id;
      const rating = parseInt(b.dataset.r);
      if (!state.standardsLog[k]) state.standardsLog[k] = [];
      const today = todayISO();
      const last = state.standardsLog[k][state.standardsLog[k].length - 1];
      if (last && last.date === today) last.rating = rating;
      else state.standardsLog[k].push({ date: today, rating });
      pushToFirebase();
      renderStandards();
    });
  });
}

function renderCheckin() {
  const qs = (config.questions && config.questions.items) || [];
  const q = qs.length ? qs[state.qIndex % qs.length] : "";
  document.getElementById("discussion-q").textContent = q;
  ["gratitude", "issues", "goals", "ahead"].forEach(f => {
    const el = document.getElementById("ci-" + f);
    if (el) el.value = state.currentCheckin[f] || "";
  });
  document.getElementById("checkin-archive").innerHTML = state.checkinArchive.slice(-10).reverse().map(c =>
    `<div class="archive-item"><div class="date">${escapeHtml(c.date || "")}</div>
    ${c.gratitude ? `<div><b>Grateful:</b> ${escapeHtml(c.gratitude)}</div>` : ""}
    ${c.issues ? `<div><b>Issues:</b> ${escapeHtml(c.issues)}</div>` : ""}
    ${c.goals ? `<div><b>Goals:</b> ${escapeHtml(c.goals)}</div>` : ""}
    ${c.ahead ? `<div><b>Ahead:</b> ${escapeHtml(c.ahead)}</div>` : ""}
    </div>`
  ).join("") || "<p class='muted'>No past check-ins yet.</p>";
}

// ---- Us tab / Photos -----------------------------------------------------

const MONTH_LABELS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function formatPhotoDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function monthKey(iso) {
  if (!iso) return "0000-00";
  const [y, m] = iso.split("-");
  return `${y}-${m}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_LABELS[(parseInt(m, 10) - 1) || 0]} ${y}`;
}

function renderUs() {
  const timeline = document.getElementById("photos-timeline");
  const empty = document.getElementById("photos-empty");
  if (!timeline) return;

  if (!photos.length) {
    timeline.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  // Group photos by month
  const groups = new Map();
  photos.forEach(p => {
    const k = monthKey(p.takenAt);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  });

  // Sort: months desc, photos within group already in desc order via subscription
  const keys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  const html = keys.map(k => {
    const list = groups.get(k);
    const cards = list.map((p) => {
      const globalIdx = photos.indexOf(p);
      const uploader = p.uploader || "";
      const uploaderName = uploader === "matthew" || uploader === "marie" ? profileName(uploader) : "—";
      const caption = p.caption ? `<div class="photo-card-caption">${escapeHtml(p.caption)}</div>` : `<div class="photo-card-caption empty">No caption</div>`;
      return `<button class="photo-card" data-idx="${globalIdx}" type="button">
        <div class="photo-card-img-wrap"><img class="photo-card-img" loading="lazy" src="${escapeHtml(p.url)}" alt=""></div>
        <div class="photo-card-body">
          ${caption}
          <div class="photo-card-meta">
            <span>${formatPhotoDate(p.takenAt)}</span>
            <span class="by"><span class="by-dot ${uploader}"></span>${escapeHtml(uploaderName)}</span>
          </div>
        </div>
      </button>`;
    }).join("");

    return `<div class="photo-month">
      <div class="photo-month-header">${monthLabel(k)}</div>
      <div class="photo-grid">${cards}</div>
    </div>`;
  }).join("");

  timeline.innerHTML = html;

  timeline.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.idx, 10);
      openViewer(idx);
    });
  });
}

function subscribeToPhotos() {
  if (photosUnsub) { try { photosUnsub(); } catch(e){} }
  const q = query(collection(db, "photos"), orderBy("takenAt", "desc"));
  photosUnsub = onSnapshot(q, (snap) => {
    photos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderUs();
  }, (err) => {
    console.error("Photos sync error:", err);
  });
}

function openUploadFlow() {
  if (!currentUid) {
    alert("Signing in… try again in a moment.");
    ensureAuthAndPhotos();
    return;
  }
  const input = document.getElementById("photo-file-input");
  if (!input) return;
  input.value = "";
  input.click();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resizeImageToBlob(file, maxDim = 1600, quality = 0.85) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
  if (!blob) throw new Error("Resize failed");
  return { blob, previewUrl: dataUrl };
}

async function onPhotoFilePicked(file) {
  if (!file) return;
  try {
    const { previewUrl } = await resizeImageToBlob(file);
    pendingPhotoFile = file;
    pendingPhotoDataUrl = previewUrl;
    openCaptionModal();
  } catch (e) {
    console.error("Failed to read photo:", e);
    alert("Could not read that photo. Try a different one.");
  }
}

function openCaptionModal() {
  const modal = document.getElementById("caption-modal");
  const preview = document.getElementById("caption-preview");
  const captionInput = document.getElementById("caption-input");
  const dateInput = document.getElementById("caption-date");
  const posterName = document.getElementById("caption-poster-name");
  const progress = document.getElementById("caption-progress");
  const fill = document.getElementById("caption-progress-fill");

  if (!modal) return;
  if (preview && pendingPhotoDataUrl) preview.src = pendingPhotoDataUrl;
  if (captionInput) captionInput.value = "";
  if (dateInput) dateInput.value = todayISO();
  if (posterName) posterName.textContent = profileName(currentUser);
  if (progress) progress.classList.add("hidden");
  if (fill) fill.style.width = "0%";

  document.getElementById("caption-upload").disabled = false;
  document.getElementById("caption-cancel").disabled = false;

  modal.classList.remove("hidden");
}

function closeCaptionModal() {
  const modal = document.getElementById("caption-modal");
  if (modal) modal.classList.add("hidden");
  pendingPhotoFile = null;
  pendingPhotoDataUrl = null;
}

async function uploadPhoto(file, caption, takenAt) {
  if (!currentUid) throw new Error("Not signed in");
  setSyncStatus("syncing");

  const progress = document.getElementById("caption-progress");
  const fill = document.getElementById("caption-progress-fill");
  const text = document.getElementById("caption-progress-text");
  const uploadBtn = document.getElementById("caption-upload");
  const cancelBtn = document.getElementById("caption-cancel");

  if (progress) progress.classList.remove("hidden");
  if (uploadBtn) uploadBtn.disabled = true;
  if (cancelBtn) cancelBtn.disabled = true;
  if (text) text.textContent = "Resizing…";
  if (fill) fill.style.width = "10%";

  const { blob } = await resizeImageToBlob(file);

  if (text) text.textContent = "Uploading…";
  if (fill) fill.style.width = "45%";

  const filename = `photos/${currentUid}_${Date.now()}.jpg`;
  const ref = storageRef(storage, filename);
  await uploadBytes(ref, blob, { contentType: "image/jpeg" });

  if (text) text.textContent = "Saving…";
  if (fill) fill.style.width = "80%";

  const url = await getDownloadURL(ref);

  await addDoc(collection(db, "photos"), {
    url,
    caption: caption || "",
    takenAt: takenAt || todayISO(),
    uploadedAt: serverTimestamp(),
    uploader: currentUser
  });

  if (fill) fill.style.width = "100%";
  if (text) text.textContent = "Done";
  setSyncStatus("synced");
}

// ---- Fullscreen viewer ---------------------------------------------------

function openViewer(idx) {
  const modal = document.getElementById("viewer-modal");
  if (!modal || !photos.length) return;
  viewerIndex = Math.max(0, Math.min(photos.length - 1, idx));
  renderViewer();
  modal.classList.remove("hidden");
}

function closeViewer() {
  const modal = document.getElementById("viewer-modal");
  if (modal) modal.classList.add("hidden");
}

function renderViewer() {
  const p = photos[viewerIndex];
  if (!p) return;
  const img = document.getElementById("viewer-img");
  const capText = document.getElementById("viewer-caption-text");
  const capMeta = document.getElementById("viewer-caption-meta");
  const prev = document.getElementById("viewer-prev");
  const next = document.getElementById("viewer-next");
  if (img) img.src = p.url;
  if (capText) {
    if (p.caption) {
      capText.textContent = p.caption;
      capText.classList.remove("empty");
    } else {
      capText.textContent = "—";
      capText.classList.add("empty");
    }
  }
  if (capMeta) {
    const uploader = (p.uploader === "matthew" || p.uploader === "marie") ? profileName(p.uploader) : "";
    capMeta.textContent = `${formatPhotoDate(p.takenAt)}${uploader ? " · " + uploader : ""}`;
  }
  if (prev) prev.disabled = viewerIndex <= 0;
  if (next) next.disabled = viewerIndex >= photos.length - 1;
}

function viewerNext() {
  if (viewerIndex < photos.length - 1) {
    viewerIndex++;
    renderViewer();
  }
}
function viewerPrev() {
  if (viewerIndex > 0) {
    viewerIndex--;
    renderViewer();
  }
}

function attachViewerSwipe() {
  const stage = document.getElementById("viewer-stage");
  if (!stage) return;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  stage.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) viewerNext();
      else viewerPrev();
    }
  }, { passive: true });
}

// ---- Settings overlay ----------------------------------------------------

function uid(prefix) {
  return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36).slice(-4);
}

function openSettings() {
  const overlay = document.getElementById("settings-overlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  renderSettings();
}
function closeSettings() {
  const overlay = document.getElementById("settings-overlay");
  if (overlay) overlay.classList.add("hidden");
}

function renderSettings() {
  // Apply open-state classes
  ["profiles","visits","habits","goals","standards","questions","app","danger"].forEach(name => {
    const sec = document.querySelector(`.settings-section[data-section="${name}"]`);
    if (sec) sec.classList.toggle("open", !!settingsState.open[name]);
  });
  renderSettingsProfiles();
  renderSettingsVisits();
  renderSettingsHabits();
  renderSettingsGoals();
  renderSettingsStandards();
  renderSettingsQuestions();
  renderSettingsApp();
}

// Profiles
function renderSettingsProfiles() {
  const container = document.getElementById("settings-profiles");
  if (!container) return;
  const profiles = config.profiles || {};
  const roles = ["matthew", "marie"];
  container.innerHTML = roles.map(role => {
    const p = profiles[role] || {};
    return `<div class="settings-profile-row" data-role="${role}">
      <div class="settings-profile-role">${role.charAt(0).toUpperCase() + role.slice(1)}</div>
      <input class="settings-profile-name" type="text" data-field="displayName" value="${escapeHtml(p.displayName || "")}" placeholder="Display name">
      <input class="settings-input" type="color" data-field="color" value="${escapeHtml(p.color || "#000000")}" title="Color" style="width:42px;padding:4px;">
    </div>`;
  }).join("");
  container.querySelectorAll(".settings-profile-row").forEach(row => {
    const role = row.dataset.role;
    row.querySelectorAll("input").forEach(inp => {
      const commit = async () => {
        const next = { ...(config.profiles || {}) };
        next[role] = { ...(next[role] || {}), [inp.dataset.field]: inp.value };
        const prev = config.profiles;
        config.profiles = next;
        applyNameLabels();
        const ok = await patchConfigDoc("profiles", { [role]: next[role] });
        if (!ok) {
          config.profiles = prev;
          applyNameLabels();
          renderSettingsProfiles();
        }
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
    });
  });
}

// Visits
function renderSettingsVisits() {
  const container = document.getElementById("settings-visits");
  if (!container) return;
  const items = (config.visits && Array.isArray(config.visits.items)) ? config.visits.items : [];
  if (!items.length) {
    container.innerHTML = `<p class="settings-empty">No visits scheduled.</p>`;
    return;
  }
  container.innerHTML = items.map((v, i) => `<div class="settings-card" data-i="${i}">
    <div class="settings-card-main settings-visit">
      <div class="settings-card-row">
        <input class="settings-input flex-name" type="text" data-field="name" value="${escapeHtml(v.name || "")}" placeholder="Visit name">
      </div>
      <div class="settings-card-row">
        <label class="settings-label" style="margin-bottom:0">Start</label>
        <input class="settings-input" type="date" data-field="start" value="${escapeHtml(v.start || "")}">
        <label class="settings-label" style="margin-bottom:0">End</label>
        <input class="settings-input" type="date" data-field="end" value="${escapeHtml(v.end || "")}">
      </div>
    </div>
    <button class="settings-delete" data-del="${i}" aria-label="Delete visit">×</button>
  </div>`).join("");

  container.querySelectorAll(".settings-card").forEach(card => {
    const i = parseInt(card.dataset.i, 10);
    card.querySelectorAll("input[data-field]").forEach(inp => {
      const commit = async () => {
        const cur = (config.visits && config.visits.items) ? config.visits.items.slice() : [];
        if (!cur[i]) return;
        const updated = { ...cur[i], [inp.dataset.field]: inp.value };
        cur[i] = updated;
        const prev = config.visits;
        config.visits = { items: cur };
        renderHeader();
        const ok = await saveConfigDoc("visits", { items: cur });
        if (!ok) {
          config.visits = prev;
          renderHeader();
          renderSettingsVisits();
        }
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
    });
    const delBtn = card.querySelector(".settings-delete");
    if (delBtn) delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this visit?")) return;
      const cur = (config.visits && config.visits.items) ? config.visits.items.slice() : [];
      cur.splice(i, 1);
      const prev = config.visits;
      config.visits = { items: cur };
      renderSettingsVisits();
      renderHeader();
      const ok = await saveConfigDoc("visits", { items: cur });
      if (!ok) {
        config.visits = prev;
        renderSettingsVisits();
        renderHeader();
      }
    });
  });
}

async function addVisit() {
  const cur = (config.visits && config.visits.items) ? config.visits.items.slice() : [];
  const t = todayISO();
  cur.push({ id: uid("v"), name: "New visit", start: t, end: t });
  const prev = config.visits;
  config.visits = { items: cur };
  renderSettingsVisits();
  renderHeader();
  const ok = await saveConfigDoc("visits", { items: cur });
  if (!ok) {
    config.visits = prev;
    renderSettingsVisits();
    renderHeader();
  }
}

// Habits
function renderSettingsHabits() {
  const tabsEl = document.querySelector('.settings-tabs[data-group="habits"]');
  if (tabsEl) {
    tabsEl.querySelectorAll(".settings-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.habitsTab === settingsState.habitsTab);
    });
  }
  const container = document.getElementById("settings-habits");
  if (!container) return;
  const list = (config.habits && config.habits[settingsState.habitsTab]) || [];
  if (!list.length) {
    container.innerHTML = `<p class="settings-empty">No habits yet. Tap "+ Add habit" below.</p>`;
    return;
  }
  container.innerHTML = list.map((h, i) => `<div class="settings-card" data-i="${i}">
    <div class="settings-card-main">
      <div class="settings-card-row">
        <input class="settings-input emoji" type="text" maxlength="6" data-field="emoji" value="${escapeHtml(h.emoji || "")}">
        <input class="settings-input flex-name" type="text" data-field="name" value="${escapeHtml(h.name || "")}" placeholder="Habit name">
      </div>
      <div class="settings-card-row">
        <input class="settings-input flex-target" type="text" data-field="target" value="${escapeHtml(h.target || "")}" placeholder="Daily / 3x/week">
        <select class="settings-select" data-field="section">
          <option value="body" ${sectionFor(h.id) === "body" ? "selected" : ""}>Body</option>
          <option value="mind" ${sectionFor(h.id) === "mind" ? "selected" : ""}>Mind &amp; Spirit</option>
          <option value="together" ${sectionFor(h.id) === "together" ? "selected" : ""}>Together</option>
        </select>
      </div>
    </div>
    <button class="settings-delete" data-del="${i}" aria-label="Delete habit">×</button>
  </div>`).join("");

  container.querySelectorAll(".settings-card").forEach(card => {
    const i = parseInt(card.dataset.i, 10);
    card.querySelectorAll("input[data-field], select[data-field]").forEach(inp => {
      const commit = async () => {
        const role = settingsState.habitsTab;
        const cur = (config.habits && config.habits[role]) ? config.habits[role].slice() : [];
        if (!cur[i]) return;
        const field = inp.dataset.field;
        const prevHabits = config.habits;
        const prevSections = config.habit_sections;
        if (field === "section") {
          // Move habit id between section.ids
          const sections = JSON.parse(JSON.stringify(config.habit_sections || DEFAULT_HABIT_SECTIONS));
          ["body","mind","together"].forEach(k => {
            sections[k] = sections[k] || { title: k, ids: [] };
            sections[k].ids = (sections[k].ids || []).filter(id => id !== cur[i].id);
          });
          sections[inp.value] = sections[inp.value] || { title: inp.value, ids: [] };
          sections[inp.value].ids.push(cur[i].id);
          config.habit_sections = sections;
          const ok = await saveConfigDoc("habit_sections", sections);
          if (!ok) {
            config.habit_sections = prevSections;
            renderSettingsHabits();
          } else {
            renderToday();
          }
          return;
        }
        const updated = { ...cur[i], [field]: inp.value };
        cur[i] = updated;
        const nextHabits = { ...(config.habits || {}), [role]: cur };
        config.habits = nextHabits;
        const ok = await saveConfigDoc("habits", nextHabits);
        if (!ok) {
          config.habits = prevHabits;
          renderSettingsHabits();
        }
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter" && inp.tagName === "INPUT") inp.blur(); });
    });
    const delBtn = card.querySelector(".settings-delete");
    if (delBtn) delBtn.addEventListener("click", async () => {
      const role = settingsState.habitsTab;
      const cur = (config.habits && config.habits[role]) ? config.habits[role].slice() : [];
      const removed = cur[i];
      if (!removed) return;
      if (!confirm(`Delete habit "${removed.name || ""}"?`)) return;
      cur.splice(i, 1);
      const prevHabits = config.habits;
      const prevSections = config.habit_sections;
      const nextHabits = { ...(config.habits || {}), [role]: cur };
      // Also strip the id from habit_sections
      const sections = JSON.parse(JSON.stringify(config.habit_sections || DEFAULT_HABIT_SECTIONS));
      ["body","mind","together"].forEach(k => {
        sections[k] = sections[k] || { title: k, ids: [] };
        sections[k].ids = (sections[k].ids || []).filter(id => id !== removed.id);
      });
      config.habits = nextHabits;
      config.habit_sections = sections;
      renderSettingsHabits();
      const ok1 = await saveConfigDoc("habits", nextHabits);
      const ok2 = await saveConfigDoc("habit_sections", sections);
      if (!ok1 || !ok2) {
        config.habits = prevHabits;
        config.habit_sections = prevSections;
        renderSettingsHabits();
      }
    });
  });
}

async function addHabit() {
  const role = settingsState.habitsTab;
  const cur = (config.habits && config.habits[role]) ? config.habits[role].slice() : [];
  const prefix = role === "matthew" ? "mw" : role === "marie" ? "mr" : "sh";
  const id = uid(prefix);
  cur.push({ id, name: "New habit", emoji: "✨", target: "Daily" });
  const sections = JSON.parse(JSON.stringify(config.habit_sections || DEFAULT_HABIT_SECTIONS));
  sections.body = sections.body || { title: "Body", ids: [] };
  sections.body.ids.push(id);
  const prevHabits = config.habits;
  const prevSections = config.habit_sections;
  const nextHabits = { ...(config.habits || {}), [role]: cur };
  config.habits = nextHabits;
  config.habit_sections = sections;
  renderSettingsHabits();
  const ok1 = await saveConfigDoc("habits", nextHabits);
  const ok2 = await saveConfigDoc("habit_sections", sections);
  if (!ok1 || !ok2) {
    config.habits = prevHabits;
    config.habit_sections = prevSections;
    renderSettingsHabits();
  }
}

// Goals
function renderSettingsGoals() {
  const tabsEl = document.querySelector('.settings-tabs[data-group="goals"]');
  if (tabsEl) {
    tabsEl.querySelectorAll(".settings-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.goalsTab === settingsState.goalsTab);
    });
  }
  const container = document.getElementById("settings-goals");
  if (!container) return;
  const list = (config.outcomes && config.outcomes[settingsState.goalsTab]) || [];
  if (!list.length) {
    container.innerHTML = `<p class="settings-empty">No goals yet. Tap "+ Add goal" below.</p>`;
    return;
  }
  container.innerHTML = list.map((o, i) => `<div class="settings-card" data-i="${i}">
    <div class="settings-card-main">
      <div class="settings-card-row">
        <input class="settings-input flex-name" type="text" data-field="name" value="${escapeHtml(o.name || "")}" placeholder="Goal">
      </div>
      <div class="settings-card-row">
        <input class="settings-input flex-target" type="text" data-field="target" value="${escapeHtml(o.target || "")}" placeholder="Target / due">
        <input class="settings-input" type="text" data-field="cat" value="${escapeHtml(o.cat || "")}" placeholder="category" style="width:120px;">
        <label class="settings-check"><input type="checkbox" data-field="focus" ${o.focus ? "checked" : ""}> Focus</label>
      </div>
    </div>
    <button class="settings-delete" data-del="${i}" aria-label="Delete goal">×</button>
  </div>`).join("");

  container.querySelectorAll(".settings-card").forEach(card => {
    const i = parseInt(card.dataset.i, 10);
    card.querySelectorAll("input[data-field]").forEach(inp => {
      const commit = async () => {
        const role = settingsState.goalsTab;
        const cur = (config.outcomes && config.outcomes[role]) ? config.outcomes[role].slice() : [];
        if (!cur[i]) return;
        const field = inp.dataset.field;
        const value = inp.type === "checkbox" ? inp.checked : inp.value;
        cur[i] = { ...cur[i], [field]: value };
        const prev = config.outcomes;
        const next = { ...(config.outcomes || {}), [role]: cur };
        config.outcomes = next;
        const ok = await saveConfigDoc("outcomes", next);
        if (!ok) {
          config.outcomes = prev;
          renderSettingsGoals();
        } else {
          renderToday();
        }
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter" && inp.type !== "checkbox") inp.blur(); });
    });
    const delBtn = card.querySelector(".settings-delete");
    if (delBtn) delBtn.addEventListener("click", async () => {
      const role = settingsState.goalsTab;
      const cur = (config.outcomes && config.outcomes[role]) ? config.outcomes[role].slice() : [];
      if (!cur[i]) return;
      if (!confirm(`Delete goal "${cur[i].name || ""}"?`)) return;
      cur.splice(i, 1);
      const prev = config.outcomes;
      const next = { ...(config.outcomes || {}), [role]: cur };
      config.outcomes = next;
      renderSettingsGoals();
      const ok = await saveConfigDoc("outcomes", next);
      if (!ok) {
        config.outcomes = prev;
        renderSettingsGoals();
      }
    });
  });
}

async function addGoal() {
  const role = settingsState.goalsTab;
  const cur = (config.outcomes && config.outcomes[role]) ? config.outcomes[role].slice() : [];
  const prefix = role === "matthew" ? "mw" : role === "marie" ? "mr" : "sh";
  cur.push({ id: uid(prefix), cat: "personal", name: "New goal", target: "TBD", focus: false });
  const prev = config.outcomes;
  const next = { ...(config.outcomes || {}), [role]: cur };
  config.outcomes = next;
  renderSettingsGoals();
  const ok = await saveConfigDoc("outcomes", next);
  if (!ok) {
    config.outcomes = prev;
    renderSettingsGoals();
  }
}

// Standards
function renderSettingsStandards() {
  const tabsEl = document.querySelector('.settings-tabs[data-group="standards"]');
  if (tabsEl) {
    tabsEl.querySelectorAll(".settings-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.standardsTab === settingsState.standardsTab);
    });
  }
  const container = document.getElementById("settings-standards");
  if (!container) return;
  const list = (config.standards && config.standards[settingsState.standardsTab]) || [];
  if (!list.length) {
    container.innerHTML = `<p class="settings-empty">No standards yet. Tap "+ Add standard" below.</p>`;
    return;
  }
  container.innerHTML = list.map((s, i) => `<div class="settings-card" data-i="${i}">
    <div class="settings-card-main">
      <div class="settings-card-row">
        <input class="settings-input flex-name" type="text" data-field="name" value="${escapeHtml(s.name || "")}" placeholder="Standard">
      </div>
      <div class="settings-card-row">
        <input class="settings-input flex-ctx" type="text" data-field="ctx" value="${escapeHtml(s.ctx || "")}" placeholder="Context (optional)">
      </div>
    </div>
    <button class="settings-delete" data-del="${i}" aria-label="Delete standard">×</button>
  </div>`).join("");

  container.querySelectorAll(".settings-card").forEach(card => {
    const i = parseInt(card.dataset.i, 10);
    card.querySelectorAll("input[data-field]").forEach(inp => {
      const commit = async () => {
        const role = settingsState.standardsTab;
        const cur = (config.standards && config.standards[role]) ? config.standards[role].slice() : [];
        if (!cur[i]) return;
        cur[i] = { ...cur[i], [inp.dataset.field]: inp.value };
        const prev = config.standards;
        const next = { ...(config.standards || {}), [role]: cur };
        config.standards = next;
        const ok = await saveConfigDoc("standards", next);
        if (!ok) {
          config.standards = prev;
          renderSettingsStandards();
        }
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
    });
    const delBtn = card.querySelector(".settings-delete");
    if (delBtn) delBtn.addEventListener("click", async () => {
      const role = settingsState.standardsTab;
      const cur = (config.standards && config.standards[role]) ? config.standards[role].slice() : [];
      if (!cur[i]) return;
      if (!confirm(`Delete standard "${cur[i].name || ""}"?`)) return;
      cur.splice(i, 1);
      const prev = config.standards;
      const next = { ...(config.standards || {}), [role]: cur };
      config.standards = next;
      renderSettingsStandards();
      const ok = await saveConfigDoc("standards", next);
      if (!ok) {
        config.standards = prev;
        renderSettingsStandards();
      }
    });
  });
}

async function addStandard() {
  const role = settingsState.standardsTab;
  const cur = (config.standards && config.standards[role]) ? config.standards[role].slice() : [];
  const prefix = role === "marie" ? "s-mr" : "s-mw";
  cur.push({ id: uid(prefix), name: "New standard", ctx: "" });
  const prev = config.standards;
  const next = { ...(config.standards || {}), [role]: cur };
  config.standards = next;
  renderSettingsStandards();
  const ok = await saveConfigDoc("standards", next);
  if (!ok) {
    config.standards = prev;
    renderSettingsStandards();
  }
}

// Questions
function renderSettingsQuestions() {
  const container = document.getElementById("settings-questions");
  if (!container) return;
  const items = (config.questions && Array.isArray(config.questions.items)) ? config.questions.items : [];
  if (!items.length) {
    container.innerHTML = `<p class="settings-empty">No questions yet.</p>`;
    return;
  }
  container.innerHTML = items.map((q, i) => `<div class="settings-question-row" data-i="${i}">
    <input class="settings-input" type="text" value="${escapeHtml(q || "")}" placeholder="Question">
    <button class="settings-delete" data-del="${i}" aria-label="Delete question">×</button>
  </div>`).join("");

  container.querySelectorAll(".settings-question-row").forEach(row => {
    const i = parseInt(row.dataset.i, 10);
    const inp = row.querySelector("input");
    const commit = async () => {
      const cur = (config.questions && config.questions.items) ? config.questions.items.slice() : [];
      cur[i] = inp.value;
      const prev = config.questions;
      config.questions = { items: cur };
      const ok = await saveConfigDoc("questions", { items: cur });
      if (!ok) {
        config.questions = prev;
        renderSettingsQuestions();
      }
    };
    inp.addEventListener("change", commit);
    inp.addEventListener("blur", commit);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
    const delBtn = row.querySelector(".settings-delete");
    if (delBtn) delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this question?")) return;
      const cur = (config.questions && config.questions.items) ? config.questions.items.slice() : [];
      cur.splice(i, 1);
      const prev = config.questions;
      config.questions = { items: cur };
      renderSettingsQuestions();
      const ok = await saveConfigDoc("questions", { items: cur });
      if (!ok) {
        config.questions = prev;
        renderSettingsQuestions();
      }
    });
  });
}

async function addQuestion() {
  const cur = (config.questions && config.questions.items) ? config.questions.items.slice() : [];
  cur.push("New question?");
  const prev = config.questions;
  config.questions = { items: cur };
  renderSettingsQuestions();
  const ok = await saveConfigDoc("questions", { items: cur });
  if (!ok) {
    config.questions = prev;
    renderSettingsQuestions();
  }
}

// App
function renderSettingsApp() {
  const container = document.getElementById("settings-app");
  if (!container) return;
  const app = config.app || { startDate: DEFAULT_START_DATE, schemaVersion: 1 };
  container.innerHTML = `<div class="settings-app-row">
    <span class="settings-label">Start date</span>
    <input class="settings-input" id="settings-startdate" type="date" value="${escapeHtml(app.startDate || DEFAULT_START_DATE)}">
  </div>
  <div class="settings-app-row">
    <span class="settings-label">Schema version</span>
    <span class="ro">${escapeHtml(String(app.schemaVersion || 1))}</span>
  </div>`;

  const sd = document.getElementById("settings-startdate");
  if (sd) {
    const commit = async () => {
      const next = { ...(config.app || {}), startDate: sd.value, schemaVersion: app.schemaVersion || 1 };
      const prev = config.app;
      config.app = next;
      renderHeader();
      const ok = await saveConfigDoc("app", next);
      if (!ok) {
        config.app = prev;
        renderSettingsApp();
        renderHeader();
      }
    };
    sd.addEventListener("change", commit);
    sd.addEventListener("blur", commit);
  }
}

async function resetDefaults() {
  if (!confirm("Reset all habits, goals, standards, and check-in questions to the built-in defaults? This cannot be undone.")) return;
  try {
    setSyncStatus("syncing");
    const batch = writeBatch(db);
    batch.set(doc(db, "config", "habits"),         DEFAULT_HABITS);
    batch.set(doc(db, "config", "habit_sections"), DEFAULT_HABIT_SECTIONS);
    batch.set(doc(db, "config", "outcomes"),       DEFAULT_OUTCOMES);
    batch.set(doc(db, "config", "standards"),      DEFAULT_STANDARDS);
    batch.set(doc(db, "config", "questions"),      DEFAULT_QUESTIONS);
    await batch.commit();
    setSyncStatus("synced");
    showToast("Defaults restored.");
  } catch (e) {
    console.error("Reset failed:", e);
    setSyncStatus("offline");
    showToast("Reset failed.", "error");
  }
}

// ---- App bootstrap -------------------------------------------------------

ready(() => {
  console.log("M&M app initializing");

  // Bootstrap order matters: sign in anonymously FIRST. We DO NOT subscribe to
  // Firestore here — security rules now require an allowlisted UID for every
  // collection except /config/allowlist itself. Subscriptions are deferred to
  // showApp(), which only runs after ensureRoleClaim() returns true.
  let _bootstrapped = false;
  onAuthStateChanged(auth, async (user) => {
    currentUid = user ? user.uid : null;
    if (user && !_bootstrapped) {
      _bootstrapped = true;
      showLogin();
    }
    // Defensive: if currentUser was set somehow (e.g. re-entry) and we just
    // got our uid, run a claim check. With always-show-login this is rare.
    if (user && currentUser && !_dataBootstrapped) {
      const claimed = await ensureRoleClaim();
      if (claimed) showApp();
      else showAccessDenied();
    }
  });

  // Kick off anonymous sign-in immediately; everything else waits for it.
  signInAnonymously(auth).catch(e => console.error("Anonymous auth failed:", e));

  document.querySelectorAll(".who-btn").forEach(btn => {
    // Skip the back button on the denied screen (wired separately below).
    if (btn.id === "denied-back") return;
    btn.addEventListener("click", async () => {
      currentUser = btn.dataset.user;
      localStorage.setItem("mm-user", currentUser);
      // Wait for anonymous auth to resolve so we have a UID to claim with.
      if (!currentUid) {
        await new Promise((resolve) => {
          const off = onAuthStateChanged(auth, (u) => {
            if (u) { currentUid = u.uid; off(); resolve(); }
          });
        });
      }
      const claimed = await ensureRoleClaim();
      if (claimed) showApp();
      else showAccessDenied();
    });
  });

  const deniedBackBtn = document.getElementById("denied-back");
  if (deniedBackBtn) {
    deniedBackBtn.addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem("mm-user");
      showLogin();
    });
  }

  const switchBtn = document.getElementById("switch-user");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem("mm-user");
      showLogin();
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".tab-pane").forEach(p =>
        p.classList.toggle("active", p.id === "tab-" + btn.dataset.tab)
      );
    });
  });

  ["gratitude", "issues", "goals", "ahead"].forEach(f => {
    const el = document.getElementById("ci-" + f);
    if (el) {
      el.addEventListener("input", e => {
        state.currentCheckin[f] = e.target.value;
        pushToFirebase();
      });
    }
  });

  const newQBtn = document.getElementById("new-q");
  if (newQBtn) newQBtn.addEventListener("click", () => {
    state.qIndex++;
    pushToFirebase();
    renderCheckin();
  });

  const saveBtn = document.getElementById("save-checkin");
  if (saveBtn) saveBtn.addEventListener("click", () => {
    const qs = (config.questions && config.questions.items) || [];
    const q = qs.length ? qs[state.qIndex % qs.length] : "";
    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      q: q,
      ...state.currentCheckin
    };
    state.checkinArchive.push(entry);
    state.currentCheckin = { gratitude: "", issues: "", goals: "", ahead: "" };
    state.qIndex++;
    pushToFirebase();
    renderCheckin();
    alert("Saved!");
  });

  // --- Photos wiring ---
  const fab = document.getElementById("photo-fab");
  if (fab) fab.addEventListener("click", openUploadFlow);

  const fileInput = document.getElementById("photo-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) onPhotoFilePicked(file);
    });
  }

  // Caption modal close (backdrop + cancel)
  document.querySelectorAll('[data-close="caption"]').forEach(el => {
    el.addEventListener("click", closeCaptionModal);
  });

  const uploadBtn = document.getElementById("caption-upload");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      if (!pendingPhotoFile) return;
      const caption = document.getElementById("caption-input").value.trim();
      const takenAt = document.getElementById("caption-date").value || todayISO();
      try {
        await uploadPhoto(pendingPhotoFile, caption, takenAt);
        closeCaptionModal();
      } catch (e) {
        console.error("Upload failed:", e);
        alert("Upload failed. Please try again.");
        const upBtn = document.getElementById("caption-upload");
        const cnBtn = document.getElementById("caption-cancel");
        if (upBtn) upBtn.disabled = false;
        if (cnBtn) cnBtn.disabled = false;
        setSyncStatus("offline");
      }
    });
  }

  // Viewer wiring
  const viewerClose = document.getElementById("viewer-close");
  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  const viewerPrevBtn = document.getElementById("viewer-prev");
  if (viewerPrevBtn) viewerPrevBtn.addEventListener("click", viewerPrev);
  const viewerNextBtn = document.getElementById("viewer-next");
  if (viewerNextBtn) viewerNextBtn.addEventListener("click", viewerNext);
  attachViewerSwipe();

  document.addEventListener("keydown", (e) => {
    const viewer = document.getElementById("viewer-modal");
    if (viewer && !viewer.classList.contains("hidden")) {
      if (e.key === "Escape") closeViewer();
      else if (e.key === "ArrowRight") viewerNext();
      else if (e.key === "ArrowLeft") viewerPrev();
    }
    const caption = document.getElementById("caption-modal");
    if (caption && !caption.classList.contains("hidden") && e.key === "Escape") {
      closeCaptionModal();
    }
    const settings = document.getElementById("settings-overlay");
    if (settings && !settings.classList.contains("hidden") && e.key === "Escape") {
      closeSettings();
    }
  });

  // --- Settings wiring ---
  const openSetBtn = document.getElementById("open-settings");
  if (openSetBtn) openSetBtn.addEventListener("click", openSettings);
  const closeSetBtn = document.getElementById("settings-close");
  if (closeSetBtn) closeSetBtn.addEventListener("click", closeSettings);

  document.querySelectorAll(".settings-section-header[data-toggle]").forEach(h => {
    h.addEventListener("click", () => {
      const name = h.dataset.toggle;
      settingsState.open[name] = !settingsState.open[name];
      renderSettings();
    });
  });

  // Tabs inside settings
  document.querySelectorAll('.settings-tabs[data-group="habits"] .settings-tab').forEach(b => {
    b.addEventListener("click", () => {
      settingsState.habitsTab = b.dataset.habitsTab;
      renderSettingsHabits();
    });
  });
  document.querySelectorAll('.settings-tabs[data-group="goals"] .settings-tab').forEach(b => {
    b.addEventListener("click", () => {
      settingsState.goalsTab = b.dataset.goalsTab;
      renderSettingsGoals();
    });
  });
  document.querySelectorAll('.settings-tabs[data-group="standards"] .settings-tab').forEach(b => {
    b.addEventListener("click", () => {
      settingsState.standardsTab = b.dataset.standardsTab;
      renderSettingsStandards();
    });
  });

  // Add-buttons
  document.querySelectorAll(".settings-add-btn[data-add]").forEach(b => {
    b.addEventListener("click", () => {
      const kind = b.dataset.add;
      if (kind === "visit") addVisit();
      else if (kind === "habit") addHabit();
      else if (kind === "goal") addGoal();
      else if (kind === "standard") addStandard();
      else if (kind === "question") addQuestion();
    });
  });

  const resetBtn = document.getElementById("settings-reset-defaults");
  if (resetBtn) resetBtn.addEventListener("click", resetDefaults);

  // Role-claim resets. Both buttons are visible to both signed-in users so
  // either can rescue the other if they lose their device.
  const resetMatthewBtn = document.getElementById("settings-reset-matthew");
  if (resetMatthewBtn) {
    resetMatthewBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure? Anyone tapping \"I'm Matthew\" on the next device will become Matthew.")) return;
      const ok = await resetRoleClaim("matthew");
      if (ok) showToast("Matthew's slot is open.");
      else showToast("Couldn't reset that slot.", "error");
    });
  }
  const resetMarieBtn = document.getElementById("settings-reset-marie");
  if (resetMarieBtn) {
    resetMarieBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure? Anyone tapping \"I'm Marie\" on the next device will become Marie.")) return;
      const ok = await resetRoleClaim("marie");
      if (ok) showToast("Marie's slot is open.");
      else showToast("Couldn't reset that slot.", "error");
    });
  }

  // Note: showApp()/showLogin()/showAccessDenied() and Firestore subscriptions
  // are kicked off from the .who-btn click handlers above, AFTER anonymous
  // auth resolves AND ensureRoleClaim() succeeds. The auth state listener
  // only shows the login picker; it no longer subscribes by itself.
});
