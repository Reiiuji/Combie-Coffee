'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { useCart } from '@/context/CartContext'; 
import { 
  Home, ShoppingBag, Search, Menu, Plus, 
  Star
} from 'lucide-react'; // Hapus Heart dari import jika tidak dipakai

export default function CustomerMenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Coffee');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { addToCart, totalQty } = useCart();

  useEffect(() => {
    async function fetchMenus() {
      try {
        const res = await fetch('/api/customer/menu');
        const result = await res.json();
        if (result.success) setMenus(result.data);
      } catch (error) {
        console.error("Gagal ambil menu:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  // Filter Menu untuk List Bawah
  const filteredMenus = menus.filter(item => {
    const dbCat = item.kategori ? item.kategori.toLowerCase() : '';
    if (activeCategory === 'Coffee') return dbCat === 'coffee';
    if (activeCategory === 'Non Coffee') return dbCat === 'noncoffee' || dbCat === 'tea';
    if (activeCategory === 'Snack') return dbCat === 'food' || dbCat === 'snack';
    return false;
  });

  // Ambil 5 menu teratas (karena API sudah sort by penjualan terbanyak)
  const bestSellerMenus = menus.slice(0, 5); 

  const getImageUrl = (path) => {
    if (!path) return '/images/landing-coffee.jpg';
    return path.startsWith('/') ? path : `/images/${path}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans relative overflow-x-hidden text-[#4A4A4A]">
      
      {/* ================= BAGIAN ATAS (BACKGROUND KREM) ================= */}
      <div className="bg-[#FFFBF2] pb-10 rounded-b-[30px]">
        
        {/* HEADER */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#FFFBF2]/90 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white shadow-sm">
             <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.src='https://placehold.co/40x40?text=CC'} />
          </div>

          <div className="flex items-center gap-5">
             <Link href="/customer/menu"><Home className="w-6 h-6 text-[#FF4D4D]" /></Link>
             
             <Link href="/customer/cart" className="relative">
               <ShoppingBag className="w-6 h-6 text-gray-800" />
               {totalQty > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                   {totalQty}
                 </span>
               )}
             </Link>

             <Link href="/customer/search">
                <Search className="w-6 h-6 text-gray-800" />
             </Link>
             
             <button onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6 text-gray-800" /></button>
          </div>
        </header>

        {/* HERO IMAGE */}
        <div className="relative w-full h-[320px] pt-20">
           <div className="w-full h-full px-4">
             <div className="w-full h-full rounded-3xl overflow-hidden shadow-md relative">
                <img src="/images/Menu_Page.png" alt="Hero" className="w-full h-full object-cover" />
             </div>
           </div>
           
           {/* KARTU INFO */}
           <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-[85%] bg-white rounded-2xl shadow-xl p-5 text-center z-10">
              <h1 className="text-xl font-bold text-[#2D3E50]">COMBI Coffee</h1>
              <p className="text-[11px] text-gray-500 mt-1 px-4 leading-tight">
                Jl. Prof. Lafran Pane, Bakti Jaya,<br/> Kec. Sukmajaya, Kota Depok
              </p>
              
              <div className="flex justify-center items-center gap-4 mt-3 text-xs font-medium text-gray-600">
                 <span className="flex items-center gap-1">Open <span className="font-bold">8 am - 10 pm</span></span>
              </div>

              <div className="flex justify-center items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                     <Star className="w-3 h-3 fill-orange-500" /> 5.0
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                     <div className="w-3 h-3 rounded-full border border-orange-500 flex items-center justify-center text-[8px]">✓</div> Verified
                  </div>
              </div>
           </div>
        </div>

        <div className="h-20"></div>

        {/* TEXT SELAMAT DATANG */}
        <div className="px-6 mt-4">
           <h2 className="text-2xl font-bold text-[#2D3E50]">Selamat Datang</h2>
           <p className="text-sm text-gray-400">Lagi cari apa?</p>
        </div>

        {/* BEST SELLER MENU (HORIZONTAL) */}
        <div className="px-6 mt-6">
           <div className="flex justify-between items-end mb-4">
              {/* UBAH JUDUL JADI BEST SELLER */}
              <h3 className="text-lg font-bold text-[#2D3E50]">Best Seller</h3>
              
              {/* UBAH LINK KE HALAMAN SEARCH */}
              <Link href="/customer/search" className="text-[#FF4D4D] text-xs font-bold mb-1">See all</Link>
           </div>

           <div className="flex overflow-x-auto pb-8 gap-5 pt-12 -mt-10 scrollbar-hide px-2">
              {bestSellerMenus.map((item, idx) => (
                 <div key={idx} className="relative min-w-[160px] bg-white rounded-2xl shadow-sm p-4 pt-12 flex-shrink-0 mt-8">
                    {/* Foto Bulat Keluar */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-50">
                       <img src={getImageUrl(item.foto_url)} alt={item.nama_menu} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* GANTI BUTTON LOVE JADI ADD TO CART (+) */}
                    <button 
                        onClick={() => addToCart(item)}
                        disabled={item.status_ketersediaan === 'habis'}
                        className="absolute top-2 right-2 bg-[#D32F2F] hover:bg-red-700 disabled:bg-gray-300 text-white p-1.5 rounded-full z-20 shadow-md active:scale-95 transition-all"
                    >
                       <Plus className="w-4 h-4" />
                    </button>

                    <h4 className="font-bold text-[#2D3E50] text-sm mt-4 truncate text-center">{item.nama_menu}</h4>
                    <p className="text-[10px] text-gray-400 text-center mb-3 truncate">Creamy, smooth</p>
                    
                    <div className="flex justify-between items-center">
                       <span className="font-bold text-[#2D3E50] text-sm">{Number(item.harga).toLocaleString('id-ID')}</span>
                       
                       {/* Badge Stok */}
                       {item.status_ketersediaan === 'habis' ? (
                          <span className="bg-gray-200 text-gray-500 text-[9px] px-2 py-1 rounded-md font-bold">
                            Habis
                          </span>
                       ) : (
                          <span className="bg-green-500 text-white text-[9px] px-2 py-1 rounded-md font-bold">
                            Tersedia
                          </span>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>


      {/* ================= BAGIAN BAWAH (BACKGROUND PUTIH) ================= */}
      <div className="bg-white pt-2 pb-24">
        
        {/* TABS KATEGORI */}
        <div className="px-6 sticky top-[70px] z-30 bg-white pt-2">
           <div className="flex gap-8 border-b border-gray-100 pb-0">
              {['Coffee', 'Non Coffee', 'Snack'].map((cat) => (
                 <button 
                   key={cat} 
                   onClick={() => setActiveCategory(cat)} 
                   className={`pb-3 text-sm font-bold relative transition-colors ${
                      activeCategory === cat ? 'text-[#2D3E50]' : 'text-gray-400'
                   }`}
                 >
                    {cat}
                    {activeCategory === cat && (
                       <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#FF4D4D] rounded-full"></span>
                    )}
                 </button>
              ))}
           </div>
        </div>

        {/* LIST MENU VERTIKAL */}
        <div className="px-6 mt-6 space-y-8">
           {loading ? (
              <p className="text-center text-gray-400 mt-10">Memuat menu...</p>
           ) : filteredMenus.map((item) => (
              <div key={item.id_menu} className="flex gap-4 relative">
                 <div className="w-20 h-20 rounded-full overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 bg-white">
                    <img src={getImageUrl(item.foto_url)} alt={item.nama_menu} className="w-full h-full object-cover" />
                 </div>

                 <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-[#2D3E50] text-base">{item.nama_menu}</h4>
                       {/* Hapus love icon di sini juga jika tidak dipakai */}
                    </div>
                    
                    <p className="text-[#2D3E50] text-sm font-medium mt-0.5">{Number(item.harga).toLocaleString('id-ID')}</p>
                    <p className="text-[11px] text-gray-400 mt-1 truncate">Strong, bold, aromatic</p>
                    
                    <div className="flex justify-between items-center mt-2">
                       {/* Badge Stok */}
                       {item.status_ketersediaan === 'habis' ? (
                          <span className="bg-gray-200 text-gray-500 text-[9px] px-2 py-0.5 rounded-sm font-bold">Habis</span>
                       ) : (
                          <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-sm font-bold">Tersedia</span>
                       )}

                       {/* Tombol Add Merah */}
                       <button 
                          onClick={() => addToCart(item)}
                          disabled={item.status_ketersediaan === 'habis'}
                          className="bg-[#D32F2F] hover:bg-red-700 text-white flex items-center gap-1 px-4 py-1.5 rounded-md text-[10px] font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                       >
                          <Plus className="w-3 h-3" /> Add
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* SIDEBAR NAVIGATION */}
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