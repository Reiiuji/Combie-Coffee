"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();

  const [meja, setMeja] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper untuk gambar (jika path dari DB atau local)
  const getImageUrl = (path) => {
    if (!path) return "/images/landing-coffee.jpg"; // Gambar default
    return path.startsWith("/") ? path : `/images/${path}`;
  };

  // Jika keranjang kosong
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] p-6 text-center font-sans">
        <div className="w-24 h-24 bg-[#333333] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <ShoppingBag className="w-10 h-10 text-[#FF9F1C]" />
        </div>
        <h2 className="text-2xl font-bold text-[#333333] mb-2">
          Keranjang Kosong
        </h2>
        <Link
          href="/customer/menu"
          className="bg-[#FF9F1C] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-orange-600 transition-colors"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      nomor_meja: meja,
      total_harga: totalPrice,
      total_bayar: totalPrice,
      items: cart,
    };

    try {
      const res = await fetch("/api/customer/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "last_combi_order",
          JSON.stringify({
            id: data.id_pesanan,
            antrian: data.nomor_antrian,
          }),
        );
        clearCart();
        router.push("/customer/success");
      } else {
        alert(data.message || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] font-sans pb-32">
      {/* HEADER SIMPLE */}
      <div className="bg-[#FFFBF2] p-5 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-200/50 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#333333]" />
        </button>
        <h1 className="font-bold text-xl text-[#333333]">Ringkasan Order</h1>
      </div>

      <form onSubmit={handleOrder} className="p-5 space-y-6 max-w-lg mx-auto">
        {/* 1. INFO LOKASI (Style DARK sesuai Request sebelumnya) */}
        {/* <div className="bg-[#333333] p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-[#FF9F1C] text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wide">
             <MapPin className="w-4 h-4" /> Info Lokasi
          </h2>
          <div className="space-y-1">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider ml-1">Nomor Meja</label>
            <input 
              type="number" 
              placeholder="Contoh: 12" 
              value={meja}
              onChange={(e) => setMeja(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#9CA3AF] placeholder-gray-600 text-[#1F2937] font-bold text-lg outline-none focus:ring-2 focus:ring-[#FF9F1C] transition-all"
            />
            <p className="text-gray-500 text-[10px] italic ml-1 mt-1">*Kosongkan jika take away</p>
          </div>
        </div> */}

        {/* 2. RINGKASAN PESANAN (Style WHITE CARD sesuai Gambar Mobile App) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-[#2D3E50] mb-4">Pesanan</h3>

          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id_menu} className="flex items-center gap-4">
                {/* GAMBAR PRODUK (BULAT) */}
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={getImageUrl(item.foto_url)}
                    alt={item.nama_menu}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* DETAIL TEKS */}
                <div className="flex-1">
                  <h4 className="font-bold text-[#2D3E50] text-base">
                    {item.nama_menu}
                  </h4>
                  <p className="text-[#2D3E50] text-sm font-medium">
                    {Number(item.harga).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">
                    {item.note
                      ? `Note: ${item.note}`
                      : "Strong, bold, aromatic"}
                  </p>
                </div>

                {/* JUMLAH (LINGKARAN) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-red-500 font-bold">
                    Jumlah
                  </span>
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                    {item.qty}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-gray-100"></div>

          {/* PEMBAYARAN */}
          <h3 className="font-bold text-lg text-[#2D3E50] mb-4">Pembayaran</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>Total Item</span>
              <span className="text-[#2D3E50]">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>Pajak</span>
              <span className="text-[#2D3E50]">Rp 0</span>
              {/* Atau hitung pajak jika perlu: totalPrice * 0.1 */}
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
              <span className="font-bold text-[#2D3E50] text-base">
                Total Pembayaran
              </span>
              <span className="font-black text-xl text-[#2D3E50]">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* TOMBOL BAYAR (Sticky Bottom Merah) */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#FFFBF2] border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30">
          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-lg mx-auto bg-[#D32F2F] hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>Lanjutkan Order</span>
            <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
