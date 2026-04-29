const sharp = require('./server/node_modules/sharp');
const path = require('path');

const COLORS = ['#FF5BA7','#FF8A3D','#FFCB57','#7ED957','#26C6DA','#AA63F2'];
const ANGLES = [-30, -15, 0, 15, 30, 45];
const RATIOS = [1.0, 0.84, 0.68, 0.52, 0.36, 0.20];

function ringsSvg(cx, cy, maxRx, maxRy, strokeBase) {
  return COLORS.map((c, i) => {
    const rx = maxRx * RATIOS[i];
    const ry = maxRy * RATIOS[i];
    const sw = strokeBase * (1 - i * 0.08);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-width="${sw}" transform="rotate(${ANGLES[i]},${cx},${cy})" opacity="0.95"/>`;
  }).join('\n');
}

async function makeIcon() {
  const S = 1024;
  const svg = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${S}" height="${S}" fill="#0F0F10"/>
  ${ringsSvg(S/2, S/2, S*0.40, S*0.26, S*0.009)}
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets/icon.png'));
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets/adaptive-icon.png'));
  console.log('✓ icon.png + adaptive-icon.png');
}

async function makeSplash() {
  const W = 1284, H = 2778;
  const cx = W / 2, cy = H * 0.40;
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#0F0F10"/>
  ${ringsSvg(cx, cy, W*0.38, W*0.25, 10)}
  <text x="${cx}" y="${cy + W*0.38 + 80}" text-anchor="middle"
    font-family="Helvetica Neue, Arial, sans-serif" font-size="88" font-weight="700"
    fill="#F6F6F6" letter-spacing="14">LOOKATME</text>
  <text x="${cx}" y="${cy + W*0.38 + 148}" text-anchor="middle"
    font-family="Helvetica Neue, Arial, sans-serif" font-size="32" font-weight="400"
    fill="#FF5BA7" letter-spacing="10">REFINE YOUR LOOK</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets/splash-icon.png'));
  console.log('✓ splash-icon.png');
}

async function makeFavicon() {
  const S = 64;
  const svg = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${S}" height="${S}" fill="#0F0F10"/>
  ${ringsSvg(S/2, S/2, S*0.40, S*0.26, 1.2)}
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets/favicon.png'));
  console.log('✓ favicon.png');
}

Promise.all([makeIcon(), makeSplash(), makeFavicon()])
  .then(() => console.log('All assets generated!'))
  .catch(e => { console.error(e); process.exit(1); });
