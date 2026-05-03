const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000
});

async function createTables() {
  const client = await pool.connect();
  try {
    // Create tables one by one
    const tables = [
      `CREATE TABLE IF NOT EXISTS tb_user (
        id_user SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_jurusan (
        id_jurusan SERIAL PRIMARY KEY,
        nama_jurusan TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_semester (
        id_semester SERIAL PRIMARY KEY,
        nama_semester TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_mahasiswa (
        nim TEXT PRIMARY KEY,
        id_user INTEGER UNIQUE NOT NULL REFERENCES tb_user(id_user) ON DELETE CASCADE,
        nama_mahasiswa TEXT NOT NULL,
        id_jurusan INTEGER REFERENCES tb_jurusan(id_jurusan),
        id_semester INTEGER REFERENCES tb_semester(id_semester)
      )`,
      `CREATE TABLE IF NOT EXISTS tb_dosen (
        nidn TEXT PRIMARY KEY,
        id_user INTEGER UNIQUE NOT NULL REFERENCES tb_user(id_user) ON DELETE CASCADE,
        nama_dosen TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_mata_kuliah (
        kode_mk TEXT PRIMARY KEY,
        nama_mk TEXT NOT NULL,
        sks INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_ruangan (
        kode_ruangan TEXT PRIMARY KEY,
        nama_ruangan TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_koordinat_kampus (
        id_koordinat SERIAL PRIMARY KEY,
        latitude_kampus TEXT NOT NULL,
        longitude_kampus TEXT NOT NULL,
        radius_meter INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_presensi (
        id_presensi SERIAL PRIMARY KEY,
        nim TEXT NOT NULL REFERENCES tb_mahasiswa(nim),
        nidn TEXT NOT NULL REFERENCES tb_dosen(nidn),
        waktu_absen TIMESTAMP DEFAULT NOW(),
        lat_mhs TEXT NOT NULL,
        long_mhs TEXT NOT NULL,
        status TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_kuesioner (
        id_kuesioner SERIAL PRIMARY KEY,
        pertanyaan TEXT NOT NULL,
        status_aktif TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tb_evaluasi (
        id_hasil SERIAL PRIMARY KEY,
        id_kuesioner INTEGER NOT NULL REFERENCES tb_kuesioner(id_kuesioner),
        nim TEXT NOT NULL REFERENCES tb_mahasiswa(nim),
        nidn TEXT NOT NULL REFERENCES tb_dosen(nidn),
        skor_nilai INTEGER NOT NULL
      )`
    ];

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i].match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      try {
        await client.query(tables[i]);
        console.log(`✅ Table ${tableName} - OK`);
      } catch (e) {
        console.log(`❌ Table ${tableName} - ERROR: ${e.message}`);
      }
    }

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in database:');
    result.rows.forEach(r => console.log(`   - ${r.table_name}`));

  } finally {
    client.release();
    pool.end();
  }
}

createTables().catch(e => {
  console.error('Fatal error:', e);
  pool.end();
});
