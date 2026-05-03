import { connectDB } from './config/db';
import sql from 'mssql';

const config: sql.config = {
  server: 'DESKTOP-IDO3K8B',
  port: 1433,
  database: 'JBL_Store',
  authentication: {
    type: 'ntlm',
    options: {
      domain: 'DESKTOP-IDO3K8B',
      userName: 'Lenovo',
      password: '160820',
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function testDB() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM DoiTac");
    console.log('Data in DoiTac table:');
    console.log(result.recordset);
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testDB();
