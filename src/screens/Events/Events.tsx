import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../components/ui/tooltip";
import { ImageUpload } from "../../components/ui/image-upload";
import { 
  PlusIcon, 
  DownloadIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  MapPinIcon,
  SearchIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  UsersIcon,
  ClockIcon,
  XIcon
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { Event } from "../../lib/supabase";

interface EventFormData {
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  image_url: string;
  status: "upcoming" | "ongoing" | "completed";
  max_participants: number;
}

type SortField = 'title' | 'date' | 'location' | 'participants';
type SortOrder = 'asc' | 'desc';

export const Events = (): JSX.Element => {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = events.map(event => event.location).filter(Boolean);
    return [...new Set(locations)];
  }, [events]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Status filter - include all if "all" is selected
      if (selectedStatus !== "all" && event.status !== selectedStatus) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) &&
            !event.description?.toLowerCase().includes(query) &&
            !event.location?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Location filter
      if (locationFilter !== "all" && event.location !== locationFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter !== "all") {
        const eventDate = new Date(event.start_date || event.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        switch (dateFilter) {
          case 'today':
            if (eventDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'week':
            if (eventDate < thisWeek) return false;
            break;
          case 'month':
            if (eventDate < thisMonth) return false;
            break;
        }
      }
      
      return true;
    });

    // Sort events
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.start_date || a.date);
          bValue = new Date(b.start_date || b.date);
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'participants':
          aValue = a.participant_count || 0;
          bValue = b.participant_count || 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [events, selectedStatus, searchQuery, locationFilter, dateFilter, sortField, sortOrder]);

  const handleStatusChange = (status: "all" | "upcoming" | "ongoing" | "completed") => {
    setSelectedStatus(status);
    // Reset filters when changing status
    setSearchQuery("");
    setLocationFilter("all");
    setDateFilter("all");
  };

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
    setLocationFilter("all");
    setDateFilter("all");
  };

  const handleExportParticipants = (event: Event) => {
    const csvContent = `Event: ${event.title}\nParticipants: ${event.participant_count || 0}\nDate: ${event.date}\nLocation: ${event.location}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateEvent = async (formData: EventFormData) => {
    console.log('handleCreateEvent called with:', formData);
    
    try {
      // Convert the form data to match what the createEvent function expects
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        image_url: formData.image_url,
        max_participants: formData.max_participants,
        // Use start_date as the main date for compatibility
        date: formData.start_date.split('T')[0], // Extract just the date part
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      console.log('Processed event data:', eventData);
      
      const { error } = await createEvent(eventData);
      
      if (!error) {
        console.log('Event created successfully, closing dialog');
        setIsCreateDialogOpen(false);
        // Clear search to ensure new event is visible
        setSearchQuery("");
        setLocationFilter("all");
        setDateFilter("all");
        setSelectedStatus("all");
      } else {
        console.error('Error creating event:', error);
        alert('Error creating event: ' + error);
      }
    } catch (err) {
      console.error('Unexpected error in handleCreateEvent:', err);
      alert('Unexpected error creating event: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEditEvent = async (eventId: string, formData: EventFormData) => {
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        image_url: formData.image_url,
        max_participants: formData.max_participants,
        date: formData.start_date.split('T')[0],
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      const { error } = await updateEvent(eventId, eventData);
      
      if (!error) {
        setIsEditDialogOpen(false);
      } else {
        alert('Error updating event: ' + error);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Error updating event: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const { error } = await deleteEvent(eventId);
      
      if (error) {
        alert('Error deleting event: ' + error);
      }
    }
  };

  const formatEventDate = (event: Event) => {
    if (event.start_date && event.end_date) {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      // If same day, show date with time range
      if (startDate.toDateString() === endDate.toDateString()) {
        return {
          date: startDate.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          time: `${startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })} - ${endDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })}`
        };
      } else {
        // Different days
        return {
          date: `${startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} - ${endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}`,
          time: null
        };
      }
    } else {
      // Fallback to single date
      const eventDate = new Date(event.date);
      return {
        date: eventDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: null
      };
    }
  };

  const EventForm = ({ event, onSubmit, mode }: { 
    event?: Event, 
    onSubmit: (data: EventFormData) => void,
    mode: 'create' | 'edit' 
  }) => {
    // Initialize form data with proper date formatting
    const [formData, setFormData] = useState<EventFormData>(() => {
      const now = new Date();
      const defaultStartDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      defaultStartDate.setHours(9, 0, 0, 0); // 9 AM
      const defaultEndDate = new Date(defaultStartDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours later (5 PM)

      return {
        title: event?.title || '',
        start_date: event?.start_date 
          ? new Date(event.start_date).toISOString().slice(0, 16)
          : defaultStartDate.toISOString().slice(0, 16),
        end_date: event?.end_date 
          ? new Date(event.end_date).toISOString().slice(0, 16)
          : defaultEndDate.toISOString().slice(0, 16),
        location: event?.location || '',
        description: event?.description || '',
        image_url: event?.image_url || '',
        status: event?.status || 'upcoming',
        max_participants: event?.max_participants || 50
      };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted with data:', formData);
      
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Please enter an event title');
        return;
      }
      
      if (!formData.start_date) {
        alert('Please select a start date and time');
        return;
      }
      
      if (!formData.end_date) {
        alert('Please select an end date and time');
        return;
      }
      
      if (!formData.location.trim()) {
        alert('Please enter an event location');
        return;
      }
      
      if (!formData.description.trim()) {
        alert('Please enter an event description');
        return;
      }

      // Validate that end date is after start date
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        alert('End date and time must be after start date and time');
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error('Error in form submission:', err);
        alert('Error submitting form: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input 
            id="title" 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter event title"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date & Time *</Label>
            <Input 
              id="start_date" 
              type="datetime-local" 
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date & Time *</Label>
            <Input 
              id="end_date" 
              type="datetime-local" 
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required 
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input 
            id="location" 
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter event location"
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
            placeholder="Enter event description"
            rows={3}
          />
        </div>
        
        {/* Enhanced Image Upload */}
        <ImageUpload
          label="Event Image"
          value={formData.image_url}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          placeholder="Enter image URL or upload an event photo"
          maxSize={10}
          disabled={isSubmitting}
        />
        
        <div className="space-y-2">
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input 
            id="max_participants" 
            type="number" 
            min="1"
            value={formData.max_participants}
            onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select 
            id="status" 
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            disabled={isSubmitting}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
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
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Event' : 'Save Changes'
          )}
        </Button>
      </form>
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const dateInfo = formatEventDate(event);
    
    return (
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
        <CardContent className="p-0" onClick={() => {
          setSelectedEvent(event);
          setIsViewDialogOpen(true);
        }}>
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center">
              <UsersIcon className="h-3 w-3 mr-1" />
              {event.participant_count || 0}
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
                        handleExportParticipants(event);
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export participants</p>
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
                        setSelectedEvent(event);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit event</p>
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
                        handleDeleteEvent(event.id);
                      }}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete event</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Status badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <ClockIcon className="h-3 w-3 mr-1" />
                {event.status}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold line-clamp-1">{event.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
            <div className="space-y-2 text-gray-600 text-sm">
              <p className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{dateInfo.date}</span>
              </p>
              {dateInfo.time && (
                <p className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{dateInfo.time}</span>
                </p>
              )}
              <p className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Events
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading events...
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
            Events
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading events: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
              Events
            </h1>
            <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
              Manage and track sustainability events
            </p>
          </div>
          
          {/* Create Event Button with Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#009A5A] hover:bg-[#008a50] text-white py-3 px-4 text-lg font-semibold w-full lg:w-auto"
                onClick={() => {
                  console.log('Create Event button clicked');
                  setIsCreateDialogOpen(true);
                }}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm mode="create" onSubmit={handleCreateEvent} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Content */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => handleStatusChange(value as any)}>
              <div className="flex justify-center md:justify-start">
                <TabsList className="bg-[#F3F4F6] p-1.5 rounded-lg">
                  <TabsTrigger 
                    value="all" 
                    className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upcoming" 
                    className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ongoing"
                    className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Ongoing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed"
                    className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="mt-6 space-y-4">
                {/* Search Bar with Integrated Filters */}
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-10 pr-80 h-12 bg-white text-base"
                    placeholder="Search events by name, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Integrated Filter Dropdowns */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-[120px] h-8 border-0 bg-gray-50">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-[100px] h-8 border-0 bg-gray-50">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
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
                        { field: 'title' as SortField, label: 'Name' },
                        { field: 'date' as SortField, label: 'Date' },
                        { field: 'location' as SortField, label: 'Location' },
                        { field: 'participants' as SortField, label: 'Participants' }
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
                      Showing {filteredAndSortedEvents.length} of {events.length} events
                      {selectedStatus !== "all" && ` (${selectedStatus})`}
                    </span>
                    {(searchQuery || locationFilter !== "all" || dateFilter !== "all") && (
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
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {filteredAndSortedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery || locationFilter !== "all" || dateFilter !== "all"
                        ? 'No events match your search criteria.'
                        : 'No events found.'}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {filteredAndSortedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery || locationFilter !== "all" || dateFilter !== "all"
                        ? 'No events match your search criteria.'
                        : 'No upcoming events found.'}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="ongoing" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {filteredAndSortedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery || locationFilter !== "all" || dateFilter !== "all"
                        ? 'No events match your search criteria.'
                        : 'No ongoing events found.'}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {filteredAndSortedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery || locationFilter !== "all" || dateFilter !== "all"
                        ? 'No events match your search criteria.'
                        : 'No completed events found.'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <EventForm 
                mode="edit" 
                event={selectedEvent} 
                onSubmit={(formData) => handleEditEvent(selectedEvent.id, formData)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <img 
                  src={selectedEvent.image_url} 
                  alt={selectedEvent.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
                <p className="text-gray-600">{selectedEvent.description}</p>
                <div className="space-y-2">
                  {selectedEvent.start_date && selectedEvent.end_date ? (
                    <>
                      <p className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {new Date(selectedEvent.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {new Date(selectedEvent.start_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })} - {new Date(selectedEvent.end_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  <p className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {selectedEvent.location}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {selectedEvent.participant_count || 0} / {selectedEvent.max_participants} participants
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEvent.status}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => handleExportParticipants(selectedEvent)}
                        className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Export Participants
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export participant list to CSV</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};