'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Kita pakai <img> biasa, jadi tidak perlu import Image dari next/image
import { FiChevronLeft, FiEdit2, FiUpload } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State Data Form
  const [formData, setFormData] = useState({
    nama_menu: '',
    kategori: 'coffee',
    deskripsi: '',
    harga: '',
    status_ketersediaan: 'ready',
    current_foto_url: '', // Simpan url foto lama dari database
  });

  // State Gambar (Preview saat upload baru)
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Fetch Data Menu Lama saat halaman dibuka
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`/api/menu?id=${id}`); 
        const json = await res.json();
        
        // Cek apakah data ada di dalam array atau object langsung
        const dataMenu = Array.isArray(json.data) ? json.data[0] : json.data;

        if (json.success && dataMenu) {
          setFormData({
            nama_menu: dataMenu.nama_menu,
            kategori: dataMenu.kategori,
            deskripsi: dataMenu.deskripsi || '',
            harga: dataMenu.harga,
            status_ketersediaan: dataMenu.status_ketersediaan,
            current_foto_url: dataMenu.foto_url
          });
        } else {
          Swal.fire('Error', 'Menu tidak ditemukan', 'error');
          router.push('/admin/menu');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal mengambil data menu', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
        fetchMenu();
    }
  }, [id, router]);

  // 2. Handle Perubahan Input Teks
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Handle Upload Gambar Baru (Preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Buat preview lokal
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  // 4. Handle Ganti Status (Tersedia / Habis)
  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status_ketersediaan: prev.status_ketersediaan === 'ready' ? 'habis' : 'ready'
    }));
  };

  // 5. Submit Data ke Server (Update)
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const dataToSend = new FormData();
      
      // Masukkan semua data teks ke FormData
      dataToSend.append('nama_menu', formData.nama_menu);
      dataToSend.append('kategori', formData.kategori);
      dataToSend.append('deskripsi', formData.deskripsi);
      dataToSend.append('harga', formData.harga);
      dataToSend.append('status_ketersediaan', formData.status_ketersediaan);
      
      // Masukkan file gambar HANYA jika user upload gambar baru
      if (newImageFile) {
        dataToSend.append('foto', newImageFile);
      }

      // Kirim ke API (Method PUT untuk update)
      // Pastikan API kamu di route.js menangani method PUT
      const res = await fetch(`/api/admin/menu?id=${id}`, { 
        method: 'PUT', // Atau 'POST' jika API kamu pakai POST untuk update
        body: dataToSend 
      });
      
      const json = await res.json();

      if (json.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data menu berhasil diperbarui',
          confirmButtonColor: '#5C6BC0'
        });
        router.push('/admin/menu'); // Kembali ke halaman list
        router.refresh(); // Refresh agar data terbaru muncul
      } else {
        throw new Error(json.error || json.message || 'Gagal update');
      }
    } catch (error) {
      Swal.fire('Gagal', error.message || 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat data...</div>;

  // --- LOGIKA CERDAS UNTUK GAMBAR ---
  // Urutan Prioritas:
  // 1. Preview Image (Jika user baru upload file)
  // 2. Cloudinary URL (Jika data lama ada 'http')
  // 3. Local Folder (Jika data lama cuma nama file)
  // 4. Placeholder (Jika kosong/error)
  
  let imageSource = '/images/placeholder.jpg';
  
  if (previewImage) {
    imageSource = previewImage;
  } else if (formData.current_foto_url) {
    if (formData.current_foto_url.startsWith('http')) {
      imageSource = formData.current_foto_url;
    } else {
      imageSource = `/images/${formData.current_foto_url}`;
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-10">
      
      {/* HEADER ORANGE */}
      <header className="bg-[#F0AD6D] px-8 py-5 text-white shadow-sm flex justify-between items-center mb-6">
        <div /> 
        <div className="text-sm font-bold tracking-wide">Halo, Admin</div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* JUDUL */}
        <div className="bg-white px-6 py-4 rounded-t-lg shadow-sm border-b border-gray-100 mb-6">
           <h1 className="text-xl font-bold text-gray-800">Edit Menu</h1>
        </div>

        {/* CONTAINER FORM */}
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col lg:flex-row gap-10 border border-gray-200">
          
          {/* --- BAGIAN KIRI: UPLOAD GAMBAR --- */}
          <div className="lg:w-1/3 flex flex-col items-center">
             <div 
               className="relative w-full aspect-square bg-white rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 group cursor-pointer"
               onClick={triggerFileInput}
             >
                {/* Menggunakan <img> biasa agar support link luar (Cloudinary) tanpa config */}
                <img 
                  src={imageSource}
                  alt="Menu Preview"
                  className="w-full h-full object-contain p-4 group-hover:opacity-80 transition-opacity"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                />
                
                {/* Efek Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                    <FiUpload className="text-gray-700 text-3xl" />
                </div>
             </div>
             <p className="text-xs text-gray-400 mt-3 text-center">Klik gambar untuk mengganti foto</p>
             <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          {/* --- BAGIAN KANAN: INPUT DATA --- */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Nama Menu */}
            <div className="grid grid-cols-3 items-center border-b border-gray-200 pb-2">
                <label className="text-sm font-bold text-gray-700">Nama Menu</label>
                <div className="col-span-2">
                    <input 
                      type="text" 
                      name="nama_menu"
                      value={formData.nama_menu}
                      onChange={handleChange}
                      className="w-full text-gray-800 font-bold bg-transparent outline-none focus:bg-gray-50 px-2 py-1 rounded"
                    />
                </div>
            </div>

            {/* Kategori */}
            <div className="grid grid-cols-3 items-center border-b border-gray-200 pb-2">
                <label className="text-sm font-bold text-gray-700">Jenis Menu</label>
                <div className="col-span-2">
                      <select 
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        className="w-full text-gray-800 font-medium bg-transparent outline-none focus:bg-gray-50 px-2 py-1 rounded appearance-none"
                      >
                         <option value="coffee">Coffee</option>
                         <option value="tea">Tea</option>
                         <option value="noncoffee">Non Coffee</option>
                         <option value="food">Makanan</option>
                         <option value="snack">Snack</option>
                         <option value="other">Lainnya</option>
                      </select>
                </div>
            </div>

            {/* Deskripsi */}
            <div className="grid grid-cols-3 items-start border-b border-gray-200 pb-2">
                <label className="text-sm font-bold text-gray-700 mt-1">Keterangan</label>
                <div className="col-span-2">
                    <textarea 
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows={3}
                      className="w-full text-sm text-gray-600 font-medium bg-transparent outline-none focus:bg-gray-50 px-2 py-1 rounded resize-none"
                    />
                </div>
            </div>

            {/* Harga */}
            <div className="grid grid-cols-3 items-center border-b border-gray-200 pb-2">
                <label className="text-sm font-bold text-gray-700">Harga</label>
                <div className="col-span-2">
                    <input 
                      type="number" 
                      name="harga"
                      value={formData.harga}
                      onChange={handleChange}
                      className="w-full text-gray-800 font-bold bg-transparent outline-none focus:bg-gray-50 px-2 py-1 rounded"
                    />
                </div>
            </div>

            {/* Tombol Status Ketersediaan */}
            <div className="grid grid-cols-3 items-center pt-2">
                <label className="text-sm font-bold text-gray-700">Ketersediaan</label>
                <div className="col-span-2">
                    <button 
                        onClick={toggleStatus}
                        className={`px-6 py-2 rounded-md font-bold text-white text-sm shadow-sm transition-transform active:scale-95 ${
                            formData.status_ketersediaan === 'ready' ? 'bg-[#34D399] hover:bg-green-500' : 'bg-[#FF5252] hover:bg-red-500'
                        }`}
                    >
                        {formData.status_ketersediaan === 'ready' ? 'Tersedia' : 'Habis'}
                    </button>
                </div>
            </div>

          </div>
        </div>

        {/* --- TOMBOL NAVIGASI BAWAH --- */}
        <div className="flex justify-center gap-6 mt-10">
            {/* Tombol Kembali */}
            <button 
                onClick={() => router.back()}
                className="bg-[#FF5252] hover:bg-red-600 text-white font-bold py-3 px-10 rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
                <FiChevronLeft size={20} /> Kembali
            </button>

            {/* Tombol Simpan */}
            <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-[#5C6BC0] hover:bg-[#3f51b5] text-white font-bold py-3 px-10 rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
            >
                {isSaving ? 'Menyimpan...' : 'Update'} <FiEdit2 size={18} />
            </button>
        </div>

      </div>
    </div>
  );
}