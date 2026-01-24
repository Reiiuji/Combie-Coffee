'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TambahRolePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' // Default
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Berhasil menambahkan data!");
        router.push('/owner/role');
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F7FE]">
      {/* HEADER MERAH */}
      <header className="bg-[#A04040] w-full h-16 flex items-center justify-end px-8 shadow-sm text-white font-semibold text-sm">
        Halo, Owner
      </header>

      <div className="p-8">
        {/* JUDUL */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-[#A04040]">
            <h1 className="text-xl font-bold text-gray-800">Role</h1>
        </div>

        {/* TOMBOL KEMBALI */}
        <Link href="/owner/role" className="inline-block bg-[#A04040] text-white px-6 py-2 rounded font-bold text-sm mb-6 hover:bg-[#803030] transition shadow-sm">
          Kembali
        </Link>

        {/* FORM CARD */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
           <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
              
              {/* KOLOM KIRI: INPUT */}
              <div className="flex-1 space-y-5">
                 <div>
                    <label className="block text-gray-400 font-bold mb-2 text-sm">Email</label>
                    <input 
                      type="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040]"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 font-bold mb-2 text-sm">Password</label>
                    <input 
                      type="text" name="password" required
                      value={formData.password} onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040]"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 font-bold mb-2 text-sm">Konfirmasi Password</label>
                    <input 
                      type="text" name="confirmPassword" required
                      value={formData.confirmPassword} onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040]"
                    />
                 </div>
              </div>

              {/* KOLOM KANAN: ROLE & BUTTONS */}
              <div className="flex-1 space-y-6">
                 <div>
                    <label className="block text-gray-400 font-bold mb-3 text-sm">Role</label>
                    <div className="flex gap-3">
                       {['owner', 'admin'].map((r) => (
                          <button
                            key={r} type="button"
                            onClick={() => handleRoleSelect(r)}
                            className={`px-6 py-2 rounded-full font-bold text-sm capitalize transition-all border ${
                               formData.role === r 
                               ? 'bg-gray-300 text-gray-800 border-gray-400 shadow-inner' 
                               : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                             {r}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button 
                      type="submit" disabled={loading}
                      className="bg-[#5B79F4] hover:bg-blue-600 text-white px-8 py-2.5 rounded shadow-sm font-bold text-sm transition"
                    >
                       {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ email: '', password: '', confirmPassword: '', role: 'admin' })}
                      className="bg-[#F55D4A] hover:bg-red-500 text-white px-8 py-2.5 rounded shadow-sm font-bold text-sm transition"
                    >
                       Reset
                    </button>
                 </div>
              </div>

           </form>
        </div>

      </div>
    </div>
  );
}