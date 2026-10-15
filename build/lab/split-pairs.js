/* جفت‌های نزدیکِ pairs.js را بینِ گروه‌های بازبینی پخش می‌کند (هر جفت → مالکِ فایلِ ردیفِ اول؛ هر دو فایل گفته می‌شود) */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..');
const GROUPS = JSON.parse(process.argv[2]);              // {"R1":["chars-01",...],...}
const src = fs.readFileSync(process.argv[3], 'utf8');
const where = new Map();
for (const f of fs.readdirSync(DIR).filter(f => /^chars-.*\.js$/.test(f)))
  for (const l of require(path.join(DIR, f))) { const n = l.split('|')[0].trim(); if (!where.has(n)) where.set(n, []); where.get(n).push(f); }
const grpOf = f => Object.keys(GROUPS).find(g => GROUPS[g].some(p => f.startsWith(p)));
const out = Object.fromEntries(Object.keys(GROUPS).map(g => [g, []]));
for (const m of src.matchAll(/^\s+([\d.]+)\s+(.+?)\s+↔\s+(.+?)\s+\(بیشترین فرق: (.*)\)$/gm)) {
  const [, d, a, b, diff] = m;
  const fa = (where.get(a) || ['?'])[0], fb = (where.get(b) || ['?'])[0];
  const g = grpOf(fa) || grpOf(fb);
  if (g) out[g].push(`${d}  ${a} [${fa}]  ↔  ${b} [${fb}]   (بیشترین فرقِ فعلی: ${diff})`);
}
for (const [g, rows] of Object.entries(out)) { fs.writeFileSync(path.join(__dirname, `review-pairs-${g}.txt`), rows.join('\n') + '\n'); console.log(g, rows.length); }
