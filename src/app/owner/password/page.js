'use client';

import { useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import Link from 'next/link';

export default function GantiPasswordOwnerPage() {
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
    <div className="w-full min-h-screen bg-[#F4F7FE]">
      
      {/* HEADER MERAH (Owner Theme) */}
      <header className="bg-[#A04040] w-full h-16 flex items-center justify-end px-8 shadow-sm text-white font-semibold text-sm">
        Halo, Owner
      </header>

      <div className="p-8">
        
        {/* JUDUL */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-[#A04040]">
            <h1 className="text-xl font-bold text-gray-800">Ganti Password</h1>
        </div>

        {/* Notifikasi Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md text-sm font-bold flex items-center gap-2 border shadow-sm max-w-2xl ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-600' 
              : 'bg-green-50 border-green-200 text-green-600'
          }`}>
            <AlertCircle className="w-5 h-5" /> {message.text}
          </div>
        )}

        {/* CARD FORM */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
           <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Input Password Lama */}
              <div>
                <label className="block text-gray-500 font-bold text-sm mb-2">
                  Password Lama
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="passwordLama"
                  value={formData.passwordLama}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040] transition-all"
                  placeholder="Masukkan password lama"
                  required
                />
              </div>

              {/* Input Password Baru */}
              <div>
                <label className="block text-gray-500 font-bold text-sm mb-2">
                  Password Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="passwordBaru"
                  value={formData.passwordBaru}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040] transition-all"
                  placeholder="Masukkan password baru"
                  required
                />
              </div>

              {/* Input Konfirmasi Password */}
              <div>
                <label className="block text-gray-500 font-bold text-sm mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="konfirmasiPassword"
                  value={formData.konfirmasiPassword}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040] transition-all"
                  placeholder="Ulangi password baru"
                  required
                />
              </div>

              {/* Checkbox Show Password */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showPass"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 accent-[#A04040] cursor-pointer rounded border-gray-300"
                />
                <label htmlFor="showPass" className="text-gray-500 text-sm cursor-pointer select-none font-medium">
                  Tampilkan password
                </label>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#A04040] hover:bg-[#8B3636] text-white px-8 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? 'Memproses...' : <><Save size={18} /> Simpan Password</>}
                </button>
              </div>

           </form>
        </div>

      </div>
    </div>
  );
}