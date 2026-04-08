const fs = require('fs');
const logPath = 'C:\\Users\\larva\\.gemini\\antigravity\\brain\\ba48468e-06bf-4a41-997a-252a56e5b10d\\.system_generated\\logs\\overview.txt';
if (!fs.existsSync(logPath)) {
  console.log("Log not found.");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// The marker is "[diff_block_start]"
const startIndex = content.lastIndexOf('[diff_block_start]');
const endIndex = content.lastIndexOf('[diff_block_end]');

if (startIndex === -1 || endIndex === -1) {
  console.log("Diff markers not found.");
  process.exit(1);
}

const diffText = content.substring(startIndex, endIndex);
const lines = diffText.split('\n');

const oldLines = [];
let capture = false;

for (const line of lines) {
  if (line.startsWith('@@ ')) {
    capture = true;
    continue;
  }
  if (!capture) continue;
  
  if (line.startsWith('-')) {
    oldLines.push(line.substring(1));
  } else if (line.startsWith(' ')) {
    oldLines.push(line.substring(1));
  } else if (line === '-') {
    oldLines.push('');
  } else if (line === ' ') {
    oldLines.push('');
  }
}

fs.writeFileSync('d:\\1-Personal-Programming\\MPPVS\\apps\\web\\src\\app\\dashboard\\superadmin\\page-backup.tsx', oldLines.join('\n'));
console.log("Backup extracted to page-backup.tsx successfully!");
