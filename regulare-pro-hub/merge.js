const fs = require('fs');
const oldPkg = JSON.parse(fs.readFileSync('../package.json', 'utf8'));
const newPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
newPkg.dependencies = { ...newPkg.dependencies, ...oldPkg.dependencies };
delete newPkg.dependencies['react'];
delete newPkg.dependencies['react-dom'];
newPkg.scripts.seed = "tsx prisma/seed.ts";
fs.writeFileSync('./package.json', JSON.stringify(newPkg, null, 2));
console.log('Merged dependencies and added seed script');
