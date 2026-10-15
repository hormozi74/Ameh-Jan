/* ============================================================
   یادگیری از بازی‌های واقعی — همان کاری که آکیناتور را قوی می‌کند.
     curl "https://SITE/api/stats.php?key=KEY&m=all" > events.jsonl
     node build/learn-from-logs.js events.jsonl
     npm run build            (generate.js خروجی را خودش می‌خواند)

   برچسب‌ها حدسِ ما هستند از اینکه بازیکن چه جواب می‌دهد؛ بازی‌های واقعی خودِ
   جواب‌ها را دارند. برای هر دستی که جوابش معلوم است (عمه بُرد، یا بازیکن گفت
   «کی بود»)، جوابِ بازیکن به هر سؤال درباره‌ی همان ردیف جمع می‌شود:
     learned-answers.js  →  { 'کلید': { qid: [جمعِ جواب‌ها, تعداد] } }
   generate.js احتمالِ برچسبی را با این‌ها مخلوط می‌کند: (K·p + جمع) / (K + تعداد)،
   پس با چند بازی کمی جابه‌جا می‌شود و با صدها بازی به رفتارِ واقعیِ مردم می‌رسد.

   کلید = نامِ نرمال‌شده + نوع (#film / #book / #kin / خالی) — همان قراردادِ generate.js.
   دستِ «یادش دادم» نوع را نمی‌گوید؛ فقط وقتی شمرده می‌شود که آن نام یک ردیف دارد.

   خروجیِ دوم: lab/candidates.txt — اسم‌هایی که بازیکن‌ها یاد داده‌اند ولی در
   پایگاه نیستند، به ترتیبِ تعداد. این فهرستِ «چه کسی را اضافه کنیم» است.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.log('node build/learn-from-logs.js events.jsonl'); process.exit(1); }

const normalizeFa = s => String(s).replace(/[ً-ْـ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  .replace(/ة/g, 'ه').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();
const { CHARACTERS } = eval(fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({CHARACTERS})');
const kindOf = c => c.k ? ' #kin' : c.f ? ' #film' : c.b ? ' #book' : '';
const rowsByName = new Map();
for (const c of CHARACTERS) { const n = normalizeFa(c.name); (rowsByName.get(n) || rowsByName.set(n, []).get(n)).push(c); }

/* یک دست ممکن است چند رویداد داشته باشد (پایانِ دست + «یادش دادم») — با gid ادغام */
const games = new Map();
for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  let e; try { e = JSON.parse(line); } catch { continue; }
  const k = e.gid || (e.sid + e.ts);
  const g = games.get(k) || {};
  Object.assign(g, e, { truth: e.truth || g.truth, taught: e.taught || g.taught });
  games.set(k, g);
}

const learned = {}, missing = new Map();
let used = 0, ambiguous = 0;
for (const g of games.values()) {
  if (!g.truth || !Array.isArray(g.answers) || !g.answers.length) continue;
  const n = normalizeFa(g.truth), rows = rowsByName.get(n) || [];
  let key = null;
  if (g.won) key = n + (g.kin ? ' #kin' : g.film ? ' #film' : g.book ? ' #book' : '');
  else if (rows.length === 1) key = n + kindOf(rows[0]);
  else if (!rows.length) { missing.set(g.truth, (missing.get(g.truth) || 0) + 1); continue; }
  else { ambiguous++; continue; }
  const L = learned[key] || (learned[key] = {});
  for (const { id, w } of g.answers) {
    if (w === null || w === undefined || typeof w !== 'number') continue;
    const s = L[id] || (L[id] = [0, 0]);
    s[0] += w; s[1]++;
  }
  used++;
}
for (const L of Object.values(learned)) for (const id in L) L[id][0] = +L[id][0].toFixed(2);

fs.writeFileSync(path.join(__dirname, 'learned-answers.js'),
  '/* خروجیِ build/learn-from-logs.js — دستی ویرایش نکن */\nmodule.exports = ' + JSON.stringify(learned) + ';\n');
const cand = [...missing.entries()].sort((a, b) => b[1] - a[1]);
fs.writeFileSync(path.join(__dirname, 'lab', 'candidates.txt'), cand.map(([n, c]) => `${c}\t${n}`).join('\n') + '\n');
console.log(`دست‌ها: ${games.size}   شمرده‌شده: ${used}   هم‌نامِ مبهم: ${ambiguous}   ردیف‌های یادگرفته: ${Object.keys(learned).length}`);
console.log(`اسم‌های تازه (در پایگاه نیستند): ${cand.length} — ← lab/candidates.txt` + (cand.length ? '\n  ' + cand.slice(0, 15).map(([n, c]) => `${n}×${c}`).join('  ') : ''));
