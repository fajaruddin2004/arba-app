const http = require('http');

const data = JSON.stringify({
  username: '2320557051', // based on previous screenshot
  password: 'password123', // dummy guess, or we can just fetch /api/auth/me directly if we know how to bypass
  role: 'MAHASISWA'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log("LOGIN RESPONSE:", body);
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      console.log("COOKIES:", cookies);
      // Fetch /api/auth/me
      const meOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Cookie': cookies[0]
        }
      };
      const meReq = http.request(meOptions, (meRes) => {
        let meBody = '';
        meRes.on('data', (chunk) => meBody += chunk);
        meRes.on('end', () => {
          console.log("ME RESPONSE:", meBody);
        });
      });
      meReq.end();
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
