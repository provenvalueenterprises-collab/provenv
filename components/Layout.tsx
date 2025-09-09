import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  Wallet,
  CreditCard,
  Receipt,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Shield,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Enhanced responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const desktop = width >= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else if (tablet) {
        setSidebarOpen(false);
        setSidebarCollapsed(true);
      } else if (desktop) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: TrendingUp, label: 'My Thrifts', path: '/my-thrifts', badge: 3 },
    { icon: Wallet, label: 'Transactions', path: '/wallet-transactions', badge: null },
    { icon: Plus, label: 'Add Thrift', path: '/add-thrift', badge: null },
    { icon: FileText, label: 'Plans', path: '/plans', badge: null },
    { icon: CreditCard, label: 'Fund Wallet', path: '/fund-wallet', badge: null },
    { icon: User, label: 'Profile', path: '/profile', badge: null },
  ];

  if (session?.user?.role === 'admin') {
    menuItems.splice(1, 0, { icon: Shield, label: 'Admin Panel', path: '/admin', badge: null });
  }

  const currentPage = menuItems.find(item => item.path === router.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 
          bg-white/95 backdrop-blur-xl shadow-2xl
          transition-all duration-300 ease-out
          border-r border-gray-200/50
          ${isMobile 
            ? `w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : isTablet 
              ? `${sidebarCollapsed ? 'w-16' : 'w-64'} translate-x-0`
              : `${sidebarCollapsed ? 'w-16' : 'w-64'} translate-x-0`
          }
        `}
      >
        
        {/* Header */}
        <div className="relative h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 bg-gradient-to-r from-blue-600 to-purple-700">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg lg:text-xl">🎯</span>
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="text-white">
                <h1 className="font-bold text-lg lg:text-xl truncate">ProVenv</h1>
                <p className="text-white/80 text-xs hidden lg:block">Wealth Platform</p>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Desktop Toggle */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* User Info */}
        {(!sidebarCollapsed || isMobile) && (
          <div className="p-4 lg:p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-sm lg:text-base">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm lg:text-base truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-gray-500 text-xs lg:text-sm truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 overflow-y-auto">
          <div className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group flex items-center rounded-xl transition-all duration-200
                    ${sidebarCollapsed && !isMobile ? 'p-3 justify-center' : 'p-3 lg:p-4'}
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                    }
                  `}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <div className="relative">
                    <item.icon className={`
                      h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:scale-110
                      ${sidebarCollapsed && !isMobile ? '' : 'mr-3 lg:mr-4'}
                    `} />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {(!sidebarCollapsed || isMobile) && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium text-sm lg:text-base">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && !isMobile && (
                    <div className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className={`
              w-full group flex items-center rounded-xl transition-all duration-200
              ${sidebarCollapsed && !isMobile ? 'p-3 justify-center' : 'p-3 lg:p-4'}
              text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-md
            `}
          >
            <LogOut className={`
              h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:scale-110
              ${sidebarCollapsed && !isMobile ? '' : 'mr-3 lg:mr-4'}
            `} />
            {(!sidebarCollapsed || isMobile) && (
              <span className="font-medium text-sm lg:text-base">Logout</span>
            )}

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && !isMobile && (
              <div className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                Logout
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200/50 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                {currentPage?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-20 items-center justify-between px-6 xl:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">
              {currentPage?.label || 'Dashboard'}
            </h1>
            {currentPage?.badge && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                {currentPage.badge} active
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;