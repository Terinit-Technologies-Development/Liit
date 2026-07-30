const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const assetsDir = path.join(__dirname, '..', 'docs', 'assets', 'pr-01');

const files = [
  'instruction-01-main.mp4',
  'instruction-01-signout.mp4',
];

console.log('=== FFPROBE AND FILE HASH VALIDATION ===\n');

files.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  const cmd = `"${ffprobePath}" -v error -show_entries format=duration,size,format_name -show_streams -of json "${filePath}"`;
  const output = JSON.parse(execSync(cmd).toString());

  console.log(`File: ${file}`);
  console.log(`SHA-256 Hash: ${hash}`);
  console.log(`File Size: ${fs.statSync(filePath).size} bytes`);
  console.log(`Format: ${output.format.format_name}`);
  console.log(`Duration: ${output.format.duration} s`);
  console.log(`Streams count: ${output.streams.length}`);
  console.log(`Video Codec: ${output.streams[0].codec_name} (${output.streams[0].width}x${output.streams[0].height})\n`);
});
