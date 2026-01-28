import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic'; 

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET
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

// POST
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('foto'); 
    let fotoUrl = ''; 
    
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'combie-coffee-menu' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        uploadStream.end(buffer);
      });
      fotoUrl = uploadResult.secure_url;
    }
    
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    const harga = parseFloat(formData.get('harga'));
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';
    
    const insertResult = await query(
      `INSERT INTO menu (nama_menu, kategori, deskripsi, harga, status_ketersediaan, foto_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nama_menu, kategori, deskripsi, harga, status_ketersediaan, fotoUrl]
    );
    return NextResponse.json({ success: true, message: 'Menu berhasil ditambahkan', data: { id: insertResult.insertId, foto_url: fotoUrl } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (UPDATE)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // INI KUNCINYA: Pakai formData(), JANGAN json()
    const formData = await request.formData(); 
    
    const nama_menu = formData.get('nama_menu');
    const kategori = formData.get('kategori');
    const deskripsi = formData.get('deskripsi') || '';
    let harga = parseFloat(formData.get('harga'));
    if (isNaN(harga)) harga = 0;
    const status_input = formData.get('status_ketersediaan');
    const status_ketersediaan = (status_input === 'on' || status_input === 'ready') ? 'ready' : 'habis';

    const file = formData.get('foto');
    let newFotoUrl = null;

    if (file && typeof file !== 'string' && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'combie-coffee-menu' },
                (error, result) => { if (error) reject(error); else resolve(result); }
            );
            uploadStream.end(buffer);
        });
        newFotoUrl = uploadResult.secure_url;
    }

    if (newFotoUrl) {
        await query(
            `UPDATE menu SET nama_menu=?, kategori=?, deskripsi=?, harga=?, status_ketersediaan=?, foto_url=? WHERE id_menu=?`,
            [nama_menu, kategori, deskripsi, harga, status_ketersediaan, newFotoUrl, id]
        );
    } else {
        await query(
            `UPDATE menu SET nama_menu=?, kategori=?, deskripsi=?, harga=?, status_ketersediaan=? WHERE id_menu=?`,
            [nama_menu, kategori, deskripsi, harga, status_ketersediaan, id]
        );
    }

    return NextResponse.json({ success: true, message: 'Menu berhasil diupdate' });

  } catch (error) {
    console.error("DEBUG SERVER ERROR:", error);
    return NextResponse.json({ success: false, message: "SERVER ERROR: " + error.message }, { status: 200 });
  }
}

// DELETE
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