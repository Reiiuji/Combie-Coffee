import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { passwordLama, passwordBaru } = await request.json();

    // 1. Cek User (Gunakan tabel 'admin' dan kolom 'id_admin')
    // Kita asumsikan yang login adalah ID 1 (Budi Owner). 
    // Nanti jika sudah ada sesi login, angka 1 ini diganti dengan ID dari sesi.
    const [user] = await query("SELECT * FROM admin WHERE id_admin = 1");

    if (!user) {
      return NextResponse.json({ success: false, message: "User Admin tidak ditemukan" }, { status: 404 });
    }

    // 2. Cek Password Lama (Gunakan kolom 'password_hash')
    if (user.password_hash !== passwordLama) {
      return NextResponse.json({ success: false, message: "Password lama salah!" }, { status: 400 });
    }

    // 3. Update Password Baru (Update kolom 'password_hash')
    await query("UPDATE admin SET password_hash = ? WHERE id_admin = 1", [passwordBaru]);

    return NextResponse.json({ success: true, message: "Password berhasil diganti!" });

  } catch (error) {
    console.error("Error ganti password:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}