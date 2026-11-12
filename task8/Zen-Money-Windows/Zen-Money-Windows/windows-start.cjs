// Portable Windows entry point. No globally installed Node.js or npm needed.
const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const port = 3001;
const url = `http://localhost:${port}`;
process.chdir(__dirname);

function start() {
  // Preserve a recovery copy before json-server can change the database.
  if (!fs.existsSync('db.backup.json')) fs.copyFileSync('db.json', 'db.backup.json');
  console.log('Starting Zen Money... Keep this window open while using the app.');
  const server = spawn(process.execPath, [
    path.join(__dirname, 'node_modules/json-server/lib/cli/bin.js'),
    '--watch', 'db.json', '--port', String(port), '--static', '.', '--host', '127.0.0.1',
  ], { cwd: __dirname, stdio: 'inherit' });
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    const req = http.get(`http://127.0.0.1:${port}/transactions`, response => {
      response.resume();
      if (response.statusCode !== 200) return;
      clearInterval(timer);
      console.log(`Open ${url} in your browser. Close this window to stop.`);
      if (process.platform === 'win32') {
        const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], { stdio: 'ignore' });
        browser.on('error', () => console.log(`Please open ${url} manually.`));
      }
    });
    req.setTimeout(1000, () => req.destroy());
    req.on('error', () => {});
    if (attempts >= 40) {
      clearInterval(timer);
      console.error('Could not open the app. Please send a photo of this window to the sender.');
      server.kill();
    }
  }, 250);
  server.on('error', error => { clearInterval(timer); console.error(error.message); process.exitCode = 1; });
  server.on('exit', code => { clearInterval(timer); process.exitCode = code || 0; });
  process.on('SIGINT', () => { clearInterval(timer); server.kill(); });
}

// Do not start a second server or use a port occupied by another application.
const probe = net.createServer();
probe.once('error', () => {
  console.error('Port 3001 is already in use. Close the previous Zen Money window and try again.');
  process.exitCode = 1;
});
probe.listen(port, '127.0.0.1', () => probe.close(() => {
  try { start(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}));
