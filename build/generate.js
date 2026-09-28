/* ============================================================
   تولید ماتریس از برچسب‌ها + اعتبارسنجی
   ورودی: characters.js   خروجی: data-block.js برای تزریق در HTML
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { QUESTIONS, KIN_OVERRIDE, KIN_CLUSTER_DEFAULT, FILM_OVERRIDE } = require('./questions.js');
const { CHARS } = require('./characters.js');

const OUT = path.join(__dirname, 'data-block.js');

const TIER_PRIOR = { 4: 3.0, 3: 1.4, 2: 0.6, 1: 0.25 };
const clamp = p => Math.max(0.03, Math.min(0.97, p));

/* ---------- نرمال‌سازی فارسی (همان تابعی که در بازی هم هست) ---------- */
function normalizeFa(s) {
  return String(s)
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[ يی]/g, m => m === 'ي' ? 'ی' : m)
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- ساخت ---------- */
const seen = new Set();
const characters = [];
const problems = [];

CHARS.forEach((line, i) => {
  const parts = line.split('|').map(x => x.trim());
  if (parts.length !== 4) { problems.push(`خط ${i}: فرمت غلط → ${line}`); return; }
  const [name, hint, tierRaw, tagStr] = parts;
  const tier = +tierRaw;
  if (!TIER_PRIOR[tier]) { problems.push(`${name}: رده‌ی نامعتبر ${tierRaw}`); return; }

  const tags = new Set(tagStr.split(',').map(s => s.trim()).filter(Boolean));

  // یک نام می‌تواند هم سلبریتی باشد هم نسبت فامیلی — «پسرخاله» هم
  // عروسکِ کلاه‌قرمزی است هم پسرِ خاله. کلید را دامنه‌دار می‌کنیم تا
  // هر دو بمانند؛ در صفحه‌ی حدس، توضیح‌شان از هم جداشان می‌کند.
  // فیلم هم همین‌طور: «شرک» هم شخصیت است هم خودِ انیمیشن.
  const key = normalizeFa(name) + (tags.has('kin') ? ' #kin' : tags.has('film') ? ' #film' : '');
  if (seen.has(key)) { problems.push(`تکراری: ${name}`); return; }
  seen.add(key);
  if (tags.size < 4) problems.push(`${name}: فقط ${tags.size} برچسب`);
  tags.__tier = tier;
  tags.__name = name;   // برای سؤالِ حرفِ اول (letter-questions.js)

  const id = 'c' + i;
  const a = {};
  // سؤال‌های دنیای سلبریتی برای یک فامیل بی‌معنا هستند؛ بدون اورراید،
  // «اسمش رو همه شنیدن؟» برای خواهرِ آدم ۰.۹۳ می‌شد (rule از __tier
  // می‌خواند) و کل بازی خراب می‌شد.
  for (const q of QUESTIONS) {
    let v;
    if (tags.has('kin')) {
      const ov = KIN_OVERRIDE[q.id];
      v = ov !== undefined ? (typeof ov === 'function' ? ov(tags) : ov)
        : (KIN_CLUSTER_DEFAULT[q.cluster] ?? q.rule(tags));
    } else if (tags.has('film')) {
      const ov = FILM_OVERRIDE[q.id];
      v = ov !== undefined ? (typeof ov === 'function' ? ov(tags) : ov) : q.rule(tags);
    } else v = q.rule(tags);
    a[q.id] = +clamp(v).toFixed(3);
  }

  // kin به داده‌ی بازی هم می‌رود (k:1): رابط کاربری باید بداند این یک نسبت
  // است نه یک سلبریتی، تا اسمِ واقعیِ ذخیره‌شده را جای نسبت نشان دهد.
  characters.push({ id, name, hint, prior: TIER_PRIOR[tier], a, kin: tags.has('kin'), film: tags.has('film'), _tags: tagStr, _tier: tier });
});

/* ---------- اعتبارسنجی ---------- */
console.log(`شخصیت‌ها: ${characters.length}   سؤال‌ها: ${QUESTIONS.length}   خانه‌ها: ${characters.length * QUESTIONS.length}`);

/* برچسبی که هیچ قاعده‌ای سراغش نمی‌رود، اطلاعاتش دور ریخته می‌شود: نویسنده
   فکر می‌کند شخصیت را تفکیک کرده ولی بازی چیزی نمی‌بیند. این گزارش همان
   اشتباهِ خاموش را بلند می‌کند — چه غلطِ املایی باشد چه برچسبِ بی‌سؤال. */
{
  const ruleSrc = ['./questions.js', './kin-questions.js', './fic-questions.js', './film-questions.js', './hot-questions.js']
    .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
  const referenced = new Set();
  for (const m of ruleSrc.matchAll(/'([a-z_][a-z0-9_]*)'/g)) referenced.add(m[1]);

  const used = {};
  for (const c of characters)
    for (const t of c._tags.split(',').map(s => s.trim()).filter(Boolean))
      used[t] = (used[t] || 0) + 1;

  const orphan = Object.entries(used).filter(([t]) => !referenced.has(t))
    .sort((a, b) => b[1] - a[1]);
  if (orphan.length)
    console.log(`\nبرچسب‌های بی‌سؤال (${orphan.length}) — هیچ سؤالی سراغشان نمی‌رود:\n  ` +
      orphan.map(([t, n]) => `${t}×${n}`).join('  '));
}

let absolutes = 0, halves = 0;
for (const c of characters) for (const q of QUESTIONS) {
  const v = c.a[q.id];
  if (v <= 0 || v >= 1) absolutes++;
  if (v === 0.5) halves++;
}
const cells = characters.length * QUESTIONS.length;
console.log(`صفر/یک مطلق: ${absolutes}   دقیقاً ۰.۵: ${halves} (${(halves / cells * 100).toFixed(1)}%)`);

// توزیع رده‌ها
const tiers = {};
for (const c of characters) tiers[c._tier] = (tiers[c._tier] || 0) + 1;
console.log('رده‌های شهرت:', Object.entries(tiers).sort((a,b)=>b[0]-a[0])
  .map(([k, v]) => `رده${k}=${v}`).join('  '));

/* ---------- جفت‌های تفکیک‌ناپذیر ---------- */
const qids = QUESTIONS.map(q => q.id);
function dist(x, y) {
  let d = 0;
  for (const q of qids) { const t = x.a[q] - y.a[q]; d += t * t; }
  return Math.sqrt(d);
}

/* شخصیتی که از شخصیت دیگری قابل تفکیک نیست، به بازی ضرر می‌زند:
   جرم احتمال را می‌دزدد و باعث حدس غلط می‌شود. مشهورتر را نگه می‌داریم. */
const DEDUP = 0.30;
characters.sort((a, b) => b.prior - a.prior || a.name.localeCompare(b.name));
const kept = [], dropped = [];
for (const c of characters) {
  const clash = kept.find(k => dist(k, c) < DEDUP);
  if (clash) dropped.push([c, clash]); else kept.push(c);
}
console.log(`\nحذف‌شده به دلیل تفکیک‌ناپذیری: ${dropped.length}   باقی‌مانده: ${kept.length}`);

// حذف یک چهره‌ی مشهور یعنی برچسب‌هایش کم است، نه اینکه واقعاً تکراری باشد
const notable = dropped.filter(([c]) => c._tier >= 3);
if (notable.length) {
  console.log(`\nهشدار — این‌ها مشهورند و نباید حذف می‌شدند؛ برچسب تفکیک‌کننده لازم دارند (${notable.length}):`);
  notable.slice(0, 30).forEach(([c, k]) => console.log(`  ${c.name}  ↔  ${k.name}`));
}

const finalChars = kept;


if (problems.length) {
  console.log(`\nایرادها (${problems.length}):`);
  problems.slice(0, 30).forEach(p => console.log('  ' + p));
}

/* ---------- خروجی ----------
   ۸۵٪ خانه‌های ماتریس دقیقاً مقدارِ پرتکرارِ همان سؤال‌اند (چون قاعده‌ها
   «برچسب را داری یا نداری» هستند و بیشتر شخصیت‌ها بیشتر برچسب‌ها را ندارند).
   نوشتنِ تک‌تکشان HTML را ۳.۳ مگابایت می‌کرد. پس فقط تفاوت‌ها نوشته می‌شوند
   و بقیه از QDEF روی زنجیره‌ی پروتوتایپ می‌آید — یعنی `c.a[id]` برای هر
   مصرف‌کننده‌ای (بازی، تست، جاروب) دقیقاً مثل قبل کار می‌کند. */
const num = v => String(v).replace(/^0\./, '.');

const QDEF = {};
for (const q of qids) {
  const cnt = new Map();
  for (const c of finalChars) cnt.set(c.a[q], (cnt.get(c.a[q]) || 0) + 1);
  QDEF[q] = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const qOut = QUESTIONS.map(q =>
  `  {id:'${q.id}',cluster:'${q.cluster}',text:'${q.text.replace(/'/g, "\\'")}'}`).join(',\n');

const dOut = qids.map(q => `${q}:${num(QDEF[q])}`).join(',');

let written = 0;
const cOut = finalChars.map(c => {
  const vals = qids.filter(q => c.a[q] !== QDEF[q]).map(q => `${q}:${num(c.a[q])}`);
  written += vals.length;
  return `{id:'${c.id}',name:'${c.name.replace(/'/g, "\\'")}',hint:'${c.hint.replace(/'/g, "\\'")}',prior:${c.prior}${c.kin ? ',k:1' : ''}${c.film ? ',f:1' : ''},a:{${vals.join(',')}}}`;
}).join(',\n');

fs.writeFileSync(OUT,
  `const QUESTIONS = [\n${qOut}\n];\n\n` +
  `/* مقدارِ پیش‌فرضِ هر سؤال؛ هر شخصیت فقط تفاوت‌هایش را دارد. */\n` +
  `const QDEF = {${dOut}};\n\n` +
  `const CHARACTERS = [\n${cOut}\n];\n` +
  `for(const c of CHARACTERS) c.a = Object.assign(Object.create(QDEF), c.a);\n`, 'utf8');

const full = finalChars.length * qids.length;
console.log(`خانه‌های نوشته‌شده: ${written} از ${full} (${(written / full * 100).toFixed(1)}%)`);

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\nنوشته شد: data-block.js  (${kb} KB)`);
