// Script to merge all the types files into bundle.d.ts
// bundle.d.ts can be added into Monaco/react editor, until Monaco supports
// importing multiple files.

const fs = require('fs')

const indexFile = fs.readFileSync('index.d.ts', 'utf8');
// remove all import statements from index.d.ts
const indexFileNoImports = indexFile.replace(/import .*?;/gs, '');
const typesFile = fs.readFileSync('types.d.ts', 'utf8');

fs.writeFileSync('bundle.d.ts', typesFile + '\n' + indexFileNoImports.trim());
