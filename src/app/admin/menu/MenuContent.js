'use client';

import { useState } from 'react';
import Link from "next/link";
import { Plus, Search } from 'lucide-react';
import MenuTableClient from "./MenuTableClient"; 

export default function MenuContent() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#2c2c2c] font-sans flex flex-col">
      {/* 1. Header Orange */}
      <header className="bg-[#F0AD6D] px-8 py-5 text-white shadow-sm flex justify-between items-center">
        <div /> 
        <div className="text-sm font-bold tracking-wide">Halo, Admin</div>
      </header>

      <main className="flex-1 px-8 py-8">
        
        {/* 2. Judul Halaman */}
        <h1 className="text-2xl font-bold text-black mb-6 border-b-2 border-transparent pb-2 inline-block">
          Daftar Menu
        </h1>

        {/* 3. Area Tombol & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          
          {/* Tombol Tambah Data (Warna Coklat/Orange sesuai gambar) */}
          <Link
            href="/admin/menu/add"
            className="bg-[#E6A05B] hover:bg-[#d68c45] text-white font-medium px-6 py-2 rounded shadow-sm text-sm transition-colors"
          >
            Tambah Data
          </Link>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
             <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-sm bg-white"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* 4. Tabel */}
        <div className="bg-white border-t-4 border-[#F0AD6D] shadow-sm">
          <MenuTableClient searchTerm={searchTerm} />
        </div>

      </main>

      {/* Footer Copyright */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 mt-auto bg-gray-50">
        Copyright 2026 Design By Kelompok8-3KA01 <span className="float-right mr-8">2.3.0</span>
      </footer>
    </div>
  );
}