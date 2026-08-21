import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const imagePath = path.join(__dirname, 'test.jpg');
    fs.writeFileSync(imagePath, 'fake image content');

    const form = new FormData();
    form.append('brandName', 'Test Brand');
    form.append('brandCode', 'TB01');
    form.append('companyId', '1');
    form.append('manufacturerId', '1');
    form.append('status', 'Active');
    
    // Read file as Blob
    const buffer = fs.readFileSync(imagePath);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    form.append('brandImage', blob, 'test.jpg');

    console.log('Sending request...');
    const res = await fetch('http://localhost:4000/brand/add-brand', {
      method: 'POST',
      body: form,
    });
    const data = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
