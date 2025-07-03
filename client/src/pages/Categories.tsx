import { useState } from "react";
import { Grid3X3, Plus, Edit, Trash2, Users, ToggleLeft, ToggleRight, Search, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/data/dummyData";

const categoryStats = [
  {
    title: "Total Categories",
    value: "12",
    change: "+2",
    icon: Grid3X3,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Categories",
    value: "10",
    change: "+1",
    icon: Activity,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Total Providers",
    value: "284",
    change: "+18",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Avg. Providers/Category",
    value: "23.7",
    change: "+1.2",
    icon: Activity,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && category.isActive) ||
                         (statusFilter === "inactive" && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCategory = () => {
    // In a real app, this would make an API call
    console.log("Creating category:", newCategory);
    setNewCategory({ name: "", description: "", isActive: true });
    setIsDialogOpen(false);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    // In a real app, this would make an API call
    console.log("Updating category:", editingCategory.id, newCategory);
    setEditingCategory(null);
    setNewCategory({ name: "", description: "", isActive: true });
    setIsDialogOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real app, this would make an API call
    console.log("Deleting category:", categoryId);
  };

  const handleToggleStatus = (categoryId: string, currentStatus: boolean) => {
    // In a real app, this would make an API call
    console.log("Toggling category status:", categoryId, !currentStatus);
  };

  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Categories</h2>
            <p className="mt-2 text-sm text-gray-700">Create and edit service categories like Electrician, Plumber, etc.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({ name: "", description: "", isActive: true });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Electrician, Plumber"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Describe the services in this category"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={newCategory.isActive}
                      onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active Category</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {categoryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden shadow">
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{stat.change}</span>
                  <span className="text-gray-500"> from last month</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="name">Name A-Z</option>
              <option value="providers">Provider Count</option>
              <option value="created">Date Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="shadow hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <div className="flex items-center">
                      {category.isActive ? (
                        <ToggleRight 
                          className="h-5 w-5 text-green-500 cursor-pointer" 
                          onClick={() => handleToggleStatus(category.id, category.isActive)}
                        />
                      ) : (
                        <ToggleLeft 
                          className="h-5 w-5 text-gray-400 cursor-pointer"
                          onClick={() => handleToggleStatus(category.id, category.isActive)}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{category.providerCount} providers</span>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search criteria" : "Create your first service category to get started"}
          </p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredCategories.length} of {categories.length} categories</span>
          <div className="flex space-x-4">
            <span>Active: {categories.filter(c => c.isActive).length}</span>
            <span>Inactive: {categories.filter(c => !c.isActive).length}</span>
          </div>
        </div>
      </div>
    </>
  );
}
