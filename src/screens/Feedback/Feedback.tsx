import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../components/ui/tooltip";
import { 
  SearchIcon, 
  FilterIcon, 
  MessageSquareIcon, 
  StarIcon, 
  CalendarIcon,
  UserIcon,
  MailIcon,
  TrashIcon,
  EyeIcon,
  MoreVerticalIcon,
  ArrowLeftIcon,
  DownloadIcon,
  MapPinIcon,
  XIcon,
  SortAscIcon,
  SortDescIcon
} from "lucide-react";
import { useFeedback } from "../../hooks/useFeedback";
import { useEvents } from "../../hooks/useEvents";

interface FeedbackItem extends Record<string, any> {
  id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  subject: string;
  message: string;
  rating?: number;
  event_title?: string;
  event_id?: string;
  created_at: string;
}

interface EventWithFeedback {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  feedback_count: number;
  average_rating?: number;
}

type SortField = 'date' | 'rating' | 'user' | 'event';
type SortOrder = 'asc' | 'desc';

export const Feedback = (): JSX.Element => {
  const { feedback, loading: feedbackLoading, error: feedbackError, deleteFeedback, markAsRead } = useFeedback();
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedEvent, setSelectedEvent] = useState<EventWithFeedback | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'events' | 'feedback'>('events');

  const loading = feedbackLoading || eventsLoading;
  const error = feedbackError || eventsError;

  // Process events with feedback data - ONLY show events that have feedback
  const eventsWithFeedback: EventWithFeedback[] = events
    .filter(event => event.status === 'completed') // Only show completed events
    .map(event => {
      const eventFeedback = feedback.filter((item: FeedbackItem) => item.event_id === event.id);
      const totalRating = eventFeedback.reduce((sum: number, item: FeedbackItem) => sum + (item.rating || 0), 0);
      const averageRating = eventFeedback.length > 0 ? totalRating / eventFeedback.length : 0;
      
      return {
        ...event,
        feedback_count: eventFeedback.length,
        average_rating: averageRating > 0 ? averageRating : undefined
      };
    })
    .filter(event => event.feedback_count > 0) // ONLY show events with feedback
    .filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get feedback for selected event with filtering and sorting
  const eventFeedback = useMemo(() => {
    if (!selectedEvent) return [];
    
    let filtered = feedback.filter((item: FeedbackItem) => item.event_id === selectedEvent.id);
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: FeedbackItem) =>
        item.user_name.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.user_email.toLowerCase().includes(query)
      );
    }
    
    // Apply rating filter
    if (ratingFilter !== "all") {
      switch (ratingFilter) {
        case 'high':
          filtered = filtered.filter((item: FeedbackItem) => (item.rating || 0) >= 4);
          break;
        case 'medium':
          filtered = filtered.filter((item: FeedbackItem) => (item.rating || 0) >= 3 && (item.rating || 0) < 4);
          break;
        case 'low':
          filtered = filtered.filter((item: FeedbackItem) => (item.rating || 0) < 3 && (item.rating || 0) > 0);
          break;
        case 'no-rating':
          filtered = filtered.filter((item: FeedbackItem) => !item.rating);
          break;
      }
    }
    
    // Sort feedback
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'user':
          aValue = a.user_name.toLowerCase();
          bValue = b.user_name.toLowerCase();
          break;
        case 'event':
          aValue = a.event_title?.toLowerCase() || '';
          bValue = b.event_title?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [selectedEvent, feedback, searchQuery, ratingFilter, sortField, sortOrder]);

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
    setRatingFilter("all");
    setEventFilter("all");
  };

  const handleDeleteFeedback = async (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      const { error } = await deleteFeedback(id);
      if (error) {
        alert('Error deleting feedback: ' + error);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const { error } = await markAsRead(id);
    if (error) {
      alert('Error marking as read: ' + error);
    }
  };

  const handleExportFeedback = (event: EventWithFeedback) => {
    const eventFeedbackData = feedback.filter((item: FeedbackItem) => item.event_id === event.id);
    const csvContent = [
      'Event,User Name,User Email,Rating,Comment,Date Submitted',
      ...eventFeedbackData.map((item: FeedbackItem) => 
        `"${event.title}","${item.user_name}","${item.user_email}","${item.rating || 'N/A'}","${item.message.replace(/"/g, '""')}","${new Date(item.created_at).toLocaleDateString()}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-feedback.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)}/5)</span>
      </div>
    );
  };

  const EventCard = ({ event }: { event: EventWithFeedback }) => (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
      <CardContent className="p-0" onClick={() => {
        setSelectedEvent(event);
        setCurrentView('feedback');
      }}>
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {event.feedback_count} feedback
          </div>
          <div className="absolute top-4 left-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-white/90 hover:bg-white w-8 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportFeedback(event);
                    }}
                  >
                    <DownloadIcon className="h-4 w-4 text-gray-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export feedback data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            {event.average_rating && renderStars(event.average_rating)}
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
          <div className="space-y-2 text-gray-600 text-sm">
            <p className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </p>
            <p className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {event.feedback_count} participant{event.feedback_count !== 1 ? 's' : ''} provided feedback
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FeedbackCard = ({ item }: { item: FeedbackItem }) => (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardContent className="p-6" onClick={() => {
        setSelectedFeedback(item);
        setIsViewDialogOpen(true);
      }}>
        <div className="flex justify-between items-start mb-4">
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
          <div className="flex items-center space-x-2">
            {item.rating && renderStars(item.rating)}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item.id);
                    }}
                  >
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFeedback(item.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVerticalIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-700 line-clamp-3">{item.message}</p>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-500">
              {new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
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
            Feedback
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading feedback...
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
            Feedback
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading feedback: {error}
          </p>
        </div>
      </div>
    );
  }

  const totalFeedback = feedback.length;
  const eventFeedbackCount = feedback.filter((item: FeedbackItem) => item.event_id).length;
  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum: number, item: FeedbackItem) => sum + (item.rating || 0), 0) / feedback.filter((item: FeedbackItem) => item.rating).length
    : 0;

  return (
    <TooltipProvider>
      <div className="p-4 md:p-10 space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              {currentView === 'feedback' && selectedEvent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentView('events');
                          setSelectedEvent(null);
                          clearFilters();
                        }}
                        className="h-10 w-10"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Back to events</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
                  {currentView === 'events' ? 'Event Feedback' : `Feedback: ${selectedEvent?.title}`}
                </h1>
                <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
                  {currentView === 'events' 
                    ? 'View feedback from participants after they have posted their feedback on events'
                    : `${eventFeedback.length} feedback responses for this event`
                  }
                </p>
              </div>
            </div>
          </div>
          {currentView === 'feedback' && selectedEvent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleExportFeedback(selectedEvent)}
                    className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export Feedback
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export feedback data to CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#009A5A]/10 rounded-lg mr-4">
                  <MessageSquareIcon className="h-8 w-8 text-[#009A5A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Events with Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{eventsWithFeedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <StarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 md:p-6">
            {/* Search and Filter Bar */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  className="pl-10 h-12 bg-white text-base"
                  placeholder={currentView === 'events' ? "Search events..." : "Search feedback by user name, email, or message..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters and Sort - Only show for feedback view */}
              {currentView === 'feedback' && (
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Rating Filter */}
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="high">4-5 Stars</SelectItem>
                        <SelectItem value="medium">3-4 Stars</SelectItem>
                        <SelectItem value="low">1-3 Stars</SelectItem>
                        <SelectItem value="no-rating">No Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="px-4">
                          <FilterIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Advanced filters</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <div className="flex gap-1">
                      {[
                        { field: 'date' as SortField, label: 'Date' },
                        { field: 'rating' as SortField, label: 'Rating' },
                        { field: 'user' as SortField, label: 'User' }
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
                </div>
              )}
              
              {/* Results count and clear filters */}
              {currentView === 'feedback' && (searchQuery || ratingFilter !== "all") && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing {eventFeedback.length} feedback responses
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-[#009A5A] hover:text-[#008a50]"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {/* Content based on current view */}
            {currentView === 'events' ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Events with Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsWithFeedback.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {eventsWithFeedback.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No events match your search.' : 'No events with feedback available yet. Feedback will appear here once participants submit their responses.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Feedback Responses</h3>
                  {selectedEvent && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{eventFeedback.length} responses</span>
                      {selectedEvent.average_rating && (
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{selectedEvent.average_rating.toFixed(1)} average</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {eventFeedback.map((item: FeedbackItem) => (
                    <FeedbackCard key={item.id} item={item} />
                  ))}
                </div>
                {eventFeedback.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery || ratingFilter !== "all" ? 'No feedback matches your search criteria.' : 'No feedback available for this event.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedFeedback.user_avatar || ''} alt={selectedFeedback.user_name} />
                    <AvatarFallback>{selectedFeedback.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedFeedback.user_name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MailIcon className="h-4 w-4 mr-2" />
                      <span>{selectedFeedback.user_email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedFeedback.event_title && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Event</h4>
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{selectedFeedback.event_title}</span>
                      </div>
                    </div>
                  )}

                  {selectedFeedback.rating && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
                      {renderStars(selectedFeedback.rating)}
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submitted</h4>
                    <p className="text-gray-600">
                      {new Date(selectedFeedback.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleMarkAsRead(selectedFeedback.id)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Mark as Read
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark this feedback as read</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDeleteFeedback(selectedFeedback.id);
                            setIsViewDialogOpen(false);
                          }}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete this feedback permanently</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};