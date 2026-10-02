import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter bytes (0 = None)
  const lineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * lineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Let's create a subtle circular gradient and border for brand look
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / (width / 2);

      let pr = r;
      let pg = g;
      let pb = b;

      if (dist < 0.75) {
        // Inner blue-gold tint
        pr = Math.min(255, r + 25);
        pg = Math.min(255, g + 35);
        pb = Math.min(255, b + 60);
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Brand navy blue: rgb(30, 58, 138)
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createSolidPNG(192, 192, 30, 58, 138));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createSolidPNG(512, 512, 30, 58, 138));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createSolidPNG(180, 180, 30, 58, 138));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createSolidPNG(32, 32, 30, 58, 138));

console.log('Generated PNG icons in public/');
