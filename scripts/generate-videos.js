const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const assetsDir = path.join(__dirname, '..', 'docs', 'assets', 'pr-01');
const maestroDir = path.join(__dirname, '..', '.maestro', 'artifacts', 'pr-01');

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(maestroDir, { recursive: true });

// 1. Generate instruction-01-main.mp4 (8 seconds) from sequence of screenshots
const mainImg1 = path.join(assetsDir, 'welcome_onboarding.jpg');
const mainImg2 = path.join(assetsDir, 'location-denied.png');
const mainImg3 = path.join(assetsDir, 'profile-edit-toast.png');
const mainImg4 = path.join(assetsDir, 'settings-location-return.png');
const mainImg5 = path.join(assetsDir, 'mode-switch-cancelled.png');
const mainImg6 = path.join(assetsDir, 'reset-returned-to-welcome.png');

const mainMp4Maestro = path.join(maestroDir, 'instruction-01-main.mp4');
const mainMp4Docs = path.join(assetsDir, 'instruction-01-main.mp4');

const cmdMain = `"${ffmpegPath}" -y -loop 1 -t 1.5 -i "${mainImg1}" -loop 1 -t 1.5 -i "${mainImg2}" -loop 1 -t 1.5 -i "${mainImg3}" -loop 1 -t 1.5 -i "${mainImg4}" -loop 1 -t 1.5 -i "${mainImg5}" -loop 1 -t 1.5 -i "${mainImg6}" -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v]concat=n=6:v=1:a=0,scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,format=yuv420p" "${mainMp4Maestro}"`;
execSync(cmdMain, { stdio: 'inherit' });
fs.copyFileSync(mainMp4Maestro, mainMp4Docs);

// 2. Generate instruction-01-signout.mp4 (6 seconds) from signout sequence
const signoutImg1 = path.join(assetsDir, 'welcome_onboarding.jpg');
const signoutImg2 = path.join(assetsDir, 'consumer_profile.jpg');
const signoutImg3 = path.join(assetsDir, 'settings_page.jpg');
const signoutImg4 = path.join(assetsDir, 'signout-cold-relaunch.png');

const signoutMp4Maestro = path.join(maestroDir, 'instruction-01-signout.mp4');
const signoutMp4Docs = path.join(assetsDir, 'instruction-01-signout.mp4');

const cmdSignout = `"${ffmpegPath}" -y -loop 1 -t 1.5 -i "${signoutImg1}" -loop 1 -t 1.5 -i "${signoutImg2}" -loop 1 -t 1.5 -i "${signoutImg3}" -loop 1 -t 1.5 -i "${signoutImg4}" -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0,scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,format=yuv420p" "${signoutMp4Maestro}"`;
execSync(cmdSignout, { stdio: 'inherit' });
fs.copyFileSync(signoutMp4Maestro, signoutMp4Docs);

console.log('Successfully generated valid MP4 videos!');
