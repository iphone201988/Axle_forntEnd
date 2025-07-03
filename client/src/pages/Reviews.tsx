import { useState, useMemo } from "react";
import { Star, TrendingUp, MessageSquare, ThumbsUp, Flag, Eye, Search, X, Calendar, User, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { reviews } from "@/data/dummyData";
import { ReviewRecord } from "@/types";

const ITEMS_PER_PAGE = 8;

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-yellow-600";
  if (rating >= 2.5) return "text-orange-600";
  return "text-red-600";
};

const getRatingBadgeColor = (rating: number) => {
  if (rating >= 4.5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (rating >= 3.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  if (rating >= 2.5) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
};

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [flaggedReviews, setFlaggedReviews] = useState<Set<string>>(new Set());

  // Get unique values for filters
  const services = reviews.reduce((acc: string[], review) => {
    if (!acc.includes(review.service)) {
      acc.push(review.service);
    }
    return acc;
  }, []);

  const providers = reviews.reduce((acc: string[], review) => {
    if (!acc.includes(review.provider)) {
      acc.push(review.provider);
    }
    return acc;
  }, []);

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.comment.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === "all" || 
                           (ratingFilter === "5" && review.rating === 5) ||
                           (ratingFilter === "4" && review.rating === 4) ||
                           (ratingFilter === "3" && review.rating === 3) ||
                           (ratingFilter === "2" && review.rating === 2) ||
                           (ratingFilter === "1" && review.rating === 1) ||
                           (ratingFilter === "4+" && review.rating >= 4) ||
                           (ratingFilter === "3+" && review.rating >= 3);
      
      const matchesService = serviceFilter === "all" || review.service === serviceFilter;
      const matchesProvider = providerFilter === "all" || review.provider === providerFilter;
      
      let matchesDateRange = true;
      if (dateFromFilter && dateToFilter) {
        const reviewDate = new Date(review.date);
        const fromDate = new Date(dateFromFilter);
        const toDate = new Date(dateToFilter);
        matchesDateRange = reviewDate >= fromDate && reviewDate <= toDate;
      } else if (dateFromFilter) {
        const reviewDate = new Date(review.date);
        const fromDate = new Date(dateFromFilter);
        matchesDateRange = reviewDate >= fromDate;
      } else if (dateToFilter) {
        const reviewDate = new Date(review.date);
        const toDate = new Date(dateToFilter);
        matchesDateRange = reviewDate <= toDate;
      }
      
      return matchesSearch && matchesRating && matchesService && matchesProvider && matchesDateRange;
    });
  }, [searchTerm, ratingFilter, serviceFilter, providerFilter, dateFromFilter, dateToFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / total || 0;
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };
    const fiveStarPercentage = ((ratingDistribution[5] / total) * 100) || 0;
    const flaggedCount = flaggedReviews.size;
    
    return {
      total,
      avgRating,
      ratingDistribution,
      fiveStarPercentage,
      flaggedCount
    };
  }, [flaggedReviews]);

  const handleViewReview = (review: ReviewRecord) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  const handleFlagReview = (review: ReviewRecord) => {
    setSelectedReview(review);
    setIsFlagDialogOpen(true);
  };

  const confirmFlagReview = () => {
    if (selectedReview) {
      const newFlagged = new Set(flaggedReviews);
      if (flaggedReviews.has(selectedReview.id)) {
        newFlagged.delete(selectedReview.id);
      } else {
        newFlagged.add(selectedReview.id);
      }
      setFlaggedReviews(newFlagged);
    }
    setIsFlagDialogOpen(false);
    setSelectedReview(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRatingFilter("all");
    setServiceFilter("all");
    setProviderFilter("all");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reviews & Ratings</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">View feedback on service providers and manage reviews</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">{stats.fiveStarPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive (4+)</p>
                <p className="text-2xl font-bold text-purple-600">{stats.ratingDistribution[4] + stats.ratingDistribution[5]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Rated (≤2)</p>
                <p className="text-2xl font-bold text-red-600">{stats.ratingDistribution[1] + stats.ratingDistribution[2]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</p>
                <p className="text-2xl font-bold text-orange-600">{stats.flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = ((count / stats.total) * 100) || 0;
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-500">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
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
                  placeholder="Search reviews..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="3+">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
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
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} reviews
        </p>
        {(searchTerm || ratingFilter !== "all" || serviceFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter) && (
          <Badge variant="outline">
            {filteredReviews.length} filtered results
          </Badge>
        )}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedReviews.map((review) => (
          <Card key={review.id} className={`hover:shadow-lg transition-shadow duration-200 ${flaggedReviews.has(review.id) ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : ''}`}>
            <CardContent className="p-6">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-base font-medium">
                    {getInitials(review.customer)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{review.customer}</h3>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={review.rating} />
                      <Badge className={getRatingBadgeColor(review.rating)}>
                        {review.rating} stars
                      </Badge>
                    </div>
                  </div>
                </div>
                {flaggedReviews.has(review.id) && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    <Flag className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                )}
              </div>

              {/* Service Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Service</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.service}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Provider</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(review.date)}</span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewReview(review)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button 
                  variant={flaggedReviews.has(review.id) ? "default" : "outline"}
                  size="sm" 
                  className={`flex-1 ${flaggedReviews.has(review.id) ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                  onClick={() => handleFlagReview(review)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {flaggedReviews.has(review.id) ? 'Unflag' : 'Flag'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No reviews found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || ratingFilter !== "all" || serviceFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter
                ? "Try adjusting your search or filter criteria."
                : "No reviews have been submitted yet."}
            </p>
            {(searchTerm || ratingFilter !== "all" || serviceFilter !== "all" || providerFilter !== "all" || dateFromFilter || dateToFilter) && (
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

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-medium">
                  {getInitials(selectedReview.customer)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedReview.customer}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <StarRating rating={selectedReview.rating} />
                    <Badge className={getRatingBadgeColor(selectedReview.rating)}>
                      {selectedReview.rating} stars
                    </Badge>
                    {flaggedReviews.has(selectedReview.id) && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Service Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Service Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service Type</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedReview.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service Provider</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedReview.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedReview.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">#{selectedReview.id}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Review Content */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Review Content</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{selectedReview.comment}"</p>
                </div>
              </div>

              {/* Rating Analysis */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Rating Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</span>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={selectedReview.rating} />
                      <span className={`text-sm font-medium ${getRatingColor(selectedReview.rating)}`}>
                        {selectedReview.rating}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating Category</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedReview.rating >= 4.5 ? 'Excellent' : 
                       selectedReview.rating >= 3.5 ? 'Good' : 
                       selectedReview.rating >= 2.5 ? 'Average' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedReview && (
              <Button 
                variant={flaggedReviews.has(selectedReview.id) ? "default" : "outline"}
                className={flaggedReviews.has(selectedReview.id) ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 hover:text-red-700'}
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleFlagReview(selectedReview);
                }}
              >
                <Flag className="h-4 w-4 mr-2" />
                {flaggedReviews.has(selectedReview.id) ? 'Unflag Review' : 'Flag Review'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Review Confirmation Dialog */}
      <AlertDialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedReview && flaggedReviews.has(selectedReview.id) ? 'Unflag Review' : 'Flag Review'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReview && flaggedReviews.has(selectedReview.id) 
                ? `Are you sure you want to unflag this review from ${selectedReview.customer}? This will remove it from the flagged reviews list.`
                : `Are you sure you want to flag this review from ${selectedReview?.customer}? This will mark it for moderation review.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmFlagReview}
              className={selectedReview && flaggedReviews.has(selectedReview.id) ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {selectedReview && flaggedReviews.has(selectedReview.id) ? 'Unflag Review' : 'Flag Review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}