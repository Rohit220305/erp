const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.service.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('sysRecDeleted: 0')) {
      content = content.replace(/sysRecDeleted:\s*0/g, 'sysRecDeleted: false');
      changed = true;
    }
    if (content.includes('sysRecDeleted: 1')) {
      content = content.replace(/sysRecDeleted:\s*1/g, 'sysRecDeleted: true');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
