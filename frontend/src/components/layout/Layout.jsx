import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { ToastContainer } from '../common/Toast';
import { OrderModal } from '../trading/OrderModal';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F3F6FC] dark:bg-[#101114] text-[#172033] dark:text-[#F4F6FC] flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Navbar */}
      <AppNavbar />

      {/* Main Page Workspace */}
      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Global Interactive Trading Pad Modal */}
      <OrderModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
