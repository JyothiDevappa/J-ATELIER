const { execSync } = require('child_process');
try {
  const output = execSync('npm run build', { 
    cwd: 'c:\\xampp\\htdocs\\jatelier-store',
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000
  });
  console.log('BUILD OUTPUT:');
  console.log(output);
} catch (err) {
  console.log('BUILD ERROR:');
  console.log(err.stdout || '');
  console.log(err.stderr || '');
  console.log(err.message);
}
