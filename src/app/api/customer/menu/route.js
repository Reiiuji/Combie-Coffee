import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const category = searchParams.get('cat') || '';

    // Query dasar: hanya ambil menu yang aktif
    let sql = "SELECT * FROM menu WHERE is_active = 1";
    let params = [];

    // Jika ada pencarian kata kunci
    if (searchTerm.trim() !== '') {
      sql += " AND (nama_menu LIKE ? OR deskripsi LIKE ?)";
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Jika ada filter kategori dan bukan 'All'
    if (category && category !== 'All' && category.trim() !== '') {
      sql += " AND kategori = ?";
      params.push(category.toLowerCase());
    }

    sql += " ORDER BY nama_menu ASC";
    
    const menus = await query(sql, params);
    
    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";