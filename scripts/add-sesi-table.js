require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_sesi_kelas (
        id_sesi SERIAL PRIMARY KEY,
        nidn TEXT NOT NULL REFERENCES tb_dosen(nidn),
        nama_mk TEXT NOT NULL,
        waktu_buka TIMESTAMP DEFAULT NOW(),
        waktu_tutup TIMESTAMP,
        status TEXT DEFAULT 'AKTIF',
        qr_token TEXT UNIQUE NOT NULL
      )
    `);
    console.log('✅ tb_sesi_kelas created');

    await client.query(`
      ALTER TABLE tb_presensi ADD COLUMN IF NOT EXISTS id_sesi INTEGER REFERENCES tb_sesi_kelas(id_sesi)
    `);
    console.log('✅ tb_presensi updated with id_sesi');

  } finally {
    client.release();
    pool.end();
  }
}
main().catch(e => { console.error('ERR:', e.message); pool.end(); });
