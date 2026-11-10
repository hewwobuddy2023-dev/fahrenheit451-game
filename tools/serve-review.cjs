// Local review only. Serves one build directory, with no dependencies or deployment.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = fs.realpathSync(path.resolve(process.argv[2] || path.join(__dirname, '../dist')));
const port = Number(process.argv[3] || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Use a valid local port');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const server = http.createServer((req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.startsWith('/fahrenheit451-game/')) name = name.slice('/fahrenheit451-game'.length);
    if (name === '/') name = '/index.html';
    const file = fs.realpathSync(path.resolve(root, '.' + name));
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(404).end(); }
});
server.on('error', e => { console.error('Cannot start review server:', e.message); process.exitCode = 1; });
server.listen(port, '0.0.0.0', () => {
  console.log('PC: http://localhost:' + port + '/');
  let interfaces = {};
  try { interfaces = os.networkInterfaces(); } catch { console.log('LAN address unavailable; on Windows run ipconfig to find your IPv4 address.'); }
  for (const list of Object.values(interfaces)) for (const a of list || [])
    if (a.family === 'IPv4' && !a.internal) console.log('Phone on same trusted Wi-Fi: http://' + a.address + ':' + port + '/');
  console.log('Keep this window open. Ctrl+C stops. No public deployment.');
});
