/* profile: node prof.js [mult] [html] [data] — times rankQuestions/update/toProbs with CHARACTERS duplicated `mult` times */
const fs = require('fs'), nodePath = require('path');
const SB = process.env.SB || nodePath.join(__dirname, '..', '..');
const mult = +(process.argv[2] || 2);
const htmlPath = process.argv[3] || nodePath.join(SB, 'ameh-jan.html');
const dataPath = process.argv[4] || nodePath.join(SB, 'build', 'data-block.js');
const src = fs.readFileSync(htmlPath, 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
let { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const base = CHARACTERS.slice();
for (let m = 1; m < mult; m++) for (const c of base) CHARACTERS.push({ ...c, id: c.id + '_' + m });
globalThis.ENGF = {};
const t0 = performance.now();
const ENG = eval(src.slice(s, e) + '\n;ENG');
const tBuild = performance.now() - t0;
const NC = CHARACTERS.length;
let seed = 7; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
// play a few deterministic games to get realistic states at steps 0, 3, 8, 15
const states = {};
for (let g = 0; g < 6; g++) {
  const truth = CHARACTERS[Math.floor(rnd() * NC)];
  let log = CHARACTERS.map(c => Math.log(c.prior)); const asked = [], cc = {};
  for (let n = 0; n < 20; n++) {
    (states[n] = states[n] || []).push({ log: log.slice(), asked: asked.slice(), cc: { ...cc } });
    const probs = ENG.toProbs(log);
    const pool = ENG.rankQuestions(probs, asked, cc);
    const q = ENG.pickQuestion(probs, asked, cc, pool); if (!q) break;
    const p = truth.a[q.id]; const w = rnd() < p ? 1 : 0;
    log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1;
  }
}
function time(fn, reps) { const t = performance.now(); for (let i = 0; i < reps; i++) fn(); return (performance.now() - t) / reps; }
console.log(`NC=${NC} NQ=${QUESTIONS.length} build=${tBuild.toFixed(0)}ms`);
for (const n of [0, 3, 8, 15]) {
  const st = states[n]; if (!st) continue;
  let i = 0;
  const tp = time(() => ENG.toProbs(st[i++ % st.length].log), 20);
  const probsArr = st.map(x => ENG.toProbs(x.log));
  i = 0;
  const tr = time(() => { const k = i++ % st.length; ENG.rankQuestions(probsArr[k], st[k].asked, st[k].cc); }, 20);
  i = 0;
  const tu = time(() => { const k = i++ % st.length; ENG.update(st[k].log, QUESTIONS[k % 60], 1); }, 20);
  ENG.rankQuestions(probsArr[0], st[0].asked, st[0].cc);
  console.log(`step ${String(n).padStart(2)}: toProbs ${tp.toFixed(2)}ms  rankQuestions ${tr.toFixed(2)}ms  update ${tu.toFixed(2)}ms  live=${ENG.liveCount}`);
}
