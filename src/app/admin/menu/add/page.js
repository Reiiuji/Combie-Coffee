'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiImage, FiUpload, FiX, FiSave, FiRotateCcw } from 'react-icons/fi';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function AddMenuPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    kategori: 'Coffee',
    deskripsi: '',
    harga: '',
    status_ketersediaan: true // Default Tersedia
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kategori sesuai desain
  const categories = [
    { id: 'Coffee', label: 'Coffee' },
    { id: 'Non Coffee', label: 'Non Coffee' },
    { id: 'Snack', label: 'Snack' }, // Mapping 'Food' ke 'Snack' utk tampilan
    { id: 'Tea', label: 'Tea' } 
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (cat) => {
    // Mapping balik Snack -> Food jika perlu disesuaikan dengan DB, 
    // atau biarkan jika DB menerima string bebas.
    // Asumsi DB pakai ENUM: 'coffee','tea','noncoffee','food','other'
    let dbValue = cat.toLowerCase().replace(" ", "");
    if(cat === 'Snack') dbValue = 'food';

    setFormData(prev => ({ ...prev, kategori: dbValue }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({ ...prev, status_ketersediaan: !prev.status_ketersediaan }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Convert status boolean ke string enum jika perlu, atau biarkan backend handle
        if (key === 'status_ketersediaan') {
            formDataToSend.append(key, value ? 'ready' : 'habis');
        } else {
            formDataToSend.append(key, value);
        }
      });
      
      if (fileInputRef.current?.files[0]) {
        formDataToSend.append('foto', fileInputRef.current.files[0]);
      }

      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success || result.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Menu baru telah ditambahkan',
          confirmButtonColor: '#F0AD6D',
        });
        router.push('/admin/menu');
      } else {
        throw new Error(result.error || 'Gagal menambahkan menu');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_menu: '',
      kategori: 'coffee',
      deskripsi: '',
      harga: '',
      status_ketersediaan: true
    });
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-10">
      
      {/* Header Orange (Konsisten) */}
      <header className="bg-[#F0AD6D] px-8 py-5 text-white shadow-sm flex justify-between items-center mb-8">
        <div /> 
        <div className="text-sm font-bold tracking-wide">Halo, Admin</div>
      </header>

      {/* Main Content Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm p-8 md:p-12">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-12">
          
          {/* --- KOLOM KIRI (Gambar, Nama, Harga) --- */}
          <div className="w-full md:w-5/12 flex flex-col gap-6">
            
            {/* Upload Area (Dashed Orange) */}
            <div className="flex justify-center">
                <div 
                    onClick={triggerFileInput}
                    className="w-64 h-64 border-4 border-dashed border-orange-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors relative overflow-hidden group"
                >
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    
                    {preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiX onClick={removeImage} className="text-white text-4xl hover:text-red-400" />
                            </div>
                        </>
                    ) : (
                        <div className="text-orange-300 flex flex-col items-center">
                            {/* Icon Gambar Placeholder */}
                            <FiImage size={80} strokeWidth={1.5} />
                            <span className="text-sm font-bold mt-2 uppercase tracking-widest text-orange-300">Upload Foto</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Nama Menu */}
            <div>
                <label className="block text-gray-400 font-bold text-sm mb-2">Nama Menu</label>
                <input 
                    type="text" 
                    name="nama_menu"
                    value={formData.nama_menu}
                    onChange={handleInputChange}
                    className="w-full bg-[#F3F4F6] border-none rounded-lg py-3 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                    placeholder="Masukkan nama menu..."
                    required
                />
            </div>

            {/* Input Harga */}
            <div>
                <label className="block text-gray-400 font-bold text-sm mb-2">Harga</label>
                <input 
                    type="number" 
                    name="harga"
                    value={formData.harga}
                    onChange={handleInputChange}
                    className="w-full bg-[#F3F4F6] border-none rounded-lg py-3 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                    placeholder="Contoh: 25000"
                    required
                />
            </div>
          </div>

          {/* --- KOLOM KANAN (Jenis, Keterangan, Stok/Status, Tombol) --- */}
          <div className="w-full md:w-7/12 flex flex-col gap-6">
            
            {/* Jenis (Pills) */}
            <div>
                <label className="block text-gray-400 font-bold text-sm mb-3">Jenis</label>
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => {
                        // Cek apakah kategori ini yang dipilih (case insensitive match logic sederhana)
                        const isSelected = formData.kategori.toLowerCase().includes(cat.id.toLowerCase().replace(" ", "")) || 
                                           (cat.id === 'Snack' && formData.kategori === 'food');
                        
                        return (
                            <button
                                type="button"
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                                    isSelected 
                                    ? 'bg-[#D1D5DB] text-gray-800 shadow-inner' // Selected style (Grayish)
                                    : 'bg-[#E5E7EB] text-gray-500 hover:bg-gray-200' // Default style
                                }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Keterangan */}
            <div>
                <label className="block text-gray-400 font-bold text-sm mb-2">Keterangan</label>
                <textarea 
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-[#F3F4F6] border-none rounded-xl py-3 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-300 outline-none resize-none transition-all"
                    placeholder="Deskripsi singkat menu..."
                />
            </div>

            {/* Status Ketersediaan (Toggle) */}
            <div>
                <label className="block text-gray-400 font-bold text-sm mb-3">Status Ketersediaan</label>
                <div className="flex items-center gap-4">
                    {/* Custom Toggle Switch */}
                    <div 
                        onClick={toggleStatus}
                        className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            formData.status_ketersediaan ? 'bg-[#5B79F4]' : 'bg-gray-300'
                        }`}
                    >
                        <div 
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                formData.status_ketersediaan ? 'translate-x-8' : 'translate-x-0'
                            }`}
                        />
                    </div>
                    <span className={`font-bold text-sm ${formData.status_ketersediaan ? 'text-[#5B79F4]' : 'text-gray-400'}`}>
                        {formData.status_ketersediaan ? 'Tersedia' : 'Habis'}
                    </span>
                </div>
            </div>

            {/* Tombol Aksi (Simpan & Reset) */}
            <div className="mt-auto flex gap-4 pt-8">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5B79F4] hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>

                <button
                    type="button"
                    onClick={resetForm}
                    className="bg-[#FF5252] hover:bg-red-600 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all active:scale-95"
                >
                    Reset
                </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}