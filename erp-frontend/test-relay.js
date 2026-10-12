const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/relay/item-category/list-item-category',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("RESPONSE:", data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ page: 1, limit: 2 }));
req.end();
