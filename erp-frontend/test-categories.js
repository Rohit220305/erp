const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/item-category/list-item-category', // wait, the frontend uses what URL?
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
    console.log(data);
  });
});

req.write(JSON.stringify({ page: 1, limit: 1 }));
req.end();
