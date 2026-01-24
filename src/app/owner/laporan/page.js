'use client';

import { useState, useEffect } from 'react';
import { Filter, Printer, FileText, Menu } from 'lucide-react';

export default function LaporanOwnerPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Set Default Tanggal (Awal Bulan s/d Hari Ini)
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(currentDay);

  // Fungsi Fetch Data
  const fetchLaporan = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      // Reuse API yang sama karena datanya sama
      const res = await fetch(`/api/laporan?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      
      if (data.success) {
        setLaporan(data.data);
      } else {
        console.error("Gagal mengambil data laporan");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Hitung Grand Total
  const grandTotal = laporan.reduce((acc, curr) => {
    const nilai = Number(curr.subtotal) || 0; 
    return acc + nilai;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-10">
      
      {/* --- CSS KHUSUS PRINT (Updated Colors) --- */}
      <style jsx global>{`
        @media print {
          nav, aside, header, .no-print { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important;
            padding: 0 !important;
            margin-top: 20px !important;
          }
          /* Warna Header Tabel jadi Merah Bata */
          th { background-color: #A04040 !important; color: white !important; }
          tr:nth-child(even) { background-color: #F3F4F6 !important; }
        }
      `}</style>

      {/* HEADER MERAH (Owner Theme) */}
      <header className="bg-[#A04040] px-8 py-5 text-white shadow-sm flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-3">
            {/* Menu icon removed or kept depending on layout needs, kept here for structure */}
        </div> 
        <div className="text-sm font-bold tracking-wide">Halo, Owner</div>
      </header>

      <main className="px-8 max-w-7xl mx-auto">
        
        {/* CARD FILTER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 no-print">
            <h1 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Filter size={20} className="text-[#A04040]" />
                Filter Laporan Transaksi
            </h1>

            <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dari Tanggal</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A04040] outline-none transition-all"
                    />
                </div>
                
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sampai Tanggal</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A04040] outline-none transition-all"
                    />
                </div>

                <div className="w-full md:w-auto flex gap-3">
                    <button 
                        onClick={fetchLaporan}
                        disabled={loading}
                        className="bg-[#A04040] hover:bg-[#8B3636] text-white px-6 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? 'Memuat...' : (
                            <> <FileText size={18} /> Tampilkan Data </>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => window.print()}
                        className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Printer size={18} /> Cetak
                    </button>
                </div>
            </div>
        </div>

        {/* TABEL HASIL LAPORAN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print-container">
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Header Tabel Merah */}
                        <tr className="bg-[#A04040] text-white">
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center border-r border-red-300/30">No</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider border-r border-red-300/30">Tanggal & Waktu</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider border-r border-red-300/30">Nama Pelanggan</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider border-r border-red-300/30">Menu/Item</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center border-r border-red-300/30">QTY</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right border-r border-red-300/30">Harga/Item</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right border-r border-red-300/30">Total Bayar</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Metode Pembayaran</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {laporan.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-10 text-center text-gray-400 bg-gray-50 italic">
                                    {loading ? 'Sedang memuat data...' : 'Tidak ada transaksi pada periode ini.'}
                                </td>
                            </tr>
                        ) : (
                            laporan.map((row, index) => (
                                <tr key={index} className="even:bg-gray-50 hover:bg-red-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium border-r border-gray-100">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium border-r border-gray-100">
                                        {new Date(row.tanggal).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium border-r border-gray-100">{row.nama_pelanggan || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">{row.nama_menu}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 text-center font-bold border-r border-gray-100">{row.qty}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 text-right border-r border-gray-100">
                                        {new Intl.NumberFormat('id-ID').format(Number(row.harga_satuan))}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right border-r border-gray-100">
                                        {new Intl.NumberFormat('id-ID').format(Number(row.subtotal))}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            row.metode_pembayaran === 'qris' 
                                            ? 'bg-blue-100 text-blue-700' 
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                            {row.metode_pembayaran || 'Tunai'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {laporan.length > 0 && (
                        <tfoot className="bg-[#FFF8F1] border-t-2 border-[#A04040]">
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-right font-bold text-gray-700 uppercase tracking-wide">Grand Total Pendapatan:</td>
                                <td className="px-6 py-4 text-right font-black text-[#A04040] text-lg">
                                    Rp {new Intl.NumberFormat('id-ID').format(grandTotal)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>

      </main>
    </div>
  );
}