const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function run() {
  try {
    // 1. Create a dummy image file
    const imagePath = path.join(__dirname, 'test.jpg');
    fs.writeFileSync(imagePath, 'fake image content');

    const form = new FormData();
    form.append('brandName', 'Test Brand');
    form.append('brandCode', 'TB01');
    form.append('companyId', '1');
    form.append('manufacturerId', '1');
    form.append('status', 'Active');
    form.append('brandImage', fs.createReadStream(imagePath), {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    });

    const headers = {
      ...form.getHeaders(),
      // We might need an auth token if the API is secured
      'Cookie': 'auth_token=...' 
    };

    console.log('Sending request...');
    const res = await axios.post('http://localhost:4000/brand/add-brand', form, { headers });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
run();
