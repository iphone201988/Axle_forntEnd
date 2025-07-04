import { useState, useMemo } from "react";
import { DollarSign, CreditCard, TrendingUp, AlertCircle, Download, Eye, RefreshCw, Search, X, Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { payments } from "@/data/dummyData";
import { PaymentRecord } from "@/types";

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const methodColors = {
  "Credit Card": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "PayPal": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Bank Transfer": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Digital Wallet": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const ITEMS_PER_PAGE = 8;

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Get unique payment methods for filter
  const paymentMethods = payments.reduce((acc: string[], payment) => {
    if (!acc.includes(payment.method)) {
      acc.push(payment.method);
    }
    return acc;
  }, []);

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
      
      let matchesDateRange = true;
      if (dateFromFilter && dateToFilter) {
        const paymentDate = new Date(payment.date);
        const fromDate = new Date(dateFromFilter);
        const toDate = new Date(dateToFilter);
        matchesDateRange = paymentDate >= fromDate && paymentDate <= toDate;
      } else if (dateFromFilter) {
        const paymentDate = new Date(payment.date);
        const fromDate = new Date(dateFromFilter);
        matchesDateRange = paymentDate >= fromDate;
      } else if (dateToFilter) {
        const paymentDate = new Date(payment.date);
        const toDate = new Date(dateToFilter);
        matchesDateRange = paymentDate <= toDate;
      }
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
    });
  }, [searchTerm, statusFilter, methodFilter, dateFromFilter, dateToFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const avgTransaction = totalRevenue / completed || 0;
    const successRate = ((completed / total) * 100) || 0;
    
    return {
      total,
      completed,
      pending,
      failed,
      totalRevenue,
      avgTransaction,
      successRate
    };
  }, []);

  // Filtered totals
  const filteredTotals = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedAmount = filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    return { totalAmount, completedAmount };
  }, [filteredPayments]);

  const handleViewPayment = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
  };

  const exportPayments = () => {
    const csvContent = [
      ["Transaction ID", "Customer", "Provider", "Service", "Amount", "Status", "Method", "Date"],
      ...filteredPayments.map(payment => [
        payment.transactionId,
        payment.customer,
        payment.provider,
        payment.service,
        payment.amount,
        payment.status,
        payment.method,
        payment.date
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return <CreditCard className="h-4 w-4" />;
      case 'PayPal':
        return <DollarSign className="h-4 w-4" />;
      case 'Bank Transfer':
        return <TrendingUp className="h-4 w-4" />;
      case 'Digital Wallet':
        return <Phone className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payments Management</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Track transactions, payment status, and revenue</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportPayments}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.avgTransaction.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search payments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                placeholder="From Date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
              <Input 
                type="date" 
                placeholder="To Date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Info and Total Amount */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} payments
        </p>
        <div className="flex items-center space-x-4">
          {(searchTerm || statusFilter !== "all" || methodFilter !== "all" || dateFromFilter || dateToFilter) && (
            <Badge variant="outline">
              {filteredPayments.length} filtered results
            </Badge>
          )}
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Total Amount: <span className="text-green-600">${filteredTotals.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedPayments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              {/* Payment Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    {getPaymentIcon(payment.method)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{payment.transactionId}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{payment.service}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={statusColors[payment.status]}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${payment.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Customer</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.customer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Provider</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method</span>
                  <Badge variant="outline" className={methodColors[payment.method as keyof typeof methodColors]}>
                    {payment.method}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(payment.date)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewPayment(payment)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {payment.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No payments found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || statusFilter !== "all" || methodFilter !== "all" || dateFromFilter || dateToFilter
                ? "Try adjusting your search or filter criteria."
                : "No payments have been processed yet."}
            </p>
            {(searchTerm || statusFilter !== "all" || methodFilter !== "all" || dateFromFilter || dateToFilter) && (
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

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl">
                    {getPaymentIcon(selectedPayment.method)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedPayment.transactionId}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPayment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[selectedPayment.status]}>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </Badge>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${selectedPayment.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Transaction Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Transaction Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPayment.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                    <Badge variant="outline" className={methodColors[selectedPayment.method as keyof typeof methodColors]}>
                      {selectedPayment.method}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedPayment.date)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Customer Information</h4>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.customer}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Provider Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Service Provider Information</h4>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.provider}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service Provider</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Service Details</h4>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Service Type</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.service}</p>
                </div>
              </div>

              {selectedPayment.status === 'failed' && (
                <>
                  <Separator />
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-600">Payment Failed</p>
                        <p className="text-sm text-red-600">This payment was not processed successfully. Please contact the customer or retry the payment.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPayment && selectedPayment.status === 'pending' && (
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}