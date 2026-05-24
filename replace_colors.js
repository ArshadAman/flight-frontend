const fs = require('fs');
const path = require('path');

const targetColorsHex = [
  '#090001', '#0C2342', '#121121', '#30060F',
  '#377BD7', '#D60D26', '#F2FBFF', '#FFA8B3', '#FFFFFF'
];

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

const targetColorsRgb = targetColorsHex.map(hex => ({
  hex,
  rgb: hexToRgb(hex)
}));

function getClosestColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let closest = targetColorsHex[0];
  let minDistance = Infinity;
  for (const tc of targetColorsRgb) {
    const dist = Math.sqrt(
      Math.pow(rgb.r - tc.rgb.r, 2) +
      Math.pow(rgb.g - tc.rgb.g, 2) +
      Math.pow(rgb.b - tc.rgb.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = tc.hex;
    }
  }
  return closest;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const regex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
let changedFiles = 0;
let totalReplaced = 0;

walkDir('./', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
    if (filePath.includes('node_modules') || filePath.includes('.next')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(regex, (match) => {
        const closest = getClosestColor(match);
        if (match.toUpperCase() !== closest.toUpperCase()) {
            totalReplaced++;
        }
        return closest;
    });

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      changedFiles++;
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log(`Replaced ${totalReplaced} color instances across ${changedFiles} files.`);
