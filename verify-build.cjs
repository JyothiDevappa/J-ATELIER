const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const output = execSync('npx tsc --noEmit', { 
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000
  });
  fs.writeFileSync(path.join(__dirname, 'tsc-output.txt'), 'TSC CHECK PASSED\n' + output);
} catch (err) {
  const result = 'TSC CHECK ERRORS:\n' + (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync(path.join(__dirname, 'tsc-output.txt'), result);
}

try {
  const output2 = execSync('npx vite build', { 
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000
  });
  fs.appendFileSync(path.join(__dirname, 'tsc-output.txt'), '\n\nVITE BUILD PASSED\n' + output2);
} catch (err) {
  const result = '\n\nVITE BUILD ERRORS:\n' + (err.stdout || '') + '\n' + (err.stderr || '');
  fs.appendFileSync(path.join(__dirname, 'tsc-output.txt'), result);
}
