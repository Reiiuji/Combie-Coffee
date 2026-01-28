import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET: Ambil Semua Data Admin
export async function GET() {
  try {
    const data = await query("SELECT * FROM admin ORDER BY id_admin ASC");
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Tambah Admin Baru
export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    // Validasi sederhana
    if (!email || !password || !role) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap!" }, { status: 400 });
    }

    // Insert ke DB
    // Note: Nama diambil dari bagian depan email (misal: admin@gmail -> admin)
    const nama = email.split('@')[0];
    
    await query(
      "INSERT INTO admin (nama, username, password_hash, role, status) VALUES (?, ?, ?, ?, 'aktif')",
      [nama, email, password, role]
    );

    return NextResponse.json({ success: true, message: "Data berhasil disimpan" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}