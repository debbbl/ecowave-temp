import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../components/ui/tooltip";
import { ImageUpload } from "../../components/ui/image-upload";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  GiftIcon, 
  CoinsIcon, 
  PackageIcon,
  HistoryIcon,
  DownloadIcon,
  CalendarIcon,
  UserIcon,
  TrendingUpIcon,
  ArrowLeftIcon,
  SearchIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  XIcon
} from "lucide-react";
import { useRewards } from "../../hooks/useRewards";
import { Reward } from "../../lib/dataService";

interface RewardFormData {
  name: string;
  description: string;
  points_required: number;
  stock: number;
  image_url: string;
}

interface RedemptionHistoryItem {
  id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  reward_name: string;
  points_deducted: number;
  redeemed_at: string;
  status: string;
}

type SortField = 'name' | 'points' | 'stock' | 'redemptions';
type SortOrder = 'asc' | 'desc';

export const Rewards = (): JSX.Element => {
  const { 
    rewards, 
    redemptions, 
    loading, 
    error, 
    createReward, 
    updateReward, 
    deleteReward, 
    fetchRedemptions,
    getRedemptionStats 
  } = useRewards();
  
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRedemptionHistoryOpen, setIsRedemptionHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'rewards' | 'redemption-history'>('rewards');
  const [rewardRedemptions, setRewardRedemptions] = useState<RedemptionHistoryItem[]>([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [pointsFilter, setPointsFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter and sort rewards
  const filteredAndSortedRewards = useMemo(() => {
    let filtered = rewards.filter(reward => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!reward.name.toLowerCase().includes(query) &&
            !reward.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Points filter
      if (pointsFilter !== "all") {
        const points = reward.points_required;
        switch (pointsFilter) {
          case 'low':
            if (points >= 500) return false;
            break;
          case 'medium':
            if (points < 500 || points >= 1000) return false;
            break;
          case 'high':
            if (points < 1000) return false;
            break;
        }
      }
      
      // Stock filter
      if (stockFilter !== "all") {
        const stock = reward.stock;
        switch (stockFilter) {
          case 'out':
            if (stock > 0) return false;
            break;
          case 'low':
            if (stock === 0 || stock > 10) return false;
            break;
          case 'available':
            if (stock === 0) return false;
            break;
        }
      }
      
      // Status filter
      if (statusFilter !== "all") {
        const isActive = reward.is_active;
        switch (statusFilter) {
          case 'active':
            if (!isActive) return false;
            break;
          case 'inactive':
            if (isActive) return false;
            break;
        }
      }
      
      return true;
    });

    // Sort rewards
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'points':
          aValue = a.points_required;
          bValue = b.points_required;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'redemptions':
          aValue = getRedemptionStats(a.id).totalRedemptions;
          bValue = getRedemptionStats(b.id).totalRedemptions;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rewards, searchQuery, pointsFilter, stockFilter, statusFilter, sortField, sortOrder, getRedemptionStats]);

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
    setPointsFilter("all");
    setStockFilter("all");
    setStatusFilter("all");
  };

  const handleCreateReward = async (formData: RewardFormData) => {
    console.log('handleCreateReward called with:', formData);
    
    try {
      const { error } = await createReward(formData);
      
      if (!error) {
        console.log('Reward created successfully, closing dialog');
        setIsCreateDialogOpen(false);
      } else {
        console.error('Error creating reward:', error);
        alert('Error creating reward: ' + error);
      }
    } catch (err) {
      console.error('Unexpected error in handleCreateReward:', err);
      alert('Unexpected error creating reward');
    }
  };

  const handleEditReward = async (rewardId: string, formData: RewardFormData) => {
    const { error } = await updateReward(rewardId, formData);
    
    if (!error) {
      setIsEditDialogOpen(false);
    } else {
      alert('Error updating reward: ' + error);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      const { error } = await deleteReward(rewardId);
      
      if (error) {
        alert('Error deleting reward: ' + error);
      }
    }
  };

  const handleViewRedemptionHistory = async (reward: Reward) => {
    setSelectedReward(reward);
    const redemptionData = await fetchRedemptions(reward.id);
    setRewardRedemptions(redemptionData as RedemptionHistoryItem[]);
    setCurrentView('redemption-history');
  };

  const handleExportRedemptions = (reward: Reward) => {
    const stats = getRedemptionStats(reward.id);
    const csvContent = [
      'Reward,User Name,User Email,Points Used,Redemption Date,Status',
      ...stats.recentRedemptions.map((item: any) => 
        `"${reward.name}","${item.user_name}","${item.user_email}","${item.points_deducted}","${new Date(item.redeemed_at).toLocaleDateString()}","${item.status}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reward.name}-redemptions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const RewardForm = ({ reward, onSubmit, mode }: { 
    reward?: Reward, 
    onSubmit: (data: RewardFormData) => void,
    mode: 'create' | 'edit' 
  }) => {
    const [formData, setFormData] = useState<RewardFormData>({
      name: reward?.name || '',
      description: reward?.description || '',
      points_required: reward?.points_required || 100,
      stock: reward?.stock || 10,
      image_url: reward?.image_url || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Reward form submitted with data:', formData);
      
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Please enter a reward name');
        return;
      }
      
      if (!formData.description.trim()) {
        alert('Please enter a reward description');
        return;
      }
      
      if (!formData.points_required || formData.points_required <= 0) {
        alert('Please enter a valid points requirement (greater than 0)');
        return;
      }
      
      if (!formData.stock || formData.stock <= 0) {
        alert('Please enter a valid stock quantity (greater than 0)');
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error('Error in reward form submission:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Reward Name *</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter reward name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea 
            id="description" 
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter reward description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points_required">Points Required *</Label>
          <Input 
            id="points_required" 
            type="number" 
            min="1"
            value={formData.points_required}
            onChange={(e) => setFormData(prev => ({ ...prev, points_required: parseInt(e.target.value) || 100 }))}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input 
            id="stock" 
            type="number" 
            min="1"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 10 }))}
            required 
            disabled={isSubmitting}
          />
        </div>
        
        {/* Enhanced Image Upload */}
        <ImageUpload
          label="Reward Image"
          value={formData.image_url}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          placeholder="Enter image URL or upload a reward photo"
          maxSize={5}
          disabled={isSubmitting}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#009A5A] hover:bg-[#008a50] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Reward' : 'Save Changes'
          )}
        </Button>
      </form>
    );
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const stats = getRedemptionStats(reward.id);
    
    return (
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
        <CardContent className="p-0" onClick={() => {
          setSelectedReward(reward);
          setIsViewDialogOpen(true);
        }}>
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={reward.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg'} 
              alt={reward.name}
              className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {reward.stock} left
            </div>
            <div className="absolute top-4 left-4 flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/90 hover:bg-white w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRedemptionHistory(reward);
                      }}
                    >
                      <HistoryIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View redemption history</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/90 hover:bg-white w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportRedemptions(reward);
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export redemption data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/90 hover:bg-white w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReward(reward);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit reward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-white/90 hover:bg-white w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReward(reward.id);
                      }}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete reward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {!reward.is_active && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{reward.name}</h3>
              <div className="flex items-center text-[#009A5A] font-bold">
                <CoinsIcon className="h-4 w-4 mr-1" />
                <span>{reward.points_required}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reward.description}</p>
            
            {/* Redemption Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Redemptions:</span>
                <span className="font-medium">{stats.totalRedemptions}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Points Used:</span>
                <span className="font-medium">{stats.totalPointsUsed.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-500 text-sm">
                <PackageIcon className="h-4 w-4 mr-1" />
                <span>{reward.stock} in stock</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                reward.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {reward.is_active ? 'Available' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RedemptionHistoryCard = ({ item }: { item: RedemptionHistoryItem }) => (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.user_avatar || ''} alt={item.user_name} />
              <AvatarFallback>{item.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{item.user_name}</h3>
              <p className="text-sm text-gray-500">{item.user_email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-[#009A5A] font-bold">
              <CoinsIcon className="h-4 w-4 mr-1" />
              <span>{item.points_deducted}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              item.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {item.status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-500">
            {new Date(item.redeemed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Rewards
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading rewards...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Rewards
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading rewards: {error}
          </p>
        </div>
      </div>
    );
  }

  const activeRewards = rewards.filter(reward => reward.is_active);
  const inactiveRewards = rewards.filter(reward => !reward.is_active);
  const totalRedemptions = redemptions.length;
  const totalPointsUsed = redemptions.reduce((sum, r) => sum + r.points_deducted, 0);

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView === 'redemption-history' && selectedReward && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentView('rewards');
                        setSelectedReward(null);
                      }}
                      className="h-10 w-10"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Back to rewards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
                {currentView === 'rewards' ? 'Rewards' : `Redemption History: ${selectedReward?.name}`}
              </h1>
              <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
                {currentView === 'rewards' 
                  ? 'Manage sustainability rewards and track redemptions'
                  : `Track redemption history and points usage for ${selectedReward?.name}`
                }
              </p>
            </div>
          </div>
          {currentView === 'rewards' && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#009A5A] hover:bg-[#008a50] text-white py-3 px-5 text-lg font-semibold w-full lg:w-auto">
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Reward</DialogTitle>
                </DialogHeader>
                <RewardForm mode="create" onSubmit={handleCreateReward} />
              </DialogContent>
            </Dialog>
          )}
          {currentView === 'redemption-history' && selectedReward && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleExportRedemptions(selectedReward)}
                  className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export redemption history to CSV</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#009A5A]/10 rounded-lg mr-4">
                  <GiftIcon className="h-8 w-8 text-[#009A5A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{rewards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <PackageIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{activeRewards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <HistoryIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRedemptions}</p>
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
                  <p className="text-sm font-medium text-gray-600">Points Used</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPointsUsed.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content based on current view */}
        {currentView === 'rewards' ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 md:p-6">
              {/* Search and Filter Bar */}
              <div className="space-y-4 mb-6">
                {/* Search Bar with Integrated Filters */}
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-10 pr-80 h-12 bg-white text-base"
                    placeholder="Search rewards by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Integrated Filter Dropdowns */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {/* Points Filter */}
                    <Select value={pointsFilter} onValueChange={setPointsFilter}>
                      <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                        <SelectValue placeholder="Points" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Points</SelectItem>
                        <SelectItem value="low">Under 500</SelectItem>
                        <SelectItem value="medium">500-999</SelectItem>
                        <SelectItem value="high">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Stock Filter */}
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                        <SelectValue placeholder="Stock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="low">Low (1-10)</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                        { field: 'points' as SortField, label: 'Points' },
                        { field: 'stock' as SortField, label: 'Stock' },
                        { field: 'redemptions' as SortField, label: 'Redemptions' }
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
                      Showing {filteredAndSortedRewards.length} of {rewards.length} rewards
                    </span>
                    {(searchQuery || pointsFilter !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
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

              <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-center md:justify-start">
                  <TabsList className="bg-[#F3F4F6] p-1.5 rounded-lg">
                    <TabsTrigger 
                      value="all" 
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      All Rewards
                    </TabsTrigger>
                    <TabsTrigger 
                      value="available"
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Available
                    </TabsTrigger>
                    <TabsTrigger 
                      value="out-of-stock"
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Out of Stock
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedRewards.map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                  {filteredAndSortedRewards.length === 0 && (
                    <div className="text-center py-12">
                      <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchQuery || pointsFilter !== "all" || stockFilter !== "all" || statusFilter !== "all"
                          ? 'No rewards match your search criteria.'
                          : 'No rewards available. Create your first reward!'}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="available" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedRewards.filter(reward => reward.is_active).map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                  {filteredAndSortedRewards.filter(reward => reward.is_active).length === 0 && (
                    <div className="text-center py-12">
                      <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No available rewards match your criteria.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="out-of-stock" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedRewards.filter(reward => !reward.is_active).map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                  {filteredAndSortedRewards.filter(reward => !reward.is_active).length === 0 && (
                    <div className="text-center py-12">
                      <CoinsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No out of stock rewards match your criteria.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {selectedReward && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={selectedReward.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg'} 
                        alt={selectedReward.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{selectedReward.name}</h3>
                        <p className="text-gray-600">{selectedReward.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-[#009A5A]">
                            <CoinsIcon className="h-4 w-4 mr-1" />
                            <span className="font-medium">{selectedReward.points_required} points</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <PackageIcon className="h-4 w-4 mr-1" />
                            <span>{selectedReward.stock} in stock</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-4">Redemption History</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rewardRedemptions.map((item) => (
                    <RedemptionHistoryCard key={item.id} item={item} />
                  ))}
                </div>
                {rewardRedemptions.length === 0 && (
                  <div className="text-center py-12">
                    <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No redemption history available for this reward.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Reward</DialogTitle>
            </DialogHeader>
            {selectedReward && (
              <RewardForm 
                mode="edit" 
                reward={selectedReward} 
                onSubmit={(formData) => handleEditReward(selectedReward.id, formData)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reward Details</DialogTitle>
            </DialogHeader>
            {selectedReward && (
              <div className="space-y-4">
                <img 
                  src={selectedReward.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg'} 
                  alt={selectedReward.name} 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h2 className="text-xl font-semibold">{selectedReward.name}</h2>
                <p className="text-gray-600">{selectedReward.description}</p>
                
                {/* Redemption Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Points Required</p>
                    <p className="text-2xl font-bold text-[#009A5A]">{selectedReward.points_required}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedReward.stock}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                    <p className="text-2xl font-bold text-blue-600">{getRedemptionStats(selectedReward.id).totalRedemptions}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Points Used</p>
                    <p className="text-2xl font-bold text-purple-600">{getRedemptionStats(selectedReward.id).totalPointsUsed.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedReward.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedReward.is_active ? 'Available' : 'Out of Stock'}
                  </span>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleViewRedemptionHistory(selectedReward)}
                          variant="outline"
                        >
                          <HistoryIcon className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View redemption history</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            setIsEditDialogOpen(true);
                          }}
                          className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit reward details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};