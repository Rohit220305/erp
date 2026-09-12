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
  const [cols] = await conn.execute('SHOW COLUMNS FROM material_request;');
  console.log('Columns:', cols.map(c => c.Field));
  
  const [cols2] = await conn.execute('SHOW COLUMNS FROM user;');
  console.log('User Columns:', cols2.map(c => c.Field));
  
  const [rows] = await conn.execute(`
    SELECT * FROM material_request materialRequest
    LEFT JOIN user u ON u.id = materialRequest.requestedBy
    WHERE materialRequest.sysRecDeleted = 0
  `);
  console.log('Rows:', rows.length);
  process.exit(0);
}
run();
