/* ═══════════════════════════════════════════════════════════════
   FitAI — script.js
   All app logic: Profile, Navigation, Workout Plan,
   Camera, Stats, History
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════
   DATA — GOALS
════════════════════════════════════════ */
const GOALS = [
  { cat: 'Beginner & General', items: [
    { id: 'beginner_fitness',  emoji: '🔰', label: 'Beginner Fitness'    },
    { id: 'get_fit',           emoji: '💪', label: 'Get Fit'             },
    { id: 'build_habit',       emoji: '📅', label: 'Build Habit'         },
  ]},
  { cat: 'Fat Loss', items: [
    { id: 'lose_belly',        emoji: '🔥', label: 'Lose Belly Fat'      },
    { id: 'full_body_fat',     emoji: '⚡', label: 'Full Body Fat Loss'  },
    { id: 'weight_loss',       emoji: '⚖️', label: 'Weight Loss'         },
    { id: 'fat_toning',        emoji: '✨', label: 'Fat Loss + Toning'   },
  ]},
  { cat: 'Muscle & Strength', items: [
    { id: 'build_muscle',      emoji: '🏋️', label: 'Build Muscle'        },
    { id: 'strength',          emoji: '💥', label: 'Strength Training'   },
    { id: 'lean_muscle',       emoji: '🎯', label: 'Lean Muscle'         },
    { id: 'upper_body',        emoji: '💪', label: 'Upper Body Strength' },
    { id: 'lower_body',        emoji: '🦵', label: 'Lower Body Strength' },
  ]},
  { cat: 'Performance', items: [
    { id: 'stamina',           emoji: '🏃', label: 'Stamina'             },
    { id: 'cardio',            emoji: '❤️', label: 'Cardio Fitness'      },
    { id: 'athletic',          emoji: '🏅', label: 'Athletic Performance'},
    { id: 'core_strength',     emoji: '🧘', label: 'Core Strength'       },
  ]},
  { cat: 'Home Focus', items: [
    { id: 'no_equipment',      emoji: '🏠', label: 'No Equipment'        },
    { id: 'small_space',       emoji: '📐', label: 'Small Space Workout' },
    { id: 'quick_workout',     emoji: '⏱️', label: 'Quick Workout 15–20m'},
  ]},
  { cat: 'Women & Safety', items: [
    { id: 'women_fitness',     emoji: '👩', label: 'Women Fitness'       },
    { id: 'low_impact',        emoji: '🌿', label: 'Low Impact Workout'  },
    { id: 'posture',           emoji: '🧍', label: 'Posture Correction'  },
  ]},
];

/* ════════════════════════════════════════
   DATA — WORKOUT PLAN
════════════════════════════════════════ */
const WEEK = [
  { key: 'mon', label: 'Mon', name: 'Monday',    focus: 'Chest & Triceps',     rest: false },
  { key: 'tue', label: 'Tue', name: 'Tuesday',   focus: 'Back & Biceps',       rest: false },
  { key: 'wed', label: 'Wed', name: 'Wednesday', focus: 'Shoulders & Traps',   rest: false },
  { key: 'thu', label: 'Thu', name: 'Thursday',  focus: 'Legs & Glutes',       rest: false },
  { key: 'fri', label: 'Fri', name: 'Friday',    focus: 'Full Body Cardio',    rest: false },
  { key: 'sat', label: 'Sat', name: 'Saturday',  focus: 'Core & Flexibility',  rest: false },
  { key: 'sun', label: 'Sun', name: 'Sunday',    focus: 'Rest or Light Walk',  rest: true  },
];

const EXERCISES = {
  'Chest & Triceps': [
    { name: 'Push-ups',              detail: 'Full chest activation · no equipment', sets: 3 },
    { name: 'Incline Push-ups',      detail: 'Upper chest focus · hands elevated',   sets: 3 },
    { name: 'Tricep Dips',           detail: 'Chair or floor · tricep isolation',    sets: 3 },
    { name: 'Diamond Push-ups',      detail: 'Close grip · tricep & inner chest',    sets: 3 },
    { name: 'Wide Push-ups',         detail: 'Outer chest · full range of motion',   sets: 3 },
  ],
  'Back & Biceps': [
    { name: 'Doorframe Rows',        detail: 'Body row · back width',                sets: 3 },
    { name: 'Towel Bicep Curls',     detail: 'Resistance curl using towel',          sets: 3 },
    { name: 'Superman Hold',         detail: 'Lower back · posterior chain',         sets: 3 },
    { name: 'Reverse Snow Angels',   detail: 'Upper back & rear deltoids',           sets: 3 },
    { name: 'Resistance Band Rows',  detail: 'Horizontal row · mid back',            sets: 3 },
  ],
  'Shoulders & Traps': [
    { name: 'Pike Push-ups',         detail: 'Shoulder press alternative',           sets: 3 },
    { name: 'Lateral Raises',        detail: 'Light weight or resistance band',      sets: 3 },
    { name: 'Front Raises',          detail: 'Anterior deltoid · controlled',        sets: 3 },
    { name: 'Shoulder Circles',      detail: 'Mobility warmup · full rotation',      sets: 2 },
    { name: 'Shrugs',                detail: 'Trap isolation · hold at top',         sets: 3 },
  ],
  'Legs & Glutes': [
    { name: 'Squats',                detail: 'Full depth · feet shoulder width',     sets: 4 },
    { name: 'Lunges',                detail: 'Alternate legs · full stride',         sets: 3 },
    { name: 'Glute Bridges',         detail: 'Squeeze at top · hip thrust',          sets: 3 },
    { name: 'Wall Sit',              detail: '45–60 second hold · quads burn',       sets: 3 },
    { name: 'Calf Raises',           detail: 'Full range · stand on edge if able',   sets: 3 },
  ],
  'Full Body Cardio': [
    { name: 'Jumping Jacks',         detail: '60 seconds · get heart rate up',       sets: 3 },
    { name: 'Mountain Climbers',     detail: 'Core + cardio · quick pace',           sets: 3 },
    { name: 'Burpees',               detail: 'Full body · explosive movement',       sets: 3 },
    { name: 'High Knees',            detail: 'Running in place · arms pumping',      sets: 3 },
    { name: 'Jump Squats',           detail: 'Power · land softly',                  sets: 3 },
  ],
  'Core & Flexibility': [
    { name: 'Plank',                 detail: '30–60 second hold · tight core',       sets: 3 },
    { name: 'Crunches',              detail: 'Controlled · no neck pulling',         sets: 3 },
    { name: 'Leg Raises',            detail: 'Lower abs · slow descent',             sets: 3 },
    { name: 'Russian Twists',        detail: 'Obliques · seated rotation',           sets: 3 },
    { name: 'Child's Pose Stretch',  detail: '60 second stretch · recovery',         sets: 2 },
  ],
};

/* ════════════════════════════════════════
   APP STATE
════════════════════════════════════════ */
const state = {
  profile: null,
  isGuest: false,
  selectedDay: null,      // active day key
  setsState: {},          // "day_exIdx" → count
  history: [],
  streak: 0,
  selectedExercise: null,
};

/* ════════════════════════════════════════
   UTILITY
════════════════════════════════════════ */
function today() {
  return ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
}
function todayName() {
  return WEEK.find(d => d.key === today());
}
function saveLocal(key, val) {
  try { localStorage.setItem('fitai_' + key, JSON.stringify(val)); } catch(e) {}
}
function loadLocal(key) {
  try { return JSON.parse(localStorage.getItem('fitai_' + key)); } catch(e) { return null; }
}
function showEl(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function hideEl(id)  { document.getElementById(id)?.classList.add('hidden'); }
function getEl(id)   { return document.getElementById(id); }

/* ════════════════════════════════════════
   APP — ENTRY & INIT
════════════════════════════════════════ */
const App = {

  init() {
    // Load persisted data
    const saved = loadLocal('profile');
    const hist  = loadLocal('history');
    if (hist) state.history = hist;
    state.streak = loadLocal('streak') || 0;

    if (saved) {
      state.profile = saved;
      App.launchApp(false);
    }
    // else: entry overlay stays visible

    // Build goal grid for profile modal
    App.buildGoalGrid();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const nav = getEl('navbar');
      nav?.classList.toggle('scrolled', window.scrollY > 20);
    });
  },

  guestMode() {
    state.isGuest = true;
    state.profile = { name: 'Guest', goal: null, level: 'beginner', height: null, weight: null };
    App.launchApp(true);
  },

  launchApp(guest) {
    hideEl('entry-overlay');
    showEl('main-app');
    getEl('main-app').classList.remove('hidden');
    App.updateUserChip();
    App.nav('home', document.querySelector('[data-section="home"]'));
    App.refreshHeroCard();
    App.refreshHistorySummary();
  },

  updateUserChip() {
    const chip = getEl('user-chip');
    if (!chip) return;
    const name = state.profile?.name || 'Guest';
    chip.textContent = state.isGuest ? '👤 Guest' : `👤 ${name}`;
  },

  /* ── NAV ── */
  nav(section, linkEl) {
    // hide all sections
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    // show target
    const target = getEl('section-' + section);
    if (target) { target.classList.add('active'); target.classList.remove('hidden'); }

    // update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');

    // Close mobile menu
    getEl('nav-links')?.classList.remove('open');

    // Section-specific init
    if (section === 'workout')      App.initWorkout();
    if (section === 'camera')       App.initCameraSection();
    if (section === 'history')      App.renderHistory();
    if (section === 'profile-view') App.renderProfileView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  },

  toggleMenu() {
    getEl('nav-links')?.classList.toggle('open');
  },

  /* ── PROFILE MODAL ── */
  openProfileSetup() {
    getEl('profile-modal')?.classList.remove('hidden');
    App.profileStep1();
  },
  closeProfileSetup() {
    getEl('profile-modal')?.classList.add('hidden');
  },
  profileStep1() {
    showEl('profile-step-1');
    hideEl('profile-step-2');
    // Pre-fill if exists
    if (state.profile) {
      const p = state.profile;
      if (p.name   && p.name !== 'Guest') getEl('p-name').value = p.name;
      if (p.age)    getEl('p-age').value    = p.age;
      if (p.height) getEl('p-height').value = p.height;
      if (p.weight) getEl('p-weight').value = p.weight;
    }
  },
  profileStep2() {
    const name = getEl('p-name')?.value.trim();
    if (!name) { alert('Please enter your name.'); return; }
    hideEl('profile-step-1');
    showEl('profile-step-2');
  },
  profileStep1() {
    showEl('profile-step-1');
    hideEl('profile-step-2');
  },

  selectPill(groupId, btn) {
    document.querySelectorAll(`#${groupId} .pill`).forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  },

  buildGoalGrid() {
    const grid = getEl('goal-grid');
    if (!grid) return;
    grid.innerHTML = '';
    GOALS.forEach(cat => {
      const catLabel = document.createElement('div');
      catLabel.className = 'goal-category-label';
      catLabel.textContent = cat.cat;
      grid.appendChild(catLabel);
      cat.items.forEach(g => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.dataset.id = g.id;
        card.innerHTML = `<span style="font-size:18px">${g.emoji}</span> ${g.label}`;
        card.onclick = () => {
          document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state._selectedGoal = g.id;
          state._selectedGoalLabel = g.label;
        };
        grid.appendChild(card);
      });
    });
  },

  saveProfile() {
    const name   = getEl('p-name')?.value.trim() || 'User';
    const age    = getEl('p-age')?.value;
    const height = getEl('p-height')?.value;
    const weight = getEl('p-weight')?.value;
    const gender = document.querySelector('#gender-select .pill.active')?.dataset.val || 'other';
    const level  = document.querySelector('#level-select .pill.active')?.dataset.val || 'beginner';
    const goal   = state._selectedGoal || null;
    const goalLabel = state._selectedGoalLabel || 'General Fitness';

    if (!goal) { alert('Please select a goal.'); return; }

    state.profile = { name, age, height, weight, gender, level, goal, goalLabel };
    state.isGuest = false;
    saveLocal('profile', state.profile);

    App.closeProfileSetup();
    App.launchApp(false);
    hideEl('entry-overlay');
    showEl('main-app');
    getEl('main-app')?.classList.remove('hidden');
  },

  /* ── HERO CARD ── */
  refreshHeroCard() {
    const todayDay = todayName();
    if (!todayDay) return;
    getEl('hero-title') && (getEl('hero-title').innerHTML = state.profile?.name && !state.isGuest
      ? `Hey, ${state.profile.name}.<br/><em>Let's Train.</em>`
      : 'Train at Home.<br/><em>Like a Pro.</em>'
    );
    getEl('today-focus-label') && (getEl('today-focus-label').textContent = todayDay.focus);
    const exList = EXERCISES[todayDay.focus];
    const exContainer = getEl('today-exercises');
    if (exContainer && exList) {
      exContainer.innerHTML = exList.slice(0,3).map(e =>
        `<div class="hc-ex"><div class="hc-ex-dot"></div>${e.name}</div>`
      ).join('');
    }
    const streakEl = getEl('hero-streak');
    if (streakEl) streakEl.textContent = state.streak;
  },

  /* ── PROFILE VIEW ── */
  renderProfileView() {
    const p = state.profile || {};
    const first = (p.name || 'G')[0].toUpperCase();
    getEl('pcb-avatar') && (getEl('pcb-avatar').textContent = first);
    getEl('pcb-name')   && (getEl('pcb-name').textContent   = p.name || 'Guest');
    getEl('pcb-goal')   && (getEl('pcb-goal').textContent   = p.goalLabel || 'No goal set');
    getEl('pd-height')  && (getEl('pd-height').textContent  = p.height ? p.height + ' cm' : '—');
    getEl('pd-weight')  && (getEl('pd-weight').textContent  = p.weight ? p.weight + ' kg' : '—');
    getEl('pd-level')   && (getEl('pd-level').textContent   = p.level || '—');
    getEl('pd-gender')  && (getEl('pd-gender').textContent  = p.gender || '—');
    getEl('pd-mode')    && (getEl('pd-mode').textContent    = state.isGuest ? 'Guest' : 'Profile');
    getEl('pcb-streak') && (getEl('pcb-streak').textContent = state.streak);
    getEl('pcb-sessions') && (getEl('pcb-sessions').textContent = state.history.length);
    const cals = state.history.reduce((a, h) => a + (h.calories || 0), 0);
    getEl('pcb-calories') && (getEl('pcb-calories').textContent = cals);
  },

  /* ── HISTORY ── */
  renderHistory() {
    App.refreshHistorySummary();
    const list = getEl('history-list');
    if (!list) return;
    if (state.history.length === 0) {
      list.innerHTML = `<div class="empty-state"><div style="font-size:48px">📭</div><p>No workouts logged yet.</p><span>Complete a session and log a set to track your progress.</span></div>`;
      return;
    }
    list.innerHTML = [...state.history].reverse().map(h => `
      <div class="history-item">
        <div class="hi-date">${h.date}</div>
        <div class="hi-info">
          <div class="hi-day">${h.day || 'Workout'}</div>
          <div class="hi-meta">${h.exercise || '—'} · ${h.sets || 0} sets</div>
        </div>
        <div class="hi-stats">
          <div class="hi-stat"><strong>${h.reps || 0}</strong><span>Reps</span></div>
          <div class="hi-stat"><strong>${h.calories || 0}</strong><span>Cal</span></div>
          <div class="hi-stat"><strong>${h.duration || '—'}</strong><span>Min</span></div>
        </div>
      </div>
    `).join('');
  },

  refreshHistorySummary() {
    const el = getEl('history-summary');
    if (!el) return;
    const total = state.history.length;
    const cals  = state.history.reduce((a, h) => a + (h.calories || 0), 0);
    const reps  = state.history.reduce((a, h) => a + (h.reps || 0), 0);
    el.innerHTML = `
      <div class="hs-card"><div class="hs-num">${state.streak}</div><div class="hs-label">Day Streak</div></div>
      <div class="hs-card"><div class="hs-num">${total}</div><div class="hs-label">Sessions</div></div>
      <div class="hs-card"><div class="hs-num">${cals}</div><div class="hs-label">Calories</div></div>
      <div class="hs-card"><div class="hs-num">${reps}</div><div class="hs-label">Total Reps</div></div>
    `;
  },
};

/* ════════════════════════════════════════
   WORKOUT PLAN
════════════════════════════════════════ */
App.initWorkout = function() {
  const strip = getEl('week-strip');
  if (!strip) return;
  const td = today();

  // Default selected day = today
  if (!state.selectedDay) state.selectedDay = td;

  // Plan desc
  const pd = getEl('plan-desc');
  if (pd && state.profile?.goalLabel) pd.textContent = `Goal: ${state.profile.goalLabel}`;

  strip.innerHTML = WEEK.map((d, i) => {
    const isToday  = d.key === td;
    const isActive = d.key === state.selectedDay;
    return `
      <button class="week-day-btn ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"
        onclick="App.selectDay('${d.key}', this)">
        ${isToday ? '<div class="wdb-today-dot"></div>' : ''}
        <div class="wdb-label">${d.label}</div>
        <div class="wdb-name">${d.focus.split(' ')[0]}</div>
      </button>`;
  }).join('');

  App.renderDayDetail(state.selectedDay);
};

App.selectDay = function(key, btn) {
  state.selectedDay = key;
  document.querySelectorAll('.week-day-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  App.renderDayDetail(key);
};

App.renderDayDetail = function(key) {
  const day = WEEK.find(d => d.key === key);
  if (!day) return;
  const detail = getEl('workout-detail');
  if (!detail) return;

  if (day.rest) {
    detail.innerHTML = `
      <div class="wd-rest">
        <div class="wd-rest-icon">🛌</div>
        <h3>Rest Day</h3>
        <p>Active recovery — light stretching, a walk, or extra sleep. Recovery is training too.</p>
      </div>`;
    return;
  }

  const exList = EXERCISES[day.focus] || [];
  const td = today();

  // Init sets state for this day
  exList.forEach((ex, i) => {
    const k = `${key}_${i}`;
    if (!(k in state.setsState)) state.setsState[k] = ex.sets;
  });

  detail.innerHTML = `
    <div class="wd-header">
      <div class="wd-day-title">${day.name} — ${day.focus}</div>
      <div class="wd-meta">
        <div class="wd-badge">${exList.length} exercises</div>
        <div class="wd-badge">${exList.reduce((a,e)=>a+e.sets,0)} sets total</div>
        ${key === td ? '<div class="wd-badge goal-badge">Today</div>' : ''}
        ${state.profile?.goalLabel ? `<div class="wd-badge goal-badge">🎯 ${state.profile.goalLabel}</div>` : ''}
      </div>
    </div>
    <div class="exercises-list" id="ex-list-${key}"></div>
  `;

  const container = getEl(`ex-list-${key}`);
  exList.forEach((ex, i) => {
    const k = `${key}_${i}`;
    const row = document.createElement('div');
    row.className = 'ex-row';
    row.id = `ex-row-${k}`;
    row.innerHTML = `
      <div class="ex-num">${i+1}</div>
      <div class="ex-info">
        <div class="ex-name-text">${ex.name}</div>
        <div class="ex-detail">${ex.detail}</div>
      </div>
      <div class="ex-sets-ctrl">
        <div class="set-ctrl-wrap">
          <button class="set-btn-small" onclick="App.adjustSets('${k}',-1,'${key}')" id="minus-${k}">−</button>
          <div class="set-val-display" id="setval-${k}">${state.setsState[k]}</div>
          <button class="set-btn-small" onclick="App.adjustSets('${k}',1,'${key}')" id="plus-${k}">+</button>
        </div>
        <span class="sets-label">sets</span>
      </div>`;
    container.appendChild(row);
    App.refreshSetBtns(k);
  });
};

App.adjustSets = function(k, delta, dayKey) {
  const cur = state.setsState[k] || 3;
  const next = Math.min(6, Math.max(1, cur + delta));
  state.setsState[k] = next;
  const el = getEl(`setval-${k}`);
  if (el) el.textContent = next;
  App.refreshSetBtns(k);
};

App.refreshSetBtns = function(k) {
  const v = state.setsState[k] || 3;
  const minus = getEl(`minus-${k}`);
  const plus  = getEl(`plus-${k}`);
  if (minus) minus.disabled = v <= 1;
  if (plus)  plus.disabled  = v >= 6;
};

/* ════════════════════════════════════════
   CAMERA SYSTEM
════════════════════════════════════════ */
App.initCameraSection = function() {
  // Populate exercise pills from today's exercises
  const day = WEEK.find(d => d.key === (state.selectedDay || today()));
  const exList = day ? (EXERCISES[day.focus] || []) : [];
  const pillsContainer = getEl('exercise-pills');
  if (pillsContainer) {
    pillsContainer.innerHTML = exList.map((ex, i) =>
      `<button class="ex-pill ${i === 0 ? 'selected' : ''}"
        onclick="Camera.selectExercise(this, '${ex.name}')">${ex.name}</button>`
    ).join('');
    state.selectedExercise = exList[0]?.name || null;
    getEl('stat-exercise') && (getEl('stat-exercise').textContent = state.selectedExercise || '—');
  }
};

const Camera = {
  stream: null,
  isRunning: false,
  reps: 0,
  setsLogged: 0,
  totalSets: 3,
  lastAngle: null,
  repState: 'up',       // for basic angle rep detection
  simInterval: null,    // simulation interval for demo

  selectExercise(btn, name) {
    document.querySelectorAll('.ex-pill').forEach(p => p.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedExercise = name;
    Camera.reps = 0;
    Camera.repState = 'up';
    getEl('stat-exercise') && (getEl('stat-exercise').textContent = name);
    getEl('stat-reps')     && (getEl('stat-reps').textContent = '0');
  },

  async start() {
    const viewport = getEl('camera-viewport');
    const video    = getEl('workout-video');
    const errBox   = getEl('cam-error');
    const liveBadge= getEl('cam-live-badge');
    const placeholder = getEl('cam-placeholder');
    const btnStart = getEl('btn-start-cam');
    const btnStop  = getEl('btn-stop-cam');

    if (!navigator.mediaDevices?.getUserMedia) {
      Camera.showError('Camera API not available. Please use HTTPS and a modern browser.');
      return;
    }

    // Try rear camera first (mobile), fallback to front
    const constraints = [
      { video: { facingMode: { exact: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: 'user',        width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: true, audio: false },
    ];

    let stream = null;
    let usedRear = false;

    for (let i = 0; i < constraints.length; i++) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints[i]);
        usedRear = (i === 0);
        break;
      } catch(e) {
        if (i === constraints.length - 1) {
          let msg = 'Camera access denied.';
          if (e.name === 'NotFoundError')    msg = 'No camera found on this device.';
          if (e.name === 'NotAllowedError')  msg = 'Camera access denied. Please allow camera permission in browser settings.';
          if (e.name === 'NotReadableError') msg = 'Camera is in use by another application.';
          Camera.showError(msg);
          return;
        }
      }
    }

    Camera.stream = stream;
    Camera.isRunning = true;

    video.srcObject = stream;
    if (usedRear) video.classList.add('rear'); else video.classList.remove('rear');

    video.onloadedmetadata = () => {
      video.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      errBox?.classList.add('hidden');
      liveBadge?.classList.remove('hidden');
      btnStart?.classList.add('hidden');
      btnStop?.classList.remove('hidden');

      // Start AI tracking simulation
      Camera.startTracking();
    };
  },

  stop() {
    if (Camera.stream) {
      Camera.stream.getTracks().forEach(t => t.stop());
      Camera.stream = null;
    }
    Camera.isRunning = false;
    clearInterval(Camera.simInterval);

    const video = getEl('workout-video');
    if (video) { video.srcObject = null; video.style.display = 'none'; }
    getEl('cam-placeholder') && (getEl('cam-placeholder').style.display = '');
    getEl('cam-live-badge')?.classList.add('hidden');
    getEl('btn-start-cam')?.classList.remove('hidden');
    getEl('btn-stop-cam')?.classList.add('hidden');

    // Reset stats
    Camera.reps = 0;
    Camera.updateStats({ angle: null, form: null, accuracy: null });
  },

  showError(msg) {
    const errBox = getEl('cam-error');
    const errText = getEl('cam-error-text');
    if (errBox)  errBox.classList.remove('hidden');
    if (errText) errText.textContent = msg;
  },

  /* ── TRACKING SIMULATION
     In production this would use TensorFlow.js MoveNet/BlazePose.
     Here we simulate joint angles and rep counting for demonstration.
  ── */
  startTracking() {
    let tick = 0;
    let phase = 0; // 0-1 sine for rep simulation

    Camera.simInterval = setInterval(() => {
      if (!Camera.isRunning) return;
      tick++;
      phase += 0.05;

      // Simulate elbow/knee angle oscillation (90°–170°)
      const rawAngle = 130 + 40 * Math.sin(phase);
      const angle = Math.round(rawAngle);

      // Rep counting logic (cross threshold)
      const threshold = 110;
      if (Camera.repState === 'up' && angle < threshold) {
        Camera.repState = 'down';
      } else if (Camera.repState === 'down' && angle > threshold + 15) {
        Camera.repState = 'up';
        Camera.reps++;
        getEl('stat-reps') && (getEl('stat-reps').textContent = Camera.reps);
      }

      // Form quality (simulated accuracy)
      const jitter = Math.random() * 10 - 5;
      const accuracy = Math.round(Math.min(100, Math.max(60, 88 + jitter)));
      const form = accuracy >= 80 ? 'Correct ✓' : 'Fix Form ✗';
      const formEl = getEl('stat-form');
      if (formEl) {
        formEl.textContent = form;
        formEl.className = 'stat-val ' + (accuracy >= 80 ? 'form-good' : 'form-bad');
      }

      Camera.updateStats({ angle, form, accuracy });

      // Draw skeleton on canvas
      Camera.drawSkeleton(angle, phase);
    }, 80);
  },

  updateStats({ angle, form, accuracy }) {
    if (angle !== null && angle !== undefined) {
      getEl('stat-angle')    && (getEl('stat-angle').textContent    = angle + '°');
    }
    if (accuracy !== null && accuracy !== undefined) {
      getEl('stat-accuracy') && (getEl('stat-accuracy').textContent = accuracy + '%');
      const bar = getEl('accuracy-bar');
      if (bar) bar.style.width = accuracy + '%';
    }
    getEl('stat-sets') && (getEl('stat-sets').textContent = `${Camera.setsLogged} / ${Camera.totalSets}`);
  },

  drawSkeleton(angle, phase) {
    const canvas = getEl('pose-canvas');
    const video  = getEl('workout-video');
    if (!canvas || !video || !Camera.isRunning) return;

    canvas.width  = video.offsetWidth  || 640;
    canvas.height = video.offsetHeight || 360;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const s  = canvas.height / 6; // scale unit

    // Body joints (normalized for a standing figure)
    const sway = Math.sin(phase) * s * 0.15;
    const headY = cy - 2.5 * s;
    const shoulderY = cy - 1.8 * s;
    const hipY = cy;
    const kneeY = cy + 1.5 * s;
    const footY = cy + 2.8 * s;

    // Arm angle from simulated data
    const rad = ((180 - angle) * Math.PI) / 180;
    const armLen = s * 0.9;
    const elbowX = cx - s * 0.6;
    const elbowY = shoulderY + s * 0.7;
    const handX  = elbowX - armLen * Math.sin(rad) * 0.6;
    const handY  = elbowY + armLen * Math.cos(rad);

    const pts = {
      head:    [cx + sway * 0.3, headY],
      neck:    [cx + sway * 0.2, shoulderY - s * 0.15],
      rShoulder: [cx + s * 0.6, shoulderY],
      lShoulder: [cx - s * 0.6, shoulderY],
      rElbow:  [cx + s * 0.85, shoulderY + s * 0.7],
      lElbow:  [elbowX, elbowY],
      rHand:   [cx + s * 0.9, shoulderY + s * 0.7 + armLen * Math.cos(rad)],
      lHand:   [handX, handY],
      rHip:    [cx + s * 0.35, hipY],
      lHip:    [cx - s * 0.35, hipY],
      rKnee:   [cx + s * 0.35 + sway, kneeY],
      lKnee:   [cx - s * 0.35 - sway, kneeY],
      rFoot:   [cx + s * 0.35 + sway * 1.2, footY],
      lFoot:   [cx - s * 0.35 - sway * 1.2, footY],
    };

    const skeletonColor = '#b8ff57';
    const jointColor    = '#ffffff';
    const lineW = Math.max(2, canvas.width / 280);

    ctx.strokeStyle = skeletonColor;
    ctx.lineWidth   = lineW;
    ctx.lineCap     = 'round';
    ctx.shadowColor = skeletonColor;
    ctx.shadowBlur  = 6;

    const connect = (a, b) => {
      if (!pts[a] || !pts[b]) return;
      ctx.beginPath();
      ctx.moveTo(...pts[a]);
      ctx.lineTo(...pts[b]);
      ctx.stroke();
    };

    // Connections
    ['neck','rShoulder','lShoulder','rElbow','lElbow','rHand','lHand',
     'rHip','lHip','rKnee','lKnee','rFoot','lFoot'].forEach(() => {});

    connect('head','neck');
    connect('neck','rShoulder'); connect('neck','lShoulder');
    connect('rShoulder','rElbow'); connect('rElbow','rHand');
    connect('lShoulder','lElbow'); connect('lElbow','lHand');
    connect('rShoulder','rHip'); connect('lShoulder','lHip');
    connect('rHip','lHip');
    connect('rHip','rKnee'); connect('rKnee','rFoot');
    connect('lHip','lKnee'); connect('lKnee','lFoot');

    // Draw head circle
    ctx.beginPath();
    ctx.arc(...pts.head, s * 0.28, 0, Math.PI * 2);
    ctx.strokeStyle = skeletonColor;
    ctx.stroke();

    // Joints
    ctx.shadowBlur = 10;
    ctx.fillStyle = jointColor;
    Object.values(pts).forEach(([x, y]) => {
      if (x === pts.head[0] && y === pts.head[1]) return;
      ctx.beginPath();
      ctx.arc(x, y, lineW * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Angle annotation
    ctx.shadowBlur = 0;
    ctx.fillStyle = skeletonColor;
    ctx.font = `bold ${Math.max(12, canvas.width / 50)}px DM Sans, sans-serif`;
    ctx.fillText(`${angle}°`, pts.lElbow[0] + 10, pts.lElbow[1] - 10);
  },

  logSet() {
    if (!Camera.isRunning) { alert('Please start the camera first.'); return; }
    if (!state.selectedExercise) { alert('Please select an exercise.'); return; }

    Camera.setsLogged++;
    Camera.totalSets = 3;

    // Save to history
    const entry = {
      date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
      day: (WEEK.find(d => d.key === (state.selectedDay || today())) || {}).focus || 'Workout',
      exercise: state.selectedExercise,
      reps: Camera.reps,
      sets: Camera.setsLogged,
      calories: Math.round(Camera.reps * 0.5 + Camera.setsLogged * 8),
      duration: Math.round(Camera.setsLogged * 2.5),
    };
    if (!state.isGuest) {
      state.history.push(entry);
      saveLocal('history', state.history);
    }

    // Streak update
    state.streak = (state.streak || 0) + (Camera.setsLogged === 1 ? 1 : 0);
    if (!state.isGuest) saveLocal('streak', state.streak);

    Camera.reps = 0;
    getEl('stat-reps') && (getEl('stat-reps').textContent = '0');
    getEl('stat-sets') && (getEl('stat-sets').textContent = `${Camera.setsLogged} / ${Camera.totalSets}`);

    // Visual feedback
    const btn = getEl('btn-log-set');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Set Logged!';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 1200);
    }
  },
};

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => App.init());
