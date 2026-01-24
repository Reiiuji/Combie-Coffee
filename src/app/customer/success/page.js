'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RotateCw } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil ID Pesanan yang tersimpan di Browser (LocalStorage)
    const savedOrder = localStorage.getItem('last_combi_order');
    
    if (!savedOrder) {
      // Jika tidak ada data order, kembalikan ke menu
      router.replace('/customer/menu');
      return;
    }

    const { id } = JSON.parse(savedOrder);

    // 2. Panggil API untuk mengambil data ASLI dari Database
    async function fetchOrderData() {
      try {
        const res = await fetch(`/api/customer/status?id=${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderData();
  }, [router]);

  // Tampilan Loading
  if (loading) return (
    <div className="min-h-screen bg-[#FFFBF2] flex flex-col items-center justify-center font-sans text-gray-500">
      <RotateCw className="w-8 h-8 animate-spin text-orange-500 mb-2" />
      Memuat Data Pesanan...
    </div>
  );

  // Jika data belum ada (fallback)
  if (!order) return null;

  // Format Nomor Antrian (misal A-001)
  // Kita ambil angka di belakangnya atau tampilkan apa adanya dari DB
  const displayAntrian = order.nomor_antrian || '0000';

  return (
    <div className="min-h-screen bg-[#FFFBF2] flex flex-col items-center px-6 pt-10 pb-10 font-sans">
      
      {/* Ilustrasi Sukses */}
      <div className="flex flex-col items-center text-center mb-10 animate-in fade-in zoom-in duration-500">
        <div className="relative w-52 h-52 bg-pink-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <div className="bg-yellow-400 p-5 rounded-2xl shadow-xl transform -rotate-12 translate-x-4">
             <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <div className="absolute top-4 right-12 bg-orange-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
             <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-[#2D3E50] leading-tight px-4">
          Selesaikan Pembayaran <br /> di Kasir
        </h1>
      </div>

      {/* Card Info Pesanan */}
      <div className="w-full bg-white rounded-[25px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 mb-10 animate-in slide-in-from-bottom-5 duration-700">
        <div className="text-center mb-8">
          <p className="text-gray-400 font-bold text-sm mb-2 tracking-wide uppercase">Nomor Antrian</p>
          <div className="text-5xl font-extrabold text-[#2D3E50] tracking-[0.05em] border-b-2 border-gray-50 pb-6">
            {displayAntrian}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-[#2D3E50]">Pembayaran</h2>
          
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>Status</span>
            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs uppercase">
              {order.status_pesanan}
            </span>
          </div>
          
          {/* Karena di DB tidak ada kolom pajak terpisah, kita 0-kan atau hapus baris ini */}
          <div className="flex justify-between text-gray-500 font-bold text-sm pb-5 border-b border-dashed border-gray-100">
            <span>Pajak</span>
            <span>Rp 0</span>
          </div>

          <div className="flex justify-between text-[#2D3E50] font-black text-2xl pt-2">
            <span>Total Pembayaran</span>
            <span>Rp {Number(order.total).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Tombol Selesai */}
      <div className="mt-auto w-full space-y-3">
        <button 
          onClick={() => router.push('/customer/status')}
          className="w-full bg-[#D12B2B] hover:bg-red-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
        >
          Lihat Status Pesanan
        </button>

        <button 
          onClick={() => router.push('/customer/menu')}
          className="w-full bg-white text-gray-500 font-bold py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
        >
          Kembali ke Menu
        </button>
      </div>
    </div>
  );
}