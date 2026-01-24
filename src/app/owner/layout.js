// Pastikan import sesuai nama file baru yang sudah direname
import SidebarOwner from './components/SidebarOwner'; 

export const metadata = {
  title: 'Owner Dashboard',
};

export default function OwnerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F4F7FE]">
      {/* Panggil Sidebar */}
      <SidebarOwner />
      
      {/* Main Content:
        - ml-64: Memberi ruang untuk sidebar (lebar 64)
        - relative: Agar positioning child element aman
        - PENTING: Jangan kasih padding (p-8) disini agar Header Merah bisa full-width.
          Padding konten nanti ditaruh di dalam page.js saja.
      */}
      <main className="flex-1 ml-64 relative font-sans">
        {children}
      </main>
    </div>
  );
}