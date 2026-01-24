import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',      
  password: '',      
  database: 'db_combie_coffee',
};

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    
    const { 
      nomor_meja = '', 
      total_harga = 0, 
      items = [] 
    } = body;

    // Buat koneksi manual agar bisa melakukan Transaction
    connection = await mysql.createConnection(dbConfig);
    
    // MULAI TRANSAKSI
    await connection.beginTransaction();

    // --- PERBAIKAN LOGIKA ANTRIAN (ANTI DUPLIKAT) ---
    // 1. Ambil nomor antrian TERAKHIR hari ini.
    // 2. Gunakan 'FOR UPDATE' untuk mengunci baris ini sementara sampai proses insert selesai.
    //    Ini mencegah dua orang mendapatkan nomor terakhir yang sama di waktu bersamaan.
    const [rows] = await connection.execute(
      `SELECT nomor_antrian 
       FROM pesanan 
       WHERE DATE(waktu_pesan) = CURDATE() 
       ORDER BY id_pesanan DESC 
       LIMIT 1 
       FOR UPDATE`
    );

    let nextNumber = 1; // Default jika belum ada pesanan hari ini

    if (rows.length > 0) {
      // Format Database: "A-001", "A-015", dst.
      // Kita ambil bagian angkanya saja setelah strip "-"
      const lastAntrian = rows[0].nomor_antrian; // Contoh: "A-005"
      const lastNumberStr = lastAntrian.split('-')[1]; // Ambil "005"
      const lastNumberInt = parseInt(lastNumberStr, 10); // Ubah jadi angka 5
      
      nextNumber = lastNumberInt + 1; // Jadi 6
    }

    // Format ulang menjadi "A-006"
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

    // KOMIT TRANSAKSI (Simpan Permanen)
    // Di titik ini, lock 'FOR UPDATE' dilepas, dan orang berikutnya baru bisa ambil nomor.
    await connection.commit();

    return NextResponse.json({ 
      success: true, 
      id_pesanan: id_pesanan_baru,
      nomor_antrian: nomor_antrian,
      message: 'Pesanan berhasil dibuat!' 
    });

  } catch (error) {
    // Jika error, batalkan semua perubahan
    if (connection) await connection.rollback();
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal memproses pesanan: ' + error.message 
    }, { status: 500 });
  } finally {
    // Tutup koneksi
    if (connection) await connection.end();
  }
}