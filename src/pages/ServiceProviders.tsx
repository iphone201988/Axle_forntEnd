import { useState, useMemo } from "react";
import { Plus, Eye, Edit, Trash2, Check, Star, ChevronLeft, ChevronRight, Search, X, Calendar, MapPin, Phone, Mail, Award, Briefcase, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { providers } from "@/data/dummyData";
import { Provider } from "@/types";

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

const ITEMS_PER_PAGE = 6;

export default function ServiceProviders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Provider>>({});
  const [newProvider, setNewProvider] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    experience: "",
    bio: "",
  });

  // Get unique categories for filter
  const categories = providers.reduce((acc: string[], provider) => {
    if (!acc.includes(provider.category)) {
      acc.push(provider.category);
    }
    return acc;
  }, []);

  // Filter and search providers
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.phone.includes(searchTerm);
      const matchesCategory = categoryFilter === "all" || provider.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || provider.status === statusFilter;
      const matchesRating = ratingFilter === "all" || 
                           (ratingFilter === "4.5+" && provider.rating >= 4.5) ||
                           (ratingFilter === "4.0+" && provider.rating >= 4.0) ||
                           (ratingFilter === "3.5+" && provider.rating >= 3.5) ||
                           (ratingFilter === "3.0+" && provider.rating >= 3.0);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesRating;
    });
  }, [searchTerm, categoryFilter, statusFilter, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProviders = filteredProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = providers.length;
    const active = providers.filter(p => p.status === 'active').length;
    const pending = providers.filter(p => p.status === 'pending').length;
    const avgRating = providers.reduce((sum, p) => sum + p.rating, 0) / total;
    const totalJobs = providers.reduce((sum, p) => sum + p.jobsCompleted, 0);
    
    return {
      total,
      active,
      pending,
      avgRating: avgRating.toFixed(1),
      totalJobs
    };
  }, []);

  const handleCreateProvider = () => {
    console.log("Creating provider:", newProvider);
    setNewProvider({
      name: "",
      email: "",
      phone: "",
      category: "",
      experience: "",
      bio: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsViewDialogOpen(true);
  };

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setEditFormData({
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      category: provider.category,
      experience: provider.experience,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProvider = () => {
    console.log("Updating provider:", selectedProvider?.id, editFormData);
    setIsEditDialogOpen(false);
    setSelectedProvider(null);
    setEditFormData({});
  };

  const handleDeleteProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log("Deleting provider:", selectedProvider?.id);
    setIsDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleApproveProvider = (provider: Provider) => {
    console.log("Approving provider:", provider.id);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setRatingFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Providers</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage and verify service providers on your platform</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service Provider</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="providerName">Full Name *</Label>
                  <Input
                    id="providerName"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="providerEmail">Email Address *</Label>
                  <Input
                    id="providerEmail"
                    type="email"
                    value={newProvider.email}
                    onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="providerPhone">Phone Number *</Label>
                  <Input
                    id="providerPhone"
                    value={newProvider.phone}
                    onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="providerCategory">Service Category *</Label>
                  <Select value={newProvider.category} onValueChange={(value) => setNewProvider({ ...newProvider, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electrician">Electrician</SelectItem>
                      <SelectItem value="Plumber">Plumber</SelectItem>
                      <SelectItem value="House Cleaning">House Cleaning</SelectItem>
                      <SelectItem value="Car Wash">Car Wash</SelectItem>
                      <SelectItem value="Handyman">Handyman</SelectItem>
                      <SelectItem value="Gardening">Gardening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="providerExperience">Years of Experience</Label>
                  <Input
                    id="providerExperience"
                    type="number"
                    value={newProvider.experience}
                    onChange={(e) => setNewProvider({ ...newProvider, experience: e.target.value })}
                    placeholder="5"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="providerBio">Bio / Description</Label>
                <Textarea
                  id="providerBio"
                  value={newProvider.bio}
                  onChange={(e) => setNewProvider({ ...newProvider, bio: e.target.value })}
                  placeholder="Brief description of services and experience..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProvider}
                className="bg-primary hover:bg-primary/90"
                disabled={!newProvider.name || !newProvider.email || !newProvider.phone || !newProvider.category}
              >
                Add Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Providers</p>
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
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalJobs.toLocaleString()}</p>
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
                  placeholder="Search providers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5+">3.5+ Stars</SelectItem>
                  <SelectItem value="3.0+">3.0+ Stars</SelectItem>
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
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProviders.length)} of {filteredProviders.length} providers
        </p>
        {(searchTerm || categoryFilter !== "all" || statusFilter !== "all" || ratingFilter !== "all") && (
          <Badge variant="outline">
            {filteredProviders.length} filtered results
          </Badge>
        )}
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              {/* Provider Header */}
              <div className="flex items-center mb-4">
                <div className={`h-12 w-12 rounded-full ${provider.bgColor} text-white flex items-center justify-center text-base font-medium flex-shrink-0`}>
                  {provider.initials}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">{provider.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{provider.email}</p>
                </div>
                <Badge className={statusColors[provider.status]}>
                  {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                </Badge>
              </div>

              {/* Provider Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Experience</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.experience} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Jobs Completed</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.jobsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">{provider.rating}</span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({provider.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProvider(provider)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditProvider(provider)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {provider.status === 'pending' ? (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveProvider(provider)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteProvider(provider)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No providers found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || ratingFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first service provider."}
            </p>
            {(searchTerm || categoryFilter !== "all" || statusFilter !== "all" || ratingFilter !== "all") && (
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

      {/* View Provider Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className={`h-16 w-16 rounded-full ${selectedProvider.bgColor} text-white flex items-center justify-center text-xl font-medium`}>
                  {selectedProvider.initials}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedProvider.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProvider.category}</p>
                  <Badge className={statusColors[selectedProvider.status]}>
                    {selectedProvider.status.charAt(0).toUpperCase() + selectedProvider.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedProvider.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedProvider.phone}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Performance Stats */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Performance Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProvider.rating} ({selectedProvider.reviewCount} reviews)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProvider.jobsCompleted}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProvider.experience} years</p>
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
            {selectedProvider && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditProvider(selectedProvider);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Provider
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editName">Full Name *</Label>
                  <Input
                    id="editName"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editEmail">Email Address *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editPhone">Phone Number *</Label>
                  <Input
                    id="editPhone"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editCategory">Service Category *</Label>
                  <Select value={editFormData.category || ""} onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editExperience">Years of Experience</Label>
                  <Input
                    id="editExperience"
                    type="number"
                    value={editFormData.experience || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: parseInt(e.target.value) })}
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProvider}
              disabled={!editFormData.name || !editFormData.email || !editFormData.phone || !editFormData.category}
            >
              Update Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the provider account for <strong>{selectedProvider?.name}</strong> and remove all their data from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}