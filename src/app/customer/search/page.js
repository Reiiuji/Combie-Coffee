"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  Home,
  ShoppingBag,
  Search,
  Menu,
  Heart,
  Plus,
  Minus,
  Edit2,
} from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, cart, updateCartItem, totalQty } = useCart();

  // State
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // Keyword ambil dari URL atau string kosong
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
   
  // Kategori default All
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("cat") || "All"
  );
   
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. FETCH DATA (Hanya berdasarkan Keyword)
  useEffect(() => {
    async function fetchSearch() {
      setLoading(true);
      try {
        const res = await fetch(`/api/customer/menu?q=${keyword}`);
        const result = await res.json();
        
        if (result.success) {
            setMenus(result.data);
        } else {
            setMenus([]);
        }
      } catch (error) {
        console.error("Gagal cari menu:", error);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    }
    // Debounce sedikit biar ga spam API kalau ngetik cepet
    const timeoutId = setTimeout(() => {
        fetchSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword]); 

  // 2. LOGIKA FILTER FRONTEND
  const filteredMenus = menus.filter((item) => {
    if (activeCategory === "All") return true;

    const dbCat = item.kategori ? item.kategori.toLowerCase() : "";

    if (activeCategory === "Coffee") return dbCat === "coffee";
    if (activeCategory === "Non Coffee") return dbCat === "noncoffee" || dbCat === "tea";
    if (activeCategory === "Snack") return dbCat === "snack" || dbCat === "food";
    
    return false;
  });

  // --- PERBAIKAN LOGIC GAMBAR (SUPAYA CLOUDINARY BISA MUNCUL) ---
  const getImageUrl = (path) => {
    if (!path) return "/images/landing-coffee.jpg";
    
    // 1. Jika link Cloudinary (http...), pakai langsung
    if (path.startsWith("http")) return path;
    
    // 2. Jika path lokal absolut
    if (path.startsWith("/")) return path;
    
    // 3. Sisanya dianggap file lokal di folder /images/
    return `/images/${path}`;
  };

  const getCartItem = (id) => cart.find((item) => item.id_menu === id);

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
            <ShoppingBag className="w-6 h-6 text-gray-800" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                {totalQty}
              </span>
            )}
          </Link>

          <Link href="/customer/search">
            <Search className="w-6 h-6 text-[#FF4D4D]" />
          </Link>

          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </header>

      {/* SEARCH BAR & BACK */}
      <div className="pt-20 px-5 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-lg shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari kopi favoritmu..."
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Coffee", "Non Coffee", "Snack"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-5 mt-6 space-y-6">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Mencari menu...</p>
        ) : filteredMenus.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            Menu tidak ditemukan.
          </p>
        ) : (
          filteredMenus.map((item) => {
            const inCart = getCartItem(item.id_menu);
            return (
              <div
                key={item.id_menu}
                className="flex bg-white p-4 rounded-2xl shadow-sm border border-gray-50 items-center gap-4 relative"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                  <img
                    src={getImageUrl(item.foto_url)}
                    alt={item.nama_menu}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src='/images/landing-coffee.jpg'}
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">
                    {item.nama_menu}
                  </h4>
                  <h5 className="font-bold text-gray-600 text-sm">
                    {Number(item.harga).toLocaleString("id-ID")}
                  </h5>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.deskripsi || "Nikmati kesegaran Combi Coffee"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button>
                    <Heart className="w-5 h-5 text-red-500 hover:fill-red-500" />
                  </button>

                  {item.status_ketersediaan === "habis" ? (
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Habis
                    </span>
                  ) : inCart ? (
                    /* QTY Control */
                    <div className="flex flex-col items-end gap-2">
                      <button className="text-red-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <button
                          onClick={() => updateCartItem(item.id_menu, "minus")}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-bold text-gray-800">
                          {inCart.qty}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id_menu, "plus")}
                          className="px-2 py-1 bg-red-600 text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Tombol Add */
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-red-600 text-white flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* STICKY FOOTER CART PREVIEW */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent z-40">
          <Link
            href="/customer/cart"
            className="w-full bg-red-600 text-white rounded-2xl py-4 px-6 flex justify-between items-center shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">
                  Total Item: {totalQty}
                </p>
                <p className="font-bold">Lihat Keranjang</p>
              </div>
            </div>
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </Link>
        </div>
      )}

      {/* SIDEBAR */}
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <SearchContent />
    </Suspense>
  );
}
