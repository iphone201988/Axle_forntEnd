import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  CreditCard, 
  Star, 
  HelpCircle, 
  Grid3X3, 
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "providers", label: "Service Providers", icon: Users, path: "/providers" },
  { id: "bookings", label: "Bookings", icon: Calendar, path: "/bookings" },
  { id: "customers", label: "Customers", icon: UserCheck, path: "/customers" },
  { id: "payments", label: "Payments", icon: CreditCard, path: "/payments" },
  { id: "reviews", label: "Reviews & Ratings", icon: Star, path: "/reviews" },
  { id: "support", label: "Support Tickets", icon: HelpCircle, path: "/support" },
  { id: "categories", label: "Service Categories", icon: Grid3X3, path: "/categories" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="ml-3 text-xl font-semibold text-gray-900 transition-opacity duration-200">
                  Axle
                </h1>
              )}
            </div>
            <button
              onClick={onToggle}
              className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.id} href={item.path}>
                  <div
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <span className="transition-opacity duration-200">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Collapse indicator */}
          {isCollapsed && (
            <div className="hidden md:flex items-center justify-center py-4 border-t border-gray-200">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
  );
}
