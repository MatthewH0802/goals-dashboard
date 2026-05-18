// M&M Goals Dashboard - Firebase-synced app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const DOC_REF = doc(db, "dashboard", "main");

// ============ CONFIG ============
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

// ============ STATE ============
let state = {
  outcomeProgress: {},
  habitLog: {},
  standardsLog: {},
  currentCheckin: { gratitude: "", issues: "", goals: "", ahead: "" },
  checkinArchive: [],
  qIndex: 0
};

let currentUser = localStorage.getItem("mm-user") || null;
let currentOutcomeView = "matthew";
let currentHabitView = "matthew";
let unsubscribe = null;
let writeTimer = null;

// ============ FIREBASE SYNC ============
async function subscribeToData() {
  unsubscribe = onSnapshot(DOC_REF, (snap) => {
    if (snap.exists()) {
      state = Object.assign(state, snap.data());
      renderAll();
      setSyncStatus("synced");
    }
  }, (err) => {
    console.error("Sync error:", err);
    setSyncStatus("offline");
  });
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

function setSyncStatus(status) {
  const el = document.getElementById("sync-indicator");
  el.textContent = status;
  el.classList.toggle("syncing", status === "syncing");
}

// ============ HELPERS ============
function todayISO() { return new Date().toISOString().slice(0, 10); }
function isoDate(d) { return d.toISOString().slice(0, 10); }
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

// ============ LOGIN ============
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
}

document.querySelectorAll(".who-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentUser = btn.dataset.user;
    localStorage.setItem("mm-user", currentUser);
    showApp();
  });
});

document.getElementById("switch-user").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("mm-user");
  showLogin();
});

// ============ TABS ============
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".tab-pane").forEach(p =>
      p.classList.toggle("active", p.id === "tab-" + btn.dataset.tab)
    );
  });
});

// ============ RENDER ============
function renderAll() {
  renderHeader();
  renderToday();
  renderHabitsWeek();
  renderOutcomes();
  renderStandards();
  renderCheckin();
}

function renderHeader() {
  const today = todayISO();
  const dayEl = document.getElementById("day-counter");
  if (today < START_DATE) {
    dayEl.textContent = "starts May 18";
  } else {
    dayEl.textContent = "Day " + (daysBetween(START_DATE, today) + 1);
  }
  const banner = document.getElementById("visit-banner");
  if (today >= VISIT_START && today <= VISIT_END) {
    banner.classList.remove("hidden");
    banner.innerHTML = "❤ <strong>Marie is here!</strong> Book next trip before she leaves.";
  } else if (today < VISIT_START) {
    const d = daysBetween(today, VISIT_START);
    banner.classList.remove("hidden");
    banner.innerHTML = `❤ Marie arrives in <strong>${d} day${d === 1 ? "" : "s"}</strong> (May 25–29)`;
  } else {
    banner.classList.add("hidden");
  }
}

function renderToday() {
  const today = todayISO();
  document.getElementById("today-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const myHabits = HABITS[currentUser] || [];
  const sharedHabits = HABITS.shared || [];
  const allMine = [...myHabits, ...sharedHabits];
  const locked = today < START_DATE;

  document.getElementById("today-habits").innerHTML = allMine.map(h => {
    const k = today + "_" + h.id;
    const status = state.habitLog[k];
    const done = status === "done";
    const streak = getStreak(h.id);
    return `<button class="quick-log-btn ${done ? "done" : ""}" data-habit="${h.id}" ${locked ? "disabled" : ""}>
      ${streak > 0 ? `<span class="qlog-streak">${streak}🔥</span>` : ""}
      <span class="qlog-emoji">${h.emoji}</span>
      <span class="qlog-name">${h.name}</span>
      <span class="qlog-meta">${h.target}</span>
    </button>`;
  }).join("");

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

  // Focus outcomes
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
  const render = (containerId, list) => {
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
  render("standards-marie", STANDARDS_MARIE);
  render("standards-matthew", STANDARDS_MATTHEW);

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
    document.getElementById("ci-" + f).value = state.currentCheckin[f] || "";
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

["gratitude", "issues", "goals", "ahead"].forEach(f => {
  document.getElementById("ci-" + f).addEventListener("input", e => {
    state.currentCheckin[f] = e.target.value;
    pushToFirebase();
  });
});

document.getElementById("new-q").addEventListener("click", () => {
  state.qIndex++;
  pushToFirebase();
  renderCheckin();
});

document.getElementById("save-checkin").addEventListener("click", () => {
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

// ============ INIT ============
if (currentUser) {
  showApp();
} else {
  showLogin();
}
subscribeToData();
