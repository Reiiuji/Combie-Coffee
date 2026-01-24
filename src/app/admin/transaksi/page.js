'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiCoffee } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function TransactionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(''); // '' | 'qris' | 'tunai'

  // Fetch Data Transaksi
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/transaksi/${id}`);
        const data = await res.json();
        
        if (!data.success) throw new Error(data.error);
        setTransaction(data.data);
      } catch (err) {
        console.error('Error:', err);
        Swal.fire('Error', 'Gagal memuat data transaksi', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // Handle Selesaikan Pesanan
  const handleCompleteOrder = async () => {
    if (!paymentMethod) {
      return Swal.fire('Pilih Pembayaran', 'Silakan pilih metode pembayaran (QRIS atau Tunai)', 'warning');
    }

    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_pesanan: 'selesai',
          metode_pembayaran: paymentMethod
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pesanan telah diselesaikan.',
            confirmButtonColor: '#E6A05B'
        });
        router.push('/admin/transaksi'); 
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] text-gray-500">Memuat data...</div>;
  if (!transaction) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">Transaksi tidak ditemukan</div>;

  // Kalkulasi sederhana (Jika BE belum kirim detail pajak, hitung manual)
  const totalBayar = Number(transaction.total_bayar) || 0;
  // Asumsi pajak sudah include atau hitung 10% jika perlu. Di sini kita ambil dari data jika ada.
  const pajak = Number(transaction.pajak) || 0; 
  const totalItem = totalBayar - pajak; 

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#2c2c2c] font-sans pb-10">
      
      {/* HEADER ORANGE */}
      <header className="bg-[#E6A05B] px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="font-bold text-xl text-white">ADMIN PANEL</div>
        <div className="text-sm font-semibold text-white">Halo, Admin</div>
      </header>

      <main className="px-8 py-6 max-w-[1600px] mx-auto">
        
        {/* JUDUL DASHBOARD (Putih) */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-orange-400">
           <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* TOMBOL KEMBALI */}
        <button 
            onClick={() => router.back()}
            className="mb-6 bg-[#EDA05D] hover:bg-orange-600 text-white px-6 py-2 rounded shadow-sm flex items-center font-medium transition-colors"
        >
            <FiChevronLeft className="mr-2" /> Kembali
        </button>

        {/* --- GRID UTAMA (KIRI: DETAIL, KANAN: PEMBAYARAN) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* === KOLOM KIRI (Detail Pesanan) === */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Header Konfirmasi & Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Konfirmasi Pesanan Selesai</h2>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-700">Nomor Antrian :</span>
                                <span className="text-3xl font-bold text-[#2D3E50]">{transaction.nomor_antrian}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-700">Atas Nama :</span>
                                <span className="text-lg font-medium text-gray-600">{transaction.nama_pelanggan || '-'}</span>
                            </div>
                        </div>

                        {/* Tombol Dummy Visual (Sesuai Gambar) */}
                        <div className="bg-[#EDA05D] text-white px-6 py-3 rounded-md font-bold text-center shadow-sm opacity-90 cursor-default">
                            Konfirmasi Selesai <br/> Pemesanan
                        </div>
                    </div>
                </div>

                {/* List Produk (Grid Card) */}
                <div>
                    <h3 className="text-lg font-bold text-[#4A5568] mb-4 pl-1">Pesanan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transaction.items?.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                {/* Foto Bulat */}
                                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                    {item.foto_url ? (
                                        <img 
                                            src={`/images/${item.foto_url}`} 
                                            alt={item.nama_menu} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://placehold.co/100x100?text=Coffee'}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-400"><FiCoffee /></div>
                                    )}
                                </div>

                                {/* Detail Teks */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-lg truncate">{item.nama_menu}</h4>
                                    <p className="text-gray-400 text-xs font-medium">
                                        {new Intl.NumberFormat('id-ID').format(item.harga_satuan)} 
                                    </p>
                                    <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">
                                        {item.catatan_item || 'Strong, bold, aromatic'}
                                    </p>
                                </div>

                                {/* Qty & Label Jumlah */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Jumlah</span>
                                    <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm bg-white shadow-sm">
                                        {item.jumlah}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === KOLOM KANAN (Ringkasan & Pembayaran) === */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#4A5568]">Ringkasan Pemesanan</h3>

                {/* Card Putih Pembayaran */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-600 text-lg mb-4">Pembayaran</h4>
                    
                    <div className="space-y-3 text-sm font-medium text-gray-500">
                        <div className="flex justify-between">
                            <span>Total Item</span>
                            <span className="text-gray-800 font-bold">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalItem)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pajak</span>
                            <span className="text-gray-800 font-bold">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pajak)}
                            </span>
                        </div>
                        <div className="border-t pt-3 mt-3 flex justify-between text-base">
                            <span className="font-bold text-gray-800">Total Pembayaran</span>
                            <span className="font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBayar)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pilih Pembayaran */}
                <div>
                    <h4 className="font-bold text-gray-600 text-lg mb-3">Pilih Pembayaran</h4>
                    
                    {/* Tombol Metode Pembayaran (Merah/Brownish) */}
                    <div className="flex gap-3 mb-4">
                        <button 
                            onClick={() => setPaymentMethod('qris')}
                            className={`flex-1 py-3 rounded-lg font-bold text-white transition-all shadow-sm
                            ${paymentMethod === 'qris' 
                                ? 'bg-[#7A2E2E] ring-2 ring-offset-2 ring-[#7A2E2E]'  // Active state
                                : 'bg-[#9E3F3F] hover:bg-[#8B3535] opacity-90'        // Default state
                            }`}
                        >
                            QRIS
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('tunai')}
                            className={`flex-1 py-3 rounded-lg font-bold text-white transition-all shadow-sm
                            ${paymentMethod === 'tunai' 
                                ? 'bg-[#7A2E2E] ring-2 ring-offset-2 ring-[#7A2E2E]' 
                                : 'bg-[#9E3F3F] hover:bg-[#8B3535] opacity-90'
                            }`}
                        >
                            Tunai
                        </button>
                    </div>

                    {/* Tombol Final (Orange) */}
                    <button
                        onClick={handleCompleteOrder}
                        className="w-full bg-[#EDA05D] hover:bg-orange-500 text-white font-bold py-4 rounded-lg shadow-md transition-all active:scale-95"
                    >
                        Pembayaran telah diterima
                    </button>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
}