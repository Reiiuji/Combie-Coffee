import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Pastikan path ini sesuai dengan file koneksi db kamu
import fs from 'fs/promises';
import path from 'path';

// GET: Ambil 1 data menu berdasarkan ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    // Ambil data menu
    const menuData = await query('SELECT * FROM menu WHERE id_menu = ?', [id]);

    if (!menuData || menuData.length === 0) {
      return NextResponse.json({ success: false, message: 'Menu tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: menuData[0] });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT: Update data menu
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    // Ambil data dari form (termasuk gambar)
    const formData = await request.formData();
    
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi');
    const harga = formData.get('harga');
    const status_ketersediaan = formData.get('status_ketersediaan');
    const file = formData.get('foto'); // File gambar baru (objek File)
    const current_foto_url = formData.get('current_foto_url'); // Nama file lama (string)

    let fileName = current_foto_url;

    // Cek apakah user mengupload gambar baru?
    if (file && typeof file === 'object' && file.size > 0) {
      // 1. Hapus gambar lama jika ada dan bukan placeholder
      if (current_foto_url && current_foto_url !== 'placeholder.jpg') {
        const oldPath = path.join(process.cwd(), 'public/images', current_foto_url);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.log('Gagal hapus gambar lama (mungkin file sudah hilang):', err.message);
        }
      }

      // 2. Simpan gambar baru
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Buat nama file unik: menu-TIMESTAMP-NAMAASLI
      fileName = `menu-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const newPath = path.join(process.cwd(), 'public/images', fileName);
      
      await fs.writeFile(newPath, buffer);
    }

    // Update Database
    await query(
      `UPDATE menu 
       SET nama_menu = ?, kategori = ?, deskripsi = ?, 
           harga = ?, status_ketersediaan = ?, foto_url = ?
       WHERE id_menu = ?`,
      [nama_menu, kategori, deskripsi, harga, status_ketersediaan, fileName, id]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Menu berhasil diupdate' 
    });

  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal update data: ' + error.message },
      { status: 500 }
    );
  }
}