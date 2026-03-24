/* ═══════════════════════════════════════════════════
   APEX — AI WORKOUT TRAINER
   PDF Generator Module
   Uses jsPDF (loaded via CDN in index.html)
═══════════════════════════════════════════════════ */

'use strict';

/**
 * generatePDF
 * Creates and downloads a styled workout plan PDF.
 * @param {Object} plan    - { goal, level, days: [...] }
 * @param {Object|null} profile - { name, age, weight, goal }
 */
function generatePDF(plan, profile) {
  if (typeof window.jspdf === 'undefined') {
    throw new Error('jsPDF not loaded');
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W    = 210;
  const PAGE_H    = 297;
  const MARGIN    = 16;
  const COL_W     = PAGE_W - MARGIN * 2;
  const ACCENT    = [198, 241, 53];   // lime green
  const DARK      = [11, 12, 14];     // near black
  const CARD_BG   = [24, 28, 34];
  const TEXT_MAIN = [240, 242, 245];
  const TEXT_SUB  = [136, 146, 164];

  let y = 0;

  /* ── helpers ── */
  function setFont(style, size, color) {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    if (color) doc.setTextColor(...color);
  }

  function rect(x, ry, w, h, r, fillColor) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, ry, w, h, r, r, 'F');
  }

  function checkNewPage(needed = 30) {
    if (y + needed > PAGE_H - 12) {
      doc.addPage();
      // Minimal header on continuation pages
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
      rect(0, 0, PAGE_W, 8, 0, ACCENT);
      y = 16;
    }
  }

  /* ── PAGE 1 BACKGROUND ── */
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  /* ── HEADER BAND ── */
  rect(0, 0, PAGE_W, 52, 0, CARD_BG);
  rect(0, 0, PAGE_W, 3, 0, ACCENT);

  // Logo
  setFont('bold', 28, ACCENT);
  doc.text('APEX', MARGIN, 22);

  setFont('normal', 9, TEXT_SUB);
  doc.text('AI WORKOUT TRAINER', MARGIN, 30);

  // Title right
  setFont('bold', 13, TEXT_MAIN);
  doc.text('WEEKLY WORKOUT PLAN', PAGE_W - MARGIN, 20, { align: 'right' });

  setFont('normal', 9, TEXT_SUB);
  const dateStr = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  doc.text(`Generated: ${dateStr}`, PAGE_W - MARGIN, 28, { align: 'right' });

  // Goal + Level badges
  const badgeY = 36;
  const goal  = plan.goal  || 'General Fitness';
  const level = plan.level || 'Intermediate';
  rect(PAGE_W - MARGIN - 88, badgeY - 4, 40, 10, 3, [40, 50, 60]);
  rect(PAGE_W - MARGIN - 44, badgeY - 4, 40, 10, 3, [30, 45, 20]);
  setFont('bold', 8, TEXT_SUB);
  doc.text(goal.toUpperCase(),  PAGE_W - MARGIN - 68, badgeY + 2.5, { align: 'center' });
  doc.setTextColor(...ACCENT);
  doc.text(level.toUpperCase(), PAGE_W - MARGIN - 24, badgeY + 2.5, { align: 'center' });

  y = 62;

  /* ── PROFILE CARD ── */
  if (profile && profile.name) {
    rect(MARGIN, y, COL_W, 34, 4, CARD_BG);
    // Accent left bar
    rect(MARGIN, y, 3, 34, 2, ACCENT);

    setFont('bold', 7, ACCENT);
    doc.text('ATHLETE PROFILE', MARGIN + 8, y + 7);

    setFont('bold', 16, TEXT_MAIN);
    doc.text(profile.name.toUpperCase(), MARGIN + 8, y + 17);

    setFont('normal', 9, TEXT_SUB);
    const details = [
      profile.age    ? `Age: ${profile.age}y`       : null,
      profile.weight ? `Weight: ${profile.weight}kg` : null,
      profile.goal   ? `Goal: ${profile.goal}`       : null,
    ].filter(Boolean).join('   |   ');
    doc.text(details, MARGIN + 8, y + 25);
    y += 42;
  }

  /* ── SECTION HEADING ── */
  setFont('bold', 8, ACCENT);
  doc.text('FULL WEEKLY BREAKDOWN', MARGIN, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 68, y - 1, PAGE_W - MARGIN, y - 1);
  y += 8;

  /* ── DAY CARDS ── */
  plan.days.forEach((day) => {
    const isRest = day.isRest;
    const cardH  = isRest ? 18 : 18 + day.exercises.length * 11 + 6;

    checkNewPage(cardH + 6);

    // Card background
    rect(MARGIN, y, COL_W, cardH, 4, CARD_BG);

    // Day label pill
    rect(MARGIN + 4, y + 4, 20, 8, 3, isRest ? [40, 40, 40] : ACCENT);
    setFont('bold', 7, isRest ? TEXT_SUB : DARK);
    doc.text(`DAY ${day.day}`, MARGIN + 14, y + 9.5, { align: 'center' });

    // Day name
    setFont('bold', 11, TEXT_MAIN);
    doc.text(day.name, MARGIN + 30, y + 10);

    if (!isRest) {
      // Exercises count
      setFont('normal', 8, TEXT_SUB);
      doc.text(`${day.exercises.length} exercises`, PAGE_W - MARGIN - 4, y + 10, { align: 'right' });

      // Divider
      doc.setDrawColor(40, 46, 56);
      doc.setLineWidth(0.2);
      doc.line(MARGIN + 4, y + 16, PAGE_W - MARGIN - 4, y + 16);

      let ey = y + 22;

      day.exercises.forEach((ex, ei) => {
        // Alternating row tint
        if (ei % 2 === 1) {
          rect(MARGIN + 4, ey - 4, COL_W - 8, 10, 2, [20, 24, 30]);
        }

        // Exercise name
        setFont('normal', 9, TEXT_MAIN);
        doc.text(ex.name, MARGIN + 8, ey + 2);

        // Detail
        setFont('normal', 7, TEXT_SUB);
        doc.text(ex.detail, MARGIN + 8, ey + 6.5);

        // Sets badge
        rect(PAGE_W - MARGIN - 28, ey - 3, 24, 9, 3, [30, 45, 15]);
        setFont('bold', 9, ACCENT);
        doc.text(`${ex.sets} SETS`, PAGE_W - MARGIN - 16, ey + 3.5, { align: 'center' });

        ey += 11;
      });
    } else {
      // Rest note
      setFont('italic', 8, TEXT_SUB);
      doc.text('Active rest · Stretch · Foam roll · Hydrate well', MARGIN + 30, y + 13);
    }

    y += cardH + 5;
  });

  /* ── FOOTER ── */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    setFont('normal', 7, [60, 70, 80]);
    doc.text('APEX AI Trainer  •  apextrainer.app', MARGIN, PAGE_H - 6);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
    rect(0, PAGE_H - 3, PAGE_W, 3, 0, ACCENT);
  }

  /* ── SAVE ── */
  const filename = `APEX_${(plan.goal || 'Workout').replace(/\s+/g, '_')}_${plan.level || 'Plan'}.pdf`;
  doc.save(filename);
}
