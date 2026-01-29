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
    // 1. Terima 'username' bukan 'email'
    const { username, password, role } = await request.json();

    // 2. Validasi
    if (!username || !password || !role) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap!" }, { status: 400 });
    }

    // 3. Insert ke DB
    // Kita isi kolom 'nama' dengan 'username' juga (sebagai display name default)
    const nama = username;
    
    await query(
      "INSERT INTO admin (nama, username, password_hash, role, status) VALUES (?, ?, ?, ?, 'aktif')",
      [nama, username, password, role]
    );

    return NextResponse.json({ success: true, message: "Data berhasil disimpan" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
