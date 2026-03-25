/* ============================================================
   FitHome — pdf.js
   White-theme PDF: Profile, Weekly Plan, Diet Plan
   Uses jsPDF loaded from CDN
   ============================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// DIET PLANS (goal-based)
// ═══════════════════════════════════════════════════════════════
const DIET = {
  'fat-loss': {
    label: 'Fat Loss — High Protein, Low Calorie',
    calories: '1600–1900 kcal/day',
    macros: 'Protein 40% · Carbs 35% · Fat 25%',
    breakfast: ['3 egg whites + 1 whole egg with spinach', 'Half cup oatmeal with berries', 'Black coffee or green tea'],
    lunch: ['150g grilled chicken breast', '1 cup brown rice', 'Mixed salad with lemon & olive oil'],
    dinner: ['150g baked fish (salmon/tilapia)', 'Steamed broccoli and cauliflower', 'Half cup sweet potato'],
    snacks: ['Whey protein shake', 'Greek yogurt 0% fat', 'Handful almonds (15–20)', 'Rice cakes'],
    tips: ['Drink 3–4 litres water daily', 'Avoid sugar, fried foods, alcohol', 'Eat every 3–4 hours', 'Last meal 2 hours before sleep'],
  },
  'muscle-gain': {
    label: 'Muscle Gain — High Protein, High Calorie',
    calories: '2800–3400 kcal/day',
    macros: 'Protein 35% · Carbs 45% · Fat 20%',
    breakfast: ['4 whole eggs with cheese and veggies', '2 slices whole wheat toast', '1 banana + glass whole milk', 'Oatmeal with honey'],
    lunch: ['200g grilled chicken or lean beef', '1.5 cups brown rice or pasta', 'Vegetables stir-fried in olive oil'],
    dinner: ['200g salmon or chicken thighs', '1 cup rice + 1 cup lentils', 'Roasted sweet potato & broccoli'],
    snacks: ['Whey protein + banana (post-workout)', 'Peanut butter sandwich', 'Mixed nuts and dried fruit', 'Cottage cheese with fruit'],
    tips: ['Protein within 30 min after workout', 'Aim for +300–500 kcal above maintenance', 'Sleep 7–9 hours for muscle recovery', 'Progressive overload weekly'],
  },
  'beginner': {
    label: 'Beginner — Balanced, Sustainable Nutrition',
    calories: '1800–2200 kcal/day',
    macros: 'Protein 30% · Carbs 45% · Fat 25%',
    breakfast: ['2 whole eggs with whole grain toast', '1 cup oatmeal with fruit', 'Green tea or coffee'],
    lunch: ['150g lean protein (chicken/paneer/tofu)', '1 cup rice or roti', 'Mixed salad'],
    dinner: ['150g fish or chicken curry', '1 cup vegetables', 'Half cup rice or 1 roti'],
    snacks: ['Fruit with peanut butter', 'Mixed nuts', 'Low-fat yogurt'],
    tips: ['Start slow — consistency beats intensity', 'Eat real food, avoid processed snacks', 'Hydrate well — 2.5L water minimum', 'Rest is part of training'],
  },
  'endurance': {
    label: 'Endurance — Carb-Focused Energy',
    calories: '2200–2800 kcal/day',
    macros: 'Protein 25% · Carbs 55% · Fat 20%',
    breakfast: ['1.5 cups oatmeal with banana and honey', '2 eggs or protein shake', 'Fresh orange juice'],
    lunch: ['150g chicken or tofu', '1.5 cups pasta or rice', 'Green salad with olive oil'],
    dinner: ['150g baked fish', '1 cup whole grain rice', 'Steamed vegetables + sweet potato'],
    snacks: ['Banana + dates pre-workout', 'Sports drink for 60+ min sessions', 'Rice cakes with jam'],
    tips: ['Carb-load before long sessions', 'Electrolytes for 60+ min cardio', 'Hydrate: 500ml water 1 hour before', 'Increase carbs on heavy training days'],
  },
  'lean': {
    label: 'Lean Body (Cutting) — Calorie Deficit',
    calories: '1700–2000 kcal/day',
    macros: 'Protein 40% · Carbs 35% · Fat 25%',
    breakfast: ['Egg white omelette with spinach & tomato', 'Half cup oatmeal', 'Black coffee'],
    lunch: ['150g grilled chicken', 'Large salad with balsamic dressing', 'Half cup quinoa'],
    dinner: ['150g white fish or tofu', 'Steamed vegetables', 'Small portion sweet potato'],
    snacks: ['Protein shake', 'Celery with hummus', 'Apple', 'Green tea'],
    tips: ['Track calories for first 2 weeks', 'High volume, low calorie vegetables help', 'Protein preserves muscle in a deficit', 'Avoid liquid calories'],
  },
  'strength': {
    label: 'Strength — Fuel for Heavy Lifting',
    calories: '2400–2800 kcal/day',
    macros: 'Protein 38% · Carbs 42% · Fat 20%',
    breakfast: ['3 eggs + 2 egg whites with vegetables', '2 slices whole grain toast', 'Greek yogurt with honey'],
    lunch: ['180g grilled chicken or lean beef', '1 cup brown rice + roasted vegetables', 'Balsamic salad'],
    dinner: ['180g salmon or lean steak', '1 cup sweet potato or quinoa', 'Steamed asparagus or broccoli'],
    snacks: ['Protein shake (post-workout)', '2–3 hard-boiled eggs', 'Hummus with carrots', 'Trail mix'],
    tips: ['Eat complex carbs 1–2 hours pre-workout', 'Creatine 5g/day can boost strength', 'Rest 2–3 min between heavy sets', 'Sleep 8 hours for strength recovery'],
  },
};

function getDiet(goal) {
  return DIET[goal] || DIET['beginner'];
}

// ═══════════════════════════════════════════════════════════════
// LOAD jsPDF
// ═══════════════════════════════════════════════════════════════
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    const existing = window.jspdf?.jsPDF || window.jsPDF;
    if (existing) { resolve(existing); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => {
      const j = window.jspdf?.jsPDF || window.jsPDF;
      j ? resolve(j) : reject(new Error('jsPDF not found'));
    };
    s.onerror = () => reject(new Error('CDN load failed'));
    document.head.appendChild(s);
  });
}

// ═══════════════════════════════════════════════════════════════
// GENERATE PDF
// ═══════════════════════════════════════════════════════════════
async function generatePDF(profile, dayWorkout, exConfig) {
  let jsPDF;
  try {
    jsPDF = await loadJsPDF();
  } catch {
    alert('Could not load PDF library. Please check your connection.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  let y = 0;

  const diet = getDiet(profile?.goal);
  const goalLabel = profile?.goalLabel || profile?.goal || 'General Fitness';
  const now = new Date();
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // ── HELPERS ──────────────────────────────────────────────────
  function check(n = 18) { if (y + n > H - 18) nextPage(); }
  function nextPage() { doc.addPage(); y = 0; header(); }
  function sp(h = 5) { y += h; }

  function header() {
    doc.setFillColor(17, 24, 18);
    doc.rect(0, 0, W, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(45, 212, 191);
    doc.text('FITHOME — AI WORKOUT TRAINER', M, 7.5);
    doc.setTextColor(130, 160, 140);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, W - M, 7.5, { align: 'right' });
    y = 20;
  }

  function band(text, r = 17, g = 24, b = 18) {
    check(15);
    doc.setFillColor(r, g, b);
    doc.rect(M - 5, y - 5, W - M * 2 + 10, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(r < 50 ? 255 : 20, r < 50 ? 255 : 20, r < 50 ? 255 : 20);
    doc.text(text, M, y + 3);
    y += 14;
    doc.setTextColor(30, 30, 30);
  }

  function subh(text) {
    check(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(text, M, y);
    y += 6;
    doc.setDrawColor(210, 220, 210);
    doc.line(M, y - 1, W - M, y - 1);
    y += 3;
  }

  function body(text, indent = 0) {
    check(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 55, 55);
    const lines = doc.splitTextToSize(text, W - M * 2 - indent);
    doc.text(lines, M + indent, y);
    y += lines.length * 5.2;
  }

  function bullet(text, indent = 4) {
    check(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 55, 55);
    const lines = doc.splitTextToSize(`• ${text}`, W - M * 2 - indent);
    doc.text(lines, M + indent, y);
    y += lines.length * 5.2;
  }

  // ══ PAGE 1: COVER ═══════════════════════════════════════════
  doc.setFillColor(17, 24, 18);
  doc.rect(0, 0, W, 90, 'F');

  // Teal accent
  doc.setFillColor(45, 212, 191);
  doc.rect(0, 90, W, 3, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('FitHome', PW / 2, 30, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(45, 212, 191);
  doc.text('AI Home Workout Trainer', W / 2, 45, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 170, 145);
  doc.text('Your private. Intelligent. Home fitness companion.', W / 2, 58, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(80, 110, 90);
  doc.text(`Generated: ${now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`, W / 2, 75, { align: 'center' });

  y = 105;

  // Profile block
  if (profile?.name) {
    doc.setFillColor(245, 250, 246);
    doc.setDrawColor(200, 225, 210);
    doc.roundedRect(M, y, W - M * 2, 55, 4, 4, 'FD');

    const cx = M + 28;
    doc.setFillColor(45, 212, 191);
    doc.circle(cx, y + 22, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 18);
    doc.text(profile.name.charAt(0).toUpperCase(), cx, y + 26, { align: 'center' });

    const tx = M + 52;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 30, 24);
    doc.text(profile.name, tx, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 110, 85);
    doc.text(`Goal: ${goalLabel}`, tx, y + 24);

    doc.setFontSize(8);
    doc.setTextColor(100, 130, 110);
    let infoX = tx;
    if (profile.age) { doc.text(`Age: ${profile.age}`, infoX, y + 34); infoX += 30; }
    if (profile.weight) { doc.text(`Weight: ${profile.weight}kg`, infoX, y + 34); infoX += 40; }
    if (profile.height) { doc.text(`Height: ${profile.height}cm`, infoX, y + 34); }

    y += 65;
  }

  // Contents
  sp(4);
  doc.setFillColor(248, 252, 249);
  doc.setDrawColor(200, 220, 205);
  doc.roundedRect(M, y, W - M * 2, 52, 3, 3, 'FD');
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 40, 30);
  doc.text('PLAN CONTENTS', M + 6, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 90, 75);
  ['1.  Weekly 7-Day Home Workout Plan', '2.  Exercise Details & Rep Targets', '3.  Daily Diet Plan (Goal-Specific)', '4.  Nutrition Tips & Hydration Guide'].forEach(c => {
    doc.text(c, M + 10, y); y += 7;
  });

  // ══ PAGE 2: WEEKLY WORKOUT ═══════════════════════════════════
  nextPage();
  band('WEEKLY HOME WORKOUT PLAN');
  sp(3);

  const dayEntries = Object.entries(dayWorkout)
    .filter(([d]) => d !== 'null')
    .sort((a, b) => {
      const order = [1,2,3,4,5,6,0];
      return order.indexOf(+a[0]) - order.indexOf(+b[0]);
    });

  dayEntries.forEach(([dayNum, dayData]) => {
    const dn = +dayNum;
    const dayName = DAYS[dn];
    const isSunday = dn === 0;

    check(18);
    doc.setFillColor(240, 246, 242);
    doc.setDrawColor(200, 220, 205);
    doc.rect(M - 3, y - 4, W - M * 2 + 6, 11, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(45, 150, 120);
    doc.text(dayName, M, y + 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 30, 20);
    if (dayData) doc.text(dayData.focus, M + 22, y + 3);
    else doc.text('Rest or Train — Your Choice', M + 22, y + 3);

    y += 14;

    if (isSunday || !dayData) {
      check(8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 140, 115);
      doc.text('  Choose: Rest · Repeat a workout · Try something new', M, y);
      y += 7;
    } else {
      dayData.exercises.forEach(exName => {
        const cfg = exConfig?.[exName];
        check(7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(50, 60, 50);
        const repsStr = cfg ? (cfg.isTimer ? `${cfg.repsTarget}s × ${cfg.sets} sets` : `${cfg.repsTarget} reps × ${cfg.sets} sets`) : '';
        doc.text(`  • ${exName}`, M, y);
        if (repsStr) {
          doc.setTextColor(140, 170, 145);
          doc.setFontSize(7.5);
          doc.text(repsStr, W - M, y, { align: 'right' });
          doc.setFontSize(8.5);
          doc.setTextColor(50, 60, 50);
        }
        y += 5.5;
      });
    }

    sp(4);
    doc.setDrawColor(220, 235, 222);
    doc.line(M, y - 2, W - M, y - 2);
    sp(2);
  });

  // ══ PAGE 3+: DIET PLAN ═══════════════════════════════════════
  nextPage();
  band('DAILY DIET PLAN');
  sp(4);

  // Diet overview
  doc.setFillColor(236, 252, 245);
  doc.setDrawColor(150, 220, 190);
  doc.roundedRect(M - 3, y - 3, W - M * 2 + 6, 22, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 110, 70);
  doc.text(diet.label, M + 2, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 130, 100);
  doc.text(`Daily Target: ${diet.calories}`, M + 2, y + 14);
  doc.text(`Macros: ${diet.macros}`, W / 2, y + 14);
  y += 28;

  subh('🍳  Breakfast');
  diet.breakfast.forEach(i => bullet(i));
  sp(5);

  subh('🥗  Lunch');
  diet.lunch.forEach(i => bullet(i));
  sp(5);

  check(45);
  subh('🍽  Dinner');
  diet.dinner.forEach(i => bullet(i));
  sp(5);

  check(45);
  subh('🥜  Snacks & Supplements');
  diet.snacks.forEach(i => bullet(i));
  sp(8);

  // Tip band
  check(55);
  doc.setFillColor(17, 24, 18);
  doc.rect(M - 5, y - 5, W - M * 2 + 10, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 212, 191);
  doc.text('NUTRITION TIPS', M, y + 3);
  y += 15;

  diet.tips.forEach(t => bullet(t));
  sp(8);

  // Disclaimer
  check(55);
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(210, 225, 210);
  doc.roundedRect(M - 3, y - 3, W - M * 2 + 6, 50, 3, 3, 'FD');
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 100, 80);
  doc.text('DISCLAIMER', M + 4, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 130, 110);
  const disc = 'This plan is for informational purposes only. It is not medical advice. Consult a healthcare professional before starting any new fitness or diet program. FitHome AI tracking is a guide — always listen to your body and stop if you feel pain.';
  const dl = doc.splitTextToSize(disc, W - M * 2 - 8);
  doc.text(dl, M + 4, y);
  y += dl.length * 5 + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(45, 150, 120);
  doc.text('© FitHome — Private. Personal. Powerful.', M + 4, y);

  // Save
  const fname = profile?.name
    ? `FitHome_${profile.name.replace(/\s+/g, '_')}_Plan.pdf`
    : 'FitHome_WorkoutPlan.pdf';

  doc.save(fname);
}

// Helper for cover page (jsPDF uses mm)
const PW = 210;

window.generatePDF = generatePDF;
