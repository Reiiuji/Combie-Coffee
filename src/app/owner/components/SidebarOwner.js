'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, FileText, Users, Lock, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/owner/dashboard', icon: Home },
  { name: 'Laporan', path: '/owner/laporan', icon: FileText },
  { name: 'Role', path: '/owner/role', icon: Users },
  { name: 'Ganti Password', path: '/owner/password', icon: Lock },
];

export default function SidebarOwner() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- UPDATE LOGIKA LOGOUT DI SINI ---
  const handleLogout = () => {
    // 1. Hapus Cookie (PENTING!)
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // 2. Hapus LocalStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    // 3. Redirect ke Login & Refresh
    router.push('/login-admin');
    router.refresh();
  };

  return (
    <>
      {/* ID 'owner-sidebar' PENTING untuk Print */}
      <div id="owner-sidebar" className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 font-sans shadow-sm">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b flex items-center justify-center">
           <h1 className="text-xl font-extrabold text-gray-700 uppercase tracking-wider">
             OWNER PANEL
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
                        ? 'bg-orange-50 text-red-600 border-l-4 border-red-600 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Anda Yakin Ingin Keluar?</h2>
            <div className="flex justify-center gap-4">
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-lg font-bold text-lg shadow-md transition-colors w-36">Ya</button>
              <button onClick={() => setShowLogoutModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-md transition-colors w-36">Kembali</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}