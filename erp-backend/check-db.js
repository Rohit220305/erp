const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'erp_db',
  });

  const [rows] = await connection.execute('SELECT id, brandName, brandImage FROM brand_master ORDER BY id DESC LIMIT 5');
  console.log('Recent brands:', rows);

  for (const row of rows) {
    if (row.brandImage) {
      const p = `/var/www/html/training/erp/erp-backend/uploads/brand/${row.id}/${row.brandImage}`;
      const exists = fs.existsSync(p);
      console.log(`Image for ID ${row.id}: ${row.brandImage} - Exists on disk? ${exists}`);
    }
  }
  
  await connection.end();
}
run();
