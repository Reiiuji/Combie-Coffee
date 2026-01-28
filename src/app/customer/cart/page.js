"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Home,
  ShoppingBag,
  Search,
  Menu,
  ChevronLeft,
  Trash2,
  Edit2,
  Plus,
  Minus,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cart, updateCartItem, removeFromCart, totalPrice, totalQty } =
    useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    // Saat pindah ke checkout, data 'cart' di Context sudah membawa 'note'
    router.push("/customer/checkout");
  };

  const getImageUrl = (path) => {
    if (!path) return "/images/landing-coffee.jpg";
    // Jika path sudah merupakan URL lengkap (Cloudinary), gunakan langsung
    if (path.startsWith("http")) return path;
    // Jika path lokal diawali slash
    if (path.startsWith("/")) return path;
    // Jika path lokal tanpa slash (misal nama file saja)
    return `/images/${path}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] pb-32 font-sans relative">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#FFFBF2]/90 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white shadow-sm">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-full h-full object-cover"
            onError={(e) =>
              (e.target.src = "https://placehold.co/40x40?text=CC")
            }
          />
        </div>

        <div className="flex items-center gap-5">
          <Link href="/customer/menu" className="relative">
            <Home className="w-6 h-6 text-gray-800" />
          </Link>

          <Link href="/customer/cart" className="relative">
            <ShoppingBag className="w-6 h-6 text-[#FF4D4D]" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                {totalQty}
              </span>
            )}
          </Link>

          <Link href="/customer/search" className="relative">
            <Search className="w-6 h-6 text-gray-800" />
          </Link>

          <button onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6 text-gray-800" /></button>
        </div>
      </header>

      {/* TITLE */}
      <div className="pt-20 px-5 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <h1 className="px-5 mt-4 text-2xl font-bold text-gray-800">Keranjang</h1>

      {/* LIST PESANAN */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Pesanan</h2>
            <Link
              href="/customer/menu"
              className="text-red-500 text-sm font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Tambah Item
            </Link>
          </div>

          <div className="space-y-8">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <p>Keranjang kosong.</p>
                <Link
                  href="/customer/menu"
                  className="text-red-500 text-sm underline mt-2 inline-block"
                >
                  Pesan sesuatu yuk!
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id_menu} className="relative">
                  <div className="flex gap-4">
                    {/* Gambar */}
                    <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={getImageUrl(item.foto_url)}
                        alt={item.nama_menu}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 pr-8">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {item.nama_menu}
                      </h3>
                      <p className="text-gray-500 text-sm font-semibold mt-1">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Hapus */}
                    <button
                      onClick={() => removeFromCart(item.id_menu)}
                      className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* QTY Control */}
                  <div className="flex justify-end items-center gap-3 mt-4">
                    <button className="text-red-500">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateCartItem(item.id_menu, "minus")}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-l-md hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center bg-gray-50 border-y border-gray-200 text-gray-800 font-bold text-sm">
                        {item.qty}
                      </div>
                      <button
                        onClick={() => updateCartItem(item.id_menu, "plus")}
                        className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-r-md hover:bg-red-700 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* --- INPUT CATATAN --- */}
                  <div className="mt-3">
                    <label className="text-gray-500 text-xs font-semibold mb-1 block">
                      Catatan (Less sugar, dll):
                    </label>
                    <textarea
                      value={item.note || ""} // Mengambil dari state Context
                      onChange={(e) =>
                        updateCartItem(item.id_menu, "note", e.target.value)
                      } // Mengirim update ke Context
                      className="w-full bg-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none h-16"
                      placeholder="Contoh: Jangan pakai susu..."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* sidebar navigation */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-[70] shadow-2xl transform transition-transform duration-300 p-6 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-lg text-[#2D3E50]">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <span className="text-xl">✕</span>
            </button>
         </div>
         <div className="space-y-4">
            <Link href="/login-admin" className="block text-gray-600 hover:text-[#FF4D4D] font-medium p-2 hover:bg-gray-50 rounded-lg">Login Admin</Link>
            <Link href="/customer/status" className="block text-gray-600 hover:text-[#FF4D4D] font-medium p-2 hover:bg-gray-50 rounded-lg">Cek Pesanan</Link>
         </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100 z-30">
        <button
          onClick={handleCheckout}
          className="w-full bg-[#D12B2B] hover:bg-red-700 text-white rounded-xl py-4 px-6 flex justify-between items-center shadow-lg active:scale-[0.99] transition-transform"
        >
          <span className="font-bold text-lg">Lanjutkan Order</span>
          <span className="font-bold text-lg">
            Rp {totalPrice.toLocaleString("id-ID")}
          </span>
        </button>
      </div>
    </div>
  );
}