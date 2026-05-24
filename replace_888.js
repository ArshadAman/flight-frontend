const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const regex = /#377BD7/gi;
let changedFiles = 0;
let totalReplaced = 0;

walkDir('./', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
    if (filePath.includes('node_modules') || filePath.includes('.next')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let matchCount = (content.match(regex) || []).length;
    
    if (matchCount > 0) {
        let newContent = content.replace(regex, '#888');
        fs.writeFileSync(filePath, newContent);
        changedFiles++;
        totalReplaced += matchCount;
        console.log(`Updated ${filePath} (${matchCount} replacements)`);
    }
  }
});

console.log(`Replaced ${totalReplaced} color instances across ${changedFiles} files.`);
