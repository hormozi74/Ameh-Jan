/* ============================================================
   حسِ بازی، نه فقط دقتش.
   - دماسنج: در هر سؤال چه پله‌ای است، و «آتیش!» چند سؤال پیش از حدس روشن می‌شود
   - سؤال‌های داغ: در چند درصد بازی‌ها پرسیده می‌شوند و کجای بازی
   - سؤال‌های سلیقه‌ای: چندتا در هر بازی
   ثابت‌های دما باید با HEAT و heatOf در HTML یکی باشند.
   اجرا:  node heat-sim.js [تعداد]
   ============================================================ */
const fs = require('fs');
const nodePath = require('path');
const src = fs.readFileSync(nodePath.join(__dirname, '..', 'ameh-jan.html'), 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(nodePath.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

const MAXQ = 28, MINQ = 8, RATIO = 6, CONF = 0.80, IG_FLOOR = 0.15;
const HEAT_T = [0, 0.25, 0.45, 0.62, 0.80];
const VAGUE = new Set(['serious','beloved','controversial','legend','rich','pop','epic','married_fam','active']);
const N = +(process.argv[2] || 300);

const weights = CHARACTERS.map(c => c.prior), total = weights.reduce((a, b) => a + b, 0);
const sample = () => { let r = Math.random() * total; for (let i = 0; i < CHARACTERS.length; i++) { r -= weights[i]; if (r <= 0) return CHARACTERS[i]; } return CHARACTERS.at(-1); };
const level = x => HEAT_T.reduce((lv, t, i) => x >= t ? i : lv, 0);

let ltr = 0, ltrPos = [], ok = 0, sq = 0, hotGames = 0, hotCount = 0, hotLate = 0, vague = 0, fireLead = [], lvAtGuess = [0,0,0,0,0];
const trace = [];
const filmN = CHARACTERS.filter(c => c.f).length;
let filmGames = 0, filmOk = 0;
for (let g = 0; g < N; g++) {
  const truth = sample();
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const h0 = ENG.entropy(ENG.toProbs(log));
  const asked = [], cc = {};
  let n = 0, firstFire = -1, hots = [];
  const heats = [];
  for (;;) {
    const probs = ENG.toProbs(log);
    let bi = 0; for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bi]) bi = i;
    let second = 0; for (let i = 0; i < probs.length; i++) if (i !== bi && probs[i] > second) second = probs[i];
    const cool = Math.max(0, Math.min(1, (1 - ENG.entropy(probs) / h0) / 0.7));
    const heat = Math.max(0, Math.min(1, 0.7 * cool + 0.3 * Math.sqrt(probs[bi])));
    let ready = (n >= MINQ && probs[bi] > CONF && probs[bi] / Math.max(second, 1e-9) > RATIO) || n >= MAXQ;
    const pool = ready ? null : ENG.rankQuestions(probs, asked, cc);
    if (!ready && n >= MINQ && pool.reduce((m, x) => Math.max(m, x.ig), 0) < IG_FLOOR) ready = true;
    const q = ready ? null : ENG.pickQuestion(probs, asked, cc, pool);
    if (ready || !q) {
      lvAtGuess[level(heat)]++;
      if (CHARACTERS[bi].id === truth.id) ok++;
      if (truth.f) { filmGames++; if (CHARACTERS[bi].id === truth.id) filmOk++; }
      break;
    }
    heats.push(level(heat));
    if (firstFire < 0 && level(heat) >= 4) firstFire = n;
    if (q.cluster === 'hot') hots.push(n);
    if (q.cluster === 'letter') { ltr++; ltrPos.push(n); }
    if (VAGUE.has(q.id)) vague++;
    const p = truth.a[q.id];
    const w = Math.random() < p ? (Math.random() < .15 ? .75 : 1) : (Math.random() < .15 ? .25 : 0);
    log = ENG.update(log, q, w);
    asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
  sq += n;
  if (hots.length) { hotGames++; hotCount += hots.length; if (hots.some(i => i >= n * 0.4)) hotLate++; }
  if (firstFire >= 0) fireLead.push(n - firstFire);
  if (g < 6) trace.push(`${truth.name.padEnd(22)} ${heats.join('')}  (${n} سؤال${hots.length ? '، داغ در ' + hots.map(x => x + 1).join(',') : ''})`);
}
const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-';
console.log(`${N} بازی   شخصیت‌ها: ${CHARACTERS.length} (فیلم: ${filmN})   سؤال‌ها: ${QUESTIONS.length}`);
console.log(`حدس اول درست: ${(ok / N * 100).toFixed(1)}%   میانگین سؤال: ${(sq / N).toFixed(1)}` +
  (filmGames ? `   فیلم‌ها: ${filmOk}/${filmGames}` : ''));
console.log(`بازی‌هایی با سؤالِ داغ: ${(hotGames / N * 100).toFixed(0)}%   میانگین در هر بازی: ${(hotCount / N).toFixed(2)}   داغ در نیمه‌ی دوم: ${(hotLate / N * 100).toFixed(0)}%`);
console.log(`سؤالِ حرفِ اول در ${(ltr / N * 100).toFixed(0)}% بازی‌ها`);
console.log(`سؤالِ سلیقه‌ای در هر بازی: ${(vague / N).toFixed(2)}`);
console.log(`«آتیش!» روشن شد در ${(fireLead.length / N * 100).toFixed(0)}% بازی‌ها، به‌طور میانگین ${avg(fireLead)} سؤال پیش از حدس`);
console.log(`پله‌ی دما در لحظه‌ی حدس: ` + lvAtGuess.map((c, i) => `${i}:${(c / N * 100).toFixed(0)}%`).join('  '));
console.log('\nنمونه‌ی مسیرِ دما (۰ سرد … ۴ آتیش):');
trace.forEach(t => console.log('  ' + t));
