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
        
        // Insert sample products
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM SanPham)
            BEGIN
                INSERT INTO SanPham (ma_danh_muc, ten_san_pham, sku, gia_ban, so_luong_ton)
                VALUES 
                (1, N'JBL Flip 6', 'JBL-FL6-001', 2500000, 10),
                (1, N'JBL Charge 5', 'JBL-CH5-001', 3500000, 5),
                (2, N'JBL Live 660NC', 'JBL-L660-001', 4500000, 8),
                (3, N'JBL PartyBox 110', 'JBL-PB110-001', 9500000, 3)
            END
        `);

        const result = await pool.request().query("SELECT * FROM SanPham");
        console.log('Data in SanPham table:');
        console.log(result.recordset);
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testDB();
