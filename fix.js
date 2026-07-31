const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // AppText replacements
  content = content.replace(/variant="h1"/g, 'variant="heading"');
  content = content.replace(/variant="h2"/g, 'variant="heading"');
  content = content.replace(/variant="h3"/g, 'variant="subheading"');
  content = content.replace(/variant="body1"/g, 'variant="body"');
  content = content.replace(/variant="body2"/g, 'variant="body"');
  content = content.replace(/variant="body3"/g, 'variant="body"');
  content = content.replace(/weight="[^"]+"/g, '');

  // AppButton replacements
  content = content.replace(/variant="outline"/g, 'variant="secondary"');
  content = content.replace(/title="([^"]+)"/g, (match, p1) => {
    if (content.includes('AppButton')) {
      // Very naive, assuming title is only on AppButton or header
      if (!match.includes('AppHeader')) {
          return `label="${p1}"`;
      }
    }
    return match;
  });
  content = content.replace(/<AppButton([^>]*?)title="([^"]+)"/g, '<AppButton$1label="$2"');
  content = content.replace(/size="small"/g, 'size="sm"');

  // Screen replacements
  content = content.replace(/preset="scroll"/g, 'scrollable');
  content = content.replace(/preset="fixed"/g, '');

  // Colors replacements
  content = content.replace(/import \{ colors \} from ".*?tokens\/colors";/g, '');
  content = content.replace(/colors\./g, 'theme.colors.');

  fs.writeFileSync(file, content);
});
