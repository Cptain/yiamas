const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPngBuffer(width, height, draw) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }
  draw(pixels, width, height);

  const raw = Buffer.alloc(height * (width * 3 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[offset++] = pixels[i];
      raw[offset++] = pixels[i + 1];
      raw[offset++] = pixels[i + 2];
    }
  }

  const deflated = zlib.deflateSync(raw);
  const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])];

  const addChunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    parts.push(len, typeBuf, data, crc);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  addChunk('IHDR', ihdr);
  addChunk('IDAT', deflated);
  addChunk('IEND', Buffer.alloc(0));

  return Buffer.concat(parts);
}

function setPixel(pixels, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
  pixels[i + 3] = color[3];
}

function fillRect(pixels, width, height, x0, y0, x1, y1, color) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      setPixel(pixels, width, height, x, y, color);
    }
  }
}

function drawCircle(pixels, width, height, cx, cy, r, color) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        setPixel(pixels, width, height, x, y, color);
      }
    }
  }
}

function writePng(filePath, width, height, draw) {
  fs.writeFileSync(filePath, createPngBuffer(width, height, draw));
}

const outDir = path.join(process.cwd(), 'public');
fs.mkdirSync(outDir, { recursive: true });

writePng(path.join(outDir, 'social-google.png'), 64, 64, (pixels, width, height) => {
  fillRect(pixels, width, height, 0, 0, width, height, [255, 255, 255, 255]);
  drawCircle(pixels, width, height, 32, 32, 24, [240, 240, 240, 255]);
  fillRect(pixels, width, height, 12, 12, 52, 52, [255, 255, 255, 255]);
  fillRect(pixels, width, height, 18, 16, 46, 44, [66, 133, 244, 255]);
  fillRect(pixels, width, height, 16, 30, 48, 48, [52, 168, 83, 255]);
  fillRect(pixels, width, height, 18, 14, 32, 30, [251, 188, 5, 255]);
  fillRect(pixels, width, height, 30, 14, 46, 30, [234, 67, 53, 255]);
});

writePng(path.join(outDir, 'social-facebook.png'), 64, 64, (pixels, width, height) => {
  fillRect(pixels, width, height, 0, 0, width, height, [24, 119, 242, 255]);
  fillRect(pixels, width, height, 18, 18, 46, 46, [255, 255, 255, 255]);
  fillRect(pixels, width, height, 22, 26, 42, 46, [24, 119, 242, 255]);
  fillRect(pixels, width, height, 28, 16, 42, 26, [24, 119, 242, 255]);
});

writePng(path.join(outDir, 'social-apple.png'), 64, 64, (pixels, width, height) => {
  fillRect(pixels, width, height, 0, 0, width, height, [17, 17, 17, 255]);
  fillRect(pixels, width, height, 18, 18, 46, 46, [255, 255, 255, 255]);
  fillRect(pixels, width, height, 24, 24, 40, 42, [17, 17, 17, 255]);
  fillRect(pixels, width, height, 24, 18, 34, 24, [255, 255, 255, 255]);
});

console.log('Created social PNG assets');
