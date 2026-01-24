import { query } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// --- GET: Ambil Data Menu ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let queryStr = "SELECT * FROM menu WHERE is_active = 1"; // Gunakan 1 untuk TRUE di MySQL
    const params = [];
    
    // Jika ada ID, ambil spesifik
    if (id) {
      queryStr += " AND id_menu = ?";
      params.push(id);
    }
    
    queryStr += " ORDER BY id_menu DESC"; // Urutkan dari yang terbaru
    
    const rows = await query(queryStr, params);
    
    // Sesuaikan format return agar cocok dengan Frontend (success: true)
    return NextResponse.json({ 
      success: true, 
      data: id ? (rows[0] || null) : rows 
    });

  } catch (error) {
    console.error("Menu fetch error", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// --- DELETE: Hapus Menu (Soft Delete) ---
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID menu tidak valid' },
      { status: 400 }
    );
  }
  
  try {
    // Soft delete: set is_active jadi 0 (False)
    // Data tidak hilang dari database, tapi tidak muncul di list
    await query(
      'UPDATE menu SET is_active = 0 WHERE id_menu = ?',
      [id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// --- POST: Tambah Menu Baru ---
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Handle Upload File Foto
    const file = formData.get('foto'); // Pastikan di form frontend namenya 'foto' bukan 'foto_url'
    let fotoUrl = '';
    
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Buat nama file unik
      const timestamp = Date.now();
      // Bersihkan nama file dari karakter aneh
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_"); 
      const filename = `menu_${timestamp}_${cleanName}`;
      
      // Simpan ke folder public/images
      const publicDir = path.join(process.cwd(), 'public', 'images');
      const filepath = path.join(publicDir, filename);
      
      await writeFile(filepath, buffer);
      fotoUrl = filename;
    }
    
    // 2. Ambil Data Form Lainnya
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    const harga = parseFloat(formData.get('harga'));
    // Konversi status checkbox/select ke enum database
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';
    
    // 3. Insert ke Database
    const insertResult = await query(
      `INSERT INTO menu (nama_menu, kategori, deskripsi, harga, status_ketersediaan, foto_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nama_menu, kategori, deskripsi, harga, status_ketersediaan, fotoUrl]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu berhasil ditambahkan',
      data: { id: insertResult.insertId }
    });
    
  } catch (error) {
    console.error('Error adding menu:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}