/* ============================================================
   FitHome — script.js
   Real pose tracking via MediaPipe Pose
   Angle-based rep counting, form correction, voice feedback
   ============================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Day → workout mapping (0=Sunday)
const DAY_WORKOUT = {
  1: { focus: 'Chest & Triceps', exercises: ['Push-up', 'Dumbbell Fly', 'Tricep Dip', 'Incline Push-up', 'Diamond Push-up'] },
  2: { focus: 'Back & Biceps',   exercises: ['Bicep Curl', 'Reverse Row', 'Superman Hold', 'Hammer Curl', 'Back Extension'] },
  3: { focus: 'Shoulders',       exercises: ['Shoulder Press', 'Lateral Raise', 'Front Raise', 'Upright Row', 'Arm Circles'] },
  4: { focus: 'Legs',            exercises: ['Squat', 'Lunge', 'Glute Bridge', 'Calf Raise', 'Step-up'] },
  5: { focus: 'Cardio & Core',   exercises: ['High Knees', 'Jumping Jacks', 'Plank', 'Mountain Climber', 'Burpee'] },
  6: { focus: 'Full Body',       exercises: ['Squat', 'Push-up', 'Lunge', 'Plank', 'Bicep Curl'] },
  0: null, // Sunday = user choice
};

// MediaPipe landmark indices
const MP = {
  NOSE:0, L_EYE_IN:1, L_EYE:2, L_EYE_OUT:3,
  R_EYE_IN:4, R_EYE:5, R_EYE_OUT:6,
  L_EAR:7, R_EAR:8, MOUTH_L:9, MOUTH_R:10,
  L_SHOULDER:11, R_SHOULDER:12,
  L_ELBOW:13, R_ELBOW:14,
  L_WRIST:15, R_WRIST:16,
  L_PINKY:17, R_PINKY:18,
  L_INDEX:19, R_INDEX:20,
  L_THUMB:21, R_THUMB:22,
  L_HIP:23, R_HIP:24,
  L_KNEE:25, R_KNEE:26,
  L_ANKLE:27, R_ANKLE:28,
  L_HEEL:29, R_HEEL:30,
  L_FOOT:31, R_FOOT:32,
};

// Exercise tracking configs
const EX_CONFIG = {
  'Bicep Curl': {
    icon: '💪', muscle: 'Biceps · Arms',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackBicepCurl,
    instruction: 'Stand facing camera. Keep elbows tight to your sides. Curl both arms up fully, then lower completely.',
    calibrationNote: 'Stand with arms fully extended at sides. Hold 3 seconds.',
  },
  'Squat': {
    icon: '🦵', muscle: 'Quads · Glutes · Legs',
    repsTarget: 15, sets: 3, restSec: 60,
    track: trackSquat,
    instruction: 'Stand shoulder-width. Lower until thighs are parallel to floor. Keep back straight.',
    calibrationNote: 'Stand upright with arms at sides. Hold 3 seconds.',
  },
  'Push-up': {
    icon: '🤜', muscle: 'Chest · Triceps · Shoulders',
    repsTarget: 10, sets: 3, restSec: 60,
    track: trackPushup,
    instruction: 'Place phone sideways so full body is visible. Lower chest to floor, then push up fully.',
    calibrationNote: 'Get into high plank. Hold 3 seconds.',
  },
  'Lunge': {
    icon: '🏃', muscle: 'Quads · Glutes · Balance',
    repsTarget: 10, sets: 3, restSec: 45,
    track: trackLunge,
    instruction: 'Step forward with one leg, lower back knee toward floor. Alternate sides.',
    calibrationNote: 'Stand upright, feet together. Hold 3 seconds.',
  },
  'Shoulder Press': {
    icon: '🙌', muscle: 'Deltoids · Traps',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackShoulderPress,
    instruction: 'Raise arms overhead fully, then lower to shoulder height. Keep core tight.',
    calibrationNote: 'Stand with arms at shoulders, elbows bent. Hold 3 seconds.',
  },
  'Plank': {
    icon: '🧘', muscle: 'Core · Abs · Shoulders',
    repsTarget: 30, sets: 3, restSec: 30,
    isTimer: true,
    track: trackPlank,
    instruction: 'Hold body straight as a plank. Keep hips level. Breathe steadily.',
    calibrationNote: 'Get into plank position. Hold 3 seconds.',
  },
  'High Knees': {
    icon: '🔥', muscle: 'Cardio · Core',
    repsTarget: 20, sets: 3, restSec: 30,
    track: trackHighKnees,
    instruction: 'Run in place, lifting knees to waist height each rep.',
    calibrationNote: 'Stand upright. Hold 3 seconds.',
  },
  'Glute Bridge': {
    icon: '🍑', muscle: 'Glutes · Hamstrings',
    repsTarget: 15, sets: 3, restSec: 45,
    track: trackGluteBridge,
    instruction: 'Lie on back, feet flat. Push hips up until straight, hold 1s, lower back.',
    calibrationNote: 'Lie flat on back. Hold 3 seconds.',
  },
  'Jumping Jacks': {
    icon: '⚡', muscle: 'Full Body · Cardio',
    repsTarget: 20, sets: 3, restSec: 30,
    track: trackJumpingJacks,
    instruction: 'Jump feet apart and arms overhead simultaneously. Return and repeat.',
    calibrationNote: 'Stand upright, arms at sides. Hold 3 seconds.',
  },
  // Fallback for any unrecognized exercise
  'Mountain Climber': {
    icon: '🧗', muscle: 'Core · Cardio',
    repsTarget: 16, sets: 3, restSec: 30,
    track: trackHighKnees,
    instruction: 'High plank. Drive alternating knees to chest rapidly.',
    calibrationNote: 'Get into high plank. Hold 3 seconds.',
  },
  'Lateral Raise': {
    icon: '↔', muscle: 'Deltoids',
    repsTarget: 12, sets: 3, restSec: 40,
    track: trackShoulderPress,
    instruction: 'Raise both arms out to the side up to shoulder height, then lower.',
    calibrationNote: 'Stand with arms at sides. Hold 3 seconds.',
  },
  'Front Raise': {
    icon: '⬆', muscle: 'Front Deltoids',
    repsTarget: 12, sets: 3, restSec: 40,
    track: trackShoulderPress,
    instruction: 'Raise both arms forward to shoulder height, then lower.',
    calibrationNote: 'Stand with arms at sides. Hold 3 seconds.',
  },
  'Superman Hold': {
    icon: '🦸', muscle: 'Lower Back · Glutes',
    repsTarget: 10, sets: 3, restSec: 40,
    track: trackGluteBridge,
    instruction: 'Lie face down. Raise arms and legs off floor simultaneously. Hold 2s, lower.',
    calibrationNote: 'Lie face down flat. Hold 3 seconds.',
  },
  'Hammer Curl': {
    icon: '🔨', muscle: 'Biceps · Brachialis',
    repsTarget: 12, sets: 3, restSec: 40,
    track: trackBicepCurl,
    instruction: 'Same as bicep curl but palms face each other.',
    calibrationNote: 'Stand with arms at sides. Hold 3 seconds.',
  },
  'Tricep Dip': {
    icon: '💎', muscle: 'Triceps',
    repsTarget: 10, sets: 3, restSec: 45,
    track: trackPushup,
    instruction: 'Use a chair. Lower body by bending elbows, then press back up.',
    calibrationNote: 'Arms straight, body off chair. Hold 3 seconds.',
  },
  'Diamond Push-up': {
    icon: '💎', muscle: 'Triceps · Chest',
    repsTarget: 10, sets: 3, restSec: 45,
    track: trackPushup,
    instruction: 'Hands form a diamond shape below chest. Lower and push up.',
    calibrationNote: 'High plank with diamond hands. Hold 3 seconds.',
  },
  'Incline Push-up': {
    icon: '📐', muscle: 'Chest · Shoulders',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackPushup,
    instruction: 'Hands on elevated surface (chair/wall). Lower chest to surface.',
    calibrationNote: 'Incline plank position. Hold 3 seconds.',
  },
  'Reverse Row': {
    icon: '🔙', muscle: 'Back · Biceps',
    repsTarget: 10, sets: 3, restSec: 45,
    track: trackBicepCurl,
    instruction: 'Under a table. Row chest up to table edge, lower back.',
    calibrationNote: 'Hang under table with arms straight. Hold 3 seconds.',
  },
  'Calf Raise': {
    icon: '🦶', muscle: 'Calves',
    repsTarget: 20, sets: 3, restSec: 30,
    track: trackCalfRaise,
    instruction: 'Rise up onto toes fully, then lower heels back down.',
    calibrationNote: 'Stand flat-footed. Hold 3 seconds.',
  },
  'Step-up': {
    icon: '🪜', muscle: 'Quads · Glutes',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackSquat,
    instruction: 'Step up onto a chair one foot at a time, then step back down.',
    calibrationNote: 'Stand in front of step. Hold 3 seconds.',
  },
  'Upright Row': {
    icon: '⬆', muscle: 'Traps · Shoulders',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackShoulderPress,
    instruction: 'Pull hands up to chin height with elbows flaring out. Lower slowly.',
    calibrationNote: 'Stand with arms at sides. Hold 3 seconds.',
  },
  'Arm Circles': {
    icon: '🔄', muscle: 'Shoulders · Warm-up',
    repsTarget: 15, sets: 2, restSec: 20,
    track: trackJumpingJacks,
    instruction: 'Extend arms and make large circles forward, then backward.',
    calibrationNote: 'Stand with arms extended to sides. Hold 3 seconds.',
  },
  'Back Extension': {
    icon: '🔙', muscle: 'Lower Back',
    repsTarget: 12, sets: 3, restSec: 40,
    track: trackGluteBridge,
    instruction: 'Lie face down. Raise chest off floor, lower slowly.',
    calibrationNote: 'Lie face down. Hold 3 seconds.',
  },
  'Burpee': {
    icon: '💥', muscle: 'Full Body · Cardio',
    repsTarget: 8, sets: 3, restSec: 60,
    track: trackSquat,
    instruction: 'Stand, drop to plank, push-up, jump feet in, jump up. Full sequence = 1 rep.',
    calibrationNote: 'Stand upright. Hold 3 seconds.',
  },
};

// ═══════════════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════════════
const S = {
  profile: null,
  theme: 'dark',
  poseReady: false,
  stream: null,
  poseInstance: null,
  camera: null,
  selectedEx: null,
  exConfig: null,
  landmarks: null,

  // Tracking state
  angle: 0,
  repState: 'up',      // state machine: 'up', 'down'
  repCount: 0,
  setCount: 0,
  totalReps: 0,
  sessionStart: null,
  paused: false,

  // Calibration
  calibrated: false,
  calibratingFrames: 0,
  baselineAngle: 180,

  // Form
  formOk: true,
  consecutiveFormFails: 0,

  // Rest timer
  restInterval: null,

  // Voice
  speechSynth: window.speechSynthesis,
  lastSpoken: 0,
  lastFeedbackMsg: '',
};

// ═══════════════════════════════════════════════════════════════
// DOM REFS
// ═══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadProfile();
  startLoadingSequence();
});

// ═══════════════════════════════════════════════════════════════
// LOADING & POSE ENGINE SETUP
// ═══════════════════════════════════════════════════════════════
async function startLoadingSequence() {
  const bar = $('loadProgress');
  const status = $('loadStatus');

  const steps = [
    [20, 'Loading pose engine…'],
    [45, 'Initializing MediaPipe…'],
    [70, 'Preparing exercise data…'],
    [90, 'Almost ready…'],
    [100, 'Ready!'],
  ];

  async function animStep(i) {
    if (i >= steps.length) {
      await delay(300);
      finishLoading();
      return;
    }
    bar.style.width = steps[i][0] + '%';
    status.textContent = steps[i][1];
    await delay(400);
    animStep(i + 1);
  }

  // Try to init MediaPipe in background
  try {
    await initPoseEngine();
    S.poseReady = true;
  } catch (e) {
    console.warn('MediaPipe not loaded, using fallback mode:', e);
    S.poseReady = false;
  }

  animStep(0);
}

async function initPoseEngine() {
  if (typeof Pose === 'undefined') throw new Error('Pose not loaded');

  S.poseInstance = new Pose({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
  });

  S.poseInstance.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  S.poseInstance.onResults(onPoseResults);
  await S.poseInstance.initialize();
}

function finishLoading() {
  $('loadingScreen').classList.add('hidden');

  if (S.profile) {
    showMainApp();
  } else {
    showOnboarding();
  }
}

function showOnboarding() {
  $('onboardScreen').classList.remove('hidden');
  bindOnboarding();
}

function showMainApp() {
  $('mainApp').classList.remove('hidden');
  initMainApp();
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════
function bindOnboarding() {
  let selectedGoal = null;

  $$('#obGoalGrid .goal-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#obGoalGrid .goal-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedGoal = btn.dataset.goal;
    });
  });

  $('btnStartJourney').addEventListener('click', () => {
    const name = $('ob-name').value.trim();
    if (!name) { toast('Please enter your name'); return; }
    if (!selectedGoal) { toast('Please select a goal'); return; }

    S.profile = {
      name,
      age: $('ob-age').value || '',
      weight: $('ob-weight').value || '',
      height: $('ob-height').value || '',
      goal: selectedGoal,
      goalLabel: $$('#obGoalGrid .goal-opt.selected')[0]?.textContent || selectedGoal,
    };

    localStorage.setItem('fh_profile', JSON.stringify(S.profile));
    $('onboardScreen').classList.add('hidden');
    showMainApp();
    toast(`Welcome, ${name}! 🎉`);
  });
}

// ═══════════════════════════════════════════════════════════════
// LOAD PROFILE & THEME
// ═══════════════════════════════════════════════════════════════
function loadProfile() {
  try {
    const raw = localStorage.getItem('fh_profile');
    if (raw) S.profile = JSON.parse(raw);
  } catch { S.profile = null; }
}

function loadTheme() {
  const t = localStorage.getItem('fh_theme') || 'dark';
  S.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  const tog = $('themeToggle');
  if (tog) tog.checked = (t === 'light');
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP INIT
// ═══════════════════════════════════════════════════════════════
function initMainApp() {
  updateTopbar();
  bindNav();
  bindTheme();
  setupTodayWorkout();
  bindProfile();
  bindHistory();
  renderHistory();
}

function updateTopbar() {
  if (!S.profile) return;
  const name = S.profile.name.split(' ')[0];
  $('userGreet').textContent = `Hi, ${name}`;
  $('dpName').textContent = S.profile.name;
  $('dpGoal').textContent = S.profile.goalLabel || S.profile.goal || '—';
  $('dpAvatar').textContent = name.charAt(0).toUpperCase();

  const day = new Date().getDay();
  const dayName = DAYS[day];
  const w = DAY_WORKOUT[day];
  const label = w ? w.focus : (day === 0 ? 'Your Day' : '—');
  $('todayPill').textContent = `${dayName}: ${label}`;
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function bindNav() {
  $('menuBtn').addEventListener('click', toggleDrawer);
  $('drawerOverlay').addEventListener('click', closeDrawer);

  $$('.dl-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
      closeDrawer();
    });
  });

  $('btnExportPDF').addEventListener('click', () => {
    closeDrawer();
    if (typeof generatePDF === 'function') {
      generatePDF(S.profile, DAY_WORKOUT, EX_CONFIG);
    } else toast('PDF module not ready');
  });
}

function toggleDrawer() {
  const open = $('sideDrawer').classList.toggle('open');
  $('drawerOverlay').classList.toggle('open', open);
  $('menuBtn').classList.toggle('open', open);
}

function closeDrawer() {
  $('sideDrawer').classList.remove('open');
  $('drawerOverlay').classList.remove('open');
  $('menuBtn').classList.remove('open');
}

function showPage(name) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${name}`);
  if (target) target.classList.add('active');

  $$('.dl-link').forEach(l => l.classList.toggle('active', l.dataset.page === name));
}

// ═══════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════
function bindTheme() {
  const tog = $('themeToggle');
  if (!tog) return;
  tog.addEventListener('change', () => {
    S.theme = tog.checked ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', S.theme);
    localStorage.setItem('fh_theme', S.theme);
  });
}

// ═══════════════════════════════════════════════════════════════
// TODAY'S WORKOUT SETUP
// ═══════════════════════════════════════════════════════════════
function setupTodayWorkout() {
  const day = new Date().getDay();
  const dayName = DAYS[day];
  $('thDay').textContent = dayName;

  if (day === 0) {
    // Sunday — user choice
    $('sundayChoice').classList.remove('hidden');
    $('exercisePicker').classList.add('hidden');
    $('todayHeader').querySelector('#thFocus').textContent = 'Rest or Train?';

    $('sbRest').addEventListener('click', () => {
      $('sundayChoice').classList.add('hidden');
      $('restScreen').classList.remove('hidden');
    });

    $('sbWorkout').addEventListener('click', () => {
      $('sundayChoice').classList.add('hidden');
      loadWorkoutForDay(5); // Saturday's full body workout
    });
    return;
  }

  loadWorkoutForDay(day);
}

function loadWorkoutForDay(day) {
  const w = DAY_WORKOUT[day] || DAY_WORKOUT[5];
  $('thFocus').textContent = w.focus;
  $('thExCount').textContent = `${w.exercises.length} exercises`;

  const totalRepsEst = w.exercises.reduce((acc, name) => {
    const c = EX_CONFIG[name];
    return acc + (c ? (c.repsTarget * c.sets) : 30);
  }, 0);

  $('thDuration').textContent = `~${Math.round(totalRepsEst / 8)} min`;
  $('thGoalTag').textContent = S.profile?.goalLabel || '—';

  renderExerciseList(w.exercises);
}

function getExerciseDetails(name) {
  if (EX_CONFIG[name]) return EX_CONFIG[name];
  // Default fallback
  return {
    icon: '🏋', muscle: 'Full Body',
    repsTarget: 12, sets: 3, restSec: 45,
    track: trackBicepCurl,
    instruction: `Perform ${name} with controlled movement.`,
    calibrationNote: 'Stand upright. Hold 3 seconds.',
  };
}

function renderExerciseList(exercises) {
  const container = $('exCards');
  container.innerHTML = '';

  exercises.forEach(name => {
    const config = getExerciseDetails(name);
    const repsLabel = config.isTimer ? `${config.repsTarget}s hold` : `${config.repsTarget} reps`;

    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-card-icon">${config.icon}</div>
      <div class="ex-card-info">
        <div class="ec-name">${name}</div>
        <div class="ec-meta">${config.muscle} · ${repsLabel} × ${config.sets} sets</div>
      </div>
      <div class="ex-card-arrow">›</div>`;

    card.addEventListener('click', () => selectExercise(name));
    container.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// SELECT & START EXERCISE
// ═══════════════════════════════════════════════════════════════
function selectExercise(name) {
  const config = getExerciseDetails(name);
  S.selectedEx = name;
  S.exConfig = config;

  // Reset state
  S.repCount = 0;
  S.setCount = 0;
  S.totalReps = 0;
  S.repState = 'up';
  S.calibrated = false;
  S.paused = false;
  S.sessionStart = null;
  S.consecutiveFormFails = 0;

  // Update UI
  $('exercisePicker').classList.add('hidden');
  $('activeWorkout').classList.remove('hidden');
  $('awName').textContent = name;
  $('setBadge').textContent = `Set 1/${config.sets}`;
  $('repsTarget').textContent = config.isTimer
    ? `Hold ${config.repsTarget} seconds`
    : `Target: ${config.repsTarget} reps`;

  $('scReps').textContent = '0';
  $('scAngle').textContent = '—°';
  $('scSets').textContent = `0/${config.sets}`;

  $('calInstruction').textContent = config.instruction;
  $('calStatus').textContent = 'Ready to start';

  // Show calibration
  $('calibrationBox').classList.remove('hidden');
  $('trackingView').classList.add('hidden');
  $('restTimerBox').classList.add('hidden');
  $('workoutComplete').classList.add('hidden');

  $('btnCalibrate').disabled = false;
  $('btnCalibrate').textContent = 'Enable Camera & Calibrate';

  bindExerciseControls();
}

function bindExerciseControls() {
  $('backToList').onclick = () => {
    stopCamera();
    $('exercisePicker').classList.remove('hidden');
    $('activeWorkout').classList.add('hidden');
    clearInterval(S.restInterval);
  };

  $('btnCalibrate').onclick = () => startCalibration();

  $('btnPause').onclick = () => {
    S.paused = !S.paused;
    $('btnPause').textContent = S.paused ? '▶ Resume' : '⏸ Pause';
    setFeedback(S.paused ? 'Paused — press Resume to continue' : 'Resumed', '⏸', false);
  };

  $('btnResetSet').onclick = () => {
    S.repCount = 0;
    S.repState = 'up';
    $('scReps').textContent = '0';
    setFeedback('Set reset — go again!', '↺', false);
    toast('Set reset');
  };

  $('btnSkipRest').onclick = () => skipRest();
  $('btnNextExercise').onclick = () => {
    $('workoutComplete').classList.add('hidden');
    $('exercisePicker').classList.remove('hidden');
    $('activeWorkout').classList.add('hidden');
    stopCamera();
    toast('Select your next exercise!');
  };
  $('btnRepeatExercise').onclick = () => selectExercise(S.selectedEx);
}

// ═══════════════════════════════════════════════════════════════
// CALIBRATION
// ═══════════════════════════════════════════════════════════════
async function startCalibration() {
  $('btnCalibrate').disabled = true;
  $('calStatus').textContent = 'Starting camera…';

  const started = await startCamera();
  if (!started) {
    $('btnCalibrate').disabled = false;
    $('calStatus').textContent = 'Camera failed. Please allow camera access.';
    toast('Camera permission needed');
    return;
  }

  $('calStatus').textContent = 'Get into start position…';
  $('calCountdown').textContent = '';

  // Wait for first pose detection
  await waitForPose();

  // 3-second countdown
  for (let i = 3; i >= 1; i--) {
    $('calCountdown').textContent = i;
    $('calStatus').textContent = i === 3 ? 'Hold still…' : i === 2 ? 'Almost there…' : 'Calibrating!';
    await delay(1000);
  }

  $('calCountdown').textContent = '✓';
  $('calStatus').textContent = 'Calibrated!';

  // Record baseline
  if (S.landmarks) {
    S.baselineAngle = S.exConfig.track(S.landmarks).angle;
  }
  S.calibrated = true;
  S.sessionStart = Date.now();

  await delay(400);

  // Show tracking view
  $('calibrationBox').classList.add('hidden');
  $('trackingView').classList.remove('hidden');

  setFeedback(S.exConfig.instruction, '💡', false);
  speak('Start when ready');
}

async function waitForPose() {
  return new Promise(resolve => {
    let attempts = 0;
    const check = setInterval(() => {
      if (S.landmarks || attempts > 30) { clearInterval(check); resolve(); }
      attempts++;
    }, 100);
  });
}

// ═══════════════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════════════
async function startCamera() {
  try {
    // Prefer back camera on mobile
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };

    S.stream = await navigator.mediaDevices.getUserMedia(constraints);
    const vid = $('videoEl');
    vid.srcObject = S.stream;

    // Don't mirror if using back camera
    const track = S.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    if (settings.facingMode === 'environment') {
      vid.style.transform = 'none';
      $('canvasEl').style.transform = 'none';
    }

    await new Promise(r => { vid.onloadedmetadata = r; });
    await vid.play();

    // Fit canvas to video
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start pose detection loop
    if (S.poseReady && S.poseInstance) {
      startPoseLoop();
    } else {
      // Fallback simulation mode
      startSimulationMode();
    }

    return true;
  } catch (e) {
    console.error('Camera error:', e);
    return false;
  }
}

function stopCamera() {
  if (S.stream) {
    S.stream.getTracks().forEach(t => t.stop());
    S.stream = null;
  }
  if (S.camera) {
    S.camera.stop?.();
    S.camera = null;
  }
  S.landmarks = null;
  window.removeEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const vid = $('videoEl');
  const canvas = $('canvasEl');
  canvas.width = vid.offsetWidth;
  canvas.height = vid.offsetHeight;
}

// ─── MEDIAPIPE POSE LOOP ─────────────────────────────────────
function startPoseLoop() {
  if (typeof Camera !== 'undefined') {
    S.camera = new Camera($('videoEl'), {
      onFrame: async () => {
        if (S.paused) return;
        if (S.poseInstance) {
          await S.poseInstance.send({ image: $('videoEl') });
        }
      },
      width: 640,
      height: 480,
    });
    S.camera.start();
  } else {
    // Manual loop fallback
    const loop = async () => {
      if (!S.stream) return;
      if (!S.paused && S.poseInstance) {
        await S.poseInstance.send({ image: $('videoEl') });
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
}

function onPoseResults(results) {
  const canvas = $('canvasEl');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
    S.landmarks = null;
    setFeedback('Move into camera view — keep full body visible', '👁', false);
    return;
  }

  S.landmarks = results.poseLandmarks;

  // Draw minimal tracking points
  drawMinimalOverlay(ctx, results.poseLandmarks, canvas.width, canvas.height);

  if (S.calibrated) {
    processExercise();
  }
}

// ─── SIMULATION MODE (fallback when MediaPipe unavailable) ───
function startSimulationMode() {
  let frame = 0;
  const config = S.exConfig;

  const loop = () => {
    if (!S.stream) return;
    frame++;

    if (!S.paused && S.calibrated) {
      // Simulate angle oscillation for demo
      const t = frame * 0.04;
      const simAngle = 100 + Math.sin(t) * 70;

      S.angle = Math.round(simAngle);
      $('abValue').textContent = S.angle + '°';
      $('scAngle').textContent = S.angle + '°';

      // Simulate rep counting
      const result = {
        angle: S.angle,
        feedback: simAngle > 150 ? 'good' : simAngle < 60 ? 'good' : '',
        formMsg: '',
      };

      updateRepState(result);
    }

    requestAnimationFrame(loop);
  };
  loop();
  setFeedback('Simulation mode — MediaPipe not loaded. Logic active!', '⚠', false);
}

// ═══════════════════════════════════════════════════════════════
// DRAW OVERLAY
// ═══════════════════════════════════════════════════════════════
function drawMinimalOverlay(ctx, lm, W, H) {
  if (!S.exConfig) return;

  // Determine which landmarks to highlight based on exercise
  let keyPoints = [];
  const ex = S.selectedEx || '';

  if (ex.includes('Curl') || ex.includes('Press') || ex.includes('Raise') || ex.includes('Row')) {
    keyPoints = [MP.L_SHOULDER, MP.R_SHOULDER, MP.L_ELBOW, MP.R_ELBOW, MP.L_WRIST, MP.R_WRIST];
  } else if (ex === 'Squat' || ex === 'Lunge' || ex === 'Step-up') {
    keyPoints = [MP.L_HIP, MP.R_HIP, MP.L_KNEE, MP.R_KNEE, MP.L_ANKLE, MP.R_ANKLE];
  } else if (ex === 'Plank' || ex.includes('Push')) {
    keyPoints = [MP.L_SHOULDER, MP.R_SHOULDER, MP.L_ELBOW, MP.R_ELBOW, MP.L_HIP, MP.R_HIP, MP.L_ANKLE, MP.R_ANKLE];
  } else {
    keyPoints = [MP.L_SHOULDER, MP.R_SHOULDER, MP.L_HIP, MP.R_HIP, MP.L_KNEE, MP.R_KNEE];
  }

  // Draw lines between key connections
  const connections = getRelevantConnections(ex);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(45,212,191,0.7)';
  ctx.lineCap = 'round';

  connections.forEach(([a, b]) => {
    if (!lm[a] || !lm[b]) return;
    if (lm[a].visibility < 0.4 || lm[b].visibility < 0.4) return;
    ctx.beginPath();
    ctx.moveTo(lm[a].x * W, lm[a].y * H);
    ctx.lineTo(lm[b].x * W, lm[b].y * H);
    ctx.stroke();
  });

  // Draw key joint dots
  keyPoints.forEach(idx => {
    if (!lm[idx] || lm[idx].visibility < 0.4) return;
    const x = lm[idx].x * W;
    const y = lm[idx].y * H;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = S.formOk ? 'rgba(45,212,191,0.9)' : 'rgba(255,123,84,0.9)';
    ctx.fill();
  });
}

function getRelevantConnections(ex) {
  if (ex.includes('Curl') || ex.includes('Press') || ex.includes('Raise')) {
    return [[MP.L_SHOULDER,MP.L_ELBOW],[MP.L_ELBOW,MP.L_WRIST],[MP.R_SHOULDER,MP.R_ELBOW],[MP.R_ELBOW,MP.R_WRIST],[MP.L_SHOULDER,MP.R_SHOULDER]];
  } else if (ex === 'Squat' || ex === 'Lunge' || ex.includes('Bridge')) {
    return [[MP.L_HIP,MP.L_KNEE],[MP.L_KNEE,MP.L_ANKLE],[MP.R_HIP,MP.R_KNEE],[MP.R_KNEE,MP.R_ANKLE],[MP.L_HIP,MP.R_HIP]];
  } else if (ex.includes('Push') || ex === 'Plank') {
    return [[MP.L_SHOULDER,MP.L_ELBOW],[MP.L_ELBOW,MP.L_WRIST],[MP.R_SHOULDER,MP.R_ELBOW],[MP.R_ELBOW,MP.R_WRIST],[MP.L_SHOULDER,MP.R_SHOULDER],[MP.L_HIP,MP.R_HIP],[MP.L_SHOULDER,MP.L_HIP],[MP.R_SHOULDER,MP.R_HIP]];
  } else {
    return [[MP.L_SHOULDER,MP.R_SHOULDER],[MP.L_SHOULDER,MP.L_HIP],[MP.R_SHOULDER,MP.R_HIP],[MP.L_HIP,MP.R_HIP],[MP.L_HIP,MP.L_KNEE],[MP.R_HIP,MP.R_KNEE]];
  }
}

// ═══════════════════════════════════════════════════════════════
// EXERCISE PROCESSING
// ═══════════════════════════════════════════════════════════════
function processExercise() {
  if (!S.landmarks || !S.exConfig) return;

  const result = S.exConfig.track(S.landmarks);

  S.angle = result.angle;
  $('abValue').textContent = Math.round(result.angle) + '°';
  $('scAngle').textContent = Math.round(result.angle) + '°';

  // Check visibility/confidence
  if (result.visibility !== undefined && result.visibility < 0.4) {
    setFeedback('Landmark not visible — step back from camera', '👁', false);
    return;
  }

  // Form checking
  handleFormFeedback(result);

  // Rep counting
  updateRepState(result);
}

function handleFormFeedback(result) {
  if (result.formMsg) {
    S.formOk = false;
    S.consecutiveFormFails++;
    setFeedback(result.formMsg, '⚠', true);
    showFormAlert(result.formMsg);

    // Voice warning every 5 bad frames
    if (S.consecutiveFormFails > 0 && S.consecutiveFormFails % 5 === 0) {
      speak('Fix your form');
    }
  } else {
    S.formOk = true;
    if (S.consecutiveFormFails > 3) {
      setFeedback('Good — form looks correct!', '✅', false);
      if (S.consecutiveFormFails > 5) speak('Good form');
    }
    S.consecutiveFormFails = 0;
    hideFormAlert();
  }
}

// ─── STATE MACHINE ────────────────────────────────────────────
function updateRepState(result) {
  const { angle, atTop, atBottom } = result;
  const config = S.exConfig;

  if (config.isTimer) {
    // Timer-based exercise (Plank)
    setFeedback(result.formMsg || 'Hold steady — great work!', '⏱', false);
    return;
  }

  // Noise filter: only change state if movement is significant
  const DEAD_ZONE = 8;

  if (S.repState === 'up') {
    // Waiting for "down" position (contraction/lowering)
    if (atBottom) {
      S.repState = 'down';
      setFeedback('Good — now return to start position', '⬆', false);
    } else if (angle < (S.baselineAngle - DEAD_ZONE * 2)) {
      // Moving toward contracted position
      setFeedback(result.feedback || 'Keep going — full range!', '💪', false);
    }
  } else if (S.repState === 'down') {
    // Waiting for "up" — full extension completes a rep
    if (atTop) {
      S.repState = 'up';
      completeRep();
    }
  }
}

function completeRep() {
  if (S.paused) return;

  S.repCount++;
  S.totalReps++;
  $('scReps').textContent = S.repCount;

  // Flash animation
  const el = $('scReps');
  el.style.transition = 'transform 0.12s, color 0.12s';
  el.style.transform = 'scale(1.5)';
  el.style.color = 'var(--teal)';
  setTimeout(() => { el.style.transform = 'scale(1)'; el.style.color = ''; }, 150);

  // Feedback
  if (S.repCount % 5 === 0) speak(`${S.repCount} reps!`);
  else if (S.repCount === 1) speak('Good rep');
  else if (S.repCount === S.exConfig.repsTarget) speak('Set complete — great job!');

  setFeedback(`Rep ${S.repCount} — keep going!`, '🔥', false);

  // Check set completion
  if (S.repCount >= S.exConfig.repsTarget) {
    setTimeout(() => completeSet(), 300);
  }
}

function completeSet() {
  S.setCount++;
  const config = S.exConfig;
  $('scSets').textContent = `${S.setCount}/${config.sets}`;
  $('setBadge').textContent = `Set ${Math.min(S.setCount + 1, config.sets)}/${config.sets}`;

  speak(`Set ${S.setCount} complete`);

  if (S.setCount >= config.sets) {
    finishExercise();
  } else {
    startRestTimer(config.restSec, S.setCount + 1);
  }
}

function finishExercise() {
  $('trackingView').classList.add('hidden');
  $('workoutComplete').classList.remove('hidden');

  const secs = Math.round((Date.now() - (S.sessionStart || Date.now())) / 1000);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;

  $('wcTotalReps').textContent = S.totalReps;
  $('wcSets').textContent = S.setCount;
  $('wcDuration').textContent = `${mins}:${String(s).padStart(2, '0')}`;

  saveWorkoutSession();
  speak('Excellent work! Exercise complete!');
}

// ═══════════════════════════════════════════════════════════════
// REST TIMER
// ═══════════════════════════════════════════════════════════════
function startRestTimer(seconds, nextSet) {
  S.repCount = 0;
  S.repState = 'up';
  $('scReps').textContent = '0';

  $('trackingView').classList.add('hidden');
  $('restTimerBox').classList.remove('hidden');
  $('rtbNext').textContent = `Next: Set ${nextSet}/${S.exConfig.sets} · ${S.selectedEx}`;

  let remaining = seconds;
  $('rtbCountdown').textContent = remaining;

  speak(`Rest for ${seconds} seconds`);

  clearInterval(S.restInterval);
  S.restInterval = setInterval(() => {
    remaining--;
    $('rtbCountdown').textContent = remaining;

    if (remaining === 10) speak('10 seconds');
    if (remaining === 3) speak('3');
    if (remaining === 2) speak('2');
    if (remaining === 1) speak('1');

    if (remaining <= 0) {
      clearInterval(S.restInterval);
      resumeAfterRest();
    }
  }, 1000);
}

function skipRest() {
  clearInterval(S.restInterval);
  resumeAfterRest();
}

function resumeAfterRest() {
  $('restTimerBox').classList.add('hidden');
  $('trackingView').classList.remove('hidden');
  $('setBadge').textContent = `Set ${S.setCount + 1}/${S.exConfig.sets}`;
  speak('Go!');
  setFeedback('Start your next set!', '💪', false);
}

// ═══════════════════════════════════════════════════════════════
// FEEDBACK & VOICE
// ═══════════════════════════════════════════════════════════════
function setFeedback(msg, icon = '💡', isWarn = false) {
  if (msg === S.lastFeedbackMsg) return;
  S.lastFeedbackMsg = msg;
  $('fbText').textContent = msg;
  $('fbIcon').textContent = icon;
  const bar = $('feedbackBar');
  bar.className = 'feedback-bar' + (isWarn ? ' warn' : (icon === '✅' || icon === '🔥' ? ' good' : ''));
}

function showFormAlert(msg) {
  const el = $('formAlert');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visible'), 3000);
}

function hideFormAlert() {
  $('formAlert').classList.remove('visible');
}

function speak(text) {
  if (!S.speechSynth) return;
  const now = Date.now();
  if (now - S.lastSpoken < 1500) return; // throttle
  S.lastSpoken = now;

  S.speechSynth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.0;
  utt.pitch = 1.0;
  utt.volume = 0.9;
  S.speechSynth.speak(utt);
}

// ═══════════════════════════════════════════════════════════════
// ANGLE CALCULATION
// ═══════════════════════════════════════════════════════════════
function calcAngle(A, B, C) {
  // A = first point, B = vertex, C = third point
  const radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function avgPoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(a.visibility || 1, b.visibility || 1) };
}

function getVis(lm, ...indices) {
  return Math.min(...indices.map(i => lm[i]?.visibility || 0));
}

// ═══════════════════════════════════════════════════════════════
// EXERCISE TRACKING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ── BICEP CURL ────────────────────────────────────────────────
function trackBicepCurl(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.L_ELBOW, MP.L_WRIST,
                        MP.R_SHOULDER, MP.R_ELBOW, MP.R_WRIST);

  // Use the arm with better visibility
  let shoulder, elbow, wrist;
  const lVis = getVis(lm, MP.L_SHOULDER, MP.L_ELBOW, MP.L_WRIST);
  const rVis = getVis(lm, MP.R_SHOULDER, MP.R_ELBOW, MP.R_WRIST);

  if (lVis >= rVis) {
    shoulder = lm[MP.L_SHOULDER];
    elbow = lm[MP.L_ELBOW];
    wrist = lm[MP.L_WRIST];
  } else {
    shoulder = lm[MP.R_SHOULDER];
    elbow = lm[MP.R_ELBOW];
    wrist = lm[MP.R_WRIST];
  }

  const angle = calcAngle(shoulder, elbow, wrist);

  // Form checks
  let formMsg = '';

  // Check if elbow is drifting (elbow x should stay near shoulder x)
  const elbowDrift = Math.abs(elbow.x - shoulder.x);
  if (elbowDrift > 0.15) {
    formMsg = 'Keep elbow fixed to your side';
  }

  // Check body sway (hip should stay relatively still)
  const hip = lVis >= rVis ? lm[MP.L_HIP] : lm[MP.R_HIP];
  if (hip && Math.abs(hip.x - shoulder.x) > 0.25) {
    formMsg = "Don't swing your body";
  }

  return {
    angle,
    atBottom: angle < 50,    // fully contracted
    atTop: angle > 155,      // fully extended
    feedback: angle > 90 ? 'Curl higher — full contraction' : 'Control the lowering',
    formMsg,
    visibility: vis,
  };
}

// ── SQUAT ─────────────────────────────────────────────────────
function trackSquat(lm) {
  const vis = getVis(lm, MP.L_HIP, MP.L_KNEE, MP.L_ANKLE,
                        MP.R_HIP, MP.R_KNEE, MP.R_ANKLE);

  const hip = avgPoint(lm[MP.L_HIP], lm[MP.R_HIP]);
  const knee = avgPoint(lm[MP.L_KNEE], lm[MP.R_KNEE]);
  const ankle = avgPoint(lm[MP.L_ANKLE], lm[MP.R_ANKLE]);

  const angle = calcAngle(hip, knee, ankle);

  let formMsg = '';

  // Check knee tracking (knees should stay over toes)
  const lKneeX = lm[MP.L_KNEE]?.x || 0;
  const lAnkleX = lm[MP.L_ANKLE]?.x || 0;
  const rKneeX = lm[MP.R_KNEE]?.x || 0;
  const rAnkleX = lm[MP.R_ANKLE]?.x || 0;

  if (angle < 130) {
    if (Math.abs(lKneeX - lAnkleX) > 0.08 || Math.abs(rKneeX - rAnkleX) > 0.08) {
      formMsg = 'Align knees over toes';
    }
  }

  // Back straightness: check shoulder-hip vertical alignment
  const shoulder = avgPoint(lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  if (angle < 120) {
    const lean = Math.abs(shoulder.x - hip.x);
    if (lean > 0.12) {
      formMsg = 'Keep your back straight';
    }
  }

  return {
    angle,
    atBottom: angle < 100,   // deep squat
    atTop: angle > 165,      // standing
    feedback: angle > 130 ? 'Lower down — thighs parallel to floor' : 'Push through heels to stand',
    formMsg,
    visibility: vis,
  };
}

// ── PUSH-UP ───────────────────────────────────────────────────
function trackPushup(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.L_ELBOW, MP.L_WRIST,
                        MP.R_SHOULDER, MP.R_ELBOW, MP.R_WRIST);

  const shoulder = avgPoint(lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  const elbow = avgPoint(lm[MP.L_ELBOW], lm[MP.R_ELBOW]);
  const wrist = avgPoint(lm[MP.L_WRIST], lm[MP.R_WRIST]);

  const angle = calcAngle(shoulder, elbow, wrist);

  let formMsg = '';

  // Hip sag/pike check
  const hip = avgPoint(lm[MP.L_HIP], lm[MP.R_HIP]);
  const ankle = avgPoint(lm[MP.L_ANKLE] || lm[MP.L_FOOT], lm[MP.R_ANKLE] || lm[MP.R_FOOT]);

  if (hip && shoulder && ankle) {
    const hipSag = hip.y - (shoulder.y + ankle.y) / 2;
    if (hipSag > 0.08) formMsg = 'Keep hips level — no sagging';
    else if (hipSag < -0.08) formMsg = 'Lower hips — body straight';
  }

  return {
    angle,
    atBottom: angle < 80,    // chest near floor
    atTop: angle > 155,      // arms extended
    feedback: angle > 110 ? 'Lower chest to floor' : 'Push all the way up',
    formMsg,
    visibility: vis,
  };
}

// ── LUNGE ─────────────────────────────────────────────────────
function trackLunge(lm) {
  // Use front leg (lower knee)
  const lKnee = lm[MP.L_KNEE];
  const rKnee = lm[MP.R_KNEE];
  const useLLeft = lKnee && rKnee && lKnee.y > rKnee.y;

  const hip = useLLeft ? lm[MP.L_HIP] : lm[MP.R_HIP];
  const knee = useLLeft ? lKnee : rKnee;
  const ankle = useLLeft ? lm[MP.L_ANKLE] : lm[MP.R_ANKLE];
  const vis = getVis(lm, MP.L_HIP, MP.L_KNEE, MP.L_ANKLE, MP.R_HIP, MP.R_KNEE, MP.R_ANKLE);

  const angle = calcAngle(hip, knee, ankle);

  let formMsg = '';
  // Knee should not go past ankle
  if (angle < 100 && knee && ankle) {
    if (knee.x - ankle.x > 0.05) formMsg = 'Knee too far forward over ankle';
  }

  return {
    angle,
    atBottom: angle < 100,
    atTop: angle > 160,
    feedback: angle > 130 ? 'Step deeper — lower back knee' : 'Rise back to start position',
    formMsg,
    visibility: vis,
  };
}

// ── SHOULDER PRESS ────────────────────────────────────────────
function trackShoulderPress(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.L_ELBOW, MP.L_WRIST,
                        MP.R_SHOULDER, MP.R_ELBOW, MP.R_WRIST);

  const shoulder = avgPoint(lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  const elbow = avgPoint(lm[MP.L_ELBOW], lm[MP.R_ELBOW]);
  const wrist = avgPoint(lm[MP.L_WRIST], lm[MP.R_WRIST]);

  const angle = calcAngle(shoulder, elbow, wrist);

  let formMsg = '';
  // Wrist should be above elbow when pressing up
  if (angle > 150 && wrist.y > elbow.y) formMsg = 'Extend arms fully overhead';
  // Check arching back
  const hip = avgPoint(lm[MP.L_HIP], lm[MP.R_HIP]);
  if (hip && shoulder) {
    if (shoulder.x - hip.x > 0.1) formMsg = 'Keep core tight — no arching';
  }

  return {
    angle,
    atBottom: angle < 90,    // elbows at shoulder level
    atTop: angle > 160,      // arms overhead
    feedback: angle < 120 ? 'Press arms all the way up' : 'Lower to shoulder height',
    formMsg,
    visibility: vis,
  };
}

// ── HIGH KNEES ────────────────────────────────────────────────
function trackHighKnees(lm) {
  const vis = getVis(lm, MP.L_HIP, MP.L_KNEE, MP.R_HIP, MP.R_KNEE);

  const lHip = lm[MP.L_HIP];
  const rHip = lm[MP.R_HIP];
  const lKnee = lm[MP.L_KNEE];
  const rKnee = lm[MP.R_KNEE];

  // Height of knee relative to hip (negative y = higher in image coords)
  const lKneeHeight = lHip.y - lKnee.y;
  const rKneeHeight = rHip.y - rKnee.y;
  const maxHeight = Math.max(lKneeHeight, rKneeHeight);

  // Convert to angle-like metric (0-180)
  const angle = Math.max(0, Math.min(180, maxHeight * 400 + 90));

  return {
    angle,
    atBottom: maxHeight < 0.01,  // knee is low
    atTop: maxHeight > 0.12,     // knee is high
    feedback: maxHeight < 0.08 ? 'Lift knees higher — to waist level' : 'Good height!',
    formMsg: '',
    visibility: vis,
  };
}

// ── GLUTE BRIDGE ──────────────────────────────────────────────
function trackGluteBridge(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.L_HIP, MP.L_KNEE);

  const shoulder = avgPoint(lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  const hip = avgPoint(lm[MP.L_HIP], lm[MP.R_HIP]);
  const knee = avgPoint(lm[MP.L_KNEE], lm[MP.R_KNEE]);

  const angle = calcAngle(shoulder, hip, knee);

  let formMsg = '';
  if (angle > 150) formMsg = 'Squeeze glutes at the top';

  return {
    angle,
    atBottom: angle < 130,
    atTop: angle > 170,
    feedback: angle < 150 ? 'Push hips up higher' : 'Hold at the top, then lower',
    formMsg,
    visibility: vis,
  };
}

// ── PLANK ─────────────────────────────────────────────────────
function trackPlank(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.L_HIP, MP.L_ANKLE);

  const shoulder = avgPoint(lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  const hip = avgPoint(lm[MP.L_HIP], lm[MP.R_HIP]);
  const ankle = avgPoint(lm[MP.L_ANKLE] || lm[MP.L_HEEL], lm[MP.R_ANKLE] || lm[MP.R_HEEL]);

  const hipSag = hip.y - (shoulder.y + ankle.y) / 2;
  const bodyAngle = calcAngle(shoulder, hip, ankle);

  let formMsg = '';
  if (hipSag > 0.05) formMsg = 'Lift hips — keep body straight';
  else if (hipSag < -0.05) formMsg = 'Lower hips — avoid piking';

  return {
    angle: bodyAngle,
    atBottom: false,
    atTop: false,
    feedback: Math.abs(hipSag) < 0.04 ? 'Perfect plank position! Breathe.' : formMsg,
    formMsg,
    visibility: vis,
  };
}

// ── JUMPING JACKS ─────────────────────────────────────────────
function trackJumpingJacks(lm) {
  const vis = getVis(lm, MP.L_SHOULDER, MP.R_SHOULDER, MP.L_WRIST, MP.R_WRIST);

  const lShoulder = lm[MP.L_SHOULDER];
  const rShoulder = lm[MP.R_SHOULDER];
  const lWrist = lm[MP.L_WRIST];
  const rWrist = lm[MP.R_WRIST];

  // Arm spread: difference in wrist x positions
  const armSpread = Math.abs((lWrist?.x || 0) - (rWrist?.x || 0));
  const angle = Math.min(180, armSpread * 250);

  return {
    angle,
    atBottom: armSpread < 0.15,
    atTop: armSpread > 0.5,
    feedback: armSpread < 0.3 ? 'Spread arms and legs wide' : 'Back to center',
    formMsg: '',
    visibility: vis,
  };
}

// ── CALF RAISE ────────────────────────────────────────────────
function trackCalfRaise(lm) {
  const vis = getVis(lm, MP.L_ANKLE, MP.L_HEEL, MP.R_ANKLE, MP.R_HEEL);

  // Heel lifting = heel y decreasing (moving up in image)
  const lHeel = lm[MP.L_HEEL] || lm[MP.L_FOOT];
  const rHeel = lm[MP.R_HEEL] || lm[MP.R_FOOT];
  const lAnkle = lm[MP.L_ANKLE];
  const rAnkle = lm[MP.R_ANKLE];

  const lLift = lHeel && lAnkle ? lAnkle.y - lHeel.y : 0;
  const rLift = rHeel && rAnkle ? rAnkle.y - rHeel.y : 0;
  const lift = (lLift + rLift) / 2;

  const angle = Math.max(0, Math.min(180, 90 + lift * 600));

  return {
    angle,
    atBottom: lift < 0.01,
    atTop: lift > 0.04,
    feedback: lift < 0.02 ? 'Rise higher on toes' : 'Lower heels back down',
    formMsg: '',
    visibility: vis,
  };
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS STORAGE
// ═══════════════════════════════════════════════════════════════
function saveWorkoutSession() {
  const session = {
    date: new Date().toISOString(),
    exercise: S.selectedEx,
    reps: S.totalReps,
    sets: S.setCount,
    duration: Math.round((Date.now() - (S.sessionStart || Date.now())) / 1000),
  };

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('fh_history') || '[]');
  } catch { history = []; }

  history.unshift(session);
  if (history.length > 100) history = history.slice(0, 100); // max 100 entries

  localStorage.setItem('fh_history', JSON.stringify(history));
  renderHistory();
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('fh_history') || '[]');
  } catch { return []; }
}

function renderHistory() {
  const history = loadHistory();
  const list = $('historyList');
  if (!list) return;

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">No workouts yet. Start your first session!</div>';
    $('streakNum').textContent = '0';
    return;
  }

  list.innerHTML = '';
  history.slice(0, 20).forEach(s => {
    const d = new Date(s.date);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const mins = Math.floor((s.duration || 0) / 60);
    const secs = (s.duration || 0) % 60;

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="hi-date">${label}</div>
      <div class="hi-info">
        <div class="hi-name">${s.exercise}</div>
        <div class="hi-meta">${s.reps} reps · ${s.sets} sets · ${mins}:${String(secs).padStart(2,'0')}</div>
      </div>
      <span class="hi-badge">✓ Done</span>`;
    list.appendChild(item);
  });

  // Streak calc
  $('streakNum').textContent = calculateStreak(history);
}

function calculateStreak(history) {
  if (!history.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [...new Set(history.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  let streak = 0;
  let expected = today.getTime();

  for (const day of uniqueDays) {
    if (day === expected) {
      streak++;
      expected -= 86400000;
    } else if (day === expected + 86400000) {
      // today was yesterday's
      expected = day - 86400000;
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function bindHistory() {
  const clearBtn = $('btnClearHistory');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all workout history?')) {
        localStorage.removeItem('fh_history');
        renderHistory();
        toast('History cleared');
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════════
function bindProfile() {
  let editGoal = S.profile?.goal || null;

  // Populate fields
  if (S.profile) {
    const p = S.profile;
    $('pe-name').value = p.name || '';
    $('pe-age').value = p.age || '';
    $('pe-weight').value = p.weight || '';
    $('pe-height').value = p.height || '';

    // Profile card
    $('pcbAvatar').textContent = (p.name || 'U').charAt(0).toUpperCase();
    $('pcbName').textContent = p.name || 'User';
    $('pcbGoal').textContent = p.goalLabel || p.goal || '—';
    $('pcbAge').textContent = p.age ? `${p.age}y` : '—';
    $('pcbWeight').textContent = p.weight ? `${p.weight}kg` : '—';
    $('pcbHeight').textContent = p.height ? `${p.height}cm` : '—';
  }

  $$('#peGoalGrid .goal-opt').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.goal === editGoal);
    btn.addEventListener('click', () => {
      $$('#peGoalGrid .goal-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      editGoal = btn.dataset.goal;
    });
  });

  $('btnSaveProfile').addEventListener('click', () => {
    const name = $('pe-name').value.trim();
    if (!name) { toast('Name required'); return; }

    const sel = $$('#peGoalGrid .goal-opt.selected')[0];
    S.profile = {
      ...S.profile,
      name,
      age: $('pe-age').value,
      weight: $('pe-weight').value,
      height: $('pe-height').value,
      goal: editGoal,
      goalLabel: sel?.textContent || editGoal,
    };

    localStorage.setItem('fh_profile', JSON.stringify(S.profile));

    // Update display
    $('pcbAvatar').textContent = name.charAt(0).toUpperCase();
    $('pcbName').textContent = name;
    $('pcbGoal').textContent = S.profile.goalLabel || S.profile.goal;
    $('pcbAge').textContent = S.profile.age ? `${S.profile.age}y` : '—';
    $('pcbWeight').textContent = S.profile.weight ? `${S.profile.weight}kg` : '—';
    $('pcbHeight').textContent = S.profile.height ? `${S.profile.height}cm` : '—';

    updateTopbar();

    const msg = $('savePEMsg');
    msg.textContent = '✓ Profile updated';
    setTimeout(() => { msg.textContent = ''; }, 2500);
    toast('Profile updated!');
  });
}

// ═══════════════════════════════════════════════════════════════
// TOAST & UTILS
// ═══════════════════════════════════════════════════════════════
let toastTimer;
function toast(msg) {
  clearTimeout(toastTimer);
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
