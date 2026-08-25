import fs from 'fs';
import path from 'path';

function replaceInDir(dirPath) {
  const files = fs.readdirSync(dirPath, { recursive: true });
  for (const relFile of files) {
    const fullPath = path.join(dirPath, relFile);
    if (fs.statSync(fullPath).isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace hardcoded $ with R
      let updated = content
        .replace(/`\$\{symbol\}0`/g, '`R0`')
        .replace(/>\s*\$\s*\{/g, '>R {')
        .replace(/>\s*\$\s*([0-9])/g, '>R $1')
        .replace(/"\$"/g, '"R"')
        .replace(/'\$'/g, "'R'")
        .replace(/`\$`/g, '`R`')
        .replace(/`\$\{Number\(/g, '`R ${Number(')
        .replace(/>\s*\$/g, '>R');

      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated currency symbol in: ${fullPath}`);
      }
    }
  }
}

replaceInDir('C:/Users/Spark.DESKTOP-F75SGV0/Desktop/omni-admin/src');
replaceInDir('C:/Users/Spark.DESKTOP-F75SGV0/Desktop/omni/src');
