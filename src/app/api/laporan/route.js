import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ 
        success: false, 
        message: "Tanggal awal dan akhir diperlukan" 
      }, { status: 400 });
    }

    // --- PERBAIKAN QUERY SQL DISINI ---
    // Logika Baru: Transaksi -> Join Pesanan -> Join Detail Pesanan
    const sql = `
      SELECT 
        t.id_transaksi as id,
        t.waktu_bayar as tanggal,
        p.catatan_umum as nama_pelanggan,  -- Kita pakai catatan_umum (isi meja/nama) sebagai nama
        t.metode as metode_pembayaran,
        dp.nama_menu_snapshot as nama_menu,
        dp.qty,
        dp.harga_satuan,
        dp.subtotal_item as subtotal,
        t.jumlah_bayar as total_bayar
      FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
      WHERE t.status_bayar = 'lunas'
      AND DATE(t.waktu_bayar) BETWEEN ? AND ?
      ORDER BY t.waktu_bayar DESC
    `;

    const data = await query(sql, [start, end]);

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Laporan Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";