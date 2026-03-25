/* ============================================================
   AI WORKOUT TRAINER — pdf.js
   PDF Generation: White theme, jsPDF auto-loaded from CDN
   Includes: Profile, 7-day workout plan, full diet plan
   ============================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// DIET PLAN DATABASE
// ═══════════════════════════════════════════════════════════════
const DIET_DB = {
  'fat-loss': {
    label: 'Fat Loss — Low Calorie, High Protein',
    calories: '1600–1900 kcal/day',
    macros: 'Protein 40% · Carbs 35% · Fat 25%',
    breakfast: [
      '3 egg whites + 1 whole egg scramble with spinach & tomato',
      '½ cup oatmeal with berries (no added sugar)',
      'Black coffee or green tea (unsweetened)',
    ],
    lunch: [
      '150g grilled chicken breast (no skin)',
      '1 cup brown rice or quinoa',
      'Mixed salad with lemon & olive oil dressing',
      '1 medium apple',
    ],
    dinner: [
      '150g baked salmon or tilapia',
      'Steamed broccoli, cauliflower, and green beans',
      '½ cup sweet potato (boiled)',
      'Warm lemon water',
    ],
    snacks: [
      '1 scoop whey protein (water-based shake)',
      'Greek yogurt 0% fat with cucumber slices',
      'Handful of almonds (15–20 pieces)',
      'Rice cakes with a thin spread of peanut butter',
    ],
    tips: [
      'Drink 3–4 litres of water per day minimum',
      'Avoid sugar, refined carbs, fried foods, and alcohol',
      'Eat every 3–4 hours to keep metabolism elevated',
      'Last meal should be at least 2 hours before sleep',
      'Do 20 min light cardio (walk/cycle) on rest days',
    ],
  },
  'muscle-gain': {
    label: 'Muscle Gain — High Protein, High Calorie (Bulk)',
    calories: '2800–3400 kcal/day',
    macros: 'Protein 35% · Carbs 45% · Fat 20%',
    breakfast: [
      '4 whole eggs scrambled with cheese, veggies & olive oil',
      '2 slices whole wheat toast with almond butter',
      '1 large banana + 1 glass full-fat milk',
      '1 cup oatmeal with honey and walnuts',
    ],
    lunch: [
      '200g grilled chicken breast or lean beef (steak/mince)',
      '1.5 cups brown rice or pasta',
      'Mixed vegetables stir-fried in olive oil',
      '1 large fruit (mango, banana, or pear)',
    ],
    dinner: [
      '200g salmon or chicken thighs',
      '1 cup white/brown rice + 1 cup cooked lentils (dal)',
      'Roasted sweet potato and broccoli',
      '1 glass whole milk or protein shake',
    ],
    snacks: [
      'Post-workout: 1–2 scoops whey protein + 1 banana',
      'Peanut butter sandwich on 2 slices wholegrain bread',
      'Mixed nuts, dried fruits, and dark chocolate',
      'Cottage cheese with pineapple or berries',
    ],
    tips: [
      'Consume protein within 30 minutes of finishing workout',
      'Focus on compound movements: bench, squat, deadlift, OHP',
      'Sleep 7–9 hours for maximum muscle protein synthesis',
      'Target +300–500 kcal above your maintenance calories',
      'Track your lifts weekly — progressive overload is key',
    ],
  },
  'strength': {
    label: 'Strength Building — Moderate Calories, High Protein',
    calories: '2400–2800 kcal/day',
    macros: 'Protein 38% · Carbs 42% · Fat 20%',
    breakfast: [
      '3 whole eggs + 2 egg whites with sautéed vegetables',
      '2 slices whole grain toast',
      '1 cup Greek yogurt with honey',
      'Coffee or green tea',
    ],
    lunch: [
      '180g grilled chicken, turkey, or tuna',
      '1 cup brown rice + 1 cup roasted vegetables',
      'Mixed salad with balsamic vinegar dressing',
      '1 seasonal fruit',
    ],
    dinner: [
      '180g lean red meat (sirloin) or salmon fillet',
      '1 cup sweet potato or quinoa',
      'Steamed asparagus or broccoli',
      '1 glass low-fat milk',
    ],
    snacks: [
      'Protein shake with almond milk (post-workout)',
      '2–3 hard-boiled eggs',
      'Hummus with carrot and celery sticks',
      'Trail mix: almonds, cashews, pumpkin seeds',
    ],
    tips: [
      'Focus on progressive overload — add weight every week',
      'Rest 2–3 minutes between heavy compound sets',
      'Eat complex carbs 1–2 hours pre-workout for energy',
      'Consider creatine monohydrate 5g/day for strength gains',
      'Keep a training log to track PRs and identify plateaus',
    ],
  },
  'endurance': {
    label: 'Endurance / Stamina — Carbohydrate Focused',
    calories: '2200–2800 kcal/day',
    macros: 'Protein 25% · Carbs 55% · Fat 20%',
    breakfast: [
      '1.5 cups oatmeal with banana, honey, and chia seeds',
      '2 whole eggs or 1 scoop protein powder',
      '1 glass fresh orange juice',
      'Coffee or green tea',
    ],
    lunch: [
      '150g grilled chicken, white fish, or tofu',
      '1.5 cups pasta or white rice with marinara sauce',
      'Green salad with olive oil and lemon',
      '1 medium banana or mango',
    ],
    dinner: [
      '150g baked fish (cod, tilapia, or salmon)',
      '1 cup whole grain rice or couscous',
      'Steamed broccoli and roasted sweet potato',
      '1 glass low-fat milk',
    ],
    snacks: [
      'Banana or dates + peanut butter (pre-workout energy)',
      'Sports drink or electrolyte water during long sessions',
      'Rice cakes with jam or honey',
      'Low-fat yogurt with granola',
    ],
    tips: [
      'Carb-load the evening before long training sessions',
      'Hydrate well: drink 500ml water 1 hour before exercise',
      'Include dedicated rest days to prevent overtraining',
      'Electrolyte supplements (sodium, potassium) for 60+ min cardio',
      'Increase carb intake on heavy training days',
    ],
  },
  'full-fitness': {
    label: 'Full Body Fitness — Balanced Diet',
    calories: '2000–2500 kcal/day',
    macros: 'Protein 30% · Carbs 42% · Fat 28%',
    breakfast: [
      '2 whole eggs + 1 egg white omelette with spinach and tomato',
      '1 cup oatmeal with mixed berries',
      '1 banana',
      'Green tea or black coffee',
    ],
    lunch: [
      '150g grilled chicken, fish, or legumes',
      '1 cup brown rice or whole grain wrap',
      'Rainbow salad with olive oil dressing',
      '1 seasonal fruit',
    ],
    dinner: [
      '150g salmon, chicken, or paneer',
      '1 cup quinoa or sweet potato',
      'Roasted/steamed mixed vegetables',
      '1 cup warm milk or herbal tea',
    ],
    snacks: [
      '1 scoop whey protein shake',
      'Handful of mixed nuts (almonds, walnuts)',
      'Apple with natural peanut butter',
      'Low-fat Greek yogurt',
    ],
    tips: [
      'Eat 4–5 small meals spread throughout the day',
      'Prioritise whole, unprocessed foods over packaged items',
      'Minimum 2.5 litres of water daily',
      'Include one rest day per week for full recovery',
      'Combine cardio (2–3x/week) with resistance training (3–4x/week)',
    ],
  },
  default: {
    label: 'Balanced Fitness Diet',
    calories: '2000–2400 kcal/day',
    macros: 'Protein 30% · Carbs 42% · Fat 28%',
    breakfast: ['3 eggs with whole grain toast', '1 cup oatmeal with fruit', 'Green tea or coffee'],
    lunch: ['150g lean protein', '1 cup rice or pasta', 'Mixed salad', '1 fruit'],
    dinner: ['150g fish or chicken', '1 cup vegetables', '½ cup complex carbs'],
    snacks: ['Protein shake', 'Mixed nuts', 'Fruit with nut butter'],
    tips: [
      'Eat every 3–4 hours', 'Drink 2.5–3L water daily',
      'Prioritise whole foods', 'Balance macronutrients at every meal',
    ],
  },
};

function getDiet(goal) {
  return DIET_DB[goal] || DIET_DB['default'];
}

// ═══════════════════════════════════════════════════════════════
// LOAD jsPDF
// ═══════════════════════════════════════════════════════════════
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    const existing = window.jspdf?.jsPDF || window.jsPDF;
    if (existing) { resolve(existing); return; }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      jsPDF ? resolve(jsPDF) : reject(new Error('jsPDF not found'));
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF CDN'));
    document.head.appendChild(script);
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════
async function generatePDF(profile, weeklyPlan, goalLabels) {
  let jsPDF;
  try {
    jsPDF = await loadJsPDF();
  } catch {
    alert('Could not load PDF library. Check your internet connection and try again.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();   // 210
  const PH = doc.internal.pageSize.getHeight();  // 297
  const M = 18; // margin
  let y = 0;

  const diet = getDiet(profile?.goal);
  const goalLabel = goalLabels?.[profile?.goal] || profile?.goal || 'General Fitness';

  // ── HELPERS ──────────────────────────────────────────────────
  function checkPage(need = 18) {
    if (y + need > PH - 18) addPage();
  }

  function addPage() {
    doc.addPage();
    y = 0;
    drawRunningHeader();
  }

  function font(family, style, size) {
    doc.setFont(family, style);
    doc.setFontSize(size);
  }

  function color(r, g, b) { doc.setTextColor(r, g, b); }
  function fill(r, g, b) { doc.setFillColor(r, g, b); }
  function stroke(r, g, b) { doc.setDrawColor(r, g, b); }

  function drawRunningHeader() {
    fill(15, 15, 20);
    doc.rect(0, 0, PW, 11, 'F');
    font('helvetica', 'bold', 7);
    color(255, 107, 43);
    doc.text('AI WORKOUT TRAINER', M, 7.5);
    color(140, 140, 160);
    const pg = `Page ${doc.internal.getNumberOfPages()}`;
    doc.text(pg, PW - M, 7.5, { align: 'right' });
    y = 20;
  }

  function sectionBand(text, r = 15, g = 15, b = 20) {
    checkPage(16);
    fill(r, g, b);
    doc.rect(M - 5, y - 5, PW - M * 2 + 10, 13, 'F');
    font('helvetica', 'bold', 11);
    color(r < 50 ? 255 : 30, g < 50 ? 255 : 30, b < 50 ? 255 : 30);
    doc.text(text, M, y + 3.5);
    y += 16;
    color(30, 30, 30);
  }

  function subHead(text) {
    checkPage(12);
    font('helvetica', 'bold', 9.5);
    color(20, 20, 20);
    doc.text(text, M, y);
    y += 6;
    stroke(210, 210, 210);
    doc.line(M, y - 1, PW - M, y - 1);
    y += 3;
  }

  function body(text, indent = 0) {
    checkPage(8);
    font('helvetica', 'normal', 8.5);
    color(55, 55, 55);
    const lines = doc.splitTextToSize(text, PW - M * 2 - indent);
    doc.text(lines, M + indent, y);
    y += lines.length * 5.2;
  }

  function bullet(text, indent = 4) {
    checkPage(8);
    font('helvetica', 'normal', 8.5);
    color(60, 60, 60);
    const lines = doc.splitTextToSize(`• ${text}`, PW - M * 2 - indent);
    doc.text(lines, M + indent, y);
    y += lines.length * 5.2;
  }

  function kv(key, val) {
    checkPage(7);
    font('helvetica', 'bold', 8.5);
    color(40, 40, 40);
    doc.text(`${key}:`, M, y);
    font('helvetica', 'normal', 8.5);
    color(80, 80, 80);
    doc.text(String(val), M + doc.getTextWidth(`${key}: `) + 1, y);
    y += 6.5;
  }

  function sp(h = 5) { y += h; }

  // ══════════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ══════════════════════════════════════════════════════════════

  // Dark top block
  fill(10, 10, 15);
  doc.rect(0, 0, PW, 88, 'F');

  // Orange accent stripe
  fill(255, 107, 43);
  doc.rect(0, 88, PW, 3.5, 'F');

  // App title
  font('helvetica', 'bold', 32);
  color(255, 255, 255);
  doc.text('AI WORKOUT', PW / 2, 30, { align: 'center' });
  color(255, 107, 43);
  doc.text('TRAINER', PW / 2, 52, { align: 'center' });

  font('helvetica', 'normal', 9);
  color(160, 160, 180);
  doc.text('Personalized Fitness & Nutrition Plan', PW / 2, 66, { align: 'center' });

  // Date
  const now = new Date();
  font('helvetica', 'normal', 7.5);
  color(100, 100, 120);
  doc.text(`Generated: ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, PW / 2, 80, { align: 'center' });

  y = 102;

  // Profile card on cover
  if (profile?.name) {
    fill(248, 248, 252);
    stroke(220, 220, 230);
    doc.roundedRect(M, y, PW - M * 2, 52, 4, 4, 'FD');

    const cx = M + 28;
    // Avatar circle
    fill(255, 107, 43);
    doc.circle(cx, y + 20, 14, 'F');
    font('helvetica', 'bold', 14);
    color(255, 255, 255);
    doc.text(profile.name.charAt(0).toUpperCase(), cx, y + 24.5, { align: 'center' });

    const tx = M + 50;
    font('helvetica', 'bold', 13);
    color(20, 20, 20);
    doc.text(profile.name, tx, y + 14);

    font('helvetica', 'normal', 8.5);
    color(120, 120, 140);
    doc.text(`Goal: ${goalLabel}`, tx, y + 23);

    font('helvetica', 'normal', 8);
    color(100, 100, 100);
    let infoY = y + 33;
    if (profile.age) { doc.text(`Age: ${profile.age} yrs`, tx, infoY); infoY += 7; }
    if (profile.weight) { doc.text(`Weight: ${profile.weight} kg`, tx, infoY); }
    if (profile.height) { doc.text(`Height: ${profile.height} cm`, tx + 45, infoY); }

    y += 60;
  }

  sp(6);

  // Contents block
  fill(250, 250, 252);
  stroke(220, 220, 230);
  doc.roundedRect(M, y, PW - M * 2, 50, 3, 3, 'FD');
  y += 10;

  font('helvetica', 'bold', 9);
  color(30, 30, 30);
  doc.text('CONTENTS', M + 6, y);
  y += 9;

  const contents = [
    '1.  Weekly Workout Plan (Days 1–7)',
    '2.  Exercise Details with Adjustable Sets',
    '3.  Daily Diet Plan (Breakfast, Lunch, Dinner, Snacks)',
    '4.  Nutrition Tips & Goal-Based Guidance',
  ];

  font('helvetica', 'normal', 8.5);
  color(70, 70, 70);
  contents.forEach(c => {
    doc.text(c, M + 10, y);
    y += 7;
  });

  // ══════════════════════════════════════════════════════════════
  // PAGE 2: WEEKLY WORKOUT PLAN
  // ══════════════════════════════════════════════════════════════
  addPage();

  sectionBand('WEEKLY WORKOUT PLAN');
  sp(3);

  weeklyPlan.forEach((day, i) => {
    checkPage(20);

    // Day header row
    fill(242, 244, 248);
    stroke(220, 222, 228);
    doc.rect(M - 3, y - 4, PW - M * 2 + 6, 11, 'FD');

    font('helvetica', 'bold', 9.5);
    color(255, 107, 43);
    doc.text(`DAY ${day.day}`, M, y + 3);

    font('helvetica', 'bold', 9.5);
    color(20, 20, 20);
    doc.text(day.name, M + 20, y + 3);

    font('helvetica', 'normal', 7.5);
    color(140, 140, 140);
    doc.text(day.tag, PW - M, y + 3, { align: 'right' });

    y += 14;

    day.exercises.forEach(ex => {
      checkPage(8);
      font('helvetica', 'normal', 8.5);
      color(50, 50, 50);
      doc.text(`  • ${ex.name}`, M, y);

      if (ex.sets > 0) {
        font('helvetica', 'bold', 8);
        color(180, 180, 180);
        doc.text(`${ex.sets} sets`, PW - M, y, { align: 'right' });
      }
      y += 5.5;
    });

    if (day.note) {
      checkPage(10);
      fill(240, 248, 255);
      doc.rect(M, y, PW - M * 2, 9, 'F');
      font('helvetica', 'italic', 7.5);
      color(100, 120, 140);
      doc.text(`  ${day.note}`, M + 3, y + 5.5);
      y += 12;
    }

    sp(4);
    stroke(225, 225, 225);
    doc.line(M, y - 2, PW - M, y - 2);
    sp(2);
  });

  // ══════════════════════════════════════════════════════════════
  // PAGE 3+: DIET PLAN
  // ══════════════════════════════════════════════════════════════
  addPage();

  sectionBand('DAILY DIET PLAN');
  sp(4);

  // Diet overview pill
  fill(255, 249, 240);
  stroke(255, 200, 140);
  doc.roundedRect(M - 3, y - 3, PW - M * 2 + 6, 22, 3, 3, 'FD');
  font('helvetica', 'bold', 9.5);
  color(180, 80, 0);
  doc.text(diet.label, M + 2, y + 5);
  font('helvetica', 'normal', 8);
  color(120, 80, 30);
  doc.text(`Target: ${diet.calories}`, M + 2, y + 13);
  doc.text(`Macros: ${diet.macros}`, M + 70, y + 13);
  y += 28;

  subHead('🍳  Breakfast');
  diet.breakfast.forEach(i => bullet(i));
  sp(5);

  subHead('🥗  Lunch');
  diet.lunch.forEach(i => bullet(i));
  sp(5);

  checkPage(45);
  subHead('🍽  Dinner');
  diet.dinner.forEach(i => bullet(i));
  sp(5);

  checkPage(45);
  subHead('🥜  Snacks & Supplements');
  diet.snacks.forEach(i => bullet(i));
  sp(8);

  // Nutrition tips
  checkPage(55);
  fill(15, 15, 20);
  doc.rect(M - 5, y - 5, PW - M * 2 + 10, 12, 'F');
  font('helvetica', 'bold', 10);
  color(255, 107, 43);
  doc.text('NUTRITION TIPS', M, y + 3.5);
  y += 16;

  diet.tips.forEach(t => bullet(t));
  sp(8);

  // ══════════════════════════════════════════════════════════════
  // FINAL BLOCK: Disclaimer
  // ══════════════════════════════════════════════════════════════
  checkPage(55);
  fill(250, 250, 252);
  stroke(220, 220, 230);
  doc.roundedRect(M - 3, y - 3, PW - M * 2 + 6, 52, 4, 4, 'FD');
  y += 6;

  font('helvetica', 'bold', 9);
  color(80, 80, 100);
  doc.text('DISCLAIMER', M + 4, y);
  y += 8;

  font('helvetica', 'normal', 7.5);
  color(120, 120, 140);
  const disc = 'This plan is generated by AI Workout Trainer for informational and motivational purposes only. It is not a substitute for professional medical, nutritional, or personal training advice. Always consult a qualified healthcare provider or certified fitness professional before starting a new exercise or diet program. Results may vary based on individual body composition, health status, and consistency.';
  const discLines = doc.splitTextToSize(disc, PW - M * 2 - 8);
  doc.text(discLines, M + 4, y);
  y += discLines.length * 5 + 8;

  font('helvetica', 'bold', 8);
  color(255, 107, 43);
  doc.text('© AI Workout Trainer — Built with dedication to your fitness journey.', M + 4, y);

  // ── Save ─────────────────────────────────────────────────────
  const fname = profile?.name
    ? `AWT_${profile.name.replace(/\s+/g, '_')}_FitnessPlan.pdf`
    : 'AWT_FitnessPlan.pdf';

  doc.save(fname);
}

window.generatePDF = generatePDF;
