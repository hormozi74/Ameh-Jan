/* node splice.js <html> <engfile> — replaces the `const ENG = (() => {` … `})();` block in html with engfile */
const fs = require('fs');
const [html, engf] = process.argv.slice(2);
const src = fs.readFileSync(html, 'utf8');
const s = src.indexOf('const ENG = (() => {');
const e = src.indexOf('\n})();', s) + '\n})();'.length;
if (s < 0 || e < s) { console.error('ENG block not found'); process.exit(1); }
fs.writeFileSync(html, src.slice(0, s) + fs.readFileSync(engf, 'utf8').trimEnd() + src.slice(e), 'utf8');
console.log('spliced', engf, 'into', html, `(${e - s} → ${fs.readFileSync(engf,'utf8').trimEnd().length} chars)`);
