/* ⚠️ منسوخ — از build/sweep3.js استفاده کن.
   این اسکریپت موتور بیزی را برای سرعت از نو می‌نوشت و «آستانه‌ی نرم‌شونده» را
   مدل می‌کرد. بازی دیگر آستانه‌ی نرم‌شونده ندارد و موتورش هم بازنویسی شده،
   پس عددهای این‌جا دیگر با چیزی که منتشر می‌شود نمی‌خواند.
   sweep3.js همان ENG داخل بازی را اجرا می‌کند و حالا به‌قدر کافی سریع هست. */
const fs=require('fs');
const path=require('path');
let src=fs.readFileSync(path.join(__dirname,'sweep-full.js'),'utf8');
// آستانه‌ی نزولی: اول سخت‌گیر، هرچه جلوتر می‌رود نرم‌تر
src=src.replace(
 'const ready = (n >= MINQ && p1 > CONF && p1 / Math.max(p2, 1e-12) > RATIO) || n >= MAXQ;',
 'const conf = Math.max(CONF, 0.92 - DECAY*n), rat = Math.max(RATIO, 9 - DECAY*24*n);\n    const ready = (n >= MINQ && p1 > conf && p1 / Math.max(p2, 1e-12) > rat) || n >= MAXQ;');
src=src.replace(/function play\(truth, noise, CONF, RATIO, MINQ, MAXQ\)/,'function play(truth, noise, CONF, RATIO, MINQ, MAXQ, DECAY)');
src=src.replace(/const r = play\(t, noise, conf, ratio, minq, maxq\)/,'const r = play(t, noise, conf, ratio, minq, maxq, decay)');
src=src.replace(/function run\(conf, ratio, minq, maxq, noise, N\)/,'function run(conf, ratio, minq, maxq, noise, N, decay)');
src=src.replace(/console\.log\('conf ratio[\s\S]*$/,`
console.log('کف‌اطمینان  شیب‌نزول  سقف | حدس‌اول  سه‌حدس  سؤال | نویز۱۰٪ اول  سه‌حدس');
for (const [conf, ratio, minq, maxq, decay] of [
  [.90, 8, 6, 25, 0], [.70, 5, 6, 22, 0],
  [.40, 3, 6, 20, .030], [.40, 3, 6, 20, .045], [.40, 3, 6, 20, .060],
  [.30, 2.5, 6, 20, .045], [.50, 3.5, 6, 20, .045], [.40, 3, 6, 24, .045],
]) {
  const a = run(conf, ratio, minq, maxq, 0, 700, decay);
  const b = run(conf, ratio, minq, maxq, .1, 700, decay);
  console.log(\`\${conf.toFixed(2)}      \${decay.toFixed(3)}    \${String(maxq).padStart(2)} | \` +
    \`\${a[0].toFixed(1).padStart(5)}%  \${a[1].toFixed(1).padStart(5)}%  \${a[2].toFixed(1).padStart(4)} | \` +
    \`\${b[0].toFixed(1).padStart(5)}%  \${b[1].toFixed(1).padStart(5)}%\`);
}
`);
fs.writeFileSync(path.join(__dirname,'sweep2-run.js'),src);
