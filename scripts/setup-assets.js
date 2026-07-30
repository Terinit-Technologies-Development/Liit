const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'assets', 'images');
const sourceImage = path.join(baseDir, 'icon.png');
const fallbackImage = path.join(baseDir, 'android-icon-foreground.png');

const sourceBuffer = fs.existsSync(sourceImage)
  ? fs.readFileSync(sourceImage)
  : fs.readFileSync(fallbackImage);

const dirs = ['events', 'venues', 'hosts', 'avatars'];
dirs.forEach((d) => fs.mkdirSync(path.join(baseDir, d), { recursive: true }));

const imagesToCreate = [
  // Events
  'events/midnight-grooves.png',
  'events/rosebank-art-jazz.png',
  'events/soweto-food-market.png',
  'events/jozi-run-club.png',
  'events/deep-house-rooftop.png',
  'events/amapiano-sunset.png',
  'events/fashion-week-popup.png',

  // Venues
  'venues/braam-rooftop.png',
  'venues/keyes-art-mile.png',
  'venues/soweto-theatre.png',
  'venues/maboneng-precinct.png',

  // Hosts
  'hosts/groove-co.png',
  'hosts/jozi-vibe-tribe.png',
  'hosts/art-hub-jhb.png',
  'hosts/amapiano-pulse.png',

  // Avatars
  'avatars/avatar-1.png',
  'avatars/avatar-2.png',
  'avatars/avatar-3.png',
  'avatars/avatar-4.png',
];

imagesToCreate.forEach((relPath) => {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, sourceBuffer);
  }
});

console.log('Image asset files created successfully!');
