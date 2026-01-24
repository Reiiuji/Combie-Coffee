import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Penting: Biar tidak di-cache browser

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 1. PERBAIKAN SQL: Tambahkan ', role' di dalam SELECT
    const rows = await query(
      "SELECT id_admin, username, nama, role FROM admin WHERE username = ? AND password_hash = ? LIMIT 1",
      [username, password]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 2. PERBAIKAN RESPONSE: Masukkan 'role' ke object user
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id_admin, 
        nama: user.nama,
        username: user.username,
        role: user.role // <--- INI WAJIB ADA supaya redirect berfungsi!
      } 
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}