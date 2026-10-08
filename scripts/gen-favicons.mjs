/**
 * Generates every site icon from the brand mark geometry in src/lib/brand.ts:
 *
 *   src/app/icon.svg        adaptive favicon (light/dark via prefers-color-scheme)
 *   src/app/icon.png        256px transparent fallback
 *   src/app/favicon.ico     16/32/48 transparent (legacy browsers)
 *   src/app/apple-icon.png  180px on the dark tile (iOS home screen)
 *   public/icon-192.png     PWA icon, dark tile, maskable-safe padding
 *   public/icon-512.png     PWA icon, dark tile, maskable-safe padding
 *   public/favicon.png      150px dark tile (JSON-LD publisher logo)
 *
 * Run:  npm run icons   (needs Node ≥ 22.6 for --experimental-strip-types)
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BRAND_NODES, BRAND_PALETTES, BRAND_STROKES, BRAND_VIEWBOX, brandGapCircles, brandMarkMetrics, brandMarkSvg } from '../src/lib/brand.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (...p) => join(root, ...p);

/** App-icon tile: matches manifest background_color. */
const TILE = '#0b0f19';
/**
 * Padding keeps the mark inside the maskable safe zone (central circle of
 * 80% diameter): mark corners sit at √2 × (0.5 − 0.22) ≈ 0.40 of the size.
 */
const TILE_PADDING = 0.22;

const render = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** Transparent, compact mark for browser tabs (gap is a transparent cut-out). */
const tabIcon = (size) => brandMarkSvg({ palette: BRAND_PALETTES.light, size, compact: true });

/** Mark on the dark app tile. */
const tileIcon = (size) =>
  brandMarkSvg({
    palette: BRAND_PALETTES.dark,
    size,
    compact: false,
    background: TILE,
    padding: TILE_PADDING,
  });

/** Favicon that switches palette with the OS/browser colour scheme. */
function adaptiveSvg() {
  const m = brandMarkMetrics(true);
  const [l, d] = [BRAND_PALETTES.light, BRAND_PALETTES.dark];
  const css =
    `.c0{stroke:${l[0]};fill:${l[0]}}.c1{stroke:${l[1]};fill:${l[1]}}.c2{stroke:${l[2]};fill:${l[2]}}` +
    `@media (prefers-color-scheme:dark){.c0{stroke:${d[0]};fill:${d[0]}}.c1{stroke:${d[1]};fill:${d[1]}}.c2{stroke:${d[2]};fill:${d[2]}}}`;
  const strokes = BRAND_STROKES.map(
    (s) => `<path class="c${s.color}" d="${s.d}" stroke-width="${m.strokeWidth}" stroke-linecap="round" style="fill:none"/>`
  ).join('');
  const nodes = BRAND_NODES.map(
    (n) => `<circle class="c${n.color}" cx="${n.cx}" cy="${n.cy}" r="${m.nodeRadius}" style="stroke:none"/>`
  ).join('');
  const holes = brandGapCircles(true)
    .map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="black"/>`)
    .join('');
  const mask = `<mask id="g" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="white"/>${holes}</mask>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_VIEWBOX}"><style>${css}</style><defs>${mask}</defs><g mask="url(#g)">${strokes}</g>${nodes}</svg>\n`;
}

function packIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(count * 16);
  let offset = 6 + count * 16;
  const bodies = [];

  images.forEach(({ size, data }, i) => {
    const base = i * 16;
    entries.writeUInt8(size >= 256 ? 0 : size, base + 0);
    entries.writeUInt8(size >= 256 ? 0 : size, base + 1);
    entries.writeUInt8(0, base + 2);
    entries.writeUInt8(0, base + 3);
    entries.writeUInt16LE(1, base + 4);
    entries.writeUInt16LE(32, base + 6);
    entries.writeUInt32LE(data.length, base + 8);
    entries.writeUInt32LE(offset, base + 12);
    offset += data.length;
    bodies.push(data);
  });

  return Buffer.concat([header, entries, ...bodies]);
}

async function main() {
  writeFileSync(out('src/app/icon.svg'), adaptiveSvg());
  writeFileSync(out('src/app/icon.png'), await render(brandMarkSvg({ palette: BRAND_PALETTES.light, size: 256, compact: true }), 256));
  writeFileSync(out('src/app/apple-icon.png'), await render(tileIcon(180), 180));
  writeFileSync(out('public/icon-192.png'), await render(tileIcon(192), 192));
  writeFileSync(out('public/icon-512.png'), await render(tileIcon(512), 512));
  writeFileSync(out('public/favicon.png'), await render(tileIcon(150), 150));

  const images = [];
  for (const size of [16, 32, 48]) images.push({ size, data: await render(tabIcon(size), size) });
  writeFileSync(out('src/app/favicon.ico'), packIco(images));

  console.log('Generated: icon.svg, icon.png, favicon.ico, apple-icon.png, icon-192.png, icon-512.png, favicon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
