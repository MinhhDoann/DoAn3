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

async function checkTable() {
    try {
        let pool = await sql.connect(config as any);
        console.log('Connected to DB');
        
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'PhieuGiaoHang'
        `);
        
        console.log('Table exists:', result.recordset.length > 0);
        
        if (result.recordset.length > 0) {
            const columns = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'PhieuGiaoHang'
            `);
            console.log('Columns:', columns.recordset);
        }
        
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTable();
