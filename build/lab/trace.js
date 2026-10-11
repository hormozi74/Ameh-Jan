/* ردِ گام‌به‌گام یک بازیِ انسانی: node trace.js <نامِ پروفایل> */
const fs = require('fs'), nodePath = require('path');
const BUILD = process.env.BUILD || '/Users/behtis/Documents/Personal Project/Ameh-Jan/build';
const src = fs.readFileSync(nodePath.join(BUILD, '..', 'ameh-jan.html'), 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
globalThis.ENGF = JSON.parse(process.env.ENGF || '{}');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(process.env.DATA || nodePath.join(BUILD, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval((process.env.ENG_SRC ? fs.readFileSync(process.env.ENG_SRC, 'utf8') : src.slice(s, e)) + '\n;ENG');
const W = {Y: 1, y: .75, '?': null, n: .25, N: 0};
const { first } = require(nodePath.join(BUILD, 'letter-questions.js'));
const LETTERS = ['ا','ب','پ','ت','ج','چ','ح','خ','د','ر','ز','ژ','س','ش','ص','ط','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی','ث','ذ','ض','ظ'];
const PROF = JSON.parse(fs.readFileSync(nodePath.join(__dirname, 'profiles.json'), 'utf8'));
const [truthName, letterName, A] = PROF[process.argv[2]];
Math.random = () => 0;   // بدون قرعه — همیشه بهترین
const [tn, th] = truthName.split('|'); const ti = CHARACTERS.findIndex(c => c.name === tn && !c.f && (!th || c.hint.includes(th))); const truth = CHARACTERS[ti];
const ans = q => q.cluster === 'letter' ? (first(letterName) === LETTERS[+q.id.slice(3)] ? 1 : 0) : W[A[q.id] ?? 'N'];
let log = CHARACTERS.map(c => Math.log(c.prior)); const asked = [], cc = {};
for (let n = 0; n < 28; n++) {
  const probs = ENG.toProbs(log);
  const top = probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, 5);
  const pool = ENG.rankQuestions(probs, asked, cc);
  const q = ENG.pickQuestion(probs, asked, cc, pool);
  if (!q) { console.log('no q'); break; }
  const w = ans(q);
  const show = x => `${x.q.id}(ig${x.ig.toFixed(2)} py${x.pYes.toFixed(2)} sc${x.score.toFixed(2)})`;
  console.log(`${String(n+1).padStart(2)} H=${ENG.entropy(probs).toFixed(2)} top: ${top.map(([p,i]) => CHARACTERS[i].name + ' ' + (p*100).toFixed(0) + '%').join(' | ')}`);
  console.log(`   → ${q.id}=${w}   بهترین‌ها: ${pool.slice(0, 6).map(show).join(' ')}`);
  log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1;
  const pt = ENG.toProbs(log)[ti]; if (pt > 0.8) { console.log(`   حقیقت ${(pt*100).toFixed(0)}%`); break; }
}
