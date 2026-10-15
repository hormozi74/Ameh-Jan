/* ============================================================
   انتشارِ data-block.js برای بازی.

   تا ۱۶ اکتبر ۲۰۲۶ داده داخلِ خودِ HTML تزریق می‌شد و فایل به ۵ مگابایت رسید:
   هر تغییرِ کوچکِ رابط یا موتور یعنی دانلودِ دوباره‌ی همه‌ی داده (۶۵۰ کیلوبایتِ
   فشرده) روی موبایل. حالا داده فایلِ جدای `data.js` است با نشانیِ نسخه‌دار
   (`data.js?v=<هش>`): کشِ مرورگر و service worker آن را تا وقتی داده واقعاً
   عوض نشده نگه می‌دارند، و HTML سبک می‌ماند.

   data.js یک اسکریپتِ کلاسیک است و پیش از اسکریپتِ اصلی بار می‌شود؛ `const`های
   سطحِ بالای اسکریپت‌های کلاسیک در یک حوزه‌ی سراسری‌اند، پس QUESTIONS/QDEF/
   CHARACTERS برای اسکریپتِ اصلی دقیقاً مثلِ قبل در دسترس‌اند.

   اگر HTML هنوز داده‌ی درون‌خطی دارد (نسخه‌ی قدیمی)، همین‌جا بیرون کشیده می‌شود.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'ameh-jan.html');
const DATA = path.join(__dirname, 'data-block.js');
const OUT = path.join(ROOT, 'data.js');
const END_MARK = '/* ==========================================================\n   موتور بیزی';
const TAG_RE = /<script src="data\.js\?v=[0-9a-f]+"><\/script>\n/;

const block = fs.readFileSync(DATA, 'utf8').trimEnd() + '\n';
fs.writeFileSync(OUT, block, 'utf8');
const hash = crypto.createHash('sha1').update(block).digest('hex').slice(0, 10);
const tag = `<script src="data.js?v=${hash}"></script>\n`;

let src = fs.readFileSync(HTML, 'utf8');

/* نسخه‌ی قدیمی: داده‌ی درون‌خطی را بردار */
const start = src.indexOf('const QUESTIONS = [');
if (start >= 0) {
  const end = src.indexOf(END_MARK);
  if (end < start) { console.error('نشانه‌های داده‌ی درون‌خطی پیدا نشد — HTML دست‌کاری شده؟'); process.exit(1); }
  src = src.slice(0, start) + '/* داده (QUESTIONS، QDEF، CHARACTERS) در data.js است — ← build/inject.js */\n\n' + src.slice(end);
}

/* برچسبِ اسکریپتِ داده، درست پیش از اسکریپتِ اصلی */
if (TAG_RE.test(src)) src = src.replace(TAG_RE, tag);
else {
  const main = src.indexOf('<script>\n/* ==========================================================\n   داده‌ی اولیه');
  if (main < 0) { console.error('اسکریپتِ اصلی پیدا نشد'); process.exit(1); }
  src = src.slice(0, main) + tag + src.slice(main);
}
fs.writeFileSync(HTML, src, 'utf8');

/* service worker: نسخه‌ی کش و نشانیِ داده از روی همان هش */
const SW = path.join(ROOT, 'sw.js');
let sw = fs.readFileSync(SW, 'utf8');
const sw2 = sw.replace(/const VERSION = '[^']*';/, `const VERSION = 'ameh-d${hash}';`)
              .replace(/const DATA = 'data\.js\?v=[^']*';/, `const DATA = 'data.js?v=${hash}';`);
if (!/const DATA = /.test(sw)) { console.error('sw.js ثابتِ DATA ندارد'); process.exit(1); }
if (sw2 !== sw) fs.writeFileSync(SW, sw2, 'utf8');

const kb = f => (fs.statSync(f).size / 1024).toFixed(0);
console.log(`data.js (${kb(OUT)} KB, v=${hash})  ←  ameh-jan.html (${kb(HTML)} KB)`);
