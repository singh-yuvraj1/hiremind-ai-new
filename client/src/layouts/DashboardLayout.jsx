import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

/**
 * DashboardLayout — wraps all authenticated pages with sidebar + navbar.
 * Interview and MockTest pages bypass this layout (full-screen for anti-cheat).
 */
export default function DashboardLayout({ children, title = '', showFooter = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen t-bg flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Navbar (with hamburger for mobile sidebar) */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 pt-16"> {/* pt-16 = navbar height */}
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {title && (
              <h1 className="font-display font-bold text-2xl t-text mb-6">{title}</h1>
            )}
            {children}
          </div>
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}
