import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Perbaikan: Ambil dari tabel PESANAN
    // Kita alias-kan id_pesanan jadi 'id' dan catatan_umum jadi 'nama_pelanggan' 
    // agar frontend tidak perlu banyak diubah.
    const sql = `
      SELECT 
        id_pesanan as id,
        nomor_antrian,
        catatan_umum as nama_pelanggan,
        total,
        status_pesanan,
        waktu_pesan
      FROM pesanan 
      ORDER BY waktu_pesan DESC
    `;
    const result = await query(sql);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}