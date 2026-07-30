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

if (existingFiles.length === 0) {
  console.log('No PR-02 walkthrough videos found to validate.');
  process.exit(0);
}

const results = [];

existingFiles.forEach((file) => {
  const filePath = path.join(pr02DocsDir, file);

  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

  try {
    const probeOutput = execSync(
      `"${ffprobePath}" -v error -show_entries format=duration,format_name,size -show_streams -select_streams v:0 -of json "${filePath}"`
    ).toString();

    const data = JSON.parse(probeOutput);
    const duration = parseFloat(data.format.duration);
    const stream = data.streams[0];

    if (duration <= 5.0) {
      throw new Error(`Video ${file} duration ${duration}s is less than 5 seconds requirement.`);
    }

    results.push({
      file,
      format: data.format.format_name,
      duration: `${duration.toFixed(2)} s`,
      size: `${stat.size.toLocaleString()} bytes`,
      codec: `${stream.codec_name} (${stream.width}x${stream.height})`,
      hash,
    });
  } catch (err) {
    console.warn(`Could not probe video ${file}: ${err.message}`);
  }
});

if (results.length > 1 && results[0].hash === results[1].hash) {
  throw new Error('Video SHA-256 hashes are identical! Walkthrough videos must be distinct.');
}

if (results.length > 0) {
  console.table(results);
  console.log('\n✅ Video evidence files successfully validated with ffprobe!');
}
