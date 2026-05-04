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

async function checkData() {
    try {
        let pool = await sql.connect(config as any);
        console.log('Connected to DB');
        
        const phieuGiao = await pool.request().query(`SELECT * FROM PhieuGiaoHang`);
        console.log('PhieuGiaoHang data:', phieuGiao.recordset);
        
        const donHang = await pool.request().query(`SELECT ma_don_hang FROM DonHang`);
        console.log('DonHang IDs:', donHang.recordset.map((r: any) => r.ma_don_hang));
        
        const doiTac = await pool.request().query(`SELECT ma_doi_tac, ten_doi_tac, loai_doi_tac FROM DoiTac`);
        console.log('DoiTac data:', doiTac.recordset);
        
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
