import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../components/ui/tooltip";
import { 
  SearchIcon, 
  FilterIcon, 
  MoreVerticalIcon, 
  UserPlusIcon, 
  PencilIcon, 
  CoinsIcon,
  ShieldIcon,
  UsersIcon,
  CrownIcon,
  TrendingUpIcon,
  CheckIcon,
  XIcon,
  SortAscIcon,
  SortDescIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useUsers } from "../../hooks/useUsers";
import { User } from "../../lib/dataService";

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username?: string;
}

interface EditUserData {
  full_name: string;
  email: string;
  role: string;
  points: number;
}

type SortField = 'name' | 'email' | 'role' | 'points' | 'date';
type SortOrder = 'asc' | 'desc';

export const Users = (): JSX.Element => {
  const { users, loading, error, updateUser, updateUserRole, addPointsToUser, createUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [pointsFilter, setPointsFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [newRole, setNewRole] = useState<string>("");

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, pointsFilter, sortField, sortOrder]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!user.full_name.toLowerCase().includes(query) &&
            !user.email.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }
      
      // Points filter
      if (pointsFilter !== "all") {
        const points = user.points || 0;
        switch (pointsFilter) {
          case 'high':
            if (points < 1000) return false;
            break;
          case 'medium':
            if (points < 500 || points >= 1000) return false;
            break;
          case 'low':
            if (points >= 500) return false;
            break;
          case 'zero':
            if (points > 0) return false;
            break;
        }
      }
      
      return true;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'points':
          aValue = a.points || 0;
          bValue = b.points || 0;
          break;
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, pointsFilter, sortField, sortOrder]);

  // Pagination calculations
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Pagination helpers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setPointsFilter("all");
    setCurrentPage(1);
  };

  const handleCreateUser = async (formData: UserFormData) => {
    console.log('handleCreateUser called with:', formData);
    
    try {
      const { error } = await createUser(formData);
      
      if (!error) {
        console.log('User created successfully, closing dialog');
        setIsCreateDialogOpen(false);
      } else {
        console.error('Error creating user:', error);
        alert('Error creating user: ' + error);
      }
    } catch (err) {
      console.error('Unexpected error in handleCreateUser:', err);
      alert('Unexpected error creating user');
    }
  };

  const handleEditUser = async (userData: EditUserData) => {
    if (!selectedUser) return;
    
    const { error } = await updateUser(selectedUser.id, userData);
    
    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } else {
      alert('Error updating user: ' + error);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    const { error } = await updateUserRole(selectedUser.id, newRole);
    
    if (!error) {
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
    } else {
      alert('Error updating role: ' + error);
    }
  };

  const handleAddPoints = async () => {
    if (!selectedUser || pointsToAdd <= 0) return;
    
    const { error } = await addPointsToUser(selectedUser.id, pointsToAdd);
    
    if (!error) {
      setIsPointsDialogOpen(false);
      setSelectedUser(null);
      setPointsToAdd(0);
    } else {
      alert('Error adding points: ' + error);
    }
  };

  const UserForm = ({ onSubmit }: { onSubmit: (data: UserFormData) => void }) => {
    const [formData, setFormData] = useState<UserFormData>({
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      username: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('User form submitted with data:', formData);
      
      // Validate required fields
      if (!formData.email.trim()) {
        alert('Please enter an email address');
        return;
      }
      
      if (!formData.first_name.trim()) {
        alert('Please enter a first name');
        return;
      }
      
      if (!formData.last_name.trim()) {
        alert('Please enter a last name');
        return;
      }
      
      if (!formData.role) {
        alert('Please select a role');
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error('Error in user form submission:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input 
              id="first_name" 
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required 
              disabled={isSubmitting}
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input 
              id="last_name" 
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required 
              disabled={isSubmitting}
              placeholder="Enter last name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username (Optional)</Label>
          <Input 
            id="username" 
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            disabled={isSubmitting}
            placeholder="Enter username (optional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <select 
            id="role" 
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#009A5A] hover:bg-[#008a50] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating User...
            </div>
          ) : (
            'Create User'
          )}
        </Button>
      </form>
    );
  };

  const EditUserForm = ({ user, onSubmit }: { user: User, onSubmit: (data: EditUserData) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit({
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        points: parseInt(formData.get('points') as string),
      });
    }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" name="full_name" defaultValue={user.full_name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select 
          id="role" 
          name="role" 
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          defaultValue={user.role}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="points">Total Points</Label>
        <Input 
          id="points" 
          name="points" 
          type="number" 
          defaultValue={user.points} 
          required 
        />
      </div>
      <Button type="submit" className="w-full bg-[#009A5A] hover:bg-[#008a50] text-white">
        Save Changes
      </Button>
    </form>
  );

  // Pagination component
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Show</span>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
          setItemsPerPage(parseInt(value));
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>entries per page</span>
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>First page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 ${
                  currentPage === pageNumber 
                    ? 'bg-[#009A5A] text-white hover:bg-[#008a50]' 
                    : ''
                }`}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Users
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading users...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009A5A]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Users
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading users: {error}
          </p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const regularUsers = users.filter(user => user.role === 'user').length;
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
              Users
            </h1>
            <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
              Manage user accounts, roles, and points
            </p>
          </div>
          
          {/* Create User Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#009A5A] hover:bg-[#008a50] text-white py-6 px-8 text-lg font-semibold w-full lg:w-auto">
                <UserPlusIcon className="mr-2 h-5 w-5" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <UserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#009A5A]/10 rounded-lg mr-4">
                  <UsersIcon className="h-8 w-8 text-[#009A5A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <CrownIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <UsersIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold text-gray-900">{regularUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <CoinsIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 md:p-6">
            {/* Search and Filter Bar */}
            <div className="space-y-4 mb-6">
              {/* Search Bar with Integrated Filters */}
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  className="pl-10 pr-32 h-12 bg-white text-base"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Integrated Filter Dropdown */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                    <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={pointsFilter} onValueChange={setPointsFilter}>
                    <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                      <SelectValue placeholder="Points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Points</SelectItem>
                      <SelectItem value="high">1000+</SelectItem>
                      <SelectItem value="medium">500-999</SelectItem>
                      <SelectItem value="low">1-499</SelectItem>
                      <SelectItem value="zero">0 Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Sort Options and Results */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="flex gap-1">
                    {[
                      { field: 'name' as SortField, label: 'Name' },
                      { field: 'email' as SortField, label: 'Email' },
                      { field: 'role' as SortField, label: 'Role' },
                      { field: 'points' as SortField, label: 'Points' },
                      { field: 'date' as SortField, label: 'Date' }
                    ].map(({ field, label }) => (
                      <Tooltip key={field}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={sortField === field ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSort(field)}
                            className={`px-3 py-1 ${
                              sortField === field 
                                ? 'bg-[#009A5A] text-white' 
                                : 'bg-white text-gray-700'
                            }`}
                          >
                            {label}
                            {sortField === field && (
                              sortOrder === 'asc' ? 
                              <SortAscIcon className="h-3 w-3 ml-1" /> : 
                              <SortDescIcon className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sort by {label.toLowerCase()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                
                {/* Results count and clear filters */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
                    {filteredAndSortedUsers.length !== totalUsers && ` (filtered from ${totalUsers} total)`}
                  </span>
                  {(searchQuery || roleFilter !== "all" || pointsFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-[#009A5A] hover:text-[#008a50] ml-4"
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">No.</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Points</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {startIndex + index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                            <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.role === 'admin' ? (
                            <CrownIcon className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <UsersIcon className="h-4 w-4 mr-2 text-gray-600" />
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            user.role === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CoinsIcon className="h-4 w-4 mr-2 text-[#009A5A]" />
                          <span className="font-medium">{user.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <PencilIcon className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit user profile</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setIsRoleDialogOpen(true);
                                }}
                              >
                                <ShieldIcon className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change user role</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPointsDialogOpen(true);
                                }}
                              >
                                <CoinsIcon className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add points to user</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVerticalIcon className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>More options</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {paginatedUsers.length === 0 && (
              <div className="text-center py-12">
                <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery || roleFilter !== "all" || pointsFilter !== "all"
                    ? 'No users match your search criteria.'
                    : 'No users found.'}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && <PaginationControls />}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <EditUserForm user={selectedUser} onSubmit={handleEditUser} />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url || ''} alt={selectedUser.full_name} />
                    <AvatarFallback>{selectedUser.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_role">Select New Role</Label>
                  <select 
                    id="new_role" 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Changing a user's role will affect their access permissions immediately.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsRoleDialogOpen(false)}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRoleChange}
                    className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Role
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isPointsDialogOpen} onOpenChange={setIsPointsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Points to User</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url || ''} alt={selectedUser.full_name} />
                    <AvatarFallback>{selectedUser.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <CoinsIcon className="h-4 w-4 mr-1" />
                      <span>Current: {selectedUser.points.toLocaleString()} points</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points_to_add">Points to Add</Label>
                  <Input 
                    id="points_to_add" 
                    type="number" 
                    min="1"
                    value={pointsToAdd || ''}
                    onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                    placeholder="Enter points amount"
                  />
                </div>
                
                {pointsToAdd > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>New Total:</strong> {(selectedUser.points + pointsToAdd).toLocaleString()} points
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPointsDialogOpen(false);
                      setPointsToAdd(0);
                    }}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPoints}
                    disabled={pointsToAdd <= 0}
                    className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                  >
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    Add Points
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};