/* آیکونِ اپ: سرِ عمه (سبکِ کمیکِ جوهری) روی انفجارِ نارنجی با تراما. خروجی: icon.svg و icon-*.png (با qlmanage و sips در مک)
   اجرا: node make-icon.js */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'ameh-jan.html'), 'utf8');
const fnSrc = src.slice(src.indexOf('function auntMarkup(){'), src.indexOf('/* ==========================================================\n   حالتِ عمه') > 0 ? undefined : undefined);
const auntMarkup = new Function(fnSrc.slice(0, fnSrc.indexOf('\n}\n', fnSrc.indexOf('return `')) + 3) + '; return auntMarkup;')();
const inner = auntMarkup().replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const css = `svg{--k:#1a0c12;--skin:#f6c49b;--skin-sh:#de9270;--skin-hot:#ff8a72;--hair:#d4501c;--hair-lt:#ff8f4f;--iris:#6a3416;
--lip:#d81f3f;--lip-sh:#8f1028;--frame:#f5b51b;--scarf:#e0263f;--scarf-sh:#9a1232;--scarf-pat:#ffd166;
--dress:#6a2c86;--dress-sh:#3f1556;--flower:#ff8fb1;--flower2:#ffd166;--leaf:#5fd17a;
--cardi:#f0a92e;--cardi-sh:#c27a14;--cardi-lt:#ffd57a;--slipper:#2f8ae0;--slipper-sh:#1a5aa6;--tea:#c5401a;--gold:#ffc53a;--blue:#3a8de0}
.b,.e,.m,.tears,.fx>g,.fx-sfx,.slipper-hand,.hanky,.slip-bare,.glare{display:none}.b-normal,.e-open,.m-smile{display:block}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
  <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="rgba(26,12,18,.14)"/></pattern>
  <radialGradient id="m" cx=".5" cy=".58" r=".7"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="mk"><rect width="512" height="512" fill="url(#m)"/></mask>
  <clipPath id="r"><rect width="512" height="512" rx="110"/></clipPath>
</defs>
<g clip-path="url(#r)">
  <rect width="512" height="512" fill="#ff8a2a"/>
  <g fill="#ffb83a"><path d="M256 300 L1156 300 L1125 533Z"/><path d="M256 300 L1035 750 L892 936Z"/><path d="M256 300 L706 1079 L489 1169Z"/><path d="M256 300 L256 1200 L23 1169Z"/><path d="M256 300 L-194 1079 L-380 936Z"/><path d="M256 300 L-523 750 L-613 533Z"/><path d="M256 300 L-644 300 L-613 67Z"/><path d="M256 300 L-523 -150 L-380 -336Z"/><path d="M256 300 L-194 -479 L23 -569Z"/><path d="M256 300 L256 -600 L489 -569Z"/><path d="M256 300 L706 -479 L892 -336Z"/><path d="M256 300 L1035 -150 L1125 67Z"/></g>
  <rect width="512" height="512" fill="url(#p)" mask="url(#mk)"/>
  <svg x="26" y="30" width="460" height="460" viewBox="40 2 120 120"><style>${css}</style>${inner}</svg>
  <rect x="9" y="9" width="494" height="494" rx="102" fill="none" stroke="#1a0c12" stroke-width="18"/>
</g>
</svg>`;
fs.writeFileSync(path.join(root, 'icon.svg'), svg);
try {
  execSync(`qlmanage -t -s 1024 -o "${root}" "${path.join(root, 'icon.svg')}" >/dev/null 2>&1`);
  fs.renameSync(path.join(root, 'icon.svg.png'), path.join(root, 'icon-1024.png'));
  for (const sz of [512, 192, 180]) execSync(`sips -z ${sz} ${sz} "${path.join(root, 'icon-1024.png')}" --out "${path.join(root, 'icon-' + sz + '.png')}" >/dev/null`);
  console.log('icon.svg, icon-1024/512/192/180.png');
} catch (e) { console.log('SVG نوشته شد؛ تبدیل به PNG نشد:', e.message); }
