import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public', 'favicon.png');

const iconPng = join(root, 'src', 'app', 'icon.png');
const appleIconPng = join(root, 'src', 'app', 'apple-icon.png');
const faviconIco = join(root, 'src', 'app', 'favicon.ico');
const icon192 = join(root, 'public', 'icon-192.png');
const icon512 = join(root, 'public', 'icon-512.png');

async function renderPng(size, dest) {
  const buf = await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
    .png()
    .toBuffer();
  writeFileSync(dest, buf);
  return buf;
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
  await renderPng(256, iconPng);
  await renderPng(180, appleIconPng);
  await renderPng(192, icon192);
  await renderPng(512, icon512);

  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes) {
    const data = await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
      .png()
      .toBuffer();
    images.push({ size, data });
  }
  writeFileSync(faviconIco, packIco(images));

  console.log('Generated: icon.png, apple-icon.png, favicon.ico, icon-192.png, icon-512.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
