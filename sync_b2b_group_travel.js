const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'app/group-travel');
const destDir = path.join(__dirname, 'app/b2b/group-travel');

function processFile(srcPath, destPath) {
    let content = fs.readFileSync(srcPath, 'utf8');

    // Replace Navbar with B2BNavbar
    content = content.replace(/import\s+\{\s*Navbar\s*\}\s+from\s+["']@\/components\/Navbar["'];/g, 'import { B2BNavbar } from "@/components/B2BNavbar";');
    
    // Oh wait, is B2BNavbar exported as default or named?
    // Let's assume named, wait, B2BNavbar is export default function B2BNavbar?
    // Let me check what I replaced it with in my head.
    
    content = content.replace(/<Navbar \/>/g, '<B2BNavbar />');

    // Fix links
    content = content.replace(/\/group-travel/g, '/b2b/group-travel');
    // careful: this might change /b2b/group-travel to /b2b/b2b/group-travel if already there, but since we are copying from pure /group-travel, they shouldn't exist.
    
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content, 'utf8');
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.tsx')) {
        const relPath = path.relative(srcDir, filePath);
        const destPath = path.join(destDir, relPath);
        processFile(filePath, destPath);
        console.log(`Processed ${relPath}`);
    }
});
