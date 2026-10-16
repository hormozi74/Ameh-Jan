/* ============================================================
   آزمونِ یکجا — پیش از هر انتشار:  npm test   (یا node build/test-all.js)
   بعد از بهبودِ آگاهانه، خطِ مبنا را به‌روز کن:  npm test -- --update

   ۱) check-tags روی همه‌ی فایل‌های chars: تعدادِ خطای هیچ فایلی نباید بیشتر از خطِ مبنا شود
      (چند خطای قدیمی در chars-01..23 هست که characters.js خودش فیلترشان می‌کند).
   ۲) هم‌خوانی: داده‌ی بازی همان data-block.js است، index.html همان ameh-jan.html.
   ۳) بازیکنِ انسانیِ شبیه‌سازی‌شده: profiles-2 (۴۰ چهره) و profiles-books (۳۰ کتاب‌محور) —
      حداکثر یک باختِ بیشتر از خطِ مبنا (بُرد تا چهار حدس = بازیِ واقعی؛ «تا سه حدس» هم ثبت می‌شود).
   ۴) real-sim (۳۰۰ بازی، seed ثابت): «تا سه حدس» و «تا چهار حدس» حداکثر ۳ واحد کمتر؛ میانگینِ سؤال و
      «سؤال تا حدسِ درست» حداکثر ۱.۵ سؤال بیشتر؛ بازیِ گذشته از ۳۲ سؤال حداکثر ۵ واحد بیشتر.
      (۱۶ اکتبر ۲۰۲۶: سیاستِ حدس به ENG رفت — سقفِ ۲۴ + حدسِ نرم + تمرکز؛ «به‌سقف» حالا یعنی n ≥ ۳۲.)
   ============================================================ */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const B = __dirname, ROOT = path.join(B, '..');
const BASE = path.join(B, 'lab', 'baseline.json');
const update = process.argv.includes('--update');
const base = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')) : {};
const now = { checkTags: {} };
const fails = [], lines = [];
const run = (args, env = {}) => execFileSync('node', args, { cwd: B, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 64 << 20 });
const num = (s, re) => { const m = s.match(re); return m ? +m[1] : NaN; };

/* ۱) check-tags */
for (const f of fs.readdirSync(B).filter(f => /^chars-.*\.js$/.test(f)).sort()) {
  const errs = num(run(['check-tags.js', f]), /خطا: (\d+)/);
  now.checkTags[f] = errs;
  const was = base.checkTags?.[f];
  if (was !== undefined && errs > was) fails.push(`check-tags ${f}: ${was} → ${errs} خطا`);
  else if (was === undefined && errs > 0) fails.push(`check-tags ${f} (فایلِ تازه): ${errs} خطا`);
}
lines.push(`check-tags: ${Object.values(now.checkTags).reduce((a, b) => a + b, 0)} خطا در ${Object.keys(now.checkTags).length} فایل`);

/* ۲) هم‌خوانی */
const data = fs.readFileSync(path.join(B, 'data-block.js'), 'utf8').trimEnd();
const html = fs.readFileSync(path.join(ROOT, 'ameh-jan.html'), 'utf8');
const dataJs = path.join(ROOT, 'data.js');
const inGame = fs.existsSync(dataJs) && !html.includes('const CHARACTERS = [')
  ? fs.readFileSync(dataJs, 'utf8').trimEnd() === data
  : html.includes(data);
if (!inGame) fails.push('داده‌ی بازی با data-block.js یکی نیست — node build/inject.js');
if (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') !== html) fails.push('index.html با ameh-jan.html یکی نیست — node build/publish.js');
lines.push(`هم‌خوانی: ${inGame ? 'داده ✓' : 'داده ✗'}`);

/* ۳) بازیکنِ انسانی */
for (const [key, file] of [['profiles2', 'lab/profiles-2.json'], ['books', 'lab/profiles-books.json']]) {
  const out = run(['lab/human-test2.js'], { QUIET: '1', PROFILES: path.join(B, file) });
  const m = out.match(/بُرد (\d+)\/(\d+)/), m3 = out.match(/تا سه حدس (\d+)\//), mq = out.match(/میانگینِ سؤال ([\d.]+)/);
  now[key] = +m[1]; now[key + '3'] = m3 ? +m3[1] : +m[1]; now[key + 'Mean'] = mq ? +mq[1] : NaN;
  lines.push(`${file}: ${m[1]}/${m[2]}` + (m3 ? ` (تا سه حدس ${m3[1]}، میانگین ${mq[1]} سؤال)` : ''));
  if (base[key] !== undefined && now[key] < base[key] - 1) fails.push(`${file}: ${base[key]} → ${now[key]}`);
}

/* ۴) real-sim */
{
  const out = run(['lab/real-sim.js', '300', '1']);
  now.realsim = {
    first: num(out, /حدسِ اول: ([\d.]+)%/), three: num(out, /تا سه حدس: ([\d.]+)%/), four: num(out, /تا چهار حدس: ([\d.]+)%/),
    mean: num(out, /میانگینِ سؤال: ([\d.]+)/), toCorrect: num(out, /تا حدسِ درست: ([\d.]+)/),
    firstAt: num(out, /در سؤالِ ([\d.]+)/), cap: num(out, /به سقف رسیده: ([\d.]+)%/),
  };
  const r = now.realsim, b = base.realsim;
  lines.push(`real-sim: حدسِ اول ${r.first}%  سه حدس ${r.three}%  چهار حدس ${r.four}%  میانگین ${r.mean} سؤال  تا درست ${r.toCorrect}  اولین حدس در ${r.firstAt}  از ۳۲ گذشته ${r.cap}%` +
    (b ? `   (مبنا: ${b.first}% / ${b.three}% / ${b.four ?? '-'}% / ${b.mean} / ${b.toCorrect ?? '-'} / ${b.firstAt ?? '-'} / ${b.cap}%)` : ''));
  if (b && r.three < b.three - 3) fails.push(`real-sim سه حدس: ${b.three} → ${r.three}`);
  if (b && b.four !== undefined && r.four < b.four - 3) fails.push(`real-sim چهار حدس: ${b.four} → ${r.four}`);
  if (b && b.toCorrect !== undefined && r.mean > b.mean + 1.5) fails.push(`real-sim میانگینِ سؤال: ${b.mean} → ${r.mean}`);
  if (b && b.toCorrect !== undefined && r.toCorrect > b.toCorrect + 1.5) fails.push(`real-sim سؤال تا حدسِ درست: ${b.toCorrect} → ${r.toCorrect}`);
  if (b && r.cap > b.cap + 5) fails.push(`real-sim به‌سقف: ${b.cap} → ${r.cap}`);
}

console.log(lines.join('\n'));
if (update) { fs.writeFileSync(BASE, JSON.stringify(now, null, 1) + '\n'); console.log('\nخطِ مبنا به‌روز شد → lab/baseline.json'); }
else if (fails.length) { console.log('\n✗ ' + fails.join('\n✗ ')); process.exit(1); }
else console.log('\n✓ همه سبز');
