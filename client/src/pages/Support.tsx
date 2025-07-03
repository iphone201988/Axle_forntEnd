import { useState, useMemo } from "react";
import { LifeBuoy, MessageSquare, AlertCircle, Clock, CheckCircle, XCircle, Plus, Search, X, Calendar, User, ChevronLeft, ChevronRight, Eye, MoreHorizontal, UserCheck, UserX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { supportTickets } from "@/data/dummyData";
import { SupportTicketRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const userTypeColors = {
  customer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  provider: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
};

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [tickets, setTickets] = useState<SupportTicketRecord[]>(supportTickets);
  const { toast } = useToast();

  // Form state for creating new ticket
  const [newTicket, setNewTicket] = useState({
    user: "",
    userType: "customer" as "customer" | "provider",
    subject: "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  // Get unique users for assignment filter
  const users = tickets.reduce((acc: string[], ticket) => {
    if (!acc.includes(ticket.user)) {
      acc.push(ticket.user);
    }
    return acc;
  }, []);

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesUserType = userTypeFilter === "all" || ticket.userType === userTypeFilter;
      const matchesAssignedTo = assignedToFilter === "all" || ticket.user === assignedToFilter;
      
      let matchesDateRange = true;
      if (dateFromFilter && dateToFilter) {
        const ticketDate = new Date(ticket.date);
        const fromDate = new Date(dateFromFilter);
        const toDate = new Date(dateToFilter);
        matchesDateRange = ticketDate >= fromDate && ticketDate <= toDate;
      } else if (dateFromFilter) {
        const ticketDate = new Date(ticket.date);
        const fromDate = new Date(dateFromFilter);
        matchesDateRange = ticketDate >= fromDate;
      } else if (dateToFilter) {
        const ticketDate = new Date(ticket.date);
        const toDate = new Date(dateToFilter);
        matchesDateRange = ticketDate <= toDate;
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesUserType && matchesAssignedTo && matchesDateRange;
    });
  }, [searchTerm, statusFilter, priorityFilter, userTypeFilter, assignedToFilter, dateFromFilter, dateToFilter, tickets]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const highPriority = tickets.filter(t => t.priority === 'high').length;
    const customerTickets = tickets.filter(t => t.userType === 'customer').length;
    const providerTickets = tickets.filter(t => t.userType === 'provider').length;
    
    const openAndInProgress = open + inProgress;
    const resolvedAndClosed = resolved + closed;
    const progressPercentage = total > 0 ? ((resolvedAndClosed / total) * 100) : 0;
    
    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      customerTickets,
      providerTickets,
      openAndInProgress,
      resolvedAndClosed,
      progressPercentage
    };
  }, [tickets]);

  const handleViewTicket = (ticket: SupportTicketRecord) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleCreateTicket = () => {
    if (!newTicket.user || !newTicket.subject || !newTicket.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const ticket: SupportTicketRecord = {
      id: `TICKET-${String(tickets.length + 1).padStart(3, '0')}`,
      user: newTicket.user,
      userType: newTicket.userType,
      subject: newTicket.subject,
      status: 'open',
      priority: newTicket.priority,
      date: new Date().toISOString().split('T')[0],
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({
      user: "",
      userType: "customer",
      subject: "",
      priority: "medium",
      description: "",
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Support ticket created successfully.",
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicketRecord['status']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
    
    toast({
      title: "Success",
      description: `Ticket ${newStatus === 'resolved' ? 'resolved' : newStatus === 'closed' ? 'closed' : 'updated'} successfully.`,
    });
  };

  const updateTicketPriority = (ticketId: string, newPriority: SupportTicketRecord['priority']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, priority: newPriority } : ticket
    ));
    
    toast({
      title: "Success",
      description: `Ticket priority updated to ${newPriority}.`,
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setUserTypeFilter("all");
    setAssignedToFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const quickActions = [
    { label: "Mark as In Progress", action: (id: string) => updateTicketStatus(id, 'in-progress') },
    { label: "Mark as Resolved", action: (id: string) => updateTicketStatus(id, 'resolved') },
    { label: "Mark as Closed", action: (id: string) => updateTicketStatus(id, 'closed') },
    { label: "Set High Priority", action: (id: string) => updateTicketPriority(id, 'high') },
    { label: "Set Medium Priority", action: (id: string) => updateTicketPriority(id, 'medium') },
    { label: "Set Low Priority", action: (id: string) => updateTicketPriority(id, 'low') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage customer and provider support requests</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LifeBuoy className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
                <p className="text-2xl font-bold text-purple-600">{stats.customerTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Provider</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.providerTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resolution Progress</span>
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {stats.resolvedAndClosed} of {stats.total} tickets resolved/closed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={stats.progressPercentage} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Open: {stats.open}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">In Progress: {stats.inProgress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Resolved: {stats.resolved}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Closed: {stats.closed}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search tickets..." 
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
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
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTickets.length)} of {filteredTickets.length} tickets
        </p>
        {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all" || assignedToFilter !== "all" || dateFromFilter || dateToFilter) && (
          <Badge variant="outline">
            {filteredTickets.length} filtered results
          </Badge>
        )}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              {/* Ticket Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-base font-medium">
                    {getInitials(ticket.user)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{ticket.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.user}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {quickActions.map((action, index) => (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => action.action(ticket.id)}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {ticket.subject}
                  </h4>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={statusColors[ticket.status]}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}</span>
                  </Badge>
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Badge>
                  <Badge className={userTypeColors[ticket.userType]}>
                    {ticket.userType.charAt(0).toUpperCase() + ticket.userType.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(ticket.date)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {ticket.status === 'open' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {ticket.status === 'in-progress' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LifeBuoy className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tickets found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all" || assignedToFilter !== "all" || dateFromFilter || dateToFilter
                ? "Try adjusting your search or filter criteria."
                : "No support tickets have been created yet."}
            </p>
            {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all" || assignedToFilter !== "all" || dateFromFilter || dateToFilter) && (
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

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user">User Name *</Label>
                <Input
                  id="user"
                  value={newTicket.user}
                  onChange={(e) => setNewTicket({ ...newTicket, user: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="userType">User Type *</Label>
                <Select value={newTicket.userType} onValueChange={(value: "customer" | "provider") => setNewTicket({ ...newTicket, userType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Enter ticket subject"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTicket.priority} onValueChange={(value: "low" | "medium" | "high") => setNewTicket({ ...newTicket, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Describe the issue or request..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xl font-medium">
                    {getInitials(selectedTicket.user)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedTicket.id}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedTicket.user}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={statusColors[selectedTicket.status]}>
                        {getStatusIcon(selectedTicket.status)}
                        <span className="ml-1">{selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1).replace('-', ' ')}</span>
                      </Badge>
                      <Badge className={priorityColors[selectedTicket.priority]}>
                        {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                      </Badge>
                      <Badge className={userTypeColors[selectedTicket.userType]}>
                        {selectedTicket.userType.charAt(0).toUpperCase() + selectedTicket.userType.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Ticket Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Ticket Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ticket ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{selectedTicket.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedTicket.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User Type</p>
                    <Badge className={userTypeColors[selectedTicket.userType]}>
                      {selectedTicket.userType.charAt(0).toUpperCase() + selectedTicket.userType.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                    <Badge className={statusColors[selectedTicket.status]}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1">{selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1).replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subject and Description */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Issue Details</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Priority Level</p>
                    <Badge className={priorityColors[selectedTicket.priority]}>
                      {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTicket.status !== 'in-progress' && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, 'in-progress');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Progress
                    </Button>
                  )}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, 'resolved');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, 'closed');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close Ticket
                    </Button>
                  )}
                  {selectedTicket.priority !== 'high' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateTicketPriority(selectedTicket.id, 'high');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Set High Priority
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}