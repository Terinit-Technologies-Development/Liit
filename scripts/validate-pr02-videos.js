const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

let ffprobePath = 'ffprobe';
try {
  ffprobePath = require('@ffprobe-installer/ffprobe').path;
} catch (e) {
  // Use system ffprobe if installed
}

const pr02DocsDir = path.join(__dirname, '..', 'docs', 'assets', 'pr-02');
const videoFiles = [
  'instruction-02-discovery.mp4',
  'instruction-02-states.mp4',
];

console.log('--- PR-02 VIDEO EVIDENCE FFPROBE VALIDATION ---\n');

const existingFiles = videoFiles.filter((f) => fs.existsSync(path.join(pr02DocsDir, f)));

if (existingFiles.length !== videoFiles.length) {
  throw new Error('Both genuine Instruction 2 recordings are required.');
}

const results = [];

existingFiles.forEach((file) => {
  const filePath = path.join(pr02DocsDir, file);
  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

  const probeOutput = execSync(
    `"${ffprobePath}" -v error -show_entries format=duration,format_name,size -show_streams -select_streams v:0 -of json "${filePath}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] }
  ).toString();

  const data = JSON.parse(probeOutput);
  const duration = parseFloat(data.format.duration);
  const stream = data.streams[0];

  if (duration <= 5.0) {
    throw new Error(`Video ${file} duration ${duration}s is less than 5 seconds requirement.`);
  }

  if (stat.size <= 1000) {
    throw new Error(`Video ${file} size ${stat.size} bytes is insufficient.`);
  }

  results.push({
    file,
    format: data.format.format_name,
    duration: `${duration.toFixed(2)} s`,
    size: `${stat.size.toLocaleString()} bytes`,
    codec: `${stream.codec_name} (${stream.width}x${stream.height})`,
    hash,
  });
});

if (results[0].hash === results[1].hash) {
  throw new Error('Video SHA-256 hashes are identical! Walkthrough videos must be distinct.');
}

console.table(results);
console.log('\n✅ All video evidence files successfully validated with ffprobe!');
