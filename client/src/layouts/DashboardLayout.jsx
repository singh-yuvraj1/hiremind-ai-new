import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

/**
 * DashboardLayout — wraps all authenticated pages with sidebar + navbar.
 * Interview and MockTest pages bypass this layout (full-screen for anti-cheat).
 */
export default function DashboardLayout({ children, showFooter = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex" style={{ paddingTop: 'var(--nav-h, 60px)' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="page-content">
            {children}
          </div>
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
