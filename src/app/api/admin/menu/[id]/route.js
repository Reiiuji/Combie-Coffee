import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// DELETE: Hapus Admin
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query("DELETE FROM admin WHERE id_admin = ?", [id]);
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Update Admin
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { email, password, role } = await request.json();

    // Jika password diisi, update password juga. Jika kosong, update info lain saja.
    if (password) {
      await query(
        "UPDATE admin SET username = ?, password_hash = ?, role = ? WHERE id_admin = ?",
        [email, password, role, id]
      );
    } else {
      await query(
        "UPDATE admin SET username = ?, role = ? WHERE id_admin = ?",
        [email, role, id]
      );
    }

    return NextResponse.json({ success: true, message: "Data berhasil diupdate" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}