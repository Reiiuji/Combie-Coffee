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

  // --- 1. FUNGSI PENCARIAN ---
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

  // --- 2. FUNGSI AMBIL DATA ---
  const fetchData = async () => {
      try {
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

  // --- 3. AUTO REFRESH SETIAP 5 DETIK ---
  useEffect(() => {
    fetchData(); // Load pertama kali

    const interval = setInterval(() => {
        fetchData(); // Load ulang tiap 5 detik
    }, 5000);

    return () => clearInterval(interval);
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
                <div><p className="text-gray-400 font-medium text-sm">Total Penjualan</p><h3 className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('id-ID').format(stats.totalPenjualan)}</h3></div>
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
            <div className="bg-white px-6 py-3 rounded-md shadow-sm w-full mb-4">
                <h2 className="text-lg font-bold text-gray-800">Cari & Proses Pesanan</h2>
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

        {/* DAFTAR ANTRIAN AKTIF (CLEAN TANPA INFO MEJA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transactions.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-lg shadow-sm">
                    Tidak ada antrian aktif saat ini.
                </div>
            ) : (
                transactions.map((transaction) => (
                    <div 
                        key={transaction.id}
                        onClick={() => handleTransactionClick(transaction.id)}
                        className="bg-white p-8 rounded-md shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-orange-300 group"
                    >
                        <span className="text-gray-500 text-sm font-medium">Antrian</span>
                        
                        {/* HANYA NOMOR ANTRIAN SAJA */}
                        <span className="font-extrabold text-gray-800 text-3xl group-hover:text-orange-500 transition-colors">
                            {transaction.nomor_antrian}
                        </span>
                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}