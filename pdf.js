/* ═══════════════════════════════════════════════════════════════
   FitAI — pdf.js
   Workout Plan Printer / PDF Export (no external libraries)
   Uses browser's native window.print() with a styled iframe.
═══════════════════════════════════════════════════════════════ */

'use strict';

const PDFExport = {

  /**
   * Generate and trigger a print-to-PDF for the current workout week.
   * Called via: PDFExport.print()
   */
  print() {
    const profile = (typeof state !== 'undefined' && state.profile) ? state.profile : null;
    const history = (typeof state !== 'undefined' && state.history) ? state.history : [];
    const streak  = (typeof state !== 'undefined' && state.streak)  ? state.streak  : 0;

    const userName  = profile?.name    || 'FitAI User';
    const goalLabel = profile?.goalLabel || 'General Fitness';
    const level     = profile?.level   || 'Beginner';
    const height    = profile?.height  ? profile.height + ' cm' : '—';
    const weight    = profile?.weight  ? profile.weight + ' kg' : '—';
    const dateStr   = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

    // Build week table rows
    const EXERCISES_DATA = (typeof EXERCISES !== 'undefined') ? EXERCISES : {};
    const WEEK_DATA      = (typeof WEEK      !== 'undefined') ? WEEK      : [];

    let weekRows = '';
    WEEK_DATA.forEach(day => {
      const exList = EXERCISES_DATA[day.focus] || [];
      const isSun  = day.rest;
      weekRows += `
        <tr class="day-row ${isSun ? 'rest-row' : ''}">
          <td class="day-cell">
            <div class="day-name">${day.name}</div>
            <div class="day-focus">${day.focus}</div>
          </td>
          <td class="exercises-cell">
            ${isSun
              ? '<span class="rest-label">🛌 Rest & Recovery</span>'
              : exList.map((e,i) => `
                <div class="ex-item">
                  <span class="ex-i">${i+1}</span>
                  <div class="ex-detail-wrap">
                    <strong>${e.name}</strong>
                    <span>${e.detail}</span>
                  </div>
                  <div class="sets-box">${e.sets} sets</div>
                </div>`).join('')
            }
          </td>
        </tr>`;
    });

    // History summary
    const totalCals = history.reduce((a,h)=>a+(h.calories||0), 0);
    const totalReps = history.reduce((a,h)=>a+(h.reps||0), 0);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>FitAI Workout Plan — ${userName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#fff;color:#111;padding:36px 48px;font-size:13px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #111;}
  .logo{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;}
  .logo span{color:#5a8a00;}
  .header-meta{text-align:right;font-size:12px;color:#555;line-height:1.7;}
  .header-meta strong{color:#111;font-size:14px;}
  .profile-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:28px;background:#f4f8ea;border-radius:10px;padding:16px 20px;}
  .pb-item label{display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#7a8a60;margin-bottom:3px;}
  .pb-item strong{font-size:14px;font-weight:700;}
  h2{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:14px;color:#111;}
  table{width:100%;border-collapse:collapse;margin-bottom:32px;}
  th{background:#111;color:#fff;padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;}
  th:first-child{width:160px;}
  td{padding:14px;border-bottom:1px solid #e8e8e8;vertical-align:top;}
  .day-row:hover{background:#fafff0;}
  .rest-row td{background:#f8f8f8;}
  .day-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;margin-bottom:3px;}
  .day-focus{font-size:11px;color:#666;font-weight:500;}
  .rest-label{color:#999;font-style:italic;font-size:13px;}
  .ex-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;padding:8px 10px;background:#f9f9f9;border-radius:6px;}
  .ex-item:last-child{margin-bottom:0;}
  .ex-i{width:20px;height:20px;background:#b8ff57;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#111;flex-shrink:0;margin-top:1px;}
  .ex-detail-wrap{flex:1;}
  .ex-detail-wrap strong{display:block;font-size:13px;font-weight:600;margin-bottom:2px;}
  .ex-detail-wrap span{font-size:11px;color:#777;}
  .sets-box{background:#111;color:#fff;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap;align-self:flex-start;flex-shrink:0;}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px;}
  .stat-card{background:#f4f8ea;border-radius:8px;padding:14px;text-align:center;}
  .stat-card .num{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#5a8a00;}
  .stat-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7a8a60;margin-top:3px;font-weight:600;}
  .footer{margin-top:20px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:11px;color:#aaa;display:flex;justify-content:space-between;}
  @media print{
    body{padding:24px 32px;}
    .no-print{display:none;}
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">Fit<span>AI</span></div>
    <div class="header-meta">
      <strong>${userName}'s Workout Plan</strong><br/>
      Goal: ${goalLabel}<br/>
      Generated: ${dateStr}
    </div>
  </div>

  <div class="profile-bar">
    <div class="pb-item"><label>Name</label><strong>${userName}</strong></div>
    <div class="pb-item"><label>Goal</label><strong>${goalLabel}</strong></div>
    <div class="pb-item"><label>Level</label><strong>${level}</strong></div>
    <div class="pb-item"><label>Height</label><strong>${height}</strong></div>
    <div class="pb-item"><label>Weight</label><strong>${weight}</strong></div>
  </div>

  <h2>📊 Progress Summary</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="num">${streak}</div><div class="lbl">Day Streak</div></div>
    <div class="stat-card"><div class="num">${history.length}</div><div class="lbl">Sessions</div></div>
    <div class="stat-card"><div class="num">${totalCals}</div><div class="lbl">Calories Burned</div></div>
    <div class="stat-card"><div class="num">${totalReps}</div><div class="lbl">Total Reps</div></div>
  </div>

  <h2>📋 Weekly Workout Split</h2>
  <table>
    <thead>
      <tr>
        <th>Day</th>
        <th>Exercises</th>
      </tr>
    </thead>
    <tbody>${weekRows}</tbody>
  </table>

  <div class="footer">
    <span>FitAI — AI-Powered Home Fitness</span>
    <span>Printed: ${dateStr}</span>
  </div>
</body>
</html>`;

    // Open in new window and trigger print
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      alert('Pop-up blocked. Please allow pop-ups for this site to export PDF.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        win.print();
        win.onafterprint = () => win.close();
      }, 300);
    };
  },

  /**
   * Export workout as plain text (clipboard copy fallback)
   */
  async copyText() {
    const EXERCISES_DATA = (typeof EXERCISES !== 'undefined') ? EXERCISES : {};
    const WEEK_DATA      = (typeof WEEK      !== 'undefined') ? WEEK      : [];

    let text = `FITAI WEEKLY WORKOUT PLAN\n${'='.repeat(40)}\n\n`;
    WEEK_DATA.forEach(day => {
      text += `${day.name.toUpperCase()} — ${day.focus}\n${'-'.repeat(30)}\n`;
      if (day.rest) {
        text += '  Rest & Recovery\n\n';
      } else {
        const exList = EXERCISES_DATA[day.focus] || [];
        exList.forEach((e, i) => {
          text += `  ${i+1}. ${e.name} — ${e.sets} sets\n     ${e.detail}\n`;
        });
        text += '\n';
      }
    });
    text += `\nGenerated by FitAI on ${new Date().toLocaleDateString()}`;

    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Workout plan copied to clipboard!');
    } catch(e) {
      prompt('Copy this text:', text);
    }
  },
};

// Expose globally
window.PDFExport = PDFExport;
