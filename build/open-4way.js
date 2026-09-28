/* چقدر می‌ارزد که سؤالِ اول به‌جای بله/نه، چهارگزینه‌ای باشد؟ */
const fs = require('fs'), nodePath = require('path');
const src = fs.readFileSync(nodePath.join(__dirname, '..', 'ameh-jan.html'), 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(nodePath.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

const NC = CHARACTERS.length;
const log0 = CHARACTERS.map(c => Math.log(c.prior));
const probs0 = ENG.toProbs(log0);
const H0 = ENG.entropy(probs0);
const g = (a, k, d) => a[k] ?? d;

/* گزینه‌ها: «کجا دیدیش؟» — هیچ گزینه‌ای حالتِ فامیل را لو نمی‌دهد */
const OPTS = [
  ['پردهٔ سینما و تلویزیون', c => Math.max(g(c.a,'cinema',.05), g(c.a,'series',.04), g(c.a,'tv',.12))],
  ['بازی و کارتون و انیمه',  c => Math.max(g(c.a,'game',.02), g(c.a,'cartoon_media',.03), g(c.a,'cartoon_char',.02))],
  ['کتاب و تاریخ و مدرسه',   c => Math.max(g(c.a,'book_media',.05), g(c.a,'ancient',.03), g(c.a,'scientist',.03), g(c.a,'poet',.03))],
  ['هیچ‌کدوم / یه جای دیگه', c => 1 - Math.max(g(c.a,'cinema',.05), g(c.a,'series',.04), g(c.a,'tv',.12),
                                               g(c.a,'game',.02), g(c.a,'cartoon_media',.03), g(c.a,'cartoon_char',.02),
                                               g(c.a,'book_media',.05), g(c.a,'ancient',.03), g(c.a,'scientist',.03), g(c.a,'poet',.03))]
];

const SOFT = 0.10, K = OPTS.length;
// درست‌نمایی: p_k نرمال‌شده بین گزینه‌ها، سپس با یکنواخت مخلوط (همان فلسفهٔ SOFT)
const L = CHARACTERS.map(c => {
  const raw = OPTS.map(([, f]) => Math.max(f(c), 1e-3));
  const z = raw.reduce((a, b) => a + b, 0);
  return raw.map(r => SOFT / K + (1 - SOFT) * (r / z));
});

let expH = 0;
const lines = [];
for (let k = 0; k < K; k++) {
  const lg = log0.map((l, i) => l + Math.log(L[i][k]));
  const pk = probs0.reduce((s, p, i) => s + p * L[i][k], 0);
  const h = ENG.entropy(ENG.toProbs(lg));
  expH += pk * h;
  lines.push(`   ${OPTS[k][0].padEnd(26)} احتمالِ انتخاب ${(pk*100).toFixed(0).padStart(2)}%  →  H=${h.toFixed(2)} (${Math.pow(2,h).toFixed(0)} نفرِ مؤثر)`);
}
console.log(`آنتروپیِ اولیه: ${H0.toFixed(2)} بیت (${Math.pow(2,H0).toFixed(0)} نفرِ مؤثر)\n`);
console.log('«کجا دیدیش؟» — چهارگزینه‌ای:');
lines.forEach(l => console.log(l));
console.log(`\n   بهرهٔ اطلاعاتی: ${(H0-expH).toFixed(2)} بیت   →  H=${expH.toFixed(2)} (${Math.pow(2,expH).toFixed(0)} نفرِ مؤثر)`);
console.log(`   برای مقایسه، بهترین سؤالِ بله/خیر (real): 0.54 بیت  →  H=10.27 (1235 نفر)`);
console.log(`   و دو سؤالِ بله/خیرِ بهینه روی هم:          1.09 بیت  →  H=9.72 (846 نفر)`);
