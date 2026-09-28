/* ============================================================
   تحلیلِ رویدادهای ثبت‌شده (خروجیِ api/stats.php):
     curl "https://SITE/api/stats.php?key=KEY&m=all" > events.jsonl
     node analyze.js events.jsonl

   مهم‌ترین خروجی «ناسازگاری‌ها»ست: جایی که بازیکن‌های واقعی به سؤالی
   درباره‌ی یک شخصیت جوابی داده‌اند که با برچسبِ ما نمی‌خواند. هر ردیفش
   یک برچسبِ غلط یا یک سؤالِ دوپهلوست.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.log('node analyze.js events.jsonl'); process.exit(1); }

const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const norm = s => String(s).replace(/[ً-ْـ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();
const byName = new Map(CHARACTERS.map(c => [norm(c.name), c]));
const qText = Object.fromEntries(QUESTIONS.map(q => [q.id, q.text]));

// ادغام: رویدادِ «یادش دادم» جوابِ درستِ همان دست را کامل می‌کند
const games = new Map();
for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  let e; try { e = JSON.parse(line); } catch { continue; }
  const k = e.gid || (e.sid + e.ts);
  const g = games.get(k) || {};
  Object.assign(g, e, { truth: e.truth || g.truth, taught: e.taught || g.taught });
  games.set(k, g);
}
const G = [...games.values()];
const N = G.length, won = G.filter(g => g.won).length;
const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-';
console.log(`دست‌ها: ${N}   بازیکنانِ یکتا: ${new Set(G.map(g => g.sid)).size}   برد عمه: ${(won / N * 100).toFixed(1)}%   میانگین سؤال: ${avg(G.map(g => g.n))}   موبایل: ${(G.filter(g => g.ua === 'm').length / N * 100).toFixed(0)}%   از لینکِ دعوت: ${G.filter(g => g.ref).length}`);
console.log(`فامیل: ${G.filter(g => g.kin).length}   فیلم: ${G.filter(g => g.film).length}   باختِ با «یادش دادم»: ${G.filter(g => !g.won && g.taught).length} از ${G.filter(g => !g.won).length}`);

const count = (arr) => { const m = new Map(); for (const x of arr) if (x) m.set(x, (m.get(x) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
console.log('\nپرانتخاب‌ترین‌ها:'); count(G.map(g => g.truth)).slice(0, 25).forEach(([n, c]) => console.log(`  ${String(c).padStart(3)}  ${n}`));
console.log('\nبیشترین باخت (چه کسانی را پیدا نمی‌کند):'); count(G.filter(g => !g.won).map(g => g.truth)).slice(0, 25).forEach(([n, c]) => {
  const inDb = byName.has(norm(n)); console.log(`  ${String(c).padStart(3)}  ${n}${inDb ? '' : '   ← در پایگاه نیست'}`);
});
console.log('\nحدس‌های غلطِ پرتکرار (عمه به‌اشتباه گفت):'); count(G.flatMap(g => (g.guesses || []).slice(0, -1).concat(g.won ? [] : (g.guesses || []).slice(-1)))).slice(0, 15).forEach(([n, c]) => console.log(`  ${String(c).padStart(3)}  ${n}`));

/* ناسازگاری: جوابِ قاطعِ بازیکن در برابرِ احتمالِ ما */
const dis = new Map();
for (const g of G) {
  const c = g.truth && byName.get(norm(g.truth)); if (!c || !Array.isArray(g.answers)) continue;
  for (const { id, w } of g.answers) {
    if (w === null || w === undefined) continue;
    const p = c.a[id]; if (p === undefined) continue;
    const key = c.name + '|' + id;
    const d = dis.get(key) || { name: c.name, id, p, ans: [] };
    d.ans.push(w); dis.set(key, d);
  }
}
const rows = [...dis.values()].map(d => {
  const mean = d.ans.reduce((a, b) => a + b, 0) / d.ans.length;
  return { ...d, mean, gap: Math.abs(mean - d.p), n: d.ans.length };
}).filter(r => r.n >= 2 && r.gap >= 0.5).sort((a, b) => b.gap * Math.log(b.n + 1) - a.gap * Math.log(a.n + 1));
console.log(`\nناسازگاریِ برچسب با جوابِ بازیکن‌ها (≥۲ نفر، فاصله ≥۰.۵) — ${rows.length} مورد:`);
rows.slice(0, 40).forEach(r => console.log(`  ${r.name.padEnd(22)} ${qText[r.id].slice(0, 34).padEnd(36)} ما: ${r.p.toFixed(2)}   بازیکن‌ها: ${r.mean.toFixed(2)} (${r.n} نفر)`));

/* سؤال‌های «نمی‌دونم»خور: یا بد نوشته شده‌اند یا زودتر از موقع پرسیده می‌شوند */
const unk = new Map(), asked = new Map();
for (const g of G) for (const { id, w } of (g.answers || [])) { asked.set(id, (asked.get(id) || 0) + 1); if (w === null) unk.set(id, (unk.get(id) || 0) + 1); }
console.log('\nسؤال‌هایی که بیشتر «نمی‌دونم» می‌گیرند:');
[...asked.entries()].filter(([, n]) => n >= 10).map(([id, n]) => [id, (unk.get(id) || 0) / n, n]).sort((a, b) => b[1] - a[1]).slice(0, 12)
  .forEach(([id, r, n]) => console.log(`  ${(r * 100).toFixed(0).padStart(3)}%  ${qText[id]}  (${n} بار)`));
