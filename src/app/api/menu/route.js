import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// 1. Konfigurasi Cloudinary (Otomatis baca dari file .env yang baru kamu buat)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- GET: Ambil Data Menu (Tetap Sama) ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let queryStr = "SELECT * FROM menu WHERE is_active = 1";
    const params = [];
    if (id) {
      queryStr += " AND id_menu = ?";
      params.push(id);
    }
    queryStr += " ORDER BY id_menu DESC";
    const rows = await query(queryStr, params);
    return NextResponse.json({ success: true, data: id ? (rows[0] || null) : rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- DELETE: Hapus Menu (Tetap Sama) ---
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  
  try {
    await query('UPDATE menu SET is_active = 0 WHERE id_menu = ?', [id]);
    return NextResponse.json({ success: true, message: 'Menu dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- POST: Tambah Menu (INI YANG BARU) ---
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Ambil File Foto
    const file = formData.get('foto'); 
    let fotoUrl = ''; // Default kosong kalau gak ada foto
    
    // 2. Cek apakah ada file valid yang diupload
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 3. PROSES UPLOAD KE CLOUDINARY
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'combie-coffee-menu' }, // Nama folder di Cloudinary
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      // 4. Sukses! Ambil link gambarnya (https://res.cloudinary...)
      fotoUrl = uploadResult.secure_url;
    }
    
    // 5. Ambil data teks lainnya
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    const harga = parseFloat(formData.get('harga'));
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';
    
    // 6. Simpan Link Gambar (fotoUrl) ke Database TiDB
    const insertResult = await query(
      `INSERT INTO menu (nama_menu, kategori, deskripsi, harga, status_ketersediaan, foto_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nama_menu, kategori, deskripsi, harga, status_ketersediaan, fotoUrl]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu berhasil ditambahkan ke Cloudinary & Database!',
      data: { id: insertResult.insertId, foto_url: fotoUrl }
    });
    
  } catch (error) {
    console.error('Error upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}