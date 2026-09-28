/* ============================================================
   بررسیِ یک فایلِ chars-*.js پیش از ورود به پایگاه.
   اجرا:  node check-tags.js chars-16-film-ir.js

   - برچسبی که هیچ قاعده‌ای سراغش نمی‌رود (غلط املایی یا ساختگی)
   - ردیفِ کمتر از ۷ برچسب، ستونِ ناقص، رده‌ی نامعتبر
   - نامِ تکراری با بقیه‌ی پایگاه (فیلم با فیلم، آدم با آدم)
   - فیلمی که fic/m/f دارد یا خاستگاه ندارد
   - جفت‌هایی داخلِ همین فایل که برچسب‌هایشان عیناً یکی است
   ============================================================ */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.log('نام فایل را بده'); process.exit(1); }

const ruleSrc = ['questions.js', 'kin-questions.js', 'fic-questions.js', 'film-questions.js', 'hot-questions.js']
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const allowed = new Set();
for (const m of ruleSrc.matchAll(/'([a-z_][a-z0-9_]*)'/g)) allowed.add(m[1]);
// برچسب‌های مجازی که فقط در داده‌اند یا غیرمستقیم خوانده می‌شوند
['m','f','fic','alive','dead','ir','us','eu','asia','film'].forEach(t => allowed.add(t));

const norm = s => String(s).replace(/[ً-ْـ]/g, '').replace(/ي/g, 'ی')
  .replace(/ك/g, 'ک').replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();

// بقیه‌ی پایگاه
const others = new Map();
for (const f of fs.readdirSync(__dirname).filter(f => /^chars-.*\.js$/.test(f) && f !== path.basename(file))) {
  let rows; try { rows = require(path.join(__dirname, f)); } catch (e) { continue; }
  if (!Array.isArray(rows)) continue;
  for (const line of rows) {
    const p = line.split('|');
    const film = (p[3] || '').split(',').includes('film');
    const kin = (p[3] || '').split(',').includes('kin');
    others.set(norm(p[0]) + (kin ? '#kin' : film ? '#film' : ''), f);
  }
}

const rows = require(path.resolve(file));
const errs = [], warn = [];
const seen = new Map(), sigs = new Map();
const tagCount = {};
rows.forEach((line, i) => {
  const p = line.split('|').map(s => s.trim());
  if (p.length !== 4) { errs.push(`#${i} ستون‌ها ${p.length} تاست: ${line}`); return; }
  const [name, hint, tier, tagStr] = p;
  if (!['1','2','3','4'].includes(tier)) errs.push(`${name}: رده ${tier}`);
  if (/—/.test(hint)) errs.push(`${name}: توضیح «—» دارد`);
  const tags = tagStr.split(',').map(s => s.trim()).filter(Boolean);
  const T = new Set(tags);
  if (T.size !== tags.length) warn.push(`${name}: برچسبِ تکراری`);
  if (T.size < 7) errs.push(`${name}: فقط ${T.size} برچسب`);
  for (const t of T) { tagCount[t] = (tagCount[t] || 0) + 1; if (!allowed.has(t)) errs.push(`${name}: برچسبِ ناشناخته «${t}»`); }
  if (!['ir','us','eu','asia'].some(x => T.has(x)) && !T.has('kin')) errs.push(`${name}: خاستگاه ندارد`);
  const film = T.has('film');
  if (film && ['fic','m','f','alive','dead'].some(x => T.has(x))) errs.push(`${name}: فیلم نباید fic/m/f/alive/dead بگیرد`);
  if (!film && !T.has('fic') && !T.has('kin') && !T.has('alive') && !T.has('dead') && !T.has('mythic'))
    warn.push(`${name}: آدمِ واقعی بدونِ alive/dead`);
  const key = norm(name) + (film ? '#film' : '');
  if (seen.has(key)) errs.push(`تکراری در همین فایل: ${name}`);
  seen.set(key, 1);
  if (others.has(key)) errs.push(`تکراری با ${others.get(key)}: ${name}`);
  const sig = [...T].sort().join(',') + '|' + tier;
  if (sigs.has(sig)) errs.push(`برچسب‌های یکسان: ${name} ↔ ${sigs.get(sig)}`);
  sigs.set(sig, name);
});

console.log(`${rows.length} ردیف   خطا: ${errs.length}   هشدار: ${warn.length}`);
errs.slice(0, 80).forEach(e => console.log('  ✗ ' + e));
warn.slice(0, 30).forEach(e => console.log('  ! ' + e));
const fr = Object.entries(tagCount).filter(([t]) => t.startsWith('fr_')).sort((a, b) => b[1] - a[1]);
console.log(`برچسب‌های داغ: ${fr.reduce((s, x) => s + x[1], 0)} بار روی ${rows.filter(l => /\bfr_/.test(l)).length} ردیف` +
  (fr.length ? '  ← ' + fr.slice(0, 15).map(([t, n]) => `${t}×${n}`).join(' ') : ''));
