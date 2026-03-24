/* ============================================================
   AI WORKOUT TRAINER — script.js
   Main application logic
   ============================================================ */

'use strict';

// ─── APP STATE ─────────────────────────────────────────────
const state = {
  selectedExercise: null,
  cameraActive: false,
  isRunning: false,
  sets: 3,
  reps: 0,
  completedSets: 0,
  accuracy: 0,
  duration: 0,
  timerInterval: null,
  calories: 0,
  stream: null,
  profile: null,
  theme: 'dark',
};

// ─── DOM REFS ───────────────────────────────────────────────
const dom = {
  body: document.body,
  themeToggle: document.getElementById('themeToggle'),
  welcomeText: document.getElementById('welcomeText'),
  // Exercise list
  exerciseList: document.getElementById('exerciseList'),
  selectedBadge: document.getElementById('selectedBadge'),
  // Camera
  videoFeed: document.getElementById('videoFeed'),
  poseCanvas: document.getElementById('poseCanvas'),
  cameraPlaceholder: document.getElementById('cameraPlaceholder'),
  placeholderMsg: document.getElementById('placeholderMsg'),
  repOverlay: document.getElementById('repOverlay'),
  repBig: document.getElementById('repBig'),
  // Controls
  btnCamera: document.getElementById('btnCamera'),
  btnStart: document.getElementById('btnStart'),
  btnReset: document.getElementById('btnReset'),
  // Sets
  setMinus: document.getElementById('setMinus'),
  setPlus: document.getElementById('setPlus'),
  setValueDisplay: document.getElementById('setValueDisplay'),
  setInfo: document.getElementById('setInfo'),
  // Stats
  statExercise: document.getElementById('statExercise'),
  statReps: document.getElementById('statReps'),
  statAngle: document.getElementById('statAngle'),
  statForm: document.getElementById('statForm'),
  accuracyBar: document.getElementById('accuracyBar'),
  accuracyValue: document.getElementById('accuracyValue'),
  statusDot: document.getElementById('statusDot'),
  statDuration: document.getElementById('statDuration'),
  statCalories: document.getElementById('statCalories'),
  statSetsDone: document.getElementById('statSetsDone'),
  // Tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  // Weekly
  weeklyGrid: document.getElementById('weeklyGrid'),
  // Profile
  profileAvatar: document.getElementById('profileAvatar'),
  profileDisplayName: document.getElementById('profileDisplayName'),
  profileGoalTag: document.getElementById('profileGoalTag'),
  profileName: document.getElementById('profileName'),
  profileAge: document.getElementById('profileAge'),
  profileWeight: document.getElementById('profileWeight'),
  profileHeight: document.getElementById('profileHeight'),
  goalBtns: document.querySelectorAll('.goal-btn'),
  btnSaveProfile: document.getElementById('btnSaveProfile'),
  saveStatus: document.getElementById('saveStatus'),
  // PDF
  btnDownloadPDF: document.getElementById('btnDownloadPDF'),
  // Toast
  toast: document.getElementById('toast'),
};

// ─── WEEKLY PLAN DATA ───────────────────────────────────────
const WEEKLY_PLAN = [
  {
    day: 1,
    name: 'Chest & Triceps',
    tag: 'Push Day',
    exercises: [
      { name: 'Incline Bench Press', sets: 4 },
      { name: 'Flat Bench Press', sets: 3 },
      { name: 'Dumbbell Fly', sets: 3 },
      { name: 'Push-ups', sets: 3 },
      { name: 'Cable Extension', sets: 3 },
      { name: 'Close Grip Bench Press', sets: 3 },
      { name: 'Dips', sets: 3 },
    ],
    note: null,
  },
  {
    day: 2,
    name: 'Back & Biceps',
    tag: 'Pull Day',
    exercises: [
      { name: 'Lat Pulldown', sets: 4 },
      { name: 'Bent Over Row', sets: 4 },
      { name: 'Pull-ups', sets: 3 },
      { name: 'Dumbbell Row', sets: 3 },
      { name: 'Barbell Row', sets: 3 },
      { name: 'Dumbbell Curl', sets: 3 },
      { name: 'Hammer Curl', sets: 3 },
      { name: 'Preacher Curl', sets: 3 },
    ],
    note: null,
  },
  {
    day: 3,
    name: 'Shoulders & Traps',
    tag: 'Push Day',
    exercises: [
      { name: 'Shoulder Press', sets: 4 },
      { name: 'Dumbbell Side Raises', sets: 4 },
      { name: 'Front Raises', sets: 3 },
      { name: 'Rear Delt Fly', sets: 3 },
      { name: 'Trap Shrugs', sets: 4 },
    ],
    note: null,
  },
  {
    day: 4,
    name: 'Legs',
    tag: 'Leg Day',
    exercises: [
      { name: 'Squats', sets: 4 },
      { name: 'Leg Press', sets: 4 },
      { name: 'Lunges', sets: 3 },
      { name: 'Leg Extension', sets: 3 },
      { name: 'Hamstring Curl', sets: 3 },
      { name: 'Calf Raises', sets: 4 },
    ],
    note: null,
  },
  {
    day: 5,
    name: 'Active Recovery / Alternative',
    tag: 'Suggestion',
    exercises: [
      { name: 'Repeat Day 1 or Day 2', sets: 3 },
      { name: 'Light Cardio (20 min)', sets: 1 },
      { name: 'Stretching Routine', sets: 1 },
    ],
    note: 'Repeat a previous workout or opt for a lighter alternative session.',
  },
  {
    day: 6,
    name: 'Weak Area Focus',
    tag: 'Variation',
    exercises: [
      { name: 'Choose weakest muscle group', sets: 4 },
      { name: 'Accessory Exercises', sets: 3 },
      { name: 'Core Work', sets: 3 },
      { name: 'Mobility Training', sets: 2 },
    ],
    note: 'Target your weakest area or add variation to challenge your body.',
  },
  {
    day: 7,
    name: 'Your Choice',
    tag: 'User Decision',
    exercises: [
      { name: '🛌 Full Rest Day', sets: 0 },
      { name: '🔄 Repeat Favorite Day', sets: 3 },
      { name: '🆕 New Workout Routine', sets: 3 },
    ],
    note: 'Rest, repeat, or try something new. You decide!',
  },
];

const GOAL_LABELS = {
  'fat-loss': '🔥 Fat Loss',
  'muscle-gain': '💪 Muscle Gain',
  'strength': '🏋 Strength',
  'endurance': '🏃 Endurance',
  'full-body': '🌟 Full Body',
  'lean': '✂ Lean Body',
  'beginner': '🌱 Beginner',
  'athletic': '⚡ Athletic',
  'home': '🏠 Home Workout',
  'gym': '🏛 Gym Workout',
};

// ─── INIT ───────────────────────────────────────────────────
function init() {
  loadTheme();
  loadProfile();
  setupTabs();
  setupExerciseList();
  setupCameraControls();
  setupSetControls();
  renderWeeklyPlan();
  setupProfileForm();
  setupDownloadBtn();
  setupThemeToggle();
}

// ─── THEME ───────────────────────────────────────────────────
function loadTheme() {
  const saved = localStorage.getItem('awt_theme') || 'dark';
  state.theme = saved;
  dom.body.setAttribute('data-theme', saved);
  dom.themeToggle.checked = (saved === 'light');
}

function setupThemeToggle() {
  dom.themeToggle.addEventListener('change', () => {
    state.theme = dom.themeToggle.checked ? 'light' : 'dark';
    dom.body.setAttribute('data-theme', state.theme);
    localStorage.setItem('awt_theme', state.theme);
  });
}

// ─── TABS ────────────────────────────────────────────────────
function setupTabs() {
  dom.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      dom.navTabs.forEach(t => t.classList.remove('active'));
      dom.tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('tab-' + target);
      if (content) content.classList.add('active');
    });
  });
}

// ─── EXERCISE LIST ───────────────────────────────────────────
function setupExerciseList() {
  dom.exerciseList.querySelectorAll('.exercise-item').forEach(item => {
    item.addEventListener('click', () => {
      dom.exerciseList.querySelectorAll('.exercise-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      selectExercise(item.dataset.exercise);
    });
  });
}

function selectExercise(name) {
  state.selectedExercise = name;
  state.reps = 0;
  state.accuracy = 0;

  // Update UI
  dom.selectedBadge.textContent = name;
  dom.statExercise.textContent = name;
  dom.statReps.textContent = '0';
  dom.statAngle.textContent = '0°';
  dom.statForm.textContent = 'Idle';
  dom.statForm.className = 'stat-value form-badge';
  updateAccuracy(0);

  dom.placeholderMsg.textContent = `${name} selected — enable camera to begin`;
  dom.repBig.textContent = '0';

  if (state.cameraActive) {
    dom.btnStart.disabled = false;
  }

  updateSetsDone();
  showToast(`Exercise: ${name}`);
}

// ─── CAMERA ─────────────────────────────────────────────────
function setupCameraControls() {
  dom.btnCamera.addEventListener('click', toggleCamera);
  dom.btnStart.addEventListener('click', toggleWorkout);
  dom.btnReset.addEventListener('click', resetWorkout);
}

async function toggleCamera() {
  if (state.cameraActive) {
    disableCamera();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    state.stream = stream;
    dom.videoFeed.srcObject = stream;
    dom.videoFeed.style.display = 'block';
    dom.cameraPlaceholder.style.display = 'none';
    dom.poseCanvas.style.display = 'block';
    state.cameraActive = true;
    dom.btnCamera.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M2 6h1.5L5 4h4M16 7a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V8" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
      Disable Camera`;
    dom.btnCamera.style.color = 'var(--accent-2)';
    dom.statusDot.className = 'status-dot active';

    if (state.selectedExercise) {
      dom.btnStart.disabled = false;
    }

    showToast('Camera enabled');
    startCanvasDrawLoop();
  } catch (err) {
    showToast('Camera permission denied');
  }
}

function disableCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }
  dom.videoFeed.srcObject = null;
  dom.videoFeed.style.display = 'none';
  dom.cameraPlaceholder.style.display = 'flex';
  dom.poseCanvas.style.display = 'none';
  state.cameraActive = false;
  dom.btnCamera.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 6h1.5L5 4h8l1.5 2H16a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 012-1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <circle cx="9" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>
    Enable Camera`;
  dom.btnCamera.style.color = '';
  dom.statusDot.className = 'status-dot';
  dom.btnStart.disabled = true;
  if (state.isRunning) stopWorkout();
  showToast('Camera disabled');
}

// ─── CANVAS DRAW (Placeholder skeleton effect) ───────────────
function startCanvasDrawLoop() {
  const canvas = dom.poseCanvas;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let frame = 0;
  function draw() {
    if (!state.cameraActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    if (state.isRunning) {
      drawSkeletonOverlay(ctx, canvas, frame);
      simulateStats(frame);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function drawSkeletonOverlay(ctx, canvas, frame) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const t = frame * 0.04;

  // Animated skeleton points (simulated human pose)
  const bobY = Math.sin(t) * 8;
  const armSwing = Math.sin(t * 1.5) * 15;

  const pts = {
    head:    [cx, cy - 120 + bobY],
    neck:    [cx, cy - 90 + bobY],
    lShoulder: [cx - 45 + armSwing * 0.3, cy - 70 + bobY],
    rShoulder: [cx + 45 - armSwing * 0.3, cy - 70 + bobY],
    lElbow:  [cx - 70 + armSwing, cy - 30 + bobY],
    rElbow:  [cx + 70 - armSwing, cy - 30 + bobY],
    lWrist:  [cx - 80 + armSwing * 1.3, cy + 10 + bobY],
    rWrist:  [cx + 80 - armSwing * 1.3, cy + 10 + bobY],
    hip:     [cx, cy + 10 + bobY * 0.4],
    lHip:    [cx - 28, cy + 10 + bobY * 0.4],
    rHip:    [cx + 28, cy + 10 + bobY * 0.4],
    lKnee:   [cx - 35, cy + 75 + Math.sin(t * 1.2) * 5],
    rKnee:   [cx + 35, cy + 75 + Math.sin(t * 1.2 + 1) * 5],
    lAnkle:  [cx - 32, cy + 140],
    rAnkle:  [cx + 32, cy + 140],
  };

  const connections = [
    ['head', 'neck'], ['neck', 'lShoulder'], ['neck', 'rShoulder'],
    ['lShoulder', 'lElbow'], ['lElbow', 'lWrist'],
    ['rShoulder', 'rElbow'], ['rElbow', 'rWrist'],
    ['neck', 'hip'], ['hip', 'lHip'], ['hip', 'rHip'],
    ['lHip', 'lKnee'], ['lKnee', 'lAnkle'],
    ['rHip', 'rKnee'], ['rKnee', 'rAnkle'],
  ];

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(232,255,71,0.7)';
  ctx.lineCap = 'round';

  connections.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(...pts[a]);
    ctx.lineTo(...pts[b]);
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(232,255,71,0.9)';
  Object.values(pts).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw joint angle indicator at elbow
  const angle = 90 + Math.sin(t) * 45;
  ctx.fillStyle = 'rgba(71,200,255,0.9)';
  ctx.font = '700 12px JetBrains Mono, monospace';
  ctx.fillText(`${Math.round(angle)}°`, pts.rElbow[0] + 10, pts.rElbow[1]);
}

function simulateStats(frame) {
  if (!state.isRunning) return;
  const t = frame * 0.04;

  // Simulate angle based on exercise
  const angle = Math.round(90 + Math.sin(t) * 50);
  dom.statAngle.textContent = angle + '°';

  // Simulate rep count
  const cycleLen = 80;
  const cycle = frame % cycleLen;
  if (cycle === cycleLen - 1) {
    state.reps++;
    dom.statReps.textContent = state.reps;
    dom.repBig.textContent = state.reps;
    state.repOverlay = dom.repOverlay;
    dom.repOverlay.classList.add('visible');

    // Check set completion
    const repsPerSet = 10;
    if (state.reps > 0 && state.reps % repsPerSet === 0) {
      state.completedSets++;
      if (state.completedSets >= state.sets) {
        showToast('🎉 All sets complete!');
        stopWorkout();
        return;
      } else {
        showToast(`✅ Set ${state.completedSets} done! Rest 30s`);
      }
      updateSetsDone();
    }
  }

  // Simulate form status
  const isGoodForm = (angle > 60 && angle < 150);
  if (isGoodForm) {
    dom.statForm.textContent = 'Correct';
    dom.statForm.className = 'stat-value form-badge correct';
  } else {
    dom.statForm.textContent = 'Fix Form';
    dom.statForm.className = 'stat-value form-badge fix-form';
  }

  // Simulate accuracy
  const acc = Math.round(65 + Math.sin(t * 0.5) * 20 + Math.random() * 5);
  const clampedAcc = Math.min(100, Math.max(0, acc));
  updateAccuracy(clampedAcc);

  // Calories (rough estimate: ~5 cal/min for moderate exercise)
  state.calories = Math.round(state.duration * 5 / 60 * 1.2);
  dom.statCalories.textContent = state.calories + ' kcal';
}

// ─── WORKOUT CONTROL ─────────────────────────────────────────
function toggleWorkout() {
  if (state.isRunning) {
    stopWorkout();
  } else {
    startWorkout();
  }
}

function startWorkout() {
  if (!state.selectedExercise) {
    showToast('Please select an exercise first');
    return;
  }
  if (!state.cameraActive) {
    showToast('Please enable camera first');
    return;
  }

  state.isRunning = true;
  state.duration = 0;
  dom.btnStart.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="3" width="4" height="12" rx="1" fill="currentColor"/>
      <rect x="10" y="3" width="4" height="12" rx="1" fill="currentColor"/>
    </svg>
    Pause`;
  dom.statusDot.className = 'status-dot active';
  dom.repOverlay.classList.add('visible');

  state.timerInterval = setInterval(() => {
    state.duration++;
    const mins = String(Math.floor(state.duration / 60)).padStart(2, '0');
    const secs = String(state.duration % 60).padStart(2, '0');
    dom.statDuration.textContent = `${mins}:${secs}`;
  }, 1000);

  showToast(`Started: ${state.selectedExercise}`);
}

function stopWorkout() {
  state.isRunning = false;
  clearInterval(state.timerInterval);
  dom.btnStart.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polygon points="5,3 15,9 5,15" fill="currentColor"/>
    </svg>
    Start`;
  dom.statusDot.className = 'status-dot';
}

function resetWorkout() {
  stopWorkout();
  state.reps = 0;
  state.completedSets = 0;
  state.accuracy = 0;
  state.duration = 0;
  state.calories = 0;

  dom.statReps.textContent = '0';
  dom.repBig.textContent = '0';
  dom.repOverlay.classList.remove('visible');
  dom.statAngle.textContent = '0°';
  dom.statForm.textContent = 'Idle';
  dom.statForm.className = 'stat-value form-badge';
  dom.statDuration.textContent = '00:00';
  dom.statCalories.textContent = '0 kcal';
  updateAccuracy(0);
  updateSetsDone();
  showToast('Workout reset');
}

// ─── SET CONTROLS ─────────────────────────────────────────────
function setupSetControls() {
  dom.setMinus.addEventListener('click', () => {
    if (state.sets > 1) {
      state.sets--;
      updateSetsDisplay();
    }
  });
  dom.setPlus.addEventListener('click', () => {
    if (state.sets < 6) {
      state.sets++;
      updateSetsDisplay();
    }
  });
}

function updateSetsDisplay() {
  dom.setValueDisplay.textContent = state.sets;
  dom.setInfo.textContent = `${state.sets} sets selected`;
  updateSetsDone();
}

function updateSetsDone() {
  dom.statSetsDone.textContent = `${state.completedSets} / ${state.sets}`;
}

// ─── ACCURACY ─────────────────────────────────────────────────
function updateAccuracy(val) {
  state.accuracy = val;
  dom.accuracyBar.style.width = val + '%';
  dom.accuracyValue.textContent = val + '%';
}

// ─── WEEKLY PLAN ─────────────────────────────────────────────
function renderWeeklyPlan() {
  dom.weeklyGrid.innerHTML = '';
  WEEKLY_PLAN.forEach((day, dayIndex) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.animationDelay = (dayIndex * 0.06) + 's';

    const exercisesHTML = day.exercises.map((ex, exIndex) => {
      if (ex.sets === 0) {
        return `<div class="day-exercise-row">
          <span class="ex-row-name">${ex.name}</span>
        </div>`;
      }
      return `<div class="day-exercise-row">
        <span class="ex-row-name">${ex.name}</span>
        <div class="ex-row-sets">
          <button class="set-mini-btn" data-day="${dayIndex}" data-ex="${exIndex}" data-dir="-1">−</button>
          <span class="set-mini-val" id="minival-${dayIndex}-${exIndex}">${ex.sets}</span>
          <button class="set-mini-btn" data-day="${dayIndex}" data-ex="${exIndex}" data-dir="1">+</button>
        </div>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="day-card-header">
        <span class="day-number">Day ${day.day}</span>
        <span class="day-name">${day.name}</span>
        <span class="day-tag">${day.tag}</span>
      </div>
      <div class="day-exercises">${exercisesHTML}</div>
      ${day.note ? `<div class="day-card-footer"><p class="day-note">${day.note}</p></div>` : ''}
    `;

    dom.weeklyGrid.appendChild(card);
  });

  // Mini set buttons
  dom.weeklyGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.set-mini-btn');
    if (!btn) return;
    const dayIdx = parseInt(btn.dataset.day);
    const exIdx = parseInt(btn.dataset.ex);
    const dir = parseInt(btn.dataset.dir);
    const ex = WEEKLY_PLAN[dayIdx].exercises[exIdx];
    if (ex.sets === undefined) return;
    ex.sets = Math.min(6, Math.max(1, ex.sets + dir));
    const valEl = document.getElementById(`minival-${dayIdx}-${exIdx}`);
    if (valEl) valEl.textContent = ex.sets;
  });
}

// ─── PROFILE ─────────────────────────────────────────────────
function loadProfile() {
  const saved = localStorage.getItem('awt_profile');
  if (saved) {
    try {
      state.profile = JSON.parse(saved);
      applyProfileToUI();
    } catch (e) {
      state.profile = null;
    }
  }
}

function applyProfileToUI() {
  if (!state.profile) return;
  const p = state.profile;

  if (p.name) {
    dom.welcomeText.textContent = `Welcome, ${p.name.split(' ')[0]}`;
    dom.profileDisplayName.textContent = p.name;
    dom.profileAvatar.textContent = p.name.charAt(0).toUpperCase();
  }

  if (p.goal) {
    dom.profileGoalTag.textContent = GOAL_LABELS[p.goal] || p.goal;
    dom.goalBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.goal === p.goal);
    });
  }

  if (p.name) dom.profileName.value = p.name;
  if (p.age) dom.profileAge.value = p.age;
  if (p.weight) dom.profileWeight.value = p.weight;
  if (p.height) dom.profileHeight.value = p.height;
}

function setupProfileForm() {
  let selectedGoal = state.profile?.goal || null;

  dom.goalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGoal = btn.dataset.goal;
      dom.goalBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  dom.profileName.addEventListener('input', () => {
    const v = dom.profileName.value.trim();
    dom.profileAvatar.textContent = v ? v.charAt(0).toUpperCase() : '?';
    dom.profileDisplayName.textContent = v || 'Set up your profile';
  });

  dom.btnSaveProfile.addEventListener('click', () => {
    const profile = {
      name: dom.profileName.value.trim(),
      age: dom.profileAge.value,
      weight: dom.profileWeight.value,
      height: dom.profileHeight.value,
      goal: selectedGoal,
    };

    if (!profile.name) {
      showToast('Please enter your name');
      return;
    }

    state.profile = profile;
    localStorage.setItem('awt_profile', JSON.stringify(profile));
    applyProfileToUI();

    dom.saveStatus.textContent = '✓ Profile saved';
    dom.saveStatus.style.opacity = '1';
    setTimeout(() => { dom.saveStatus.style.opacity = '0'; }, 2500);

    showToast('Profile saved!');
  });
}

// ─── DOWNLOAD PDF ─────────────────────────────────────────────
function setupDownloadBtn() {
  dom.btnDownloadPDF.addEventListener('click', () => {
    if (typeof generatePDF === 'function') {
      generatePDF(state.profile, WEEKLY_PLAN, GOAL_LABELS);
    } else {
      showToast('PDF generator not loaded');
    }
  });
}

// ─── TOAST ───────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 2400);
}

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
