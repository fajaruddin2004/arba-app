const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/absensi',
  method: 'GET'
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body.substring(0, 200)));
});
req.on('error', (err) => console.log('ERROR:', err.message));
req.end();
