/* ============================================================
   AI WORKOUT TRAINER — pdf.js
   PDF Generation (white theme, clean design)
   Uses jsPDF via CDN (auto-loaded when needed)
   ============================================================ */

'use strict';

// ─── DIET PLANS ───────────────────────────────────────────────
const DIET_PLANS = {
  'fat-loss': {
    label: 'Fat Loss — Low Calorie, High Protein',
    calories: '1600–1900 kcal/day',
    macros: 'Protein: 40% | Carbs: 35% | Fat: 25%',
    breakfast: [
      '3 egg whites + 1 whole egg scramble with spinach',
      '½ cup oatmeal with berries (no sugar)',
      '1 cup green tea or black coffee',
    ],
    lunch: [
      '150g grilled chicken breast',
      '1 cup brown rice or quinoa',
      'Mixed salad with olive oil dressing',
      '1 medium apple',
    ],
    dinner: [
      '150g baked salmon or tilapia',
      'Steamed broccoli and cauliflower',
      '½ cup sweet potato',
      'Warm lemon water',
    ],
    snacks: [
      '1 scoop whey protein + water',
      'Greek yogurt (0% fat) with cucumber',
      'Handful of almonds (15–20 pcs)',
      'Rice cakes with peanut butter',
    ],
    tips: [
      'Drink 3–4 litres of water daily',
      'Avoid sugar, fried foods, and processed snacks',
      'Eat every 3–4 hours to keep metabolism active',
      'Last meal at least 2 hours before sleep',
    ],
  },
  'muscle-gain': {
    label: 'Muscle Gain — High Protein, High Calorie',
    calories: '2800–3400 kcal/day',
    macros: 'Protein: 35% | Carbs: 45% | Fat: 20%',
    breakfast: [
      '4 whole eggs scrambled with cheese and veggies',
      '2 slices whole wheat toast',
      '1 banana + 1 glass full-fat milk',
      '1 cup oatmeal with honey',
    ],
    lunch: [
      '200g chicken breast or lean beef',
      '1.5 cups brown rice or pasta',
      'Mixed vegetables with olive oil',
      '1 large fruit (mango/banana)',
    ],
    dinner: [
      '200g salmon or chicken thighs',
      '1 cup rice + 1 cup lentils',
      'Mixed vegetable stir-fry',
      'Whole milk or protein shake',
    ],
    snacks: [
      'Post-workout: Whey protein + banana',
      'Peanut butter sandwich (2 slices WW bread)',
      'Mixed nuts and dried fruits',
      'Cottage cheese with fruit',
    ],
    tips: [
      'Consume protein within 30 minutes post-workout',
      'Prioritize compound exercises (bench, squat, deadlift)',
      'Sleep 7–9 hours for maximum muscle recovery',
      'Track calorie surplus: aim for +300–500 kcal above maintenance',
    ],
  },
  'strength': {
    label: 'Strength Building — Moderate Calorie, High Protein',
    calories: '2400–2800 kcal/day',
    macros: 'Protein: 38% | Carbs: 42% | Fat: 20%',
    breakfast: [
      '3 whole eggs + 2 egg whites with veggies',
      '2 slices whole grain toast',
      '1 cup Greek yogurt',
      'Coffee or green tea',
    ],
    lunch: [
      '180g grilled chicken or turkey',
      '1 cup brown rice + 1 cup vegetables',
      'Salad with balsamic dressing',
      '1 fruit',
    ],
    dinner: [
      '180g lean red meat or salmon',
      '1 cup sweet potato or quinoa',
      'Roasted vegetables',
      '1 glass milk',
    ],
    snacks: [
      'Protein shake with almond milk',
      'Hard boiled eggs (2–3)',
      'Hummus with carrot sticks',
      'Trail mix (nuts + seeds)',
    ],
    tips: [
      'Focus on progressive overload each week',
      'Rest 2–3 minutes between heavy sets',
      'Eat carbs pre-workout for energy',
      'Creatine monohydrate (5g/day) can boost strength',
    ],
  },
  'endurance': {
    label: 'Endurance / Stamina — Carb-Focused',
    calories: '2200–2800 kcal/day',
    macros: 'Protein: 25% | Carbs: 55% | Fat: 20%',
    breakfast: [
      '1.5 cups oatmeal with banana and honey',
      '2 whole eggs or protein shake',
      '1 glass orange juice',
      'Coffee',
    ],
    lunch: [
      '150g grilled chicken or tofu',
      'Pasta with marinara sauce (1.5 cups)',
      'Green salad with olive oil',
      '1 medium banana',
    ],
    dinner: [
      '150g lean fish or chicken',
      '1 cup whole grain rice',
      'Steamed broccoli and sweet potato',
      '1 glass milk',
    ],
    snacks: [
      'Energy bar or banana pre-workout',
      'Dates and almond butter',
      'Rice cakes with jam',
      'Sports drink during long sessions',
    ],
    tips: [
      'Carb-load before long training sessions',
      'Hydrate well before, during, and after exercise',
      'Include rest days to prevent overtraining',
      'Consider electrolyte supplements for long cardio',
    ],
  },
  default: {
    label: 'Balanced Full Body Diet',
    calories: '2000–2400 kcal/day',
    macros: 'Protein: 30% | Carbs: 40% | Fat: 30%',
    breakfast: [
      '2 whole eggs + 2 egg whites with spinach',
      '1 cup oatmeal with mixed berries',
      '1 banana',
      'Green tea or coffee',
    ],
    lunch: [
      '150g grilled chicken or fish',
      '1 cup brown rice or whole grain bread',
      'Mixed salad with olive oil',
      '1 seasonal fruit',
    ],
    dinner: [
      '150g salmon or lean meat',
      '1 cup quinoa or sweet potato',
      'Roasted or steamed vegetables',
      '1 glass warm milk',
    ],
    snacks: [
      '1 scoop whey protein shake',
      'Handful of mixed nuts',
      'Apple with peanut butter',
      'Greek yogurt',
    ],
    tips: [
      'Eat 4–6 small meals throughout the day',
      'Prioritize whole foods over processed',
      'Stay hydrated — minimum 2.5 litres water/day',
      'Plan meals in advance to stay on track',
    ],
  },
};

function getDietPlan(goal) {
  return DIET_PLANS[goal] || DIET_PLANS['default'];
}

// ─── LOAD jsPDF ────────────────────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jsPDF || (window.jspdf && window.jspdf.jsPDF)) {
      resolve(window.jsPDF || window.jspdf.jsPDF);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      if (jsPDF) resolve(jsPDF);
      else reject(new Error('jsPDF not found after load'));
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

// ─── GENERATE PDF ──────────────────────────────────────────────
async function generatePDF(profile, weeklyPlan, goalLabels) {
  let jsPDF;
  try {
    jsPDF = await loadJsPDF();
  } catch (err) {
    alert('Could not load PDF library. Please check your internet connection.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 0;

  // ── HELPERS ──
  function newPage() {
    doc.addPage();
    y = 0;
    drawPageHeader();
  }

  function checkY(needed = 20) {
    if (y + needed > H - 20) newPage();
  }

  function setFont(name, style, size) {
    doc.setFont(name, style);
    doc.setFontSize(size);
  }

  function drawPageHeader() {
    doc.setFillColor(13, 13, 13);
    doc.rect(0, 0, W, 14, 'F');
    setFont('helvetica', 'bold', 8);
    doc.setTextColor(232, 255, 71);
    doc.text('AI WORKOUT TRAINER', margin, 9);
    doc.setTextColor(160, 160, 160);
    doc.text('Personalized Fitness Plan', W - margin, 9, { align: 'right' });
    y = 22;
  }

  function sectionHeading(text, color = [0, 0, 0]) {
    checkY(18);
    doc.setFillColor(...color);
    doc.rect(margin - 4, y - 5, W - margin * 2 + 8, 13, 'F');
    setFont('helvetica', 'bold', 12);
    doc.setTextColor(color[0] < 100 ? 255 : 0, color[0] < 100 ? 255 : 0, color[0] < 100 ? 255 : 0);
    doc.text(text, margin, y + 3);
    y += 14;
    doc.setTextColor(0, 0, 0);
  }

  function subHeading(text) {
    checkY(12);
    setFont('helvetica', 'bold', 10);
    doc.setTextColor(30, 30, 30);
    doc.text(text, margin, y);
    y += 7;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 2, W - margin, y - 2);
    y += 2;
  }

  function bodyText(text, indent = 0) {
    checkY(8);
    setFont('helvetica', 'normal', 9);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, W - margin * 2 - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * 5.5;
  }

  function bulletItem(text, indent = 4) {
    checkY(8);
    setFont('helvetica', 'normal', 9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(`• ${text}`, W - margin * 2 - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * 5.5;
  }

  function keyValue(key, val) {
    checkY(7);
    setFont('helvetica', 'bold', 9);
    doc.setTextColor(40, 40, 40);
    doc.text(key + ': ', margin, y);
    const kw = doc.getTextWidth(key + ': ');
    setFont('helvetica', 'normal', 9);
    doc.setTextColor(80, 80, 80);
    doc.text(String(val), margin + kw, y);
    y += 6.5;
  }

  function spacer(h = 5) {
    y += h;
  }

  // ── PAGE 1: COVER ──────────────────────────────────────────
  // Dark cover band
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 0, W, 80, 'F');

  // Accent bar
  doc.setFillColor(232, 255, 71);
  doc.rect(0, 80, W, 3, 'F');

  // App name
  setFont('helvetica', 'bold', 28);
  doc.setTextColor(232, 255, 71);
  doc.text('AI WORKOUT', W / 2, 32, { align: 'center' });
  doc.text('TRAINER', W / 2, 48, { align: 'center' });

  setFont('helvetica', 'normal', 10);
  doc.setTextColor(180, 180, 180);
  doc.text('Personalized Fitness & Nutrition Plan', W / 2, 62, { align: 'center' });

  // Date
  const now = new Date();
  doc.setTextColor(120, 120, 120);
  setFont('helvetica', 'normal', 8);
  doc.text(`Generated: ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, W / 2, 74, { align: 'center' });

  y = 96;

  // Profile section on cover
  if (profile && profile.name) {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, W - margin * 2, 55, 3, 3, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin, y, W - margin * 2, 55, 3, 3, 'S');

    y += 10;
    setFont('helvetica', 'bold', 14);
    doc.setTextColor(20, 20, 20);
    doc.text(profile.name, margin + 8, y);
    y += 10;

    setFont('helvetica', 'normal', 9);
    doc.setTextColor(100, 100, 100);
    const goalLabel = goalLabels?.[profile.goal] || profile.goal || 'Not Set';
    doc.text(`Goal: ${goalLabel}`, margin + 8, y);
    y += 8;

    if (profile.age) { doc.text(`Age: ${profile.age} years`, margin + 8, y); y += 6; }
    if (profile.weight) { doc.text(`Weight: ${profile.weight} kg`, margin + 8, y); y += 6; }
    if (profile.height) { doc.text(`Height: ${profile.height} cm`, margin + 8, y); y += 6; }
  }

  // Table of contents
  y = 175;
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, W - margin * 2, 50, 'F');
  setFont('helvetica', 'bold', 10);
  doc.setTextColor(30, 30, 30);
  doc.text('Contents', margin + 4, y + 10);
  y += 18;
  const contents = [
    '1. Weekly Workout Plan (Days 1–7)',
    '2. Exercise Details & Sets',
    '3. Daily Diet Plan',
    '4. Nutrition Tips & Guidelines',
  ];
  setFont('helvetica', 'normal', 9);
  doc.setTextColor(70, 70, 70);
  contents.forEach(item => {
    doc.text(item, margin + 8, y);
    y += 7;
  });

  // ── PAGE 2: WEEKLY PLAN ────────────────────────────────────
  newPage();

  sectionHeading('WEEKLY WORKOUT PLAN', [13, 13, 13]);
  spacer(4);

  weeklyPlan.forEach((day, i) => {
    checkY(16);
    // Day header
    doc.setFillColor(240, 240, 235);
    doc.rect(margin - 2, y - 4, W - margin * 2 + 4, 10, 'F');
    setFont('helvetica', 'bold', 10);
    doc.setTextColor(20, 20, 20);
    doc.text(`Day ${day.day}: ${day.name}`, margin, y + 2);
    setFont('helvetica', 'normal', 8);
    doc.setTextColor(130, 130, 130);
    doc.text(day.tag, W - margin, y + 2, { align: 'right' });
    y += 12;

    day.exercises.forEach(ex => {
      checkY(7);
      setFont('helvetica', 'normal', 9);
      doc.setTextColor(50, 50, 50);
      const setsStr = ex.sets > 0 ? `${ex.sets} sets` : '';
      doc.text(`  • ${ex.name}`, margin, y);
      if (setsStr) {
        doc.setTextColor(150, 150, 150);
        doc.text(setsStr, W - margin, y, { align: 'right' });
      }
      y += 5.5;
    });

    if (day.note) {
      checkY(10);
      setFont('helvetica', 'italic', 8);
      doc.setTextColor(120, 120, 120);
      doc.text(`  Note: ${day.note}`, margin, y);
      y += 7;
    }

    spacer(4);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y - 2, W - margin, y - 2);
    spacer(2);
  });

  // ── PAGE 3+: DIET PLAN ─────────────────────────────────────
  newPage();
  const diet = getDietPlan(profile?.goal);

  sectionHeading('DAILY DIET PLAN', [13, 13, 13]);
  spacer(4);

  // Diet overview
  doc.setFillColor(248, 252, 230);
  doc.rect(margin - 2, y - 2, W - margin * 2 + 4, 22, 'F');
  setFont('helvetica', 'bold', 10);
  doc.setTextColor(80, 100, 0);
  doc.text(diet.label, margin + 2, y + 6);
  setFont('helvetica', 'normal', 9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Target Calories: ${diet.calories}`, margin + 2, y + 14);
  doc.text(`Macros: ${diet.macros}`, W / 2, y + 14);
  y += 28;

  // Breakfast
  subHeading('🍳 Breakfast');
  diet.breakfast.forEach(item => bulletItem(item));
  spacer(4);

  // Lunch
  subHeading('🥗 Lunch');
  diet.lunch.forEach(item => bulletItem(item));
  spacer(4);

  // Dinner
  checkY(40);
  subHeading('🍽 Dinner');
  diet.dinner.forEach(item => bulletItem(item));
  spacer(4);

  // Snacks
  checkY(40);
  subHeading('🥜 Snacks & Supplements');
  diet.snacks.forEach(item => bulletItem(item));
  spacer(6);

  // Tips
  checkY(50);
  doc.setFillColor(13, 13, 13);
  doc.rect(margin - 4, y - 4, W - margin * 2 + 8, 8, 'F');
  setFont('helvetica', 'bold', 10);
  doc.setTextColor(232, 255, 71);
  doc.text('NUTRITION TIPS', margin, y + 1);
  y += 12;

  diet.tips.forEach(tip => bulletItem(tip));
  spacer(6);

  // ── FINAL PAGE: DISCLAIMER ─────────────────────────────────
  checkY(60);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin - 2, y - 2, W - margin * 2 + 4, 55, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin - 2, y - 2, W - margin * 2 + 4, 55, 'S');
  y += 6;

  setFont('helvetica', 'bold', 9);
  doc.setTextColor(80, 80, 80);
  doc.text('Important Disclaimer', margin + 4, y);
  y += 8;

  setFont('helvetica', 'normal', 8);
  doc.setTextColor(120, 120, 120);
  const disclaimer = 'This plan is generated by AI Workout Trainer for informational purposes only. It is not a substitute for professional medical or nutritional advice. Consult a qualified fitness trainer or dietitian before starting any new exercise or diet program. Results vary depending on individual body composition, lifestyle, and consistency.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, W - margin * 2 - 8);
  doc.text(disclaimerLines, margin + 4, y);
  y += disclaimerLines.length * 5 + 8;

  setFont('helvetica', 'bold', 8);
  doc.setTextColor(100, 100, 100);
  doc.text('© AI Workout Trainer — Generated with dedication to your fitness goals.', margin + 4, y);

  // ── PAGE NUMBERS ───────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    setFont('helvetica', 'normal', 7);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${i} of ${totalPages}`, W - margin, H - 8, { align: 'right' });
    doc.text('AI Workout Trainer', margin, H - 8);
  }

  // ── SAVE ───────────────────────────────────────────────────
  const filename = profile?.name
    ? `AWT_Plan_${profile.name.replace(/\s+/g, '_')}.pdf`
    : 'AWT_Workout_Plan.pdf';

  doc.save(filename);
}

// Export for use in script.js
window.generatePDF = generatePDF;
