import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ServiceProviders from "@/pages/ServiceProviders";
import Bookings from "@/pages/Bookings";
import Customers from "@/pages/Customers";
import Payments from "@/pages/Payments";
import Reviews from "@/pages/Reviews";
import Support from "@/pages/Support";
import Categories from "@/pages/Categories";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

function AuthenticatedRouter({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <Switch>
      <Route path="/" component={() => <Layout title="Dashboard" user={user} onLogout={onLogout}><Dashboard /></Layout>} />
      <Route path="/providers" component={() => <Layout title="Service Providers" user={user} onLogout={onLogout}><ServiceProviders /></Layout>} />
      <Route path="/bookings" component={() => <Layout title="Bookings Management" user={user} onLogout={onLogout}><Bookings /></Layout>} />
      <Route path="/customers" component={() => <Layout title="Customer Management" user={user} onLogout={onLogout}><Customers /></Layout>} />
      <Route path="/payments" component={() => <Layout title="Payments" user={user} onLogout={onLogout}><Payments /></Layout>} />
      <Route path="/reviews" component={() => <Layout title="Reviews & Ratings" user={user} onLogout={onLogout}><Reviews /></Layout>} />
      <Route path="/support" component={() => <Layout title="Support Tickets" user={user} onLogout={onLogout}><Support /></Layout>} />
      <Route path="/categories" component={() => <Layout title="Service Categories" user={user} onLogout={onLogout}><Categories /></Layout>} />
      <Route path="/settings" component={() => <Layout title="Settings" user={user} onLogout={onLogout}><Settings /></Layout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data');
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AuthenticatedRouter user={user} onLogout={handleLogout} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
