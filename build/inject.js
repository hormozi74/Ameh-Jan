/* ============================================================
   تزریقِ data-block.js در HTML.

   تا حالا این کار دستی انجام می‌شد و هر بار خطرِ این بود که بازیِ منتشرشده
   با چیزی که تست می‌کنیم یکی نباشد. مرز را از روی همان دو نشانی پیدا
   می‌کنیم که generate.js می‌نویسد: `const QUESTIONS = [` تا انتهای
   `const CHARACTERS = [ ... ];` درست پیش از کامنتِ «موتور بیزی».
   ============================================================ */
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, '..', 'ameh-jan.html');
const DATA = path.join(__dirname, 'data-block.js');
const END_MARK = '/* ==========================================================\n   موتور بیزی';

const src = fs.readFileSync(HTML, 'utf8');
const start = src.indexOf('const QUESTIONS = [');
const end = src.indexOf(END_MARK);
if (start < 0 || end < 0 || end < start) {
  console.error('نشانه‌های تزریق پیدا نشد — HTML دست‌کاری شده؟');
  process.exit(1);
}

const block = fs.readFileSync(DATA, 'utf8').trimEnd();
const out = src.slice(0, start) + block + '\n\n' + src.slice(end);
fs.writeFileSync(HTML, out, 'utf8');

const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`تزریق شد → ameh-jan.html (${kb} KB)`);
