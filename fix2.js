const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken tags first!
  content = content.replace(/<\="([^"]+)"/g, '<AppHeader title="$1"');
  content = content.replace(/<\={false}/g, '<AppHeader title="" showBack={false}');
  
  // Re-read file if we need
  fs.writeFileSync(file, content);
});
