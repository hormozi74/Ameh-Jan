/* مثلِ pairs.js، ولی برای هر جفتِ نزدیک ردیفِ خامِ هر دو را با نامِ فایل و شماره‌ی خط چاپ می‌کند
   تا برچسبِ تفکیک‌کننده مستقیم در همان ردیف گذاشته شود.
   اجرا: node lab/pairs-rows.js [آستانه=0.45]   (یا: node lab/pairs-rows.js <buildDir> [آستانه]) */
const fs = require("fs"), path = require("path");
const B = process.argv[2] && !/^[0-9]*\.?[0-9]+$/.test(process.argv[2]) ? process.argv[2] : path.join(__dirname, ".."); const LIMIT = +((/^[0-9]*\.?[0-9]+$/.test(process.argv[2] || "") ? process.argv[2] : (process.argv[3] || 0.45)));
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(path.join(B, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const qids = QUESTIONS.filter(q => q.cluster !== 'letter').map(q => q.id);
const NC = CHARACTERS.length, NQ = qids.length;
const M = new Float64Array(NC * NQ);
for (let i = 0; i < NC; i++) for (let q = 0; q < NQ; q++) M[i * NQ + q] = CHARACTERS[i].a[qids[q]];
const pairs = [];
for (let i = 0; i < NC; i++) for (let j = i + 1; j < NC; j++) {
  let d = 0; const bi = i * NQ, bj = j * NQ;
  for (let q = 0; q < NQ; q++) { const t = M[bi + q] - M[bj + q]; d += t * t; if (d > LIMIT * LIMIT) break; }
  if (d <= LIMIT * LIMIT) pairs.push([Math.sqrt(d), i, j]);
}
pairs.sort((a, b) => a[0] - b[0]);
const norm = s => String(s).replace(/[ً-ْـ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();
const rows = new Map();
for (const f of fs.readdirSync(B).filter(f => /^chars-.*\.js$/.test(f))) {
  const lines = fs.readFileSync(path.join(B, f), 'utf8').split('\n');
  lines.forEach((ln, i) => { const m = ln.match(/^\s*'((?:[^'\\]|\\.)*)'\s*,?/); if (!m) return; const p = m[1].split('|'); if (p.length !== 4) return;
    const k = norm(p[0]); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(`${f}:${i + 1}  ${m[1]}`); });
}
console.log(`جفت‌ها < ${LIMIT}: ${pairs.length}  (از ${NC} شخصیت)`);
const byFile = {};
for (const [d, i, j] of pairs) {
  const a = CHARACTERS[i], b = CHARACTERS[j];
  const ra = rows.get(norm(a.name)) || ['?'], rb = rows.get(norm(b.name)) || ['?'];
  console.log(`\n${d.toFixed(2)}  ${a.name} ↔ ${b.name}`);
  ra.forEach(r => console.log('   A ' + r)); rb.forEach(r => console.log('   B ' + r));
  const fa = (ra[0] || '').split(':')[0]; byFile[fa] = (byFile[fa] || 0) + 1;
}
console.log('\nبر حسبِ فایلِ A: ' + Object.entries(byFile).sort((x, y) => y[1] - x[1]).map(([f, n]) => `${f}×${n}`).join('  '));
