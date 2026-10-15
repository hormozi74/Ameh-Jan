/* ============================================================
   تکراری‌های بینِ فایل‌های chars-*.js — یکسان یا نزدیک.
   اجرا:
     node lab/xdup.js                     همه‌ی فایل‌ها
     node lab/xdup.js chars-30-x.js       فقط ردیف‌های این فایل در برابرِ بقیه
     node lab/xdup.js --find "اسم۱" "اسم۲"   این اسم‌ها در پایگاه هستند؟ (ردیفِ موجود را چاپ می‌کند)

   «نزدیک» = بعد از برداشتنِ فاصله، نیم‌فاصله، اعراب، همزه، «ِ»، «ی/ي»، «ک/ك»،
   «ه/ة/هٔ»، «آ/ا» و «ال»ِ اول یکی می‌شوند («داستایفسکی» ≈ «داستایوفسکی» را نمی‌گیرد —
   برای آن --find با چند املا).
   کلید نوع را هم دارد: فیلم (#film)، کتاب (#book)، فامیل (#kin) با شخصیتِ هم‌نام تکراری نیستند.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..');

const exact = s => String(s).replace(/[ً-ْـ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  .replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();
const loose = s => exact(s).replace(/[ءأإٔ]/g, '').replace(/آ/g, 'ا').replace(/ة/g, 'ه').replace(/ؤ/g, 'و')
  .replace(/ئ/g, 'ی').replace(/^ال/, '').replace(/[\s\-‌.'«»()]/g, '').replace(/ِ/g, '');
const kindOf = tags => tags.includes('kin') ? '#kin' : tags.includes('film') ? '#film' : tags.includes('bookw') ? '#book' : '';

const rows = [];
for (const f of fs.readdirSync(DIR).filter(f => /^chars-.*\.js$/.test(f)).sort()) {
  let arr; try { arr = require(path.join(DIR, f)); } catch (e) { console.log(`(خطا در ${f}: ${e.message})`); continue; }
  if (!Array.isArray(arr)) continue;
  for (const line of arr) {
    const p = line.split('|');
    const tags = (p[3] || '').split(',').map(s => s.trim());
    rows.push({ f, line, name: p[0].trim(), hint: (p[1] || '').trim(), kind: kindOf(tags) });
  }
}

const args = process.argv.slice(2);
if (args[0] === '--find') {
  for (const q of args.slice(1)) {
    const lq = loose(q);
    const hits = rows.filter(r => loose(r.name) === lq || loose(r.name).includes(lq) && lq.length >= 4);
    console.log(`${q}: ${hits.length ? '' : 'نیست'}`);
    hits.slice(0, 8).forEach(r => console.log(`   ${r.f}  ${r.line}`));
  }
  process.exit(0);
}

const only = args[0] ? path.basename(args[0]) : null;
const byLoose = new Map();
for (const r of rows) {
  const k = loose(r.name) + r.kind;
  (byLoose.get(k) || byLoose.set(k, []).get(k)).push(r);
}
let n = 0;
for (const group of byLoose.values()) {
  if (group.length < 2) continue;
  if (only && !group.some(r => r.f === only)) continue;
  const files = new Set(group.map(r => r.f));
  if (files.size < 2 && !only) continue;          // داخلِ یک فایل را check-tags می‌گیرد
  n++;
  const same = new Set(group.map(r => exact(r.name))).size === 1;
  console.log(`${same ? '=' : '≈'} ` + group.map(r => `${r.name} «${r.hint}» [${r.f}]`).join('   |   '));
}
console.log(`\n${n} گروهِ تکراری${only ? ' برای ' + only : ''}.`);
console.log('یادآوری: هم‌نامِ واقعاً متفاوت (دو آدمِ مختلف) را نگه دار ولی توضیحِ متمایز بده؛ همان موجودیت را حذف کن و برچسب‌هایش را با extra-*.js به ردیفِ موجود بده.');
