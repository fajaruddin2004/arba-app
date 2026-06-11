const http = require('http');

async function testPort(port) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ username: 'admin', password: 'password', role: 'ADMIN' });
    const req = http.request({
      hostname: 'localhost',
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ port, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ port, error: err.message }));
    req.write(data);
    req.end();
  });
}

async function run() {
  for (let port of [3000, 3001, 3002, 3003]) {
    const result = await testPort(port);
    console.log(`Port ${port}:`, result.status || result.error, result.body ? result.body.substring(0, 50) : '');
  }
}

run();
