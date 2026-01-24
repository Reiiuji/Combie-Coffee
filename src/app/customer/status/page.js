'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Coffee, RotateCw, ReceiptText } from 'lucide-react';

export default function StatusPage() {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi ambil status
  const fetchStatus = async (idTransaksi) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer/status?id=${idTransaksi}`);
      const result = await res.json();
      if (result.success) {
        setOrderStatus(result.data);
      }
    } catch (error) {
      console.error("Gagal ambil status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('last_combi_order');
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      fetchStatus(parsed.id); 
    } else {
      setLoading(false);
    }
  }, []);

  // Mapping status (sesuai ENUM database: menunggu, diproses, siap, selesai, batal)
  const statusConfig = {
    menunggu: { color: 'bg-yellow-100 text-yellow-600', icon: <Clock className="w-5 h-5 animate-pulse" />, text: 'Menunggu Konfirmasi' },
    diproses: { color: 'bg-orange-100 text-orange-600', icon: <RotateCw className="w-5 h-5 animate-spin" />, text: 'Sedang Dibuat' },
    siap:     { color: 'bg-green-100 text-green-600', icon: <CheckCircle2 className="w-5 h-5" />, text: 'Siap Diambil' },
    selesai:  { color: 'bg-blue-100 text-blue-600', icon: <CheckCircle2 className="w-5 h-5" />, text: 'Selesai' },
    batal:    { color: 'bg-red-100 text-red-600', icon: <XCircle className="w-5 h-5" />, text: 'Dibatalkan' }
  };

  // Helper untuk format antrian (misal A-001)
  // Karena di DB sudah format string 'A-001', kita tampilkan langsung saja
  const displayAntrian = orderStatus?.nomor_antrian || '---';

  return (
    <div className="min-h-screen bg-[#FFFBF2] p-6 font-sans flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg shadow-sm">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Status Pesanan Saya</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <RotateCw className="w-10 h-10 animate-spin text-red-600 mb-4" />
          <p>Memperbarui...</p>
        </div>
      ) : orderStatus ? (
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-500">
          
          {/* KARTU STATUS UTAMA */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl text-center border border-gray-50 mb-6">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">Nomor Antrian</p>
            
            <div className="text-6xl font-black text-[#2D3E50] mb-8 tracking-wider">
              {displayAntrian}
            </div>
            
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm ${statusConfig[orderStatus.status_pesanan]?.color || 'bg-gray-100'}`}>
              {statusConfig[orderStatus.status_pesanan]?.icon}
              <span>{statusConfig[orderStatus.status_pesanan]?.text || orderStatus.status_pesanan}</span>
            </div>
          </div>

          {/* DETAIL RINGKAS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-red-600" /> Rincian
            </h2>
            
            {/* HAPUS BAGIAN NAMA PELANGGAN (Karena tidak ada di DB) */}
            
            <div className="flex justify-between text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 font-medium">Waktu Pesan</span>
              <span className="font-bold text-gray-800">
                {new Date(orderStatus.waktu_pesan).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Total Tagihan</span>
              {/* GANTI total_bayar JADI total (Sesuai API) */}
              <span className="font-bold text-red-600">
                Rp {Number(orderStatus.total).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button onClick={() => fetchStatus(orderStatus.id_pesanan)} className="mt-8 flex items-center justify-center gap-2 text-gray-400 py-2 hover:text-red-600 transition-colors">
            <RotateCw className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Update Status</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
          <Coffee className="w-20 h-20 mb-4" />
          <p className="font-bold">Belum ada pesanan aktif</p>
        </div>
      )}
    </div>
  );
}