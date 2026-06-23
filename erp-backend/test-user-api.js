const http = require('http');

const postData = JSON.stringify({
  firstName: "Test",
  lastName: "User",
  userName: "testuser1",
  email: "testuser1@test.com",
  password: "password123",
  companyId: 1,
  groupId: 1,
  status: "Active"
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/user/add-user',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
