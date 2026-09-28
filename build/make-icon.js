/* آیکونِ اپ: سرِ عمه روی کاغذدیواریِ خردلی. خروجی: icon.svg و icon-*.png (با qlmanage و sips در مک)
   اجرا: node make-icon.js */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'ameh-jan.html'), 'utf8');
const fnSrc = src.slice(src.indexOf('function auntMarkup(){'), src.indexOf('/* ==========================================================\n   حالتِ عمه') > 0 ? undefined : undefined);
const auntMarkup = new Function(fnSrc.slice(0, fnSrc.indexOf('\n}\n', fnSrc.indexOf('return `')) + 3) + '; return auntMarkup;')();
const inner = auntMarkup().replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const css = `svg{--skin:#f7dcbe;--hair:#8a7469;--brow:#6b5850;--lip:#b0435a;--petal:#fff3e0;--dress:#7d2438;--dress2:#9c3349;--scarf:#c4475f;--scarf2:#a63a52;--slipper:#5b3a2e;--tea:#b5651d;--gold:#c9a227;--ink:#3b2418;--ink-soft:#6b4a36;--anabi:#7d2438}
.b,.e,.m,.tears,.fx>g{display:none}.b-normal,.e-open,.m-smile{display:block}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfa54c"/><stop offset="1" stop-color="#a47c2a"/></linearGradient>
  <pattern id="p" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M22 5 q7 8 0 17 q-7 -8 0 -17Z M5 22 q8 -7 17 0 q-8 7 -17 0Z M22 22 q7 8 0 17 q-7 -8 0 -17Z M22 22 q8 -7 17 0 q-8 7 -17 0Z" fill="rgba(70,45,10,.12)"/></pattern>
  <radialGradient id="v" cx=".5" cy=".4" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
  <clipPath id="r"><rect width="512" height="512" rx="110"/></clipPath>
</defs>
<g clip-path="url(#r)">
  <rect width="512" height="512" fill="url(#g)"/><rect width="512" height="512" fill="url(#p)"/>
  <path d="M0 430 h512 v82 h-512Z" fill="#7d1f2f"/><path d="M0 438 h512 v10 h-512Z M0 494 h512 v8 h-512Z" fill="#28345a"/>
  <path d="M0 452 h512" stroke="#ecd9a9" stroke-width="3" stroke-dasharray="10 8"/>
  <rect width="512" height="512" fill="url(#v)"/>
  <svg x="26" y="26" width="460" height="460" viewBox="40 4 120 120"><style>${css}</style>${inner}</svg>
</g>
</svg>`;
fs.writeFileSync(path.join(root, 'icon.svg'), svg);
try {
  execSync(`qlmanage -t -s 1024 -o "${root}" "${path.join(root, 'icon.svg')}" >/dev/null 2>&1`);
  fs.renameSync(path.join(root, 'icon.svg.png'), path.join(root, 'icon-1024.png'));
  for (const sz of [512, 192, 180]) execSync(`sips -z ${sz} ${sz} "${path.join(root, 'icon-1024.png')}" --out "${path.join(root, 'icon-' + sz + '.png')}" >/dev/null`);
  console.log('icon.svg, icon-1024/512/192/180.png');
} catch (e) { console.log('SVG نوشته شد؛ تبدیل به PNG نشد:', e.message); }
