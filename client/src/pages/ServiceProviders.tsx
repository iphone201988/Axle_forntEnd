import { useState } from "react";
import { Plus, Eye, Edit, Trash2, Check, Star, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { providers } from "@/data/dummyData";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function ServiceProviders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    experience: "",
    bio: "",
  });

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || provider.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || provider.status === statusFilter;
    const matchesRating = ratingFilter === "all" || 
                         (ratingFilter === "4.5+" && provider.rating >= 4.5) ||
                         (ratingFilter === "4.0+" && provider.rating >= 4.0) ||
                         (ratingFilter === "3.5+" && provider.rating >= 3.5);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesRating;
  });

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
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Providers</h2>
            <p className="mt-2 text-sm text-gray-700">Manage and verify service providers on your platform</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Label htmlFor="providerName">Full Name</Label>
                      <Input
                        id="providerName"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="providerEmail">Email Address</Label>
                      <Input
                        id="providerEmail"
                        type="email"
                        value={newProvider.email}
                        onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="providerPhone">Phone Number</Label>
                      <Input
                        id="providerPhone"
                        value={newProvider.phone}
                        onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="providerCategory">Service Category</Label>
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
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProvider}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!newProvider.name || !newProvider.email || !newProvider.category}
                  >
                    Add Provider
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input 
              placeholder="Search providers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electrician">Electrician</SelectItem>
                <SelectItem value="Plumber">Plumber</SelectItem>
                <SelectItem value="Car Wash">Car Wash</SelectItem>
                <SelectItem value="House Cleaning">House Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                <SelectItem value="3.5+">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Providers Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
            {/* Provider Header */}
            <div className="flex items-center mb-4">
              <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full ${provider.bgColor} text-white flex items-center justify-center text-sm sm:text-base font-medium flex-shrink-0`}>
                {provider.initials}
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{provider.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{provider.email}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[provider.status]} ml-2 flex-shrink-0`}>
                {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
              </span>
            </div>

            {/* Provider Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500">Category</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{provider.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500">Experience</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{provider.experience} years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500">Jobs Completed</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{provider.jobsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500">Rating</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-xs sm:text-sm font-medium text-gray-900">{provider.rating}</span>
                  <span className="ml-1 text-xs text-gray-500">({provider.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                View
              </button>
              <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Edit
              </button>
              {provider.status === 'pending' ? (
                <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Approve
                </button>
              ) : (
                <button className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProviders.length}</span> of{" "}
            <span className="font-medium">{providers.length}</span> providers
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <button className="relative inline-flex items-center px-2 sm:px-3 py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </button>
          <button className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">1</button>
          <button className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-primary text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors">2</button>
          <button className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">3</button>
          <button className="relative inline-flex items-center px-2 sm:px-3 py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
