'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser } from 'react-icons/fi';
import { FaMoneyBillWave, FaCheck } from 'react-icons/fa';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPenjualan: 0,
    totalCustomer: 0,
    penjualanSelesai: 0
  });
  
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // We reuse the same stats API as the admin
        const res = await fetch('/api/transaksi/stats');
        const data = await res.json();

        if (data.success) {
           setStats({
            totalPenjualan: data.data.totalPenjualan || 0,
            totalCustomer: data.data.totalCustomer || 0,
            penjualanSelesai: data.data.penjualanSelesai || 0
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Gagal memuat data statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#2c2c2c] font-sans pb-10">
      
      {/* Header Khusus Owner (Warna Merah Bata sesuai gambar) */}
      <header className="bg-[#A04040] px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="text-white font-bold text-xl"></div>
        <div className="text-sm font-semibold text-white flex items-center gap-2">Halo, Owner</div>
      </header>

      <main className="px-8 py-6 container mx-auto max-w-7xl">
        
        {/* Judul Dashboard */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-8 border-l-4 border-[#A04040]">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* Loading State */}
        {loading ? (
           <div className="flex justify-center py-10">
              <span className="text-gray-400">Memuat data...</span>
           </div>
        ) : error ? (
           <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
              {error}
           </div>
        ) : (
           /* Stat Cards */
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              {/* Card 1: Total Penjualan */}
              <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#5B79F4] rounded-xl flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-200">
                    <FaMoneyBillWave />
                </div>
                <div>
                    <p className="text-gray-400 font-medium text-sm">Total Penjualan</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalPenjualan}</h3>
                </div>
              </div>

              {/* Card 2: Total Customer */}
              <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#F55D4A] rounded-xl flex items-center justify-center text-white text-4xl shadow-lg shadow-red-200">
                    <FiUser />
                </div>
                <div>
                    <p className="text-gray-400 font-medium text-sm">Total Customer</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalCustomer}</h3>
                </div>
              </div>

              {/* Card 3: Penjualan Selesai */}
              <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#2FB364] rounded-xl flex items-center justify-center text-white text-3xl shadow-lg shadow-green-200">
                    <FaCheck />
                </div>
                <div>
                    <p className="text-gray-400 font-medium text-sm">Penjualan Selesai</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.penjualanSelesai}</h3>
                </div>
              </div>

           </div>
        )}

        {/* Area Kosong Bawah (Sesuai Gambar Referensi) */}
        <div className="h-40"></div>

      </main>
    </div>
  );
}