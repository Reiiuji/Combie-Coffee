import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ambil pesanan yang statusnya MENUNGGU, DIPROSES, atau SIAP
    const results = await query(`
      SELECT 
        p.id_pesanan as id,
        p.nomor_antrian,
        p.catatan_umum,       /* PENTING: Jangan di-alias ke nama_pelanggan agar parsing meja di frontend jalan */
        p.status_pesanan,
        p.waktu_pesan as tanggal_transaksi,
        p.total,              /* Tambahan: Total harga pesanan */
        dp.id_detail as detail_id,
        dp.nama_menu_snapshot as nama_menu,
        dp.qty as jumlah,
        dp.catatan_item,
        m.foto_url
      FROM pesanan p
      LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
      LEFT JOIN menu m ON dp.id_menu = m.id_menu
      WHERE p.status_pesanan IN ('menunggu', 'diproses', 'siap')
      ORDER BY p.waktu_pesan ASC
    `);

    // Grouping data (karena hasil join membuat baris header berulang)
    const transactions = {};
    
    results.forEach(row => {
      // Jika pesanan ini belum ada di object transactions, buat entry baru
      if (!transactions[row.id]) {
        transactions[row.id] = {
          id: row.id,
          nomor_antrian: row.nomor_antrian,
          catatan_umum: row.catatan_umum, // Berisi "Meja No: 12" atau "Take Away"
          status_pesanan: row.status_pesanan,
          tanggal_transaksi: row.tanggal_transaksi,
          total: row.total,
          items: []
        };
      }
      
      // Masukkan item detail ke dalam array items
      if (row.detail_id) {
        transactions[row.id].items.push({
          id: row.detail_id,
          nama_menu: row.nama_menu,
          jumlah: row.jumlah,
          catatan: row.catatan_item, // Catatan per item (less sugar, dll)
          foto_url: row.foto_url
        });
      }
    });

    // Ubah object transactions kembali menjadi array
    return NextResponse.json({ success: true, data: Object.values(transactions) });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}