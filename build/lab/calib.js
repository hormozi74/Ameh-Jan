/* کالیبراسیونِ پسین با بازیکنِ واقعی (مدلِ real-sim) — بدونِ حدس، فقط سؤال تا ۳۲؛ در هر گام p_top، p2 و رتبه‌ی حقیقت.
   node calib.js N seed   — پایه‌ی سیاستِ حدسِ ۱۶ اکتبر ۲۰۲۶ (LOG بخشِ ۱۳) */
const fs = require('fs'), nodePath = require('path');
const BUILD = nodePath.join(__dirname, '..');
const N = +(process.argv[2] || 300), seed0 = +(process.argv[3] || 1);
const htmlPath = nodePath.join(BUILD, '..', 'ameh-jan.html'), dataPath = nodePath.join(BUILD, 'data-block.js');
let seed = seed0 >>> 0 || 1;
Math.random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const src = fs.readFileSync(htmlPath, 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
globalThis.ENGF = JSON.parse(process.env.ENGF || '{}');
const ENG = eval(src.slice(s, e) + '\n;ENG');
const MAXQ = 32, SLOPPY = 0.3;
const CRISP = new Set(['male','alive','real','iranian','american','european','eastern','animal','robot','puppet','cartoon_char','footballer','athlete','singer','actor','poet','wrestler','dancer','doctor','is_film','tvhost','scientist','teacher','cop','soldier','criminal']);
const SOFT = new Set(['serious','beloved','comedy','love','epic','pop','traditional','controversial','legend','everyone','world','kids','rich','award','married_fam','old_person','active','child_star','died_young','religious','ruler','businessman','techie','inventor','newgen','dahe60','prerev','ancient','internet','costume','lead','hero','single_media','multi_media','from_book']);
function kindOf(q){ if (q.cluster === 'letter' || q.cluster === 'hot' || q.cluster === 'kin' || q.cluster === 'fam') return 'crisp'; if (CRISP.has(q.id)) return 'crisp'; if (SOFT.has(q.id) || q.id.startsWith('f_')) return 'soft'; return 'medium'; }
const REL = { crisp: .97, medium: .90, soft: .75 }, UNK = { crisp: .03, medium: .12, soft: .30 };
const QKIND = QUESTIONS.map(kindOf);
function hash32(str){ let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function rng(seedv){ let x = seedv >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
const idx = new Map(CHARACTERS.map((c, i) => [c.id, i]));
const QI = new Map(QUESTIONS.map((q, i) => [q.id, i]));
let gameNo = 0;
// bins: by n and by p_top bin → [count, topIsTruth]
const byN = Array.from({length: MAXQ + 1}, () => ({ c: 0, hit: 0, hit3: 0, ptop: 0, ptruth: 0 }));
const BINS = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1.01];
const byBin = BINS.slice(0, -1).map(() => ({ c: 0, hit: 0 }));
const byBinLate = BINS.slice(0, -1).map(() => ({ c: 0, hit: 0 }));   // n >= 14
const byRatio = [1, 1.5, 2, 3, 4, 6, 10, 1e9].slice(0, -1).map(() => ({ c: 0, hit: 0 }));
const RB = [1, 1.5, 2, 3, 4, 6, 10, 1e9];
let stableHit = { c: 0, hit: 0 }, unstableHit = { c: 0, hit: 0 };
function play(truth){
  const gseed = hash32(seed0 + ':' + gameNo + ':' + truth.id); gameNo++;
  const g = rng(gseed); const sloppy = g() < SLOPPY;
  const cache = new Map();
  const ansFor = q => { if (cache.has(q.id)) return cache.get(q.id); const r = rng(hash32(gseed + '|' + q.id)); const kind = QKIND[QI.get(q.id)]; const p = truth.a[q.id] ?? 0.5; let w;
    const unk = UNK[kind] + (sloppy ? .05 : 0), rel = REL[kind] - (sloppy ? ({crisp:.01, medium:.06, soft:.12})[kind] : 0);
    if (q.cluster === 'letter') w = p >= .5 ? 1 : 0; else if (r() < unk) w = null; else { const faithful = r() < rel; const side = faithful ? (r() < p) : !(r() < p); const hedge = r() < (kind === 'crisp' ? .1 : .3); w = side ? (hedge ? .75 : 1) : (hedge ? .25 : 0); }
    cache.set(q.id, w); return w; };
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, unk = new Set(); const ti = idx.get(truth.id);
  let n = 0, prevTop = -1, stableFor = 0;
  for (;;) {
    const probs = ENG.toProbs(log);
    let bi = 0, b2 = -1; for (let i = 0; i < probs.length; i++) { if (probs[i] > probs[bi]) { b2 = bi; bi = i; } else if (b2 < 0 || probs[i] > probs[b2]) b2 = i; }
    let r = 1; for (let i = 0; i < probs.length; i++) if (probs[i] > probs[ti]) r++;
    stableFor = bi === prevTop ? stableFor + 1 : 0; prevTop = bi;
    const st = byN[n]; st.c++; if (r === 1) st.hit++; if (r <= 3) st.hit3++; st.ptop += probs[bi]; st.ptruth += probs[ti];
    const b = BINS.findIndex((x, i) => probs[bi] >= x && probs[bi] < BINS[i + 1]); byBin[b].c++; if (r === 1) byBin[b].hit++;
    if (n >= 14) { byBinLate[b].c++; if (r === 1) byBinLate[b].hit++; }
    if (n >= 14 && probs[bi] >= .3) { const ratio = probs[bi] / Math.max(probs[b2], 1e-9); const rb = RB.findIndex((x, i) => ratio >= x && ratio < RB[i + 1]); byRatio[rb].c++; if (r === 1) byRatio[rb].hit++;
      const t = stableFor >= 2 ? stableHit : unstableHit; t.c++; if (r === 1) t.hit++; }
    if (n >= MAXQ) break;
    const pool = ENG.rankQuestions(probs, asked, cc, unk);
    const q = ENG.pickQuestion(probs, asked, cc, pool, unk);
    if (!q) break;
    const w = ansFor(q); if (w === null) unk.add(q.id);
    log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
}
const tierOf = c => c.prior >= 3 ? 4 : c.prior >= 1.4 ? 3 : c.prior >= .6 ? 2 : 1;
const FAME = { 4: .5, 3: .35, 2: .12, 1: .03 };
const byTier = { 1: [], 2: [], 3: [], 4: [] };
for (const c of CHARACTERS) if (!c.k) byTier[tierOf(c)].push(c);
const truthRng = rng(hash32('truth:' + seed0));
function sample(){ let r = truthRng(); for (const t of [4, 3, 2, 1]) { r -= FAME[t]; if (r <= 0) { const arr = byTier[t]; return arr[Math.floor(truthRng() * arr.length)]; } } return byTier[1][0]; }
for (let i = 0; i < N; i++) play(sample());
const pc = (a, b) => b ? (100 * a / b).toFixed(0).padStart(3) + '%' : '  - ';
console.log('n   top==truth  truth≤3  mean p_top  mean p_truth');
for (let n = 0; n <= MAXQ; n += 2) { const s = byN[n]; console.log(`${String(n).padStart(2)}  ${pc(s.hit, s.c)}        ${pc(s.hit3, s.c)}     ${(s.ptop / s.c).toFixed(2)}        ${(s.ptruth / s.c).toFixed(2)}`); }
console.log('\np_top bin → P(top==truth)  (all n | n>=14)');
BINS.slice(0, -1).forEach((x, i) => console.log(`  [${x.toFixed(1)},${BINS[i + 1].toFixed(1)})  ${pc(byBin[i].hit, byBin[i].c)} (${byBin[i].c})   ${pc(byBinLate[i].hit, byBinLate[i].c)} (${byBinLate[i].c})`));
console.log('\nn>=14, p_top>=.3: ratio bin → P(top==truth)');
RB.slice(0, -1).forEach((x, i) => console.log(`  ratio≥${x}: ${pc(byRatio[i].hit, byRatio[i].c)} (${byRatio[i].c})`));
console.log(`  stable≥2: ${pc(stableHit.hit, stableHit.c)} (${stableHit.c})   unstable: ${pc(unstableHit.hit, unstableHit.c)} (${unstableHit.c})`);
