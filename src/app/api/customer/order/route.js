import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    
    const { 
      nomor_meja = '', 
      total_harga = 0, 
      items = [] 
    } = body;

    // --- PERBAIKAN: GUNAKAN PROCESS.ENV & TAMBAH SSL ---
    // Jangan hardcode localhost lagi. Kita ambil settingan dari Vercel.
    const dbConfig = {
      host: process.env.DB_HOST,       // Ambil dari Vercel
      user: process.env.DB_USER,       // Ambil dari Vercel
      password: process.env.DB_PASSWORD, // Ambil dari Vercel
      database: process.env.DB_NAME,   // Ambil dari Vercel
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Otomatis 4000 di Vercel
      // WAJIB: Settingan SSL untuk TiDB Cloud
      ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true
      }
    };

    // Buat koneksi baru pakai config di atas
    connection = await mysql.createConnection(dbConfig);
    
    // MULAI TRANSAKSI
    await connection.beginTransaction();

    // --- LOGIKA ANTRIAN (SAMA SEPERTI SEBELUMNYA) ---
    const [rows] = await connection.execute(
      `SELECT nomor_antrian 
       FROM pesanan 
       WHERE DATE(waktu_pesan) = CURDATE() 
       ORDER BY id_pesanan DESC 
       LIMIT 1 
       FOR UPDATE`
    );

    let nextNumber = 1; 

    if (rows.length > 0) {
      const lastAntrian = rows[0].nomor_antrian; 
      const lastNumberStr = lastAntrian.split('-')[1]; 
      const lastNumberInt = parseInt(lastNumberStr, 10); 
      
      nextNumber = lastNumberInt + 1; 
    }

    const nomor_antrian = `A-${String(nextNumber).padStart(3, '0')}`;
    // ------------------------------------------------

    // 2. INSERT HEADER PESANAN
    const catatan_umum = nomor_meja ? `Meja No: ${nomor_meja}` : 'Take Away';
    const harga_fix = Number(total_harga) || 0;

    const [resultHeader] = await connection.execute(
      `INSERT INTO pesanan 
       (nomor_antrian, status_pesanan, metode_pembayaran, subtotal, total, catatan_umum, waktu_pesan) 
       VALUES (?, 'menunggu', 'belum_bayar', ?, ?, ?, NOW())`,
      [nomor_antrian, harga_fix, harga_fix, catatan_umum]
    );

    const id_pesanan_baru = resultHeader.insertId; 

    // 3. INSERT DETAIL PESANAN
    for (const item of items) {
      const catatan_detail = item.note || ''; 
      const qty = Number(item.qty) || 1;
      const harga = Number(item.harga) || 0;
      const subtotal_item = qty * harga;

      await connection.execute(
        `INSERT INTO detail_pesanan 
          (id_pesanan, id_menu, nama_menu_snapshot, qty, catatan_item, harga_satuan, subtotal_item) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id_pesanan_baru, 
          item.id_menu, 
          item.nama_menu || 'Unknown',     
          qty, 
          catatan_detail,
          harga, 
          subtotal_item
        ]
      );
    }

    // KOMIT TRANSAKSI
    await connection.commit();

    return NextResponse.json({ 
      success: true, 
      id_pesanan: id_pesanan_baru,
      nomor_antrian: nomor_antrian,
      message: 'Pesanan berhasil dibuat!' 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal memproses pesanan: ' + error.message 
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}