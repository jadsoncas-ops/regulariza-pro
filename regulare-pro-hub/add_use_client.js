const fs = require('fs');
const path = require('path');

function addUseClient(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addUseClient(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
        fs.writeFileSync(fullPath, '"use client";\n' + content);
      }
    }
  }
}

addUseClient('./src/components');
console.log('Added use client to all components.');
