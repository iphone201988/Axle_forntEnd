import { useState, useMemo } from "react";
import { Users, UserPlus, Activity, DollarSign, Eye, MessageCircle, User, Search, X, Calendar, Phone, Mail, ChevronLeft, ChevronRight, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { customers } from "@/data/dummyData";
import { CustomerRecord } from "@/types";

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const ITEMS_PER_PAGE = 8;

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [spendingFilter, setSpendingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
      
      let matchesSpending = true;
      if (spendingFilter !== "all") {
        if (spendingFilter === "$0-$50") {
          matchesSpending = customer.totalSpending <= 50;
        } else if (spendingFilter === "$50-$200") {
          matchesSpending = customer.totalSpending > 50 && customer.totalSpending <= 200;
        } else if (spendingFilter === "$200-$500") {
          matchesSpending = customer.totalSpending > 200 && customer.totalSpending <= 500;
        } else if (spendingFilter === "$500-$1000") {
          matchesSpending = customer.totalSpending > 500 && customer.totalSpending <= 1000;
        } else if (spendingFilter === "$1000+") {
          matchesSpending = customer.totalSpending > 1000;
        }
      }
      
      let matchesRegistration = true;
      if (registrationFilter !== "all") {
        const registrationDate = new Date(customer.registrationDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 3600 * 24));
        
        if (registrationFilter === "30days") {
          matchesRegistration = daysDiff <= 30;
        } else if (registrationFilter === "3months") {
          matchesRegistration = daysDiff <= 90;
        } else if (registrationFilter === "6months") {
          matchesRegistration = daysDiff <= 180;
        } else if (registrationFilter === "1year") {
          matchesRegistration = daysDiff <= 365;
        }
      }
      
      return matchesSearch && matchesStatus && matchesSpending && matchesRegistration;
    });
  }, [searchTerm, registrationFilter, statusFilter, spendingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0);
    const avgSpending = totalRevenue / total || 0;
    const totalBookings = customers.reduce((sum, c) => sum + c.totalBookings, 0);
    
    // New customers this month
    const now = new Date();
    const thisMonth = customers.filter(c => {
      const regDate = new Date(c.registrationDate);
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length;
    
    return {
      total,
      active,
      inactive,
      thisMonth,
      totalRevenue,
      avgSpending,
      totalBookings
    };
  }, []);

  const handleViewCustomer = (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRegistrationFilter("all");
    setStatusFilter("all");
    setSpendingFilter("all");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSpendingCategory = (amount: number) => {
    if (amount <= 50) return { label: "Low Spender", color: "bg-gray-100 text-gray-800" };
    if (amount <= 500) return { label: "Regular", color: "bg-blue-100 text-blue-800" };
    if (amount <= 1000) return { label: "Premium", color: "bg-purple-100 text-purple-800" };
    return { label: "VIP", color: "bg-gold-100 text-gold-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">View and manage customer profiles and activity</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Spending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.avgSpending.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search customers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Registration Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Spending Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="$0-$50">$0 - $50</SelectItem>
                  <SelectItem value="$50-$200">$50 - $200</SelectItem>
                  <SelectItem value="$200-$500">$200 - $500</SelectItem>
                  <SelectItem value="$500-$1000">$500 - $1,000</SelectItem>
                  <SelectItem value="$1000+">$1,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
        </p>
        {(searchTerm || registrationFilter !== "all" || statusFilter !== "all" || spendingFilter !== "all") && (
          <Badge variant="outline">
            {filteredCustomers.length} filtered results
          </Badge>
        )}
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedCustomers.map((customer) => {
          const spendingCategory = getSpendingCategory(customer.totalSpending);
          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Customer Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-base font-medium">
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{customer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={statusColors[customer.status]}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={spendingCategory.color}>
                      {spendingCategory.label}
                    </Badge>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Registered</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(customer.registrationDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.totalBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Spending</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${customer.totalSpending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Activity</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.lastActivity}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <Separator className="mb-4" />
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No customers found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || registrationFilter !== "all" || statusFilter !== "all" || spendingFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No customers have registered yet."}
            </p>
            {(searchTerm || registrationFilter !== "all" || statusFilter !== "all" || spendingFilter !== "all") && (
              <Button variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-medium">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Customer since {formatDate(selectedCustomer.registrationDate)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={statusColors[selectedCustomer.status]}>
                      {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getSpendingCategory(selectedCustomer.totalSpending).color}>
                      {getSpendingCategory(selectedCustomer.totalSpending).label}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Activity Summary */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total Bookings</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Total Spending</p>
                        <p className="text-2xl font-bold text-green-600">${selectedCustomer.totalSpending.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Avg per Booking</p>
                        <p className="text-2xl font-bold text-purple-600">
                          ${selectedCustomer.totalBookings > 0 ? (selectedCustomer.totalSpending / selectedCustomer.totalBookings).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">Last Activity</p>
                        <p className="text-lg font-semibold text-orange-600">{selectedCustomer.lastActivity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Registration Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Registration Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Registration Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedCustomer.registrationDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer ID</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">#{selectedCustomer.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}