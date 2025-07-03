import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout/Layout";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout title="Dashboard"><Dashboard /></Layout>} />
      <Route path="/providers" component={() => <Layout title="Service Providers"><ServiceProviders /></Layout>} />
      <Route path="/bookings" component={() => <Layout title="Bookings Management"><Bookings /></Layout>} />
      <Route path="/customers" component={() => <Layout title="Customer Management"><Customers /></Layout>} />
      <Route path="/payments" component={() => <Layout title="Payments"><Payments /></Layout>} />
      <Route path="/reviews" component={() => <Layout title="Reviews & Ratings"><Reviews /></Layout>} />
      <Route path="/support" component={() => <Layout title="Support Tickets"><Support /></Layout>} />
      <Route path="/categories" component={() => <Layout title="Service Categories"><Categories /></Layout>} />
      <Route path="/settings" component={() => <Layout title="Settings"><Settings /></Layout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
