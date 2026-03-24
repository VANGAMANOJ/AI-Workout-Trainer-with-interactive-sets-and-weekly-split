/* ═══════════════════════════════════════════════════
   APEX — AI WORKOUT TRAINER
   Main Application Logic
   Modular, clean, no console errors
═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   DATA: Exercise Database
───────────────────────────────────────────────── */
const EXERCISE_DB = {
  'Chest & Triceps': [
    { name: 'Incline Bench Press',   detail: '4×8–12 · Barbell / Dumbbell' },
    { name: 'Flat Bench Press',      detail: '4×6–10 · Compound Push' },
    { name: 'Dumbbell Fly',          detail: '3×12–15 · Isolation Stretch' },
    { name: 'Push-ups',              detail: '3×15–20 · Bodyweight' },
    { name: 'Cable Extension',       detail: '3×12–15 · Triceps Isolation' },
    { name: 'Close Grip Bench Press',detail: '3×8–12 · Triceps Compound' },
    { name: 'Dips',                  detail: '3×10–14 · Bodyweight / Weighted' },
  ],
  'Back & Biceps': [
    { name: 'Lat Pulldown',   detail: '4×10–12 · Cable Machine' },
    { name: 'Bent Over Row',  detail: '4×8–10 · Barbell / Dumbbell' },
    { name: 'Pull-ups',       detail: '3×8–12 · Bodyweight' },
    { name: 'Dumbbell Row',   detail: '3×10–12 · Unilateral' },
    { name: 'Barbell Row',    detail: '3×8–10 · Compound Pull' },
    { name: 'Dumbbell Curl',  detail: '3×12–15 · Biceps Isolation' },
    { name: 'Hammer Curl',    detail: '3×12–14 · Neutral Grip' },
    { name: 'Preacher Curl',  detail: '3×10–12 · Peak Contraction' },
  ],
  'Shoulders & Traps': [
    { name: 'Shoulder Press',     detail: '4×8–12 · Seated / Standing' },
    { name: 'Dumbbell Side Raises', detail: '4×12–15 · Lateral Head' },
    { name: 'Front Raises',       detail: '3×12–15 · Anterior Delt' },
    { name: 'Rear Delt Fly',      detail: '3×12–15 · Posterior Chain' },
    { name: 'Trap Shrugs',        detail: '4×10–15 · Barbell / Dumbbell' },
  ],
  'Legs': [
    { name: 'Squats',          detail: '4×8–12 · Compound King' },
    { name: 'Leg Press',       detail: '4×10–15 · Machine' },
    { name: 'Leg Extension',   detail: '3×12–15 · Quad Isolation' },
    { name: 'Lunges',          detail: '3×12/leg · Walking / Static' },
    { name: 'Hamstring Curl',  detail: '3×12–15 · Machine' },
    { name: 'Calf Raises',     detail: '4×15–20 · Seated / Standing' },
  ],
  'Rest': [],
};

/* Weekly schedule */
const WEEKLY_SCHEDULE = [
  { day: 1, name: 'Chest & Triceps',   short: 'CHEST\n& TRIS' },
  { day: 2, name: 'Back & Biceps',     short: 'BACK\n& BIS'  },
  { day: 3, name: 'Shoulders & Traps', short: 'SHOULDERS\n& TRAPS' },
  { day: 4, name: 'Legs',              short: 'LEGS'          },
  { day: 5, name: 'Chest & Triceps',   short: 'CHEST\n& TRIS' },
  { day: 6, name: 'Back & Biceps',     short: 'BACK\n& BIS'  },
  { day: 7, name: 'Rest',              short: 'REST'          },
];

/* Sets info per level */
const LEVEL_SETS = {
  Beginner:     { default: 2, reps: '12–15' },
  Intermediate: { default: 3, reps: '8–12'  },
  Advanced:     { default: 4, reps: '6–10'  },
};

/* ─────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────── */
const state = {
  profile: null,         // { name, age, weight, goal }
  theme: 'dark',
  currentPlan: null,     // { goal, level, days: [...] }
  cameraStream: null,
};

/* ─────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }

function showToast(msg, type = 'success') {
  const container = $('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    el.addEventListener('animationend', () => el.remove());
  }, 3000);
}

function saveState() {
  localStorage.setItem('apex_profile', JSON.stringify(state.profile));
  localStorage.setItem('apex_theme', state.theme);
  if (state.currentPlan) {
    localStorage.setItem('apex_plan', JSON.stringify(state.currentPlan));
  }
}

function loadState() {
  try {
    const p = localStorage.getItem('apex_profile');
    const t = localStorage.getItem('apex_theme');
    const pl = localStorage.getItem('apex_plan');
    if (p) state.profile = JSON.parse(p);
    if (t) state.theme = t;
    if (pl) state.currentPlan = JSON.parse(pl);
  } catch (e) {
    console.warn('State load failed:', e);
  }
}

/* ─────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────── */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveState();
}

function initTheme() {
  applyTheme(state.theme);
  $('themeToggle').addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });
}

/* ─────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────── */
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.section;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      $(`section-${sectionId}`).classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────────────
   PROFILE
───────────────────────────────────────────────── */
function updateProfileUI() {
  const p = state.profile;
  if (p && p.name) {
    $('bannerGreeting').textContent = 'Welcome back,';
    $('bannerName').textContent = p.name.toUpperCase();
    $('bannerTagline').textContent = `${p.goal || 'General Fitness'} • Let's crush it today!`;
    $('statAge').textContent = p.age ? `${p.age}y` : '—';
    $('statWeight').textContent = p.weight ? `${p.weight}kg` : '—';
    $('statGoal').textContent = p.goal ? p.goal.split(' ')[0] : '—';
    $('avatarRing').textContent = p.name.charAt(0).toUpperCase();
    // Pre-fill the generator goal
    if (p.goal) {
      const genGoal = $('genGoal');
      if (genGoal) {
        for (let i = 0; i < genGoal.options.length; i++) {
          if (genGoal.options[i].value === p.goal) {
            genGoal.selectedIndex = i; break;
          }
        }
      }
    }
  } else {
    $('bannerGreeting').textContent = 'Welcome,';
    $('bannerName').textContent = 'ATHLETE';
    $('bannerTagline').textContent = 'Set up your profile to get started!';
    $('statAge').textContent = '—';
    $('statWeight').textContent = '—';
    $('statGoal').textContent = '—';
    $('avatarRing').textContent = 'A';
  }
}

function openProfileForm() {
  const p = state.profile;
  if (p) {
    $('inputName').value   = p.name || '';
    $('inputAge').value    = p.age || '';
    $('inputWeight').value = p.weight || '';
    $('inputGoal').value   = p.goal || '';
  }
  $('profileFormCard').classList.remove('hidden');
  $('editProfileBtn').classList.add('hidden');
  $('inputName').focus();
}

function closeProfileForm() {
  $('profileFormCard').classList.add('hidden');
  $('editProfileBtn').classList.remove('hidden');
}

function saveProfile() {
  const name   = $('inputName').value.trim();
  const age    = parseInt($('inputAge').value);
  const weight = parseFloat($('inputWeight').value);
  const goal   = $('inputGoal').value;

  if (!name) { showToast('Please enter your name', 'error'); return; }
  if (!age || age < 10 || age > 99) { showToast('Please enter a valid age (10–99)', 'error'); return; }
  if (!weight || weight < 30 || weight > 250) { showToast('Please enter a valid weight (30–250kg)', 'error'); return; }
  if (!goal) { showToast('Please select a goal', 'error'); return; }

  state.profile = { name, age, weight, goal };
  saveState();
  updateProfileUI();
  closeProfileForm();
  showToast(`Profile saved! Let's go, ${name}!`);
}

function initProfile() {
  updateProfileUI();
  $('editProfileBtn').addEventListener('click', openProfileForm);
  $('profileBtn').addEventListener('click', openProfileForm);
  $('saveProfileBtn').addEventListener('click', saveProfile);
  $('cancelProfileBtn').addEventListener('click', closeProfileForm);

  // Auto-open on first visit
  if (!state.profile) {
    setTimeout(openProfileForm, 800);
  }
}

/* ─────────────────────────────────────────────────
   WEEK OVERVIEW (Dashboard)
───────────────────────────────────────────────── */
function renderWeekGrid() {
  const grid = $('weekGrid');
  grid.innerHTML = '';
  WEEKLY_SCHEDULE.forEach(d => {
    const isRest = d.name === 'Rest';
    const exercises = EXERCISE_DB[d.name] || [];
    const card = document.createElement('div');
    card.className = `day-mini-card${isRest ? ' rest-day' : ''}`;
    card.innerHTML = `
      <div class="day-number">Day ${d.day}</div>
      <div class="day-name">${d.name.replace('&', '&amp;')}</div>
      <div class="day-count">${isRest ? '— Recovery —' : `${exercises.length} exercises`}</div>
    `;
    if (!isRest) {
      card.addEventListener('click', () => {
        // Switch to workout tab and auto-generate
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelector('[data-section="workout"]').classList.add('active');
        $('section-workout').classList.add('active');
        generateWorkout();
      });
    }
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────
   WORKOUT GENERATOR
───────────────────────────────────────────────── */
function buildDayPlan(goal, level) {
  const levelInfo = LEVEL_SETS[level] || LEVEL_SETS.Intermediate;

  return WEEKLY_SCHEDULE.map(d => {
    const isRest = d.name === 'Rest';
    const allExercises = EXERCISE_DB[d.name] || [];

    // Filter / limit exercises per level
    let maxExercises;
    switch (level) {
      case 'Beginner':     maxExercises = 4; break;
      case 'Advanced':     maxExercises = allExercises.length; break;
      default:             maxExercises = 5; break;
    }
    const exercises = allExercises.slice(0, maxExercises).map(ex => ({
      ...ex,
      sets: levelInfo.default,
    }));

    return {
      day: d.day,
      name: d.name,
      isRest,
      exercises,
      goal,
      level,
    };
  });
}

function renderSetControl(exercise, exerciseIndex, dayIndex) {
  const id = `set-${dayIndex}-${exerciseIndex}`;
  return `
    <div class="set-control" data-day="${dayIndex}" data-ex="${exerciseIndex}">
      <button class="set-btn"
        data-action="dec" data-day="${dayIndex}" data-ex="${exerciseIndex}"
        ${exercise.sets <= 1 ? 'disabled' : ''}>−</button>
      <div class="set-display" id="${id}">${exercise.sets}</div>
      <span class="set-label">SETS</span>
      <button class="set-btn"
        data-action="inc" data-day="${dayIndex}" data-ex="${exerciseIndex}"
        ${exercise.sets >= 6 ? 'disabled' : ''}>+</button>
    </div>
  `;
}

function renderDayCard(dayData, dayIndex) {
  const card = document.createElement('div');
  card.className = `day-card${dayData.isRest ? ' rest' : ''}`;
  card.dataset.day = dayIndex;

  if (dayData.isRest) {
    card.innerHTML = `
      <div class="day-card-header">
        <div class="day-card-header-left">
          <span class="day-tag">Day ${dayData.day}</span>
          <span class="day-card-title">Rest & Recovery</span>
        </div>
        <span class="day-card-meta">Active rest · Stretch · Hydrate</span>
      </div>
    `;
    return card;
  }

  const exercisesHTML = dayData.exercises.map((ex, ei) => `
    <div class="exercise-row">
      <div class="exercise-name">
        ${ex.name}
        <span>${ex.detail}</span>
      </div>
      ${renderSetControl(ex, ei, dayIndex)}
    </div>
  `).join('');

  card.innerHTML = `
    <div class="day-card-header">
      <div class="day-card-header-left">
        <span class="day-tag">Day ${dayData.day}</span>
        <span class="day-card-title">${dayData.name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="day-card-meta">${dayData.exercises.length} exercises</span>
        <span class="day-chevron">▾</span>
      </div>
    </div>
    <div class="day-card-body">
      <div class="exercises-list">${exercisesHTML}</div>
    </div>
  `;

  // Toggle accordion
  const header = card.querySelector('.day-card-header');
  header.addEventListener('click', () => {
    card.classList.toggle('open');
  });

  return card;
}

function attachSetButtonListeners(container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.set-btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const dayIdx = parseInt(btn.dataset.day);
    const exIdx  = parseInt(btn.dataset.ex);
    const plan   = state.currentPlan;
    if (!plan) return;

    const exercise = plan.days[dayIdx].exercises[exIdx];
    if (!exercise) return;

    let sets = exercise.sets;
    if (action === 'inc' && sets < 6) sets++;
    if (action === 'dec' && sets > 1) sets--;
    exercise.sets = sets;
    saveState();

    // Update display
    const displayId = `set-${dayIdx}-${exIdx}`;
    const display = document.getElementById(displayId);
    if (display) {
      display.textContent = sets;
      display.classList.add('bump');
      setTimeout(() => display.classList.remove('bump'), 200);
    }

    // Update button states in the set-control
    const control = btn.closest('.set-control');
    if (control) {
      const decBtn = control.querySelector('[data-action="dec"]');
      const incBtn = control.querySelector('[data-action="inc"]');
      if (decBtn) decBtn.disabled = (sets <= 1);
      if (incBtn) incBtn.disabled = (sets >= 6);
    }
  });
}

function generateWorkout() {
  const goal  = $('genGoal').value;
  const level = $('genLevel').value;

  // Animate button
  const genBtn = $('generateBtn');
  genBtn.disabled = true;
  genBtn.querySelector('.btn-label').textContent = 'Generating...';

  setTimeout(() => {
    const days = buildDayPlan(goal, level);
    state.currentPlan = { goal, level, days };
    saveState();

    const container = $('daysContainer');
    container.innerHTML = '';
    days.forEach((day, i) => {
      container.appendChild(renderDayCard(day, i));
    });
    attachSetButtonListeners(container);

    $('outputTitle').textContent = `${goal} · ${level} Plan`;
    $('workoutOutput').classList.remove('hidden');

    genBtn.disabled = false;
    genBtn.querySelector('.btn-label').textContent = 'Generate Workout';
    showToast(`${level} ${goal} plan ready! 💪`);

    // Scroll to output
    $('workoutOutput').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 600);
}

function restoreWorkoutUI() {
  if (!state.currentPlan) return;
  const { goal, level, days } = state.currentPlan;
  const container = $('daysContainer');
  container.innerHTML = '';
  days.forEach((day, i) => {
    container.appendChild(renderDayCard(day, i));
  });
  attachSetButtonListeners(container);
  $('outputTitle').textContent = `${goal} · ${level} Plan`;
  $('workoutOutput').classList.remove('hidden');

  // Set selects
  const genGoal = $('genGoal');
  for (let i = 0; i < genGoal.options.length; i++) {
    if (genGoal.options[i].value === goal) { genGoal.selectedIndex = i; break; }
  }
  const genLevel = $('genLevel');
  for (let i = 0; i < genLevel.options.length; i++) {
    if (genLevel.options[i].value === level) { genLevel.selectedIndex = i; break; }
  }
}

function initWorkout() {
  $('generateBtn').addEventListener('click', generateWorkout);
  $('downloadPdfBtn').addEventListener('click', () => {
    if (!state.currentPlan) { showToast('Generate a plan first', 'error'); return; }
    try {
      generatePDF(state.currentPlan, state.profile);
      showToast('PDF downloaded!');
    } catch (err) {
      showToast('PDF generation failed', 'error');
      console.error(err);
    }
  });
}

/* ─────────────────────────────────────────────────
   CAMERA
───────────────────────────────────────────────── */
function initCamera() {
  const video      = $('cameraVideo');
  const placeholder = $('cameraPlaceholder');
  const overlay    = $('cameraOverlay');
  const errorBox   = $('cameraError');
  const errorMsg   = $('cameraErrorMsg');
  const startBtn   = $('startCameraBtn');
  const stopBtn    = $('stopCameraBtn');

  startBtn.addEventListener('click', async () => {
    errorBox.classList.add('hidden');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      state.cameraStream = stream;
      video.srcObject = stream;
      video.classList.remove('hidden');
      placeholder.classList.add('hidden');
      overlay.classList.remove('hidden');
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      showToast('Camera started!');
    } catch (err) {
      let msg = 'Camera access was denied or unavailable.';
      if (err.name === 'NotFoundError')     msg = 'No camera found on this device.';
      if (err.name === 'NotAllowedError')   msg = 'Camera permission was denied. Please allow access in your browser.';
      if (err.name === 'NotReadableError')  msg = 'Camera is in use by another application.';
      errorMsg.textContent = msg;
      errorBox.classList.remove('hidden');
      showToast('Camera failed to start', 'error');
    }
  });

  stopBtn.addEventListener('click', () => {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
      state.cameraStream = null;
    }
    video.srcObject = null;
    video.classList.add('hidden');
    placeholder.classList.remove('hidden');
    overlay.classList.add('hidden');
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    showToast('Camera stopped');
  });
}

/* ─────────────────────────────────────────────────
   LOADER
───────────────────────────────────────────────── */
function hideLoader() {
  const loader = $('loader');
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => { loader.style.display = 'none'; }, 600);
  }, 1500);
}

/* ─────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  hideLoader();
  initTheme();
  initNav();
  initProfile();
  renderWeekGrid();
  initWorkout();
  initCamera();
  restoreWorkoutUI();
});
