const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(i => i.buffer)]);
}

async function generateAll() {
  const boldUrl = 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf';
  const res = await fetch(boldUrl);
  const fontBuf = Buffer.from(await res.arrayBuffer());
  const fontBase64 = fontBuf.toString('base64');

  // SVG for web and high-res rendering
  // Luxury rounded square tile in wedding palette (#f4f7f8 background, #24323b text, subtle #4e6b7c border)
  const svgTile = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <style>
      @font-face {
        font-family: 'Playfair Display';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }
      .monogram {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 190px;
        fill: #24323b;
        letter-spacing: -3px;
      }
    </style>
  </defs>
  <rect width="512" height="512" rx="116" fill="#f4f7f8" />
  <rect x="16" y="16" width="480" height="480" rx="100" fill="none" stroke="#4e6b7c" stroke-width="12" stroke-opacity="0.22" />
  <text x="256" y="280" text-anchor="middle" dominant-baseline="central" class="monogram">H&amp;T</text>
</svg>`;

  const projectRoot = path.resolve(__dirname, '..');
  const appDir = path.join(projectRoot, 'app');
  const publicDir = path.join(projectRoot, 'public');

  // 1. Generate app/icon.svg and public/icon.svg
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgTile);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgTile);
  console.log('Created icon.svg');

  // 2. Generate PNG buffers
  const svgBuf = Buffer.from(svgTile);
  const png512 = await sharp(svgBuf).resize(512, 512).png().toBuffer();
  const png180 = await sharp(svgBuf).resize(180, 180).png().toBuffer();
  const png64 = await sharp(svgBuf).resize(64, 64).png().toBuffer();
  const png32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();

  // 3. Write app/icon.png and public/icon.png (32x32 for standard favicon)
  fs.writeFileSync(path.join(appDir, 'icon.png'), png32);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), png32);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  console.log('Created icon.png');

  // 4. Write app/apple-icon.png and public/apple-icon.png (180x180)
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), png180);
  console.log('Created apple-icon.png');

  // 5. Write favicon.ico (multi-resolution 16x16, 32x32, 48x48)
  const png48 = await sharp(svgBuf).resize(48, 48).png().toBuffer();
  const icoBuf = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  console.log('Created favicon.ico');

  console.log('Successfully generated all icon assets!');
}

generateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
