/* تشخیصِ سؤال‌های آغازین — چه چیزی در گام ۰ و گام ۱ بالاست و چقدر می‌بُرد */
const fs = require('fs'), nodePath = require('path');
const dataPath = nodePath.join(__dirname, 'data-block.js');
const htmlPath = nodePath.join(__dirname, '..', 'ameh-jan.html');
const src = fs.readFileSync(htmlPath, 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

const log0 = CHARACTERS.map(c => Math.log(c.prior));
const probs0 = ENG.toProbs(log0);
const H0 = ENG.entropy(probs0);
console.log(`آنتروپی اولیه: ${H0.toFixed(2)} بیت  (${CHARACTERS.length} شخصیت، ${QUESTIONS.length} سؤال)\n`);

const pool = ENG.rankQuestions(probs0, [], {});
console.log('— رتبه‌بندی گام ۰ (۲۰ تای اول) —');
console.log('سؤال'.padEnd(16), 'IG'.padEnd(7), 'pYes'.padEnd(7), 'متن');
for (const x of pool.slice(0, 20))
  console.log(x.q.id.padEnd(16), x.ig.toFixed(3).padEnd(7), x.pYes.toFixed(3).padEnd(7), x.q.text);

/* بعد از یک جواب، چقدر جرمِ احتمال می‌ماند و آنتروپی چقدر می‌شود */
function after(qid, w) {
  const q = QUESTIONS.find(x => x.id === qid);
  const lg = ENG.update(log0, q, w);
  const p = ENG.toProbs(lg);
  return { H: ENG.entropy(p), eff: Math.pow(2, ENG.entropy(p)) };
}
console.log('\n— بعد از یک جواب: آنتروپی و «تعدادِ مؤثرِ» باقی‌مانده —');
const cands = ['american', 'iranian', 'real', 'alive', 'male', 'artist', 'tv', 'everyone', 'world', 'fic_media' ];
for (const id of cands) {
  if (!QUESTIONS.find(x => x.id === id)) continue;
  const y = after(id, 1), n = after(id, 0);
  const pY = pool.find(x => x.q.id === id)?.pYes ?? NaN;
  console.log(`${id.padEnd(14)} pYes=${pY.toFixed(2)}  آره→ H=${y.H.toFixed(2)} (${y.eff.toFixed(0)} نفر)   نه→ H=${n.H.toFixed(2)} (${n.eff.toFixed(0)} نفر)`);
}

/* توزیع کلان: هر شخصیت در کدام «قارهٔ» محتوایی است؟ */
const buckets = {};
for (let i = 0; i < CHARACTERS.length; i++) {
  const a = CHARACTERS[i].a, pr = probs0[i];
  const g = (k, d) => a[k] ?? d;
  let b;
  if (g('fam_close', .05) > .5) b = 'فامیل';
  else if (g('real', .95) < .5) b = 'خیالی';
  else if (g('iranian', .03) > .5) b = 'ایرانیِ واقعی';
  else b = 'خارجیِ واقعی';
  buckets[b] = (buckets[b] || 0) + pr;
}
console.log('\n— جرمِ احتمالِ اولیه به تفکیکِ قاره —');
for (const [k, v] of Object.entries(buckets).sort((a,b)=>b[1]-a[1]))
  console.log(k.padEnd(16), (v*100).toFixed(1) + '%');
