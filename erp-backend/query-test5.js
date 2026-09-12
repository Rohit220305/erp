const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });
async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  const [rows] = await conn.execute(`
    SELECT * FROM material_request materialRequest
    LEFT JOIN users u ON u.id = materialRequest.requestedBy
    WHERE materialRequest.sysRecDeleted = 0
  `);
  console.log('Rows matched sysRecDeleted=0:', rows.length);
  
  const [rows2] = await conn.execute(`
    SELECT * FROM material_request materialRequest
    LEFT JOIN users u ON u.id = materialRequest.requestedBy
    WHERE materialRequest.sysRecDeleted = 0
    AND materialRequest.productionBatchId = 8
  `);
  console.log('Rows matched sysRecDeleted=0 AND pbId=8:', rows2.length);
  process.exit(0);
}
run();
