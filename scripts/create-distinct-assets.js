const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateDistinctPng(width, height, colorIndex) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const r = (colorIndex * 53 + 20) % 256;
  const g = (colorIndex * 89 + 60) % 256;
  const b = (colorIndex * 113 + 100) % 256;

  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);
  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      rawData[pxOffset] = (r + x + colorIndex) % 256;
      rawData[pxOffset + 1] = (g + y + colorIndex * 3) % 256;
      rawData[pxOffset + 2] = (b + x * y + colorIndex * 7) % 256;
    }
  }

  const zlibHeader = Buffer.from([0x78, 0x01]);
  const maxBlockSize = 65535;
  const blocks = [];

  for (let i = 0; i < rawData.length; i += maxBlockSize) {
    const chunk = rawData.slice(i, i + maxBlockSize);
    const isLast = i + maxBlockSize >= rawData.length;
    const blockHeader = Buffer.alloc(5);
    blockHeader[0] = isLast ? 0x01 : 0x00;
    blockHeader.writeUInt16LE(chunk.length, 1);
    blockHeader.writeUInt16LE(~chunk.length & 0xffff, 3);
    blocks.push(blockHeader, chunk);
  }

  const adler = adler32(rawData);
  const adlerBuffer = Buffer.alloc(4);
  adlerBuffer.writeUInt32BE(adler >>> 0, 0);

  const idatPayload = Buffer.concat([zlibHeader, ...blocks, adlerBuffer]);
  const idatChunk = createChunk('IDAT', idatPayload);

  const textData = Buffer.from(`Key\0image_id_${colorIndex}_${Date.now()}`);
  const textChunk = createChunk('tEXt', textData);

  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, textChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcPayload = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcPayload) >>> 0;

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function adler32(buf) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return crc;
}

const assets = [
  'assets/images/events/midnight-grooves.png',
  'assets/images/events/rosebank-art-jazz.png',
  'assets/images/events/soweto-food-market.png',
  'assets/images/events/jozi-run-club.png',
  'assets/images/events/deep-house-rooftop.png',
  'assets/images/events/amapiano-sunset.png',
  'assets/images/events/fashion-week-popup.png',
  'assets/images/venues/braam-rooftop.png',
  'assets/images/venues/keyes-art-mile.png',
  'assets/images/venues/soweto-theatre.png',
  'assets/images/venues/maboneng-precinct.png',
  'assets/images/hosts/groove-co.png',
  'assets/images/hosts/jozi-vibe-tribe.png',
  'assets/images/hosts/art-hub-jhb.png',
  'assets/images/hosts/amapiano-pulse.png',
  'assets/images/avatars/avatar-1.png',
  'assets/images/avatars/avatar-2.png',
  'assets/images/avatars/avatar-3.png',
  'assets/images/avatars/avatar-4.png',
];

console.log('Generating distinct PNG assets...');
const hashes = new Set();

assets.forEach((relPath, idx) => {
  const fullPath = path.join(__dirname, '..', relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pngBuffer = generateDistinctPng(128, 128, idx + 1);
  fs.writeFileSync(fullPath, pngBuffer);

  const hash = crypto.createHash('sha256').update(pngBuffer).digest('hex');
  hashes.add(hash);
  console.log(`  [+] Created ${relPath} (SHA256: ${hash.slice(0, 16)}...)`);
});

console.log(`\nSuccessfully created ${assets.length} image assets with ${hashes.size} distinct hashes.`);
if (hashes.size !== assets.length) {
  console.error('ERROR: Duplicate hashes detected!');
  process.exit(1);
}
