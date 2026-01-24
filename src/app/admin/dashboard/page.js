'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser } from 'react-icons/fi';
import { FaMoneyBillWave, FaCheck } from 'react-icons/fa';

export default function DashboardContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPenjualan: 0,
    totalCustomer: 0,
    penjualanSelesai: 0
  });
  
  const [searchNomor, setSearchNomor] = useState('');
  const router = useRouter();

  // --- FUNGSI BARU: MEMECAH STRING CATATAN UMUM ---
  // const parseLokasi = (catatan) => {
  //   if (!catatan) return '-';

  //   // Cek apakah string mengandung kata "Meja" (Case insensitive)
  //   if (catatan.toLowerCase().includes('meja')) {
  //     // Logic: Split berdasarkan titik dua ":"
  //     // Contoh: "Meja No: 12" -> menjadi array ["Meja No", " 12"]
  //     const parts = catatan.split(':');
      
  //     // Jika ada bagian setelah titik dua, ambil dan bersihkan spasi
  //     if (parts.length > 1) {
  //       return `Meja : ${parts[1].trim()}`;
  //     }
      
  //     // Fallback jika formatnya beda (misal cuma "Meja 12")
  //     return catatan; 
  //   }

  //   // Jika "Take Away", kembalikan apa adanya
  //   return catatan;
  // };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchNomor.trim()) return alert("Masukkan Nomor Antrian");

    const params = new URLSearchParams();
    params.append('nomor', searchNomor.trim());

    try {
      const res = await fetch(`/api/transaksi/find?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data.id) {
        router.push(`/admin/transaksi/${data.data.id}`);
      } else {
        alert('Pesanan tidak ditemukan atau sudah selesai.');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Terjadi kesalahan saat mencari.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, statsRes] = await Promise.all([
          fetch('/api/transaksi/active'),
          fetch('/api/transaksi/stats')
        ]);

        const transactionsData = await transactionsRes.json();
        const statsData = await statsRes.json();

        setTransactions(transactionsData.data || []);
        setStats({
          totalPenjualan: statsData.data.totalPenjualan || 0,
          totalCustomer: statsData.data.totalCustomer || 0,
          penjualanSelesai: statsData.data.penjualanSelesai || 0
        });
      } catch (err) {
        console.error('Error:', err);
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTransactionClick = (transactionId) => {
    router.push(`/admin/transaksi/${transactionId}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#2c2c2c] font-sans pb-10">
      
      {/* Header */}
      <header className="bg-[#E6A05B] px-10 py-6 flex justify-between items-center shadow-sm">
        <div className="text-white font-bold text-xl"></div>
        <div className="text-sm font-semibold text-white flex items-center gap-2">Halo, Admin</div>
      </header>

      <main className="px-8 py-6 container mx-auto max-w-7xl">
        
        {/* Judul */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-8 border-l-4 border-orange-500">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#5B79F4] rounded-xl flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-200"><FaMoneyBillWave /></div>
                <div><p className="text-gray-400 font-medium text-sm">Total Penjualan</p><h3 className="text-2xl font-bold text-gray-800">{stats.totalPenjualan}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#F55D4A] rounded-xl flex items-center justify-center text-white text-4xl shadow-lg shadow-red-200"><FiUser /></div>
                <div><p className="text-gray-400 font-medium text-sm">Total Customer</p><h3 className="text-2xl font-bold text-gray-800">{stats.totalCustomer}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#2FB364] rounded-xl flex items-center justify-center text-white text-3xl shadow-lg shadow-green-200"><FaCheck /></div>
                <div><p className="text-gray-400 font-medium text-sm">Penjualan Selesai</p><h3 className="text-2xl font-bold text-gray-800">{stats.penjualanSelesai}</h3></div>
            </div>
        </div>

        {/* INPUT PENCARIAN */}
        <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4">
                <div className="bg-white px-6 py-3 rounded-md shadow-sm w-full md:w-auto">
                    <h2 className="text-lg font-bold text-gray-800">Cari & Proses Pesanan</h2>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 bg-white p-4 rounded-md shadow-sm flex items-center gap-4 w-full">
                    <label className="font-bold text-gray-700 min-w-[120px]">Nomor Antrian:</label>
                    <input 
                        type="text" 
                        value={searchNomor}
                        onChange={(e) => setSearchNomor(e.target.value)}
                        placeholder="Contoh: A-001"
                        className="bg-gray-200 border-none rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                </div>
                
                <button 
                    onClick={handleSearch}
                    className="bg-[#EDA05D] hover:bg-orange-500 text-white font-medium py-6 px-8 rounded-md shadow-md transition-colors w-full md:w-auto h-full"
                >
                    Proses Transaksi
                </button>
            </div>
        </div>

        {/* DAFTAR ANTRIAN AKTIF (CARD) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400">
                    Tidak ada antrian aktif saat ini.
                </div>
            ) : (
                transactions.map((transaction) => (
                    <div 
                        key={transaction.id}
                        onClick={() => handleTransactionClick(transaction.id)}
                        className="bg-white p-6 rounded-md shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-orange-200"
                    >
                        {/* No Antrian */}
                        <span className="font-bold text-gray-800 text-xl">
                            No : {transaction.nomor_antrian}
                        </span>
                        
                        {/* Info Lokasi / Meja (Dari catatan_umum)
                        <span className={`text-lg font-semibold px-4 py-1 rounded-full ${
                            transaction.catatan_umum?.toLowerCase().includes('take away') 
                            ? 'bg-blue-100 text-blue-700' // Style untuk Take Away
                            : 'bg-orange-100 text-orange-700' // Style untuk Meja
                        }`}>
                           {parseLokasi(transaction.catatan_umum)}
                        </span> */}
                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}