// M&M Goals Dashboard - Firebase-synced app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, onSnapshot,
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

const START_DATE = "2026-05-18";
const VISIT_START = "2026-05-25";
const VISIT_END = "2026-05-29";

const OUTCOMES = {
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

const HABITS = {
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

const STANDARDS_MARIE = [
  { id: "s-mr-tone", name: "Mindful of tone & delivery", ctx: "How she says things" },
  { id: "s-mr-direct", name: "Lovingly direct", ctx: "Straightforward, not hinting" },
  { id: "s-mr-absolutes", name: "No absolutes", ctx: "No 'never' or 'always'" },
  { id: "s-mr-actions", name: "Love through actions", ctx: "Not only words" },
  { id: "s-mr-collab", name: "Collaborates on solutions", ctx: "Us vs the problem" },
  { id: "s-mr-team", name: "Team mindset", ctx: "We're a team" }
];

const STANDARDS_MATTHEW = [
  { id: "s-mw-concerns", name: "Takes concerns seriously", ctx: "Doesn't dismiss" },
  { id: "s-mw-voice", name: "Calm voice", ctx: "Especially during tension" },
  { id: "s-mw-curious", name: "Asks her questions", ctx: "Learning about her" },
  { id: "s-mw-detail", name: "Goes into detail", ctx: "On things she wants to know" },
  { id: "s-mw-team", name: "Team mindset", ctx: "Us vs the problem" }
];

const QUESTIONS = [
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
];

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

// Photos state
let photos = []; // [{ id, url, caption, takenAt (YYYY-MM-DD), uploadedAt, uploader }]
let photosUnsub = null;
let pendingPhotoFile = null;
let pendingPhotoDataUrl = null;
let viewerIndex = 0;

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
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = isoDate(d);
    if (dStr < START_DATE) break;
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

function showLogin() {
  document.getElementById("login-screen").classList.add("active");
  document.getElementById("app-screen").classList.remove("active");
}

function showApp() {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app-screen").classList.add("active");
  document.getElementById("current-user").textContent = currentUser === "matthew" ? "Matthew" : "Marie";
  currentOutcomeView = currentUser;
  currentHabitView = currentUser;
  renderAll();
  startPresence();
  ensureAuthAndPhotos();
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
    el.textContent = partner.charAt(0).toUpperCase() + partner.slice(1);
  });
}

function renderAll() {
  renderHeader();
  renderToday();
  renderHabitsWeek();
  renderOutcomes();
  renderStandards();
  renderCheckin();
  renderUs();
}

function renderHeader() {
  const today = todayISO();
  const dayEl = document.getElementById("day-counter");
  if (today < START_DATE) dayEl.textContent = "starts May 18";
  else dayEl.textContent = "Day " + (daysBetween(START_DATE, today) + 1);

  const banner = document.getElementById("visit-banner");
  if (today >= VISIT_START && today <= VISIT_END) {
    banner.classList.remove("hidden");
    banner.innerHTML = `<span class="visit-heart">❤</span>
      <span class="visit-headline">Marie is here</span>
      <span class="visit-label">Book the next trip before she leaves</span>
      <span class="visit-dates">May 25 – 29</span>`;
  } else if (today < VISIT_START) {
    const d = daysBetween(today, VISIT_START);
    banner.classList.remove("hidden");
    banner.innerHTML = `<span class="visit-heart">❤</span>
      <span class="visit-count">${d}</span>
      <span class="visit-label">${d === 1 ? "day" : "days"} until Marie</span>
      <span class="visit-dates">May 25 – 29</span>`;
  } else {
    banner.classList.add("hidden");
  }
}

const HABIT_SECTIONS = {
  body: { title: "Body", ids: ["mw-gym","mw-run","mw-vitamins","mw-water","mw-bedtime","mw-wake6","mw-screen","mr-gym","mr-wake","mr-vitamins","mr-water","mr-sweets","mr-screen"] },
  mind: { title: "Mind & Spirit", ids: ["mw-chess","mw-agpeya","mr-agpeya","mr-ig-inf","sh-reading","sh-communion","sh-confession"] },
  together: { title: "Together", ids: ["sh-prayer","sh-checkin","sh-datenight","sh-watch"] }
};

function sectionFor(id) {
  if (HABIT_SECTIONS.body.ids.includes(id)) return "body";
  if (HABIT_SECTIONS.mind.ids.includes(id)) return "mind";
  if (HABIT_SECTIONS.together.ids.includes(id)) return "together";
  return "body";
}

function habitCardHtml(h, today, locked) {
  const k = today + "_" + h.id;
  const done = state.habitLog[k] === "done";
  const streak = getStreak(h.id);
  return `<button class="quick-log-btn ${done ? "done" : ""}" data-habit="${h.id}" ${locked ? "disabled" : ""}>
    <span class="qlog-emoji">${h.emoji}</span>
    <span class="qlog-check">✓</span>
    ${streak > 0 ? `<span class="qlog-streak">${streak} day${streak === 1 ? "" : "s"}</span>` : ""}
    <span class="qlog-name">${h.name}</span>
    <span class="qlog-meta">${h.target}</span>
  </button>`;
}

function renderToday() {
  const today = todayISO();
  document.getElementById("today-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const myHabits = HABITS[currentUser] || [];
  const sharedHabits = HABITS.shared || [];
  const allMine = [...myHabits, ...sharedHabits];
  const locked = today < START_DATE;

  // Group by section
  const groups = { body: [], mind: [], together: [] };
  allMine.forEach(h => groups[sectionFor(h.id)].push(h));

  let html = "";
  Object.keys(HABIT_SECTIONS).forEach(key => {
    const list = groups[key];
    if (!list.length) return;
    html += `<div class="habit-section">
      <h3 class="habit-section-title">${HABIT_SECTIONS[key].title}</h3>
      <div class="quick-log-grid">${list.map(h => habitCardHtml(h, today, locked)).join("")}</div>
    </div>`;
  });
  document.getElementById("today-habits").innerHTML = html;

  // Hero line: You: done/total today
  const myDone = allMine.filter(h => state.habitLog[today + "_" + h.id] === "done").length;
  const myTotal = allMine.length;
  const partner = currentUser === "matthew" ? "marie" : "matthew";
  const partnerHabits = [...(HABITS[partner] || []), ...sharedHabits];
  const partnerDone = partnerHabits.filter(h => state.habitLog[today + "_" + h.id] === "done").length;
  const partnerTotal = partnerHabits.length;
  const partnerName = partner.charAt(0).toUpperCase() + partner.slice(1);
  const hero = document.getElementById("hero-line");
  if (hero) {
    if (locked) {
      hero.classList.add("empty");
      hero.innerHTML = "";
    } else {
      hero.classList.remove("empty");
      hero.innerHTML = `<strong>You: ${myDone}/${myTotal}</strong> &middot; ${partnerName}: ${partnerDone}/${partnerTotal}`;
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

  const allOutcomes = [...OUTCOMES.matthew, ...OUTCOMES.marie, ...OUTCOMES.shared];
  const myFocus = allOutcomes.filter(o => o.focus && (OUTCOMES[currentUser].includes(o) || OUTCOMES.shared.includes(o)));
  document.getElementById("today-focus").innerHTML = myFocus.map(o => {
    const pct = state.outcomeProgress[o.id] || 0;
    return `<div class="focus-card">
      <div class="focus-name">${o.name}</div>
      <div class="focus-meta">${o.target} · ${pct}%</div>
      <div class="focus-bar"><div class="focus-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

function renderHabitsWeek() {
  document.querySelectorAll("#tab-habits .person-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.person === currentHabitView);
    b.onclick = () => { currentHabitView = b.dataset.person; renderHabitsWeek(); };
  });

  const habits = HABITS[currentHabitView] || [];
  const week = getCurrentWeek();
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  const today = todayISO();

  let html = `<div class="habit-row header">
    <div></div>
    ${week.map((d, i) => `<div class="habit-day-label">${dayNames[i]}<br>${d.getDate()}</div>`).join("")}
    <div class="habit-day-label">🔥</div>
  </div>`;

  habits.forEach(h => {
    const streak = getStreak(h.id);
    html += `<div class="habit-row">
      <div class="habit-name">${h.emoji} ${h.name}<span class="sub">${h.target}</span></div>
      ${week.map(d => {
        const dStr = isoDate(d);
        const k = dStr + "_" + h.id;
        const v = state.habitLog[k];
        const isToday = dStr === today;
        const locked = dStr < START_DATE;
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

  const list = OUTCOMES[currentOutcomeView] || [];
  document.getElementById("outcomes-list").innerHTML = list.map(o => {
    const pct = state.outcomeProgress[o.id] || 0;
    return `<div class="outcome-card">
      <div class="outcome-header">
        <div>
          <div class="outcome-name">${o.name}${o.focus ? '<span class="focus-star">★</span>' : ""}</div>
          <div class="outcome-target">${o.target}</div>
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
    document.getElementById(containerId).innerHTML = list.map(s => {
      const k = "std_" + s.id;
      const log = state.standardsLog[k] || [];
      const last = log.length ? log[log.length - 1].rating : null;
      return `<div class="standard-card">
        <div class="standard-name">${s.name}</div>
        <div class="rating-row">
          ${[1, 2, 3, 4, 5].map(n => `<button class="rating-btn ${last === n ? "selected" : ""}" data-id="${s.id}" data-r="${n}">${n}</button>`).join("")}
        </div>
        <div class="standard-context">${s.ctx}${log.length ? ` · ${log.length} ratings` : ""}</div>
      </div>`;
    }).join("");
  };
  renderSec("standards-marie", STANDARDS_MARIE);
  renderSec("standards-matthew", STANDARDS_MATTHEW);

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
  document.getElementById("discussion-q").textContent = QUESTIONS[state.qIndex % QUESTIONS.length];
  ["gratitude", "issues", "goals", "ahead"].forEach(f => {
    const el = document.getElementById("ci-" + f);
    if (el) el.value = state.currentCheckin[f] || "";
  });
  document.getElementById("checkin-archive").innerHTML = state.checkinArchive.slice(-10).reverse().map(c =>
    `<div class="archive-item"><div class="date">${c.date}</div>
    ${c.gratitude ? `<div><b>Grateful:</b> ${c.gratitude}</div>` : ""}
    ${c.issues ? `<div><b>Issues:</b> ${c.issues}</div>` : ""}
    ${c.goals ? `<div><b>Goals:</b> ${c.goals}</div>` : ""}
    ${c.ahead ? `<div><b>Ahead:</b> ${c.ahead}</div>` : ""}
    </div>`
  ).join("") || "<p class='muted'>No past check-ins yet.</p>";
}

// ---- Us tab / Photos -----------------------------------------------------

const MONTH_LABELS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
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
    const cards = list.map((p, idx) => {
      const globalIdx = photos.indexOf(p);
      const uploader = p.uploader || "";
      const uploaderName = uploader === "matthew" ? "Matthew" : uploader === "marie" ? "Marie" : "—";
      const caption = p.caption ? `<div class="photo-card-caption">${escapeHtml(p.caption)}</div>` : `<div class="photo-card-caption empty">No caption</div>`;
      return `<button class="photo-card" data-idx="${globalIdx}" type="button">
        <div class="photo-card-img-wrap"><img class="photo-card-img" loading="lazy" src="${escapeHtml(p.url)}" alt=""></div>
        <div class="photo-card-body">
          ${caption}
          <div class="photo-card-meta">
            <span>${formatPhotoDate(p.takenAt)}</span>
            <span class="by"><span class="by-dot ${uploader}"></span>${uploaderName}</span>
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
  if (posterName) posterName.textContent = currentUser === "matthew" ? "Matthew" : "Marie";
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
    const uploader = p.uploader === "matthew" ? "Matthew" : p.uploader === "marie" ? "Marie" : "";
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

// ---- App bootstrap -------------------------------------------------------

ready(() => {
  console.log("M&M app initializing");

  // Bootstrap order matters: sign in anonymously FIRST, then subscribe to Firestore
  // (rules require request.auth != null on every read/write).
  let _bootstrapped = false;
  onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    if (user && !_bootstrapped) {
      _bootstrapped = true;
      subscribeToData();
      if (currentUser) showApp();
      else showLogin();
    }
    if (user && currentUser) {
      bindRoleToUid();
      subscribeToPhotos();
    }
  });

  // Kick off anonymous sign-in immediately; everything else waits for it.
  signInAnonymously(auth).catch(e => console.error("Anonymous auth failed:", e));

  document.querySelectorAll(".who-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentUser = btn.dataset.user;
      localStorage.setItem("mm-user", currentUser);
      showApp();
    });
  });

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
    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      q: QUESTIONS[state.qIndex % QUESTIONS.length],
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
  });

  // Note: showApp()/showLogin() and subscribeToData() are now called from the
  // onAuthStateChanged bootstrap above, after anonymous sign-in resolves.
});
