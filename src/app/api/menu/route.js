import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// 1. Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- GET: Ambil Data Menu ---
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

// --- DELETE: Hapus Menu ---
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

// --- POST: Tambah Menu Baru ---
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Ambil File Foto
    const file = formData.get('foto'); 
    let fotoUrl = ''; 
    
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'combie-coffee-menu' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      fotoUrl = uploadResult.secure_url;
    }
    
    // 2. Ambil Data Lainnya
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    const harga = parseFloat(formData.get('harga'));
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';
    
    // 3. Simpan ke Database
    const insertResult = await query(
      `INSERT INTO menu (nama_menu, kategori, deskripsi, harga, status_ketersediaan, foto_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nama_menu, kategori, deskripsi, harga, status_ketersediaan, fotoUrl]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu berhasil ditambahkan',
      data: { id: insertResult.insertId, foto_url: fotoUrl }
    });
    
  } catch (error) {
    console.error('Error upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- PUT: Update Menu (INI YANG SEBELUMNYA HILANG) ---
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Cek ID wajib ada
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID menu wajib ada' }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    // 1. Ambil Data Teks
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    const harga = parseFloat(formData.get('harga'));
    
    // Status (convert 'on'/'ready' jadi 'ready')
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';

    // 2. Cek Apakah Ada Foto Baru?
    const file = formData.get('foto');
    let newFotoUrl = null;

    if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload ke Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'combie-coffee-menu' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });
        
        newFotoUrl = uploadResult.secure_url;
    }

    // 3. Update ke Database
    if (newFotoUrl) {
        // A. Kalo GANTI FOTO -> Update kolom foto_url juga
        await query(
            `UPDATE menu SET nama_menu=?, kategori=?, deskripsi=?, harga=?, status_ketersediaan=?, foto_url=? WHERE id_menu=?`,
            [nama_menu, kategori, deskripsi, harga, status_ketersediaan, newFotoUrl, id]
        );
    } else {
        // B. Kalo GAK GANTI FOTO -> Jangan sentuh kolom foto_url
        await query(
            `UPDATE menu SET nama_menu=?, kategori=?, deskripsi=?, harga=?, status_ketersediaan=? WHERE id_menu=?`,
            [nama_menu, kategori, deskripsi, harga, status_ketersediaan, id]
        );
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Menu berhasil diupdate' 
    });

  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}