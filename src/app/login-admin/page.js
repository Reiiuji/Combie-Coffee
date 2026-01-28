'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginAdminPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      console.log("Respon Login:", data);

      if (data.success) {
        // --- 1. SIMPAN KE COOKIE (WAJIB UNTUK MIDDLEWARE) ---
        // Middleware hanya bisa baca Cookie, tidak bisa baca LocalStorage
        // Kita simpan selama 1 hari (86400 detik)
        const userRole = data.user.role ? data.user.role.toLowerCase() : 'admin';
        
        document.cookie = `user_role=${userRole}; path=/; max-age=86400`;
        // Opsional: Simpan token juga di cookie jika nanti API butuh
        // document.cookie = `token=${data.token}; path=/; max-age=86400`;

        // --- 2. Simpan ke LocalStorage (Untuk UI Frontend saja) ---
        localStorage.setItem('admin_token', 'active');
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        // --- 3. ARAHKAN SESUAI ROLE ---
        console.log("Redirecting user with role:", userRole);

        if (userRole === 'owner') {
            router.push('/owner/dashboard');
        } else {
            router.push('/admin/dashboard');
        }
        
        // Refresh agar middleware mendeteksi cookie baru
        router.refresh();

      } else {
        setError(data.message || "Username atau Password salah!");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] font-sans p-4">
      
      <Link 
        href="/customer/menu" 
        className="absolute top-8 left-6 flex items-center gap-2 text-gray-600 hover:text-orange-500 font-bold text-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Menu
      </Link>

      <div className="bg-[#3D3D3D] p-8 md:p-10 rounded-lg shadow-xl w-full max-w-[450px]">
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-8 tracking-wide">
          Masuk ke Akun Admin
        </h2>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-orange-500 font-bold text-sm mb-2">Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-500 border-none font-medium"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-orange-500 font-bold text-sm mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-500 border-none font-medium tracking-widest"
              placeholder="........"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9F1C] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors mt-6 shadow-md disabled:opacity-70"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}