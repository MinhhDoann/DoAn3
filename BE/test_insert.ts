import sql from 'mssql';

const config = {
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

async function testInsert() {
    try {
        let pool = await sql.connect(config as any);
        console.log('Connected to DB');
        
        const ma_don_hang = 1;
        const ma_shipper = 10;
        const trang_thai_giao = 'DANG_VAN_CHUYEN';
        
        const insertResult = await pool.request()
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_shipper', sql.Int, ma_shipper)
            .input('trang_thai_giao', sql.NVarChar(50), trang_thai_giao)
            .query(`
                INSERT INTO PhieuGiaoHang (ma_don_hang, ma_shipper, trang_thai_giao)
                OUTPUT INSERTED.ma_phieu_giao
                VALUES (@ma_don_hang, @ma_shipper, @trang_thai_giao)
            `);
            
        console.log('Insert success:', insertResult.recordset);
        await pool.close();
    } catch (err) {
        console.error('Insert failed:', err);
    }
}

testInsert();
