import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLeaves } from '../hooks/useLeaves';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats } = useLeaves();

  const pendingCount = stats?.pendingRequests || stats?.pendingCount || 0;

  return (
    <div className="app-layout">
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-content-wrapper">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pendingCount={pendingCount}
        />
        <main className="layout-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
