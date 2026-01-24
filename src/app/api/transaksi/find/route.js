import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nomor = searchParams.get('nomor') || '';

    // Cari di tabel PESANAN
    const results = await query(
      'SELECT id_pesanan as id FROM pesanan WHERE nomor_antrian LIKE ? AND status_pesanan != ?',
      [`%${nomor}%`, 'selesai'] // Cari yang belum selesai saja
    );

    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: results[0].id } });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';