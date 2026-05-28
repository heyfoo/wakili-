import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import HarvesterFooter from '@/components/HarvesterFooter';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      <HarvesterFooter />
    </div>
  );
}
