'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, RefreshCw } from 'lucide-react';

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // 1. Ganti 'email' jadi 'username'
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Ambil Data Lama User
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/admin'); 
        const json = await res.json();
        
        if (json.success) {
          const user = json.data.find(u => u.id_admin == id);
          
          if (user) {
            setFormData({
                username: user.username, // 2. Ambil username dari DB
                password: '', // Biarkan kosong, hanya diisi jika ingin ganti password
                role: user.role
            });
          } else {
            alert("User tidak ditemukan!");
            router.push('/owner/role');
          }
        }
      } catch (error) {
        console.error("Gagal ambil data user:", error);
      } finally {
        setFetching(false);
      }
    }

    if (id) fetchUser();
  }, [id, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 3. Kirim data update (username, password baru, role)
      const res = await fetch(`/api/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();

      if (json.success) {
        alert("Berhasil update data!");
        router.push('/owner/role');
      } else {
        alert("Gagal update: " + json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Memuat data user...</div>;

  return (
    <div className="w-full min-h-screen bg-[#F4F7FE]">
      {/* HEADER MERAH */}
      <header className="bg-[#A04040] w-full h-16 flex items-center justify-end px-8 shadow-sm text-white font-semibold text-sm">
        Halo, Owner
      </header>

      <div className="p-8">
        
        {/* JUDUL */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-[#A04040]">
            <h1 className="text-xl font-bold text-gray-800">Edit Role</h1>
        </div>

        {/* TOMBOL KEMBALI */}
        <Link href="/owner/role" className="inline-block bg-[#A04040] text-white px-6 py-2 rounded font-bold text-sm mb-6 hover:bg-[#803030] transition shadow-sm">
          Kembali
        </Link>

        {/* FORM CARD */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
           <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
              
              {/* KOLOM KIRI */}
              <div className="flex-1 space-y-5">
                 <div>
                    {/* 4. Update Label & Input jadi Username */}
                    <label className="block text-gray-400 font-bold mb-2 text-sm">Username / ID</label>
                    <input 
                      type="text" 
                      name="username" 
                      required
                      value={formData.username} 
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040]"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 font-bold mb-2 text-sm">Password Baru</label>
                    <input 
                      type="text" 
                      name="password"
                      value={formData.password} 
                      onChange={handleChange}
                      placeholder="Biarkan kosong jika tidak ingin mengubah password"
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-gray-700 outline-none focus:ring-2 focus:ring-[#A04040]"
                    />
                 </div>
              </div>

              {/* KOLOM KANAN */}
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
                      className="bg-[#5B79F4] hover:bg-blue-600 text-white px-8 py-2.5 rounded shadow-sm font-bold text-sm transition flex items-center gap-2"
                    >
                       {loading ? 'Menyimpan...' : <><Save size={16} /> Simpan Perubahan</>}
                    </button>
                    
                     <button 
                      type="button" 
                      onClick={() => window.location.reload()} 
                      className="bg-[#F55D4A] hover:bg-red-500 text-white px-8 py-2.5 rounded shadow-sm font-bold text-sm transition flex items-center gap-2"
                    >
                       <RefreshCw size={16} /> Reset
                    </button>
                 </div>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
