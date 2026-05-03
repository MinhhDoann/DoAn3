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
        await pool.request().query(`
            UPDATE DanhMuc SET ten_danh_muc = N'Loa Bluetooth', mo_ta = N'Loa di động, chống nước' WHERE ma_danh_muc = 1;
            UPDATE DanhMuc SET ten_danh_muc = N'Tai nghe', mo_ta = N'Tai nghe không dây, chống ồn' WHERE ma_danh_muc = 2;
            UPDATE DanhMuc SET ten_danh_muc = N'Loa Karaoke', mo_ta = N'Loa công suất lớn' WHERE ma_danh_muc = 3;
            UPDATE DanhMuc SET ten_danh_muc = N'Phụ kiện', mo_ta = N'Cáp sạc, bao da' WHERE ma_danh_muc = 4;
            UPDATE DanhMuc SET ten_danh_muc = N'Micro', mo_ta = N'Micro thu âm' WHERE ma_danh_muc = 5;
        `);
        const result = await pool.request().query("SELECT * FROM DanhMuc");
        console.log('Updated Data in DanhMuc table:');
        console.log(result.recordset);
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testDB();
