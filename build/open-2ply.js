/* گشایش: (۱) بهرهٔ اطلاعاتی نسبت به «قاره» نه نسبت به فرد  (۲) جست‌وجوی دوعمقیِ بهترین جفتِ آغازین */
const fs = require('fs'), nodePath = require('path');
const src = fs.readFileSync(nodePath.join(__dirname, '..', 'ameh-jan.html'), 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(nodePath.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

const NQ = QUESTIONS.length, NC = CHARACTERS.length;
const log0 = CHARACTERS.map(c => Math.log(c.prior));
const probs0 = ENG.toProbs(log0);
const H0 = ENG.entropy(probs0);

/* ---------- ۱) قاره‌بندیِ کلان ---------- */
const g = (a, k, d) => a[k] ?? d;
function bucketOf(c) {
  const a = c.a;
  if (g(a, 'fam_close', .05) > .5) return 'فامیل';
  const fic = g(a, 'real', .95) < .5;
  if (fic) {
    if (g(a, 'cartoon_char', .02) > .5 || g(a, 'cartoon_media', .03) > .5) return 'خیالی/کارتون-انیمه';
    if (g(a, 'game', .02) > .5) return 'خیالی/بازی';
    if (g(a, 'series', .04) > .5) return 'خیالی/سریال';
    if (g(a, 'superpower', .02) > .5) return 'خیالی/ابرقهرمان-اسطوره';
    return 'خیالی/فیلم-کتاب';
  }
  const ir = g(a, 'iranian', .03) > .5;
  if (ir) return g(a, 'ancient', .03) > .5 || g(a, 'prerev', .05) > .5 ? 'واقعی/ایرانیِ قدیم' : 'واقعی/ایرانیِ امروز';
  return g(a, 'ancient', .03) > .5 ? 'واقعی/خارجیِ تاریخی' : 'واقعی/خارجیِ امروز';
}
const BK = CHARACTERS.map(bucketOf);
const BNAMES = [...new Set(BK)];
const BI = BK.map(b => BNAMES.indexOf(b));

function bucketDist(probs) {
  const d = new Float64Array(BNAMES.length);
  for (let i = 0; i < NC; i++) d[BI[i]] += probs[i];
  return d;
}
const H = d => { let h = 0; for (const p of d) if (p > 1e-12) h -= p * Math.log2(p); return h; };

const bd0 = bucketDist(probs0);
console.log(`قاره‌ها (${BNAMES.length} تا) — آنتروپیِ قاره: ${H(bd0).toFixed(2)} بیت از ${Math.log2(BNAMES.length).toFixed(2)} بیتِ ممکن`);
BNAMES.map((n, i) => [n, bd0[i]]).sort((a, b) => b[1] - a[1])
  .forEach(([n, p]) => console.log('   ' + n.padEnd(26) + (p * 100).toFixed(1) + '%'));

/* بهرهٔ اطلاعاتیِ هر سؤال نسبت به قاره — با همان update واقعیِ موتور (SOFT اعمال می‌شود) */
function step(q, w) { const lg = ENG.update(log0, q, w); return ENG.toProbs(lg); }
function pYesOf(probs, q) { let s = 0; for (let i = 0; i < NC; i++) s += probs[i] * (CHARACTERS[i].a[q.id] ?? 0.5); return s; }

const rows = QUESTIONS.map(q => {
  const pY = pYesOf(probs0, q);
  const py = step(q, 1), pn = step(q, 0);
  const igB = H(bd0) - (pY * H(bucketDist(py)) + (1 - pY) * H(bucketDist(pn)));   // اطلاعات دربارهٔ قاره
  const igC = H0 - (pY * ENG.entropy(py) + (1 - pY) * ENG.entropy(pn));            // اطلاعات دربارهٔ فرد (واقعی، نه تخمینِ igAt)
  return { q, pY, igB, igC };
});

const igAtEst = Object.fromEntries(ENG.rankQuestions(probs0, [], {}).map(x => [x.q.id, x.ig]));
console.log('\n— گام ۰: تخمینِ موتور در برابر بهرهٔ واقعی، و بهره نسبت به قاره —');
console.log('سؤال'.padEnd(16), 'IG(موتور)'.padEnd(10), 'IG(واقعی)'.padEnd(10), 'IG(قاره)'.padEnd(10), 'pYes');
for (const r of [...rows].sort((a, b) => b.igB - a.igB).slice(0, 14))
  console.log(r.q.id.padEnd(16), (igAtEst[r.q.id] ?? 0).toFixed(3).padEnd(10), r.igC.toFixed(3).padEnd(10), r.igB.toFixed(3).padEnd(10), r.pY.toFixed(2));
console.log('   ...');
for (const id of ['american', 'european', 'eastern', 'male', 'glasses'])
  { const r = rows.find(x => x.q.id === id); console.log(r.q.id.padEnd(16), (igAtEst[id] ?? 0).toFixed(3).padEnd(10), r.igC.toFixed(3).padEnd(10), r.igB.toFixed(3).padEnd(10), r.pY.toFixed(2)); }

/* ---------- ۲) جست‌وجوی دوعمقی: بهترین جفتِ آغازین ---------- */
const top1 = [...rows].sort((a, b) => b.igC - a.igC).slice(0, 26);
function expH(lg, w1q, w1) {
  const p1 = ENG.toProbs(lg);
  let best = Infinity, bq = null;
  for (const r2 of top1) {
    if (r2.q.id === w1q.id) continue;
    const pY = pYesOf(p1, r2.q);
    const h = pY * ENG.entropy(ENG.toProbs(ENG.update(lg, r2.q, 1)))
            + (1 - pY) * ENG.entropy(ENG.toProbs(ENG.update(lg, r2.q, 0)));
    if (h < best) { best = h; bq = r2.q.id; }
  }
  return { h: best, q: bq };
}
const pairs = top1.map(r => {
  const ly = ENG.update(log0, r.q, 1), ln = ENG.update(log0, r.q, 0);
  const y = expH(ly, r.q, 1), n = expH(ln, r.q, 0);
  return { id: r.q.id, h2: r.pY * y.h + (1 - r.pY) * n.h, yq: y.q, nq: n.q, h1: H0 - r.igC };
}).sort((a, b) => a.h2 - b.h2);

console.log(`\n— بهترین گشایشِ دو سؤالی (آنتروپیِ اولیه ${H0.toFixed(2)} بیت) —`);
console.log('سؤال۱'.padEnd(16), 'H بعدِ۱'.padEnd(9), 'H بعدِ۲'.padEnd(9), 'نفرِ مؤثر'.padEnd(10), 'اگر آره→'.padEnd(16), 'اگر نه→');
for (const p of pairs.slice(0, 12))
  console.log(p.id.padEnd(16), p.h1.toFixed(2).padEnd(9), p.h2.toFixed(2).padEnd(9),
    Math.pow(2, p.h2).toFixed(0).padEnd(10), String(p.yq).padEnd(16), p.nq);
const am = pairs.find(p => p.id === 'american');
if (am) console.log('\nبرای مقایسه → american:', am.h2.toFixed(2), 'بیت،', Math.pow(2, am.h2).toFixed(0), 'نفرِ مؤثر  | آره→', am.yq, '| نه→', am.nq);
