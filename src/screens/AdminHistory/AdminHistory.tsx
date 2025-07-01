import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { 
  SearchIcon, 
  FilterIcon, 
  HistoryIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  UserIcon,
  CalendarIcon,
  GiftIcon,
  DatabaseIcon,
  ClockIcon,
  TrendingUpIcon
} from "lucide-react";
import { useAdminHistory } from "../../hooks/useAdminHistory";

interface AdminHistoryItem extends Record<string, any> {
  id: string;
  admin_name: string;
  admin_email: string;
  admin_avatar?: string;
  action_type: string;
  entity_type: string;
  details: string;
  created_at: string;
}

export const AdminHistory = (): JSX.Element => {
  const { history, loading, error, filterHistory } = useAdminHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedActionType, setSelectedActionType] = useState<"all" | "create" | "update" | "delete">("all");

  const filteredHistory = history.filter((item: AdminHistoryItem) => {
    const matchesSearch = 
      item.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = 
      selectedActionType === "all" ||
      item.action_type.toLowerCase() === selectedActionType;
    
    return matchesSearch && matchesAction;
  });

  const timeFilteredHistory = selectedTimeRange === "all" 
    ? filteredHistory 
    : filterHistory(selectedTimeRange).filter((item: AdminHistoryItem) => {
        const matchesSearch = 
          item.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesAction = 
          selectedActionType === "all" ||
          item.action_type.toLowerCase() === selectedActionType;
        
        return matchesSearch && matchesAction;
      });

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'create':
        return <PlusIcon className="h-4 w-4 text-green-600" />;
      case 'update':
        return <PencilIcon className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <TrashIcon className="h-4 w-4 text-red-600" />;
      case 'export':
        return <DownloadIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <DatabaseIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      case 'reward':
        return <GiftIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <DatabaseIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const HistoryCard = ({ item }: { item: AdminHistoryItem }) => (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.admin_avatar || ''} alt={item.admin_name} />
                <AvatarFallback>{item.admin_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                {getActionIcon(item.action_type)}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{item.admin_name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action_type)}`}>
                  {item.action_type}
                </span>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              {getEntityIcon(item.entity_type)}
              <span className="text-sm font-medium text-gray-600 capitalize">
                {item.entity_type}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">{item.details}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Admin History
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading admin activity...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Admin History
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading admin history: {error}
          </p>
        </div>
      </div>
    );
  }

  const todayActions = filterHistory('today').length;
  const weekActions = filterHistory('week').length;
  const monthActions = filterHistory('month').length;

  return (
    <div className="p-4 md:p-10 space-y-7">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
          Admin History
        </h1>
        <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
          Track administrative actions and system changes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-[#009A5A]/10 rounded-lg mr-4">
                <HistoryIcon className="h-8 w-8 text-[#009A5A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <TrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{weekActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{monthActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4 md:p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-[280px]">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                className="pl-10 h-10 bg-white"
                placeholder="Search admin actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Time Range Filter */}
              <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedTimeRange === 'all' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedTimeRange("all")}
                >
                  All Time
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedTimeRange === 'today' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedTimeRange("today")}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedTimeRange === 'week' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedTimeRange("week")}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedTimeRange === 'month' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedTimeRange("month")}
                >
                  Month
                </Button>
              </div>

              {/* Action Type Filter */}
              <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedActionType === 'all' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedActionType("all")}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedActionType === 'create' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedActionType("create")}
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedActionType === 'update' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedActionType("update")}
                >
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedActionType === 'delete' 
                      ? 'bg-white text-[#009A5A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setSelectedActionType("delete")}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            {timeFilteredHistory.map((item: AdminHistoryItem) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {timeFilteredHistory.length === 0 && (
            <div className="text-center py-12">
              <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || selectedActionType !== 'all' || selectedTimeRange !== 'all'
                  ? 'No admin actions match your filters.'
                  : 'No admin actions recorded yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};