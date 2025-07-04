import { useState, useMemo } from "react";
import { Download, Eye, Edit, User, Search, X, Calendar, Clock, DollarSign, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Filter, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { bookings } from "@/data/dummyData";
import { BookingRecord } from "@/types";

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const ITEMS_PER_PAGE = 8;

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BookingRecord>>({});

  // Get unique values for filters
  const serviceTypes = bookings.reduce((acc: string[], booking) => {
    if (!acc.includes(booking.service.name)) {
      acc.push(booking.service.name);
    }
    return acc;
  }, []);

  const providers = bookings.reduce((acc: string[], booking) => {
    if (booking.provider && !acc.includes(booking.provider.name)) {
      acc.push(booking.provider.name);
    }
    return acc;
  }, []);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customer.phone.includes(searchTerm) ||
                           (booking.provider && booking.provider.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesService = serviceFilter === "all" || booking.service.name === serviceFilter;
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesProvider = providerFilter === "all" || (booking.provider && booking.provider.name === providerFilter);
      
      let matchesDateRange = true;
      if (dateFromFilter && dateToFilter) {
        const bookingDate = new Date(booking.date);
        const fromDate = new Date(dateFromFilter);
        const toDate = new Date(dateToFilter);
        matchesDateRange = bookingDate >= fromDate && bookingDate <= toDate;
      } else if (dateFromFilter) {
        const bookingDate = new Date(booking.date);
        const fromDate = new Date(dateFromFilter);
        matchesDateRange = bookingDate >= fromDate;
      } else if (dateToFilter) {
        const bookingDate = new Date(booking.date);
        const toDate = new Date(dateToFilter);
        matchesDateRange = bookingDate <= toDate;
      }
      
      return matchesSearch && matchesService && matchesStatus && matchesProvider && matchesDateRange;
    });
  }, [searchTerm, serviceFilter, statusFilter, providerFilter, dateFromFilter, dateToFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const inProgress = bookings.filter(b => b.status === 'in-progress').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
    const avgBookingValue = totalRevenue / completed || 0;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      totalRevenue,
      avgBookingValue
    };
  }, []);

  const handleViewBooking = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleEditBooking = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setEditFormData({
      date: booking.date,
      time: booking.time,
      amount: booking.amount,
      status: booking.status,
      service: booking.service,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBooking = () => {
    console.log("Updating booking:", selectedBooking?.id, editFormData);
    setIsEditDialogOpen(false);
    setSelectedBooking(null);
    setEditFormData({});
  };

  const resetFilters = () => {
    setSearchTerm("");
    setServiceFilter("all");
    setStatusFilter("all");
    setProviderFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
  };

  const exportBookings = () => {
    const csvContent = [
      ["Booking ID", "Customer Name", "Customer Phone", "Service", "Provider", "Date", "Time", "Amount", "Status"],
      ...filteredBookings.map(booking => [
        booking.id,
        booking.customer.name,
        booking.customer.phone,
        booking.service.name,
        booking.provider ? booking.provider.name : "Not assigned",
        booking.date,
        booking.time,
        booking.amount,
        booking.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookings Management</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Track and manage all service bookings</p>
        </div>
        <Button variant="outline" onClick={exportBookings}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
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
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.avgBookingValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search bookings..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
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

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
        </p>
        {(searchTerm || serviceFilter !== "all" || statusFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter) && (
          <Badge variant="outline">
            {filteredBookings.length} filtered results
          </Badge>
        )}
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              {/* Booking Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">#{booking.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service.name}</p>
                  </div>
                </div>
                <Badge className={statusColors[booking.status]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.customer.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{booking.customer.phone}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Service</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.service.description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Provider</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {booking.provider ? booking.provider.name : "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date & Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(booking.date)} at {booking.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${booking.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewBooking(booking)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditBooking(booking)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No bookings found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || serviceFilter !== "all" || statusFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter
                ? "Try adjusting your search or filter criteria."
                : "No bookings have been made yet."}
            </p>
            {(searchTerm || serviceFilter !== "all" || statusFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter) && (
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

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">#{selectedBooking.id}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedBooking.service.name}</p>
                </div>
                <Badge className={statusColors[selectedBooking.status]}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1).replace('-', ' ')}
                </Badge>
              </div>
              
              <Separator />
              
              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Customer Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedBooking.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedBooking.customer.phone}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Service Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service Type</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedBooking.service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedBooking.service.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">${selectedBooking.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Provider Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Provider Information</h4>
                {selectedBooking.provider ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedBooking.provider.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedBooking.provider.phone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No provider assigned yet</p>
                )}
              </div>

              <Separator />

              {/* Schedule */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Schedule</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedBooking.time}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedBooking && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditBooking(selectedBooking);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editDate">Date</Label>
                  <Input
                    id="editDate"
                    type="date"
                    value={editFormData.date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTime">Time</Label>
                  <Input
                    id="editTime"
                    type="time"
                    value={editFormData.time || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editAmount">Amount</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    value={editFormData.amount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editFormData.status || ""} onValueChange={(value) => setEditFormData({ ...editFormData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Service Description</Label>
                <Textarea
                  id="editDescription"
                  value={editFormData.service?.description || ""}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    service: { 
                      ...editFormData.service!, 
                      description: e.target.value 
                    } 
                  })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking}>
              Update Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}