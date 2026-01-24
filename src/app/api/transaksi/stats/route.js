import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [stats] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM pesanan) as total_pesanan,
        (SELECT COUNT(DISTINCT catatan_umum) FROM pesanan) as total_customer,
        (SELECT COUNT(*) FROM transaksi WHERE status_bayar = 'lunas') as penjualan_selesai
    `);

    const data = {
      totalPenjualan: Number(stats.total_pesanan || 0),
      totalCustomer: Number(stats.total_customer || 0),
      penjualanSelesai: Number(stats.penjualan_selesai || 0)
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';