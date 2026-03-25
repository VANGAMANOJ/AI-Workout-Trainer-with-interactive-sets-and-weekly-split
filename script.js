/* ============================================================
   AI WORKOUT TRAINER — script.js
   Full application logic: Entry, Profile, Dashboard, Weekly,
   Navigation, Camera, Stats, Theme
   ============================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
const APP = {
  profile: null,
  theme: 'dark',
  currentPage: 'dashboard',
  selectedExercise: null,
  sets: 3,
  cameraOn: false,
  running: false,
  reps: 0,
  completedSets: 0,
  accuracy: 0,
  duration: 0,
  calories: 0,
  timerID: null,
  drawLoopActive: false,
  stream: null,
  selectedGoal: null,
  editGoal: null,
};

// ═══════════════════════════════════════════════════════════════
// WEEKLY DATA
// ═══════════════════════════════════════════════════════════════
const WEEKLY_PLAN = [
  {
    day: 1, name: 'Chest & Triceps', tag: 'Push Day',
    exercises: [
      { name: 'Incline Bench Press', sets: 4 }, { name: 'Flat Bench Press', sets: 3 },
      { name: 'Dumbbell Fly', sets: 3 }, { name: 'Push-ups', sets: 3 },
      { name: 'Cable Tricep Extension', sets: 3 }, { name: 'Close Grip Bench', sets: 3 },
      { name: 'Dips', sets: 3 },
    ],
    note: null,
  },
  {
    day: 2, name: 'Back & Biceps', tag: 'Pull Day',
    exercises: [
      { name: 'Lat Pulldown', sets: 4 }, { name: 'Bent Over Row', sets: 4 },
      { name: 'Pull-ups', sets: 3 }, { name: 'Dumbbell Row', sets: 3 },
      { name: 'Barbell Row', sets: 3 }, { name: 'Dumbbell Curl', sets: 3 },
      { name: 'Hammer Curl', sets: 3 }, { name: 'Preacher Curl', sets: 3 },
    ],
    note: null,
  },
  {
    day: 3, name: 'Shoulders & Traps', tag: 'Push Day',
    exercises: [
      { name: 'Shoulder Press', sets: 4 }, { name: 'Dumbbell Side Raises', sets: 4 },
      { name: 'Front Raises', sets: 3 }, { name: 'Rear Delt Fly', sets: 3 },
      { name: 'Trap Shrugs', sets: 4 },
    ],
    note: null,
  },
  {
    day: 4, name: 'Legs', tag: 'Leg Day',
    exercises: [
      { name: 'Squats', sets: 4 }, { name: 'Leg Press', sets: 4 },
      { name: 'Lunges', sets: 3 }, { name: 'Leg Extension', sets: 3 },
      { name: 'Hamstring Curl', sets: 3 }, { name: 'Calf Raises', sets: 4 },
    ],
    note: null,
  },
  {
    day: 5, name: 'Active Recovery', tag: 'Suggestion',
    exercises: [
      { name: 'Repeat Day 1 or Day 2', sets: 3 },
      { name: 'Light Cardio (20 min)', sets: 1 },
      { name: 'Full Body Stretching', sets: 1 },
    ],
    note: 'Repeat a previous session or go for a lighter alternative.',
  },
  {
    day: 6, name: 'Weak Area Focus', tag: 'Variation',
    exercises: [
      { name: 'Target Weakest Muscle Group', sets: 4 },
      { name: 'Accessory Exercises', sets: 3 },
      { name: 'Core & Abs Work', sets: 3 },
      { name: 'Mobility Training', sets: 2 },
    ],
    note: 'Focus on underdeveloped areas or add variation to challenge adaptation.',
  },
  {
    day: 7, name: 'Your Choice', tag: 'User Decision',
    exercises: [
      { name: '🛌 Full Rest Day', sets: 0 },
      { name: '🔄 Repeat Favourite Day', sets: 3 },
      { name: '🆕 Try a New Routine', sets: 3 },
    ],
    note: 'Rest, repeat, or explore something new. Your call!',
  },
];

const GOAL_LABELS = {
  'fat-loss': '🔥 Fat Loss', 'muscle-gain': '💪 Muscle Gain',
  'strength': '🏋 Strength', 'endurance': '🏃 Endurance',
  'full-fitness': '🌟 Full Fitness', 'lean': '✂ Lean Body',
  'beginner': '🌱 Beginner', 'athletic': '⚡ Athletic',
  'home': '🏠 Home Workout', 'gym': '🏛 Gym Workout',
};

// ═══════════════════════════════════════════════════════════════
// DOM REFS
// ═══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadProfile();
  bindEntry();
  bindNavbar();
  bindDashboard();
  bindProfile();
  renderWeekly();
});

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
function loadTheme() {
  const saved = localStorage.getItem('awt_theme') || 'dark';
  APP.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  const tog = $('themeToggle');
  if (tog) tog.checked = (saved === 'light');
}

function bindThemeToggle() {
  const tog = $('themeToggle');
  if (!tog) return;
  tog.addEventListener('change', () => {
    APP.theme = tog.checked ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', APP.theme);
    localStorage.setItem('awt_theme', APP.theme);
  });
}

// ═══════════════════════════════════════════════════════════════
// ENTRY SCREEN
// ═══════════════════════════════════════════════════════════════
function bindEntry() {
  $('btnCreateProfile').addEventListener('click', () => {
    openModal();
  });

  $('btnSkip').addEventListener('click', () => {
    launchApp();
  });
}

function launchApp() {
  $('entryScreen').classList.add('hidden');
  $('mainApp').classList.remove('hidden');
  bindThemeToggle();
  updateWelcome();
}

// ═══════════════════════════════════════════════════════════════
// PROFILE MODAL
// ═══════════════════════════════════════════════════════════════
function openModal() {
  $('profileModal').classList.remove('hidden');
  bindGoalChips('goalChips', (g) => { APP.selectedGoal = g; });
}

function closeModal() {
  $('profileModal').classList.add('hidden');
}

function bindEntry_modal() {
  $('modalClose').addEventListener('click', () => {
    closeModal();
    launchApp();
  });

  $('btnSaveProfile').addEventListener('click', () => {
    const name = $('inp-name').value.trim();
    if (!name) { toast('Please enter your name'); return; }

    APP.profile = {
      name,
      age: $('inp-age').value,
      weight: $('inp-weight').value,
      height: $('inp-height').value,
      goal: APP.selectedGoal,
    };

    localStorage.setItem('awt_profile', JSON.stringify(APP.profile));
    closeModal();
    launchApp();
    syncProfilePage();
    toast('Profile saved! Let\'s train 🔥');
  });
}

// ─── Bind modal buttons on init (before app launch) ──────────
$('modalClose').addEventListener('click', () => { closeModal(); launchApp(); });
$('btnSaveProfile').addEventListener('click', () => {
  const name = $('inp-name').value.trim();
  if (!name) { toast('Please enter your name'); return; }
  APP.profile = {
    name,
    age: $('inp-age').value,
    weight: $('inp-weight').value,
    height: $('inp-height').value,
    goal: APP.selectedGoal,
  };
  localStorage.setItem('awt_profile', JSON.stringify(APP.profile));
  closeModal();
  launchApp();
  syncProfilePage();
  toast('Profile saved! Let\'s train 🔥');
});

// ═══════════════════════════════════════════════════════════════
// LOAD PROFILE
// ═══════════════════════════════════════════════════════════════
function loadProfile() {
  const raw = localStorage.getItem('awt_profile');
  if (raw) {
    try { APP.profile = JSON.parse(raw); } catch { APP.profile = null; }
  }
}

function updateWelcome() {
  const el = $('navWelcome');
  if (!el) return;
  if (APP.profile?.name) {
    el.textContent = `Hi, ${APP.profile.name.split(' ')[0]}`;
  } else {
    el.textContent = 'Guest';
  }
  syncProfilePage();
}

function syncProfilePage() {
  if (!APP.profile) return;
  const p = APP.profile;

  // Profile page card
  const av = $('ppAvatar');
  if (av) av.textContent = p.name ? p.name.charAt(0).toUpperCase() : '?';
  const nm = $('ppName');
  if (nm) nm.textContent = p.name || 'Guest';
  const gt = $('ppGoalTag');
  if (gt) gt.textContent = GOAL_LABELS[p.goal] || 'No goal set';

  const ppAge = $('ppAge');
  const ppW = $('ppWeight');
  const ppH = $('ppHeight');
  if (ppAge) ppAge.textContent = p.age ? `${p.age}y` : '—';
  if (ppW) ppW.textContent = p.weight ? `${p.weight}kg` : '—';
  if (ppH) ppH.textContent = p.height ? `${p.height}cm` : '—';

  // Edit fields
  const en = $('edit-name'), ea = $('edit-age'), ew = $('edit-weight'), eh = $('edit-height');
  if (en) en.value = p.name || '';
  if (ea) ea.value = p.age || '';
  if (ew) ew.value = p.weight || '';
  if (eh) eh.value = p.height || '';

  // Edit goal chips
  if (p.goal) {
    APP.editGoal = p.goal;
    $$('#editGoalChips .goal-chip').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.goal === p.goal);
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════
function bindNavbar() {
  // Nav link routing
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // Hamburger
  $('navHamburger').addEventListener('click', () => {
    $('navLinks').classList.toggle('open');
  });

  // PDF
  $('btnPDF').addEventListener('click', () => {
    if (typeof generatePDF === 'function') {
      generatePDF(APP.profile, WEEKLY_PLAN, GOAL_LABELS);
    } else {
      toast('PDF engine not ready');
    }
  });
}

function navigateTo(pageId) {
  APP.currentPage = pageId;

  // Update nav links
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));

  // Update pages
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Close hamburger menu
  $('navLinks').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════
// GOAL CHIPS (generic)
// ═══════════════════════════════════════════════════════════════
function bindGoalChips(containerId, onSelect) {
  $$(` #${containerId} .goal-chip`).forEach(btn => {
    btn.addEventListener('click', () => {
      $$(` #${containerId} .goal-chip`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onSelect(btn.dataset.goal);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function bindDashboard() {
  // Exercise list
  $$('#exerciseList .ex-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('#exerciseList .ex-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      selectExercise(item.dataset.ex);
    });
  });

  // Set controls
  $('setInc').addEventListener('click', () => {
    if (APP.sets < 6) { APP.sets++; updateSetDisplay(); }
  });
  $('setDec').addEventListener('click', () => {
    if (APP.sets > 1) { APP.sets--; updateSetDisplay(); }
  });

  // Camera controls
  $('btnCam').addEventListener('click', toggleCamera);
  $('btnStart').addEventListener('click', toggleWorkout);
  $('btnReset').addEventListener('click', resetAll);
}

function selectExercise(name) {
  APP.selectedExercise = name;
  APP.reps = 0;
  APP.accuracy = 0;
  APP.completedSets = 0;

  $('selectedChip').textContent = name;
  $('stExercise').textContent = name;
  $('stReps').textContent = '0';
  $('stAngle').textContent = '0°';
  setFormStatus('Idle');
  setAccuracy(0);
  $('repNumber').textContent = '0';
  $('camMsg').textContent = `${name} — press Enable Camera`;
  updateSessionBar();

  if (APP.cameraOn) $('btnStart').disabled = false;
  toast(`Selected: ${name}`);
}

function updateSetDisplay() {
  $('setVal').textContent = APP.sets;
  updateSessionBar();
}

function updateSessionBar() {
  const mins = String(Math.floor(APP.duration / 60)).padStart(2, '0');
  const secs = String(APP.duration % 60).padStart(2, '0');
  $('siTime').textContent = `${mins}:${secs}`;
  $('siCal').textContent = `${APP.calories} kcal`;
  $('siSets').textContent = `${APP.completedSets}/${APP.sets}`;
  $('setHudVal').textContent = `${APP.completedSets + 1}/${APP.sets}`;
}

// ── FORM STATUS ───────────────────────────────────────────────
function setFormStatus(status) {
  const el = $('stForm');
  el.textContent = status;
  el.className = 'form-pill';
  if (status === 'Correct') el.classList.add('correct');
  else if (status === 'Fix Form') el.classList.add('fix');
}

// ── ACCURACY ─────────────────────────────────────────────────
function setAccuracy(val) {
  APP.accuracy = Math.min(100, Math.max(0, val));
  $('accFill').style.width = APP.accuracy + '%';
  $('accPct').textContent = APP.accuracy + '%';
}

// ═══════════════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════════════
async function toggleCamera() {
  if (APP.cameraOn) {
    disableCamera();
  } else {
    await enableCamera();
  }
}

async function enableCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    APP.stream = stream;
    APP.cameraOn = true;

    const vid = $('videoFeed');
    vid.srcObject = stream;
    vid.style.display = 'block';
    $('camPlaceholder').style.display = 'none';
    $('poseCanvas').style.display = 'block';

    $('btnCam').innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="9" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
      Camera Off`;
    $('btnCam').style.color = '#FF4444';
    $('liveDot').className = 'live-dot on';

    if (APP.selectedExercise) $('btnStart').disabled = false;

    startDrawLoop();
    toast('Camera enabled ✓');
  } catch {
    toast('Camera permission denied');
  }
}

function disableCamera() {
  if (APP.stream) {
    APP.stream.getTracks().forEach(t => t.stop());
    APP.stream = null;
  }
  APP.cameraOn = false;
  APP.drawLoopActive = false;

  const vid = $('videoFeed');
  vid.srcObject = null;
  vid.style.display = 'none';
  $('camPlaceholder').style.display = 'flex';
  $('poseCanvas').style.display = 'none';

  $('btnCam').innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 5.5h1.5L5 3.5h8l1.5 2H17a1 1 0 011 1v8a1 1 0 01-1 1H1a1 1 0 01-1-1v-8a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <circle cx="9" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>
    Enable Camera`;
  $('btnCam').style.color = '';
  $('liveDot').className = 'live-dot';
  $('btnStart').disabled = true;

  if (APP.running) stopWorkout();
  toast('Camera off');
}

// ── CANVAS DRAW LOOP ──────────────────────────────────────────
function startDrawLoop() {
  const canvas = $('poseCanvas');
  const ctx = canvas.getContext('2d');
  APP.drawLoopActive = true;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let frame = 0;
  function loop() {
    if (!APP.cameraOn || !APP.drawLoopActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    if (APP.running) {
      drawPoseSkeleton(ctx, canvas, frame);
      runSimulation(frame);
    }

    requestAnimationFrame(loop);
  }
  loop();
}

function drawPoseSkeleton(ctx, canvas, frame) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const t = frame * 0.045;
  const bob = Math.sin(t) * 10;
  const swing = Math.sin(t * 1.4) * 18;

  const pts = {
    head:      [cx, cy - 125 + bob],
    neck:      [cx, cy - 95 + bob],
    lShoulder: [cx - 48 + swing * 0.2, cy - 72 + bob],
    rShoulder: [cx + 48 - swing * 0.2, cy - 72 + bob],
    lElbow:    [cx - 76 + swing, cy - 32 + bob],
    rElbow:    [cx + 76 - swing, cy - 32 + bob],
    lWrist:    [cx - 88 + swing * 1.4, cy + 8 + bob],
    rWrist:    [cx + 88 - swing * 1.4, cy + 8 + bob],
    hip:       [cx, cy + 14 + bob * 0.3],
    lHip:      [cx - 30, cy + 14 + bob * 0.3],
    rHip:      [cx + 30, cy + 14 + bob * 0.3],
    lKnee:     [cx - 38, cy + 78 + Math.sin(t * 1.1) * 6],
    rKnee:     [cx + 38, cy + 78 + Math.sin(t * 1.1 + 1) * 6],
    lAnkle:    [cx - 36, cy + 145],
    rAnkle:    [cx + 36, cy + 145],
  };

  const bones = [
    ['head','neck'],['neck','lShoulder'],['neck','rShoulder'],
    ['lShoulder','lElbow'],['lElbow','lWrist'],
    ['rShoulder','rElbow'],['rElbow','rWrist'],
    ['neck','hip'],['hip','lHip'],['hip','rHip'],
    ['lHip','lKnee'],['lKnee','lAnkle'],
    ['rHip','rKnee'],['rKnee','rAnkle'],
  ];

  // Draw bones
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,107,43,0.75)';

  bones.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(...pts[a]);
    ctx.lineTo(...pts[b]);
    ctx.stroke();
  });

  // Draw joints
  Object.entries(pts).forEach(([key, [x, y]]) => {
    ctx.beginPath();
    ctx.arc(x, y, key === 'head' ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = key === 'head' ? 'rgba(255,107,43,0.9)' : 'rgba(0,229,255,0.9)';
    ctx.fill();
  });

  // Angle annotation
  const angle = Math.round(90 + Math.sin(t) * 52);
  ctx.fillStyle = 'rgba(0,229,255,1)';
  ctx.font = 'bold 13px JetBrains Mono, monospace';
  ctx.fillText(`${angle}°`, pts.rElbow[0] + 12, pts.rElbow[1] - 4);

  // Exercise label
  if (APP.selectedExercise) {
    ctx.fillStyle = 'rgba(255,107,43,0.85)';
    ctx.font = 'bold 13px Orbitron, monospace';
    ctx.fillText(APP.selectedExercise.toUpperCase(), 12, 22);
  }
}

function runSimulation(frame) {
  const t = frame * 0.045;
  const angle = Math.round(90 + Math.sin(t) * 52);

  $('stAngle').textContent = `${angle}°`;

  // Rep detection
  if (frame % 78 === 77) {
    APP.reps++;
    $('stReps').textContent = APP.reps;
    $('repNumber').textContent = APP.reps;

    animateRepFlash();

    if (APP.reps > 0 && APP.reps % 10 === 0) {
      APP.completedSets++;
      if (APP.completedSets >= APP.sets) {
        toast('🎉 All sets complete! Well done!');
        stopWorkout();
        return;
      } else {
        toast(`✅ Set ${APP.completedSets} done! Rest 30s`);
      }
      updateSessionBar();
    }
  }

  // Form status
  const goodForm = angle > 55 && angle < 148;
  setFormStatus(goodForm ? 'Correct' : 'Fix Form');

  // Accuracy
  const rawAcc = 60 + Math.sin(t * 0.6) * 22 + Math.random() * 8;
  setAccuracy(Math.round(rawAcc));

  // Calories
  APP.calories = Math.round(APP.duration * 5.5 / 60);
  updateSessionBar();
}

function animateRepFlash() {
  const el = $('repNumber');
  el.style.transform = 'scale(1.4)';
  el.style.transition = 'transform 0.15s';
  setTimeout(() => {
    el.style.transform = 'scale(1)';
  }, 150);
}

// ═══════════════════════════════════════════════════════════════
// WORKOUT CONTROLS
// ═══════════════════════════════════════════════════════════════
function toggleWorkout() {
  if (APP.running) stopWorkout();
  else startWorkout();
}

function startWorkout() {
  if (!APP.selectedExercise) { toast('Pick an exercise first'); return; }
  if (!APP.cameraOn) { toast('Enable camera first'); return; }

  APP.running = true;
  APP.duration = 0;

  $('btnStart').innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="4.5" height="14" rx="1" fill="currentColor"/>
      <rect x="10.5" y="2" width="4.5" height="14" rx="1" fill="currentColor"/>
    </svg>
    Pause`;

  $('liveDot').className = 'live-dot on';
  $('repHud').classList.add('show');
  $('setHud').classList.add('show');

  APP.timerID = setInterval(() => {
    APP.duration++;
    updateSessionBar();
  }, 1000);

  toast(`Training: ${APP.selectedExercise}`);
}

function stopWorkout() {
  APP.running = false;
  clearInterval(APP.timerID);

  $('btnStart').innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polygon points="4,2 16,9 4,16" fill="currentColor"/>
    </svg>
    Start`;

  $('liveDot').className = APP.cameraOn ? 'live-dot on' : 'live-dot';
}

function resetAll() {
  stopWorkout();

  APP.reps = 0;
  APP.completedSets = 0;
  APP.accuracy = 0;
  APP.duration = 0;
  APP.calories = 0;

  $('stReps').textContent = '0';
  $('repNumber').textContent = '0';
  $('repHud').classList.remove('show');
  $('setHud').classList.remove('show');
  $('stAngle').textContent = '0°';
  setFormStatus('Idle');
  setAccuracy(0);
  updateSessionBar();

  toast('Reset ✓');
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY PLAN RENDER
// ═══════════════════════════════════════════════════════════════
function renderWeekly() {
  const grid = $('weeklyGrid');
  if (!grid) return;
  grid.innerHTML = '';

  WEEKLY_PLAN.forEach((day, di) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.animationDelay = `${di * 0.07}s`;

    const exRows = day.exercises.map((ex, ei) => {
      if (!ex.sets) {
        return `<div class="dc-ex-row"><span class="dc-ex-name">${ex.name}</span></div>`;
      }
      return `<div class="dc-ex-row">
        <span class="dc-ex-name">${ex.name}</span>
        <div class="dc-ex-sets">
          <button class="ds-btn" data-di="${di}" data-ei="${ei}" data-d="-1">−</button>
          <span class="ds-val" id="dv-${di}-${ei}">${ex.sets}</span>
          <button class="ds-btn" data-di="${di}" data-ei="${ei}" data-d="1">+</button>
        </div>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="dc-head">
        <span class="dc-day">Day ${day.day}</span>
        <span class="dc-name">${day.name}</span>
        <span class="dc-tag">${day.tag}</span>
      </div>
      <div class="dc-exes">${exRows}</div>
      ${day.note ? `<p class="dc-note">${day.note}</p>` : ''}
    `;

    grid.appendChild(card);
  });

  // Set buttons in weekly
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.ds-btn');
    if (!btn) return;
    const di = +btn.dataset.di, ei = +btn.dataset.ei, dir = +btn.dataset.d;
    const ex = WEEKLY_PLAN[di].exercises[ei];
    if (ex.sets === undefined || ex.sets === 0) return;
    ex.sets = Math.min(6, Math.max(1, ex.sets + dir));
    const el = document.getElementById(`dv-${di}-${ei}`);
    if (el) el.textContent = ex.sets;
  });
}

// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE (EDIT)
// ═══════════════════════════════════════════════════════════════
function bindProfile() {
  bindGoalChips('editGoalChips', g => { APP.editGoal = g; });

  $('btnEditSave').addEventListener('click', () => {
    const name = $('edit-name').value.trim();
    if (!name) { toast('Name is required'); return; }

    APP.profile = {
      name,
      age: $('edit-age').value,
      weight: $('edit-weight').value,
      height: $('edit-height').value,
      goal: APP.editGoal || APP.profile?.goal,
    };

    localStorage.setItem('awt_profile', JSON.stringify(APP.profile));
    syncProfilePage();
    updateWelcome();

    const st = $('pecStatus');
    st.textContent = '✓ Profile updated';
    st.style.opacity = '1';
    setTimeout(() => { st.style.opacity = '0'; }, 2800);

    toast('Profile updated!');
  });

  syncProfilePage();
}

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════
let toastTimer;
function toast(msg) {
  clearTimeout(toastTimer);
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('visible');
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}
