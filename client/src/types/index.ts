export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeProviders: number;
  totalCustomers: number;
}

export interface RecentBooking {
  id: string;
  service: string;
  customer: string;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  time: string;
  icon: string;
}

export interface TopProvider {
  id: string;
  name: string;
  initials: string;
  rating: number;
  category: string;
  earnings: number;
  bgColor: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  experience: number;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  status: 'active' | 'inactive' | 'pending';
  initials: string;
  bgColor: string;
}

export interface BookingRecord {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  service: {
    name: string;
    description: string;
  };
  provider: {
    name: string;
    phone: string;
  } | null;
  date: string;
  time: string;
  amount: number;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalBookings: number;
  totalSpending: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  customer: string;
  provider: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  date: string;
}

export interface ReviewRecord {
  id: string;
  customer: string;
  provider: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SupportTicketRecord {
  id: string;
  user: string;
  userType: 'customer' | 'provider';
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  date: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  providerCount: number;
  isActive: boolean;
}
