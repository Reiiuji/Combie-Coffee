import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET Detail Transaksi
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [pesanan] = await query(
      `SELECT id_pesanan as id, nomor_antrian, catatan_umum, total as total_bayar, 0 as pajak, status_pesanan, waktu_pesan as tanggal_transaksi, metode_pembayaran
       FROM pesanan WHERE id_pesanan = ?`, [id]
    );

    if (!pesanan) return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });

    const details = await query(
      `SELECT dp.id_detail as id, dp.nama_menu_snapshot as nama_menu, dp.qty as jumlah, dp.harga_satuan, dp.catatan_item, m.foto_url
       FROM detail_pesanan dp LEFT JOIN menu m ON dp.id_menu = m.id_menu WHERE dp.id_pesanan = ?`, [id]
    );

    return NextResponse.json({
      success: true,
      data: { ...pesanan, items: details.map(d => ({ ...d, harga_satuan: parseFloat(d.harga_satuan), catatan_item: d.catatan_item || '' })) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT Update Status & Pembayaran
export async function PUT(request, { params }) {
  try {
    const { id } = params; 
    const { status_pesanan, metode_pembayaran } = await request.json();

    // 1. Logika Update Status Bertahap vs Selesai
    if (status_pesanan === 'selesai') {
        // Update status ke selesai dan simpan metode bayar
        await query(
          'UPDATE pesanan SET status_pesanan = ?, metode_pembayaran = ?, waktu_selesai = NOW() WHERE id_pesanan = ?',
          [status_pesanan, metode_pembayaran || 'tunai', id]
        );

        // Catat ke tabel transaksi jika belum ada
        const [dataPesanan] = await query("SELECT total FROM pesanan WHERE id_pesanan = ?", [id]);
        await query(
          `INSERT INTO transaksi (id_pesanan, id_admin_kasir, status_bayar, metode, jumlah_bayar, waktu_bayar) 
           VALUES (?, 1, 'lunas', ?, ?, NOW())`, 
          [id, metode_pembayaran || 'tunai', dataPesanan?.total || 0]
        );
    } else {
        // Update status intermediate (menunggu/diproses/siap)
        await query(
          'UPDATE pesanan SET status_pesanan = ? WHERE id_pesanan = ?',
          [status_pesanan, id]
        );
    }

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui' });
  } catch (error) {
    console.error('Error update:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}