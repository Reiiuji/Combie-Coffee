"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; 
import { Edit, Trash2 } from 'lucide-react';

// MAPPING KATEGORI (Food -> Snack)
const kategoriMap = {
  coffee: "Coffee",
  tea: "Tea",
  noncoffee: "Non Coffee",
  food: "Snack", // <-- Update di sini
  other: "Lainnya",
};

export default function MenuTableClient({ searchTerm }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchMenus() {
      try {
        const res = await fetch("/api/admin/menu");
        const data = await res.json();
        if (data.success || data.ok) {
          setMenus(data.data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success || result.ok) {
        setMenus(prev => prev.filter(m => m.id_menu !== id));
        alert('Menu berhasil dihapus');
      } else {
        alert('Gagal menghapus');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setDeletingId(null);
    }
  };

  const safeSearch = (searchTerm || "").toLowerCase();
  const filteredMenus = menus.filter(item => 
    (item.nama_menu || "").toLowerCase().includes(safeSearch)
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-center border-collapse">
        <thead className="bg-[#F2E8E8] border-b-2 border-[#D9B5B5]">
          <tr>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">No</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">Gambar</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">Nama</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">Keterangan</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">Jenis</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#D9B5B5]">Status Shot</th>
            <th className="px-4 py-4 text-sm font-bold text-[#8B4545]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredMenus.length === 0 ? (
            <tr><td colSpan="7" className="p-8 text-gray-400 italic">Data kosong</td></tr>
          ) : (
            filteredMenus.map((menu, idx) => (
              <tr key={menu.id_menu} className={`${idx % 2 === 0 ? 'bg-[#FCFBFB]' : 'bg-[#F7F3F3]'} hover:bg-orange-50`}>
                
                <td className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#E0CACA]">{idx + 1}</td>
                
                <td className="px-4 py-4 border-r border-[#E0CACA]">
                  <div className="flex justify-center">
                    <div className="h-12 w-16 overflow-hidden rounded bg-white border border-gray-200">
                      <img
                        src={
                          menu.foto_url && menu.foto_url.startsWith('http')
                            ? menu.foto_url 
                            : `/images/${menu.foto_url}`
                        }
                        alt={menu.nama_menu}
                        className="h-full w-full object-cover"
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = '/images/placeholder.jpg'; 
                        }}
                      />
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#E0CACA]">
                  {menu.nama_menu}
                </td>
                
                <td className="px-4 py-4 text-xs text-[#8B4545] border-r border-[#E0CACA] max-w-[180px]">
                  <div className="line-clamp-2">{menu.deskripsi || '-'}</div>
                </td>
                
                <td className="px-4 py-4 text-sm font-bold text-[#8B4545] border-r border-[#E0CACA]">
                   {kategoriMap[menu.kategori] || menu.kategori}
                </td>
                
                <td className="px-4 py-4 border-r border-[#E0CACA]">
                   {menu.status_ketersediaan === 'ready' ? (
                     <span className="bg-[#00E676] text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase shadow-sm">
                       Tersedia
                     </span>
                   ) : (
                     <span className="bg-[#FF5252] text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase shadow-sm">
                       Tidak Tersedia
                     </span>
                   )}
                </td>
                
                <td className="px-4 py-4">
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => handleDelete(menu.id_menu)}
                      disabled={deletingId === menu.id_menu}
                      className="bg-[#FF5252] hover:bg-[#e74c3c] text-white p-1.5 rounded shadow-sm transition disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>

                    <Link 
                      href={`/admin/menu/edit/${menu.id_menu}`}
                      className="bg-[#5C6BC0] hover:bg-[#3f51b5] text-white p-1.5 rounded shadow-sm transition"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}