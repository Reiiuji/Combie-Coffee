'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, Utensils, ShoppingCart, FileText, Lock, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'Menu', path: '/admin/menu', icon: Utensils },
  { name: 'Laporan', path: '/admin/laporan', icon: FileText },
  { name: 'Ganti Password', path: '/admin/password', icon: Lock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol Modal Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Logika logout (hapus cookie/session jika ada)
    router.push('/');
  };

  return (
    <>
      {/* ID 'admin-sidebar' ini KUNCI agar CSS bisa menyembunyikannya saat print */}
      <div id="admin-sidebar" className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b flex items-center justify-center">
           <h1 className="text-xl font-extrabold text-gray-700 uppercase tracking-wider">
             ADMIN PANEL
           </h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto mt-4">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all font-medium ${
                      isActive 
                        ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* Tombol Logout */}
            <li>
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all scale-100">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Anda Yakin Ingin Keluar?
            </h2>

            <div className="flex justify-center gap-4">
              <button 
                onClick={handleLogout}
                className="bg-orange-400 hover:bg-orange-500 text-white px-10 py-3 rounded-lg font-bold text-lg shadow-md transition-colors w-36"
              >
                Ya
              </button>

              <button 
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-md transition-colors w-36"
              >
                Kembali
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}