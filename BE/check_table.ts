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
        
        const tables = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        
        console.log('Tables in database:', tables.recordset.map((r: any) => r.TABLE_NAME));
        
        for (const row of tables.recordset) {
            const columns = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${row.TABLE_NAME}'
            `);
            console.log(`Columns for table ${row.TABLE_NAME}:`, columns.recordset);
        }
        
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTable();
