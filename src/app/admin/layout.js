import AdminSidebar from '@/app/admin/components/AdminSidebar';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* ID 'admin-main' ini KUNCI agar CSS bisa mereset margin saat print */}
      <main id="admin-main" className="flex-1 ml-64 relative font-sans">
        {children}
      </main>
    </div>
  );
}