import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutProps {
  children: ReactNode;
  title: string;
  user?: any;
  onLogout: () => void;
}

export default function Layout({ children, title, user, onLogout }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && isMobile) {
        const target = event.target as Element;
        if (!target.closest('[data-sidebar]') && !target.closest('[data-mobile-menu-button]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        data-sidebar
        className={`
          ${isMobile ? (
            isMobileMenuOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
          ) : 'translate-x-0'}
          ${isMobile ? 'fixed z-50' : 'relative'}
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar 
          isCollapsed={!isMobile && isSidebarCollapsed} 
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
        isMobile ? 'w-full' : (isSidebarCollapsed ? 'ml-0' : 'ml-0')
      }`}>
        <TopBar 
          title={title} 
          onMobileMenuToggle={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
          user={user}
          onLogout={onLogout}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
