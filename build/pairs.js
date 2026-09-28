/* ============================================================
   عیب‌یابی: نزدیک‌ترین جفت‌های *بازمانده*.

   generate.js فقط آن‌هایی را گزارش می‌کند که از آستانه‌ی dedup رد نشدند.
   ولی جفتی که ۰.۳۵ فاصله دارد هم حذف نمی‌شود و هم عملاً غیرقابل‌تفکیک
   است — بازی تا آخر بینشان گیر می‌کند و سؤال هدر می‌دهد. این اسکریپت
   دقیقاً همان‌ها را بیرون می‌کشد تا برچسبِ تفکیک‌کننده بگیرند.

   اجرا:  node pairs.js [آستانه] [تعداد]
   ============================================================ */
const fs = require('fs');
const path = require('path');

const LIMIT = +(process.argv[2] || 0.55);
const SHOW = +(process.argv[3] || 40);

const { QUESTIONS, CHARACTERS } = eval(
  fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');

/* سؤالِ حرفِ اول هر دو اسمی را که با حرفِ متفاوت شروع می‌شوند «دور» نشان می‌دهد،
   ولی فقط یک بار و آخرِ بازی پرسیده می‌شود — پس در سنجشِ نزدیکی حساب نمی‌شود. */
const qids = QUESTIONS.filter(q => q.cluster !== 'letter').map(q => q.id);
const NC = CHARACTERS.length, NQ = qids.length;
const M = new Float64Array(NC * NQ);
for (let i = 0; i < NC; i++)
  for (let q = 0; q < NQ; q++) M[i * NQ + q] = CHARACTERS[i].a[qids[q]];

const pairs = [];
for (let i = 0; i < NC; i++) {
  for (let j = i + 1; j < NC; j++) {
    let d = 0;
    const bi = i * NQ, bj = j * NQ;
    for (let q = 0; q < NQ; q++) { const t = M[bi + q] - M[bj + q]; d += t * t; if (d > LIMIT * LIMIT) break; }
    if (d <= LIMIT * LIMIT) pairs.push([Math.sqrt(d), i, j]);
  }
}
pairs.sort((a, b) => a[0] - b[0]);

console.log(`جفت‌های نزدیک‌تر از ${LIMIT}: ${pairs.length}  (از ${NC} شخصیت)\n`);

// سؤالی که بیشترین فرق را بین دو نفر می‌سازد، برای اینکه بدانیم چه کم است
function topDiff(i, j) {
  let best = '', bv = 0;
  for (let q = 0; q < NQ; q++) {
    const d = Math.abs(M[i * NQ + q] - M[j * NQ + q]);
    if (d > bv) { bv = d; best = qids[q]; }
  }
  return `${best} ${bv.toFixed(2)}`;
}

for (const [d, i, j] of pairs.slice(0, SHOW))
  console.log(`  ${d.toFixed(2)}  ${CHARACTERS[i].name}  ↔  ${CHARACTERS[j].name}   (بیشترین فرق: ${topDiff(i, j)})`);

// کدام شخصیت‌ها بیشتر از همه در این فهرست‌اند؟ آن‌ها اول باید برچسب بگیرند
const busy = {};
for (const [, i, j] of pairs) { busy[CHARACTERS[i].name] = (busy[CHARACTERS[i].name] || 0) + 1;
                                busy[CHARACTERS[j].name] = (busy[CHARACTERS[j].name] || 0) + 1; }
const worst = Object.entries(busy).sort((a, b) => b[1] - a[1]).slice(0, 30);
if (worst.length) console.log('\nگره‌دارترین‌ها (چند همسایه‌ی نزدیک دارند):\n  ' +
  worst.map(([n, c]) => `${n}×${c}`).join('  '));
