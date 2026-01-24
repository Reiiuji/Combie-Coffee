import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Ini adalah id_pesanan

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "ID Pesanan diperlukan" 
      }, { status: 400 });
    }

    // --- PERBAIKAN DISINI ---
    // 1. Ubah tabel dari 'transaksi' ke 'pesanan'
    // 2. Sesuaikan nama kolom dengan database Anda (id_pesanan, total, waktu_pesan)
    // 3. Hapus 'nama_pelanggan' karena kolom itu tidak ada
    const sql = `
      SELECT 
        id_pesanan, 
        nomor_antrian, 
        total, 
        status_pesanan, 
        waktu_pesan 
      FROM pesanan 
      WHERE id_pesanan = ?
    `;
    
    const result = await query(sql, [id]);

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Pesanan tidak ditemukan" });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("API Status Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";