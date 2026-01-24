'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react'; // Hapus Eye dari import
import Link from 'next/link';

export default function RolePage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (json.success) setAdmins(json.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const res = await fetch(`/api/admin/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAdmins();
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="w-full">
      {/* HEADER MERAH */}
      <header className="bg-[#A04040] w-full h-16 flex items-center justify-end px-8 shadow-sm text-white font-semibold text-sm">
        Halo, Owner
      </header>

      <div className="p-8">
        {/* JUDUL */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-[#A04040] flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Role</h1>
            <Link href="/owner/role/tambah" className="bg-[#A04040] text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#803030] transition">
               <Plus size={16} /> Tambah Data
            </Link>
        </div>

        {/* TABEL */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
           <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4 font-bold text-[#A04040] text-sm text-center w-16">No</th>
                    <th className="px-6 py-4 font-bold text-[#A04040] text-sm">Email</th>
                    <th className="px-6 py-4 font-bold text-[#A04040] text-sm">Password</th>
                    <th className="px-6 py-4 font-bold text-[#A04040] text-sm text-center">Role</th>
                    <th className="px-6 py-4 font-bold text-[#A04040] text-sm text-right">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {loading ? (
                   <tr><td colSpan="5" className="p-6 text-center text-gray-400">Memuat data...</td></tr>
                 ) : admins.map((item, index) => (
                   <tr key={item.id_admin} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{item.username}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono tracking-wider">{item.password_hash}</td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-block px-4 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-bold uppercase shadow-sm">
                            {item.role}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            {/* Tombol Delete */}
                            <button onClick={() => handleDelete(item.id_admin)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow transition">
                               <Trash2 size={16} />
                            </button>
                            {/* Tombol Edit */}
                            <Link href={`/owner/role/edit/${item.id_admin}`} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded shadow transition">
                               <Edit size={16} />
                            </Link>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}