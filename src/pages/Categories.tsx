import { useState, useMemo } from "react";
import { Tag, Plus, Search, X, Edit, Trash2, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, MoreHorizontal, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { categories } from "@/data/dummyData";
import { CategoryRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>(categories);
  const { toast } = useToast();

  // Form state for adding/editing category
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Filter, search, and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categoryList.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && category.isActive) ||
                           (statusFilter === "inactive" && !category.isActive);
      
      return matchesSearch && matchesStatus;
    });

    // Sort categories
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "providers":
          aValue = a.providerCount;
          bValue = b.providerCount;
          break;
        case "status":
          aValue = a.isActive ? "active" : "inactive";
          bValue = b.isActive ? "active" : "inactive";
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortBy, sortOrder, categoryList]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredAndSortedCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const total = categoryList.length;
    const active = categoryList.filter(c => c.isActive).length;
    const inactive = categoryList.filter(c => !c.isActive).length;
    const totalProviders = categoryList.reduce((sum, c) => sum + c.providerCount, 0);
    const avgProviders = total > 0 ? Math.round(totalProviders / total) : 0;
    const topCategory = categoryList.reduce((top, current) => 
      current.providerCount > top.providerCount ? current : top
    , categoryList[0] || { name: 'N/A', providerCount: 0 });
    
    return {
      total,
      active,
      inactive,
      totalProviders,
      avgProviders,
      topCategory
    };
  }, [categoryList]);

  const handleAddCategory = () => {
    if (!categoryForm.name.trim() || !categoryForm.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newCategory: CategoryRecord = {
      id: String(categoryList.length + 1),
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      providerCount: 0,
      isActive: categoryForm.isActive,
    };

    setCategoryList([...categoryList, newCategory]);
    setCategoryForm({ name: "", description: "", isActive: true });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Category created successfully.",
    });
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !categoryForm.name.trim() || !categoryForm.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCategoryList(categoryList.map(category => 
      category.id === selectedCategory.id 
        ? { 
            ...category, 
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim(),
            isActive: categoryForm.isActive
          }
        : category
    ));

    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    setCategoryForm({ name: "", description: "", isActive: true });
    
    toast({
      title: "Success",
      description: "Category updated successfully.",
    });
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    setCategoryList(categoryList.filter(category => category.id !== selectedCategory.id));
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
    
    toast({
      title: "Success",
      description: "Category deleted successfully.",
    });
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategoryList(categoryList.map(category => 
      category.id === categoryId 
        ? { ...category, isActive: !category.isActive }
        : category
    ));
    
    const category = categoryList.find(c => c.id === categoryId);
    toast({
      title: "Success",
      description: `Category ${category?.isActive ? 'deactivated' : 'activated'} successfully.`,
    });
  };

  const openEditDialog = (category: CategoryRecord) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (category: CategoryRecord) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (category: CategoryRecord) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const resetForm = () => {
    setCategoryForm({ name: "", description: "", isActive: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Categories</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage service categories and their availability</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Providers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProviders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Providers</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgProviders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Category</p>
                <p className="text-lg font-bold text-indigo-600 truncate">{stats.topCategory.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search categories..." 
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="providers">Provider Count</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
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
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedCategories.length)} of {filteredAndSortedCategories.length} categories
        </p>
        {(searchTerm || statusFilter !== "all") && (
          <Badge variant="outline">
            {filteredAndSortedCategories.length} filtered results
          </Badge>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={statusColors[category.isActive ? 'active' : 'inactive']}>
                        {category.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openViewDialog(category)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleCategoryStatus(category.id)}>
                      {category.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(category)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Category Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{category.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Provider Count</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.providerCount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">#{category.id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="mb-4" />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openViewDialog(category)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleCategoryStatus(category.id)}
                >
                  {category.isActive ? (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedCategories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No categories found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No service categories have been created yet."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description *</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Describe the service category..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="categoryActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label htmlFor="categoryActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">Category Name *</Label>
              <Input
                id="editCategoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="editCategoryDescription">Description *</Label>
              <Textarea
                id="editCategoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Describe the service category..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editCategoryActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label htmlFor="editCategoryActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedCategory(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Tag className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedCategory.name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={statusColors[selectedCategory.isActive ? 'active' : 'inactive']}>
                      {selectedCategory.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Category Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Category Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">#{selectedCategory.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <Badge className={statusColors[selectedCategory.isActive ? 'active' : 'inactive']}>
                      {selectedCategory.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provider Count</p>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedCategory.providerCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Description</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{selectedCategory.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedCategory && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(selectedCategory);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone and will affect any providers associated with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}