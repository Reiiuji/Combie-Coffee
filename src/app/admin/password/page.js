'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GantiPasswordPage() {
  const [formData, setFormData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Validasi Sederhana
    if (formData.passwordBaru !== formData.konfirmasiPassword) {
      setMessage({ type: 'error', text: "Konfirmasi password baru tidak cocok!" });
      return;
    }

    if (formData.passwordBaru.length < 6) {
      setMessage({ type: 'error', text: "Password baru minimal 6 karakter" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordLama: formData.passwordLama,
          passwordBaru: formData.passwordBaru
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: "Berhasil! Password telah diganti." });
        setFormData({ passwordLama: '', passwordBaru: '', konfirmasiPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || "Gagal mengganti password" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: "Terjadi kesalahan sistem." });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background Halaman Krem (Sama seperti Login)
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] font-sans p-4">
      
      {/* Card Utama - Abu-abu Gelap (Sama seperti Login) */}
      <div className="bg-[#3D3D3D] p-8 md:p-10 rounded-lg shadow-xl w-full max-w-[450px]">
        
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-8 tracking-wide">
          Ganti Password
        </h2>

        {/* Notifikasi Alert */}
        {message.text && (
          <div className={`mb-6 p-3 rounded text-sm font-medium flex items-center gap-2 border ${
            message.type === 'error' 
              ? 'bg-red-500/20 border-red-500 text-red-400' 
              : 'bg-green-500/20 border-green-500 text-green-400'
          }`}>
            <AlertCircle className="w-4 h-4" /> {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input Password Lama */}
          <div>
            <label className="block text-orange-500 font-bold text-sm mb-2">
              Password Lama
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="passwordLama"
              value={formData.passwordLama}
              onChange={handleChange}
              // Style Input disamakan dengan Login (Abu-abu Medium)
              className="w-full p-3 rounded bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-500 border-none font-medium tracking-widest"
              placeholder="........"
              required
            />
          </div>

          {/* Input Password Baru */}
          <div>
            <label className="block text-orange-500 font-bold text-sm mb-2">
              Password Baru
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="passwordBaru"
              value={formData.passwordBaru}
              onChange={handleChange}
              className="w-full p-3 rounded bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-500 border-none font-medium tracking-widest"
              placeholder="........"
              required
            />
          </div>

          {/* Input Konfirmasi Password */}
          <div>
            <label className="block text-orange-500 font-bold text-sm mb-2">
              Konfirmasi Password Baru
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="konfirmasiPassword"
              value={formData.konfirmasiPassword}
              onChange={handleChange}
              className="w-full p-3 rounded bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-500 border-none font-medium tracking-widest"
              placeholder="........"
              required
            />
          </div>

          {/* Checkbox Show Password */}
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="showPass"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 accent-gray-500 cursor-pointer rounded bg-transparent border-gray-500"
            />
            <label htmlFor="showPass" className="text-gray-400 text-sm cursor-pointer select-none">
              show password
            </label>
          </div>

          {/* Tombol Simpan (Orange) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9F1C] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-6 disabled:opacity-70"
          >
            {loading ? 'Memproses...' : 'Masuk'} 
            {/* Teks tombol 'Masuk' disesuaikan dengan gambar referensi Anda, 
                tapi secara fungsi ini 'Simpan Password' */}
          </button>

        </form>
      </div>
    </div>
  );
}