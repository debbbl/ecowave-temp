import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../components/ui/tooltip";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XIcon,
  EyeIcon,
  CalendarIcon, 
  CoinsIcon,
  UsersIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  TargetIcon,
  ImageIcon,
  ArrowLeftIcon
} from "lucide-react";
import { useMissions, Mission, MissionSubmission } from "../../hooks/useMissions";

interface MissionFormData {
  title: string;
  description: string;
  points: number;
}

export const Missions = (): JSX.Element => {
  const { 
    missions, 
    submissions, 
    loading, 
    error, 
    createMission, 
    updateMission, 
    deleteMission,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission
  } = useMissions();
  
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'missions' | 'submissions'>('missions');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!mission.title.toLowerCase().includes(query) &&
            !mission.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [missions, searchQuery]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      if (statusFilter !== "all" && submission.status !== statusFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!submission.user_name?.toLowerCase().includes(query) &&
            !submission.user_email?.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, searchQuery, statusFilter]);

  const handleCreateMission = async (formData: MissionFormData) => {
    try {
      // Add start_date as now
      const missionData = {
        ...formData,
        start_date: new Date().toISOString(),
      };
      const { error } = await createMission(missionData);
      if (!error) {
        setIsCreateDialogOpen(false);
      } else {
        alert('Error creating mission: ' + error);
      }
    } catch (err) {
      console.error('Unexpected error in handleCreateMission:', err);
      alert('Unexpected error creating mission');
    }
  };

  const handleEditMission = async (missionId: string, formData: MissionFormData) => {
    try {
      const { error } = await updateMission(missionId, formData);
      
      if (!error) {
        setIsEditDialogOpen(false);
      } else {
        alert('Error updating mission: ' + error);
      }
    } catch (err) {
      console.error('Error updating mission:', err);
      alert('Error updating mission');
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      const { error } = await deleteMission(missionId);
      
      if (error) {
        alert('Error deleting mission: ' + error);
      }
    }
  };

  const handleViewSubmissions = async (mission: Mission) => {
    setSelectedMission(mission);
    await fetchSubmissions(mission.id);
    setCurrentView('submissions');
  };

  const handleApproveSubmission = async (userId: string, missionId: string) => {
    if (!window.confirm('Are you sure you want to approve this submission?')) return;
    const { error } = await approveSubmission(userId, missionId);
    if (error) {
      alert('Error approving submission: ' + error);
    } else {
      alert('Submission approved! Points awarded to user.');
    }
  };

  const handleRejectSubmission = async (userId: string, missionId: string) => {
    const { error } = await rejectSubmission(userId, missionId);
    if (error) {
      alert('Error rejecting submission: ' + error);
    }
  };

  const MissionForm = ({ mission, onSubmit, mode }: { 
    mission?: Mission, 
    onSubmit: (data: MissionFormData) => void,
    mode: 'create' | 'edit' 
  }) => {
    const [formData, setFormData] = useState<MissionFormData>(() => ({
      title: mission?.title || '',
      description: mission?.description || '',
      points: mission?.points || 100,
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) {
        alert('Please enter a mission title');
        return;
      }
      if (!formData.description.trim()) {
        alert('Please enter a mission description');
        return;
      }
      if (!formData.points || formData.points <= 0) {
        alert('Please enter valid points (greater than 0)');
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error('Error in form submission:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Mission Title *</Label>
          <Input 
            id="title" 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required 
            disabled={isSubmitting}
            placeholder="Enter mission title"
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
            placeholder="Enter mission description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Points Reward *</Label>
          <Input 
            id="points" 
            type="number" 
            min="1"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
            required 
            disabled={isSubmitting}
          />
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
            mode === 'create' ? 'Create Mission' : 'Save Changes'
          )}
        </Button>
      </form>
    );
  };

  const MissionCard = ({ mission }: { mission: Mission }) => (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
      <CardContent className="p-6" onClick={() => {
        setSelectedMission(mission);
        setIsViewDialogOpen(true);
      }}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{mission.title}</h3>
          <div className="flex items-center text-[#009A5A] font-bold">
            <CoinsIcon className="h-4 w-4 mr-1" />
            <span>{mission.points}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{mission.description}</p>
        
        <div className="space-y-2 text-gray-600 text-sm mb-4">
          <p className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{new Date(mission.start_date).toLocaleDateString()} - {new Date(mission.end_date).toLocaleDateString()}</span>
          </p>
          <p className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            <span>{mission.submission_count || 0} submissions</span>
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            mission.status === 'active' ? 'bg-green-100 text-green-800' :
            mission.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {mission.status}
          </span>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubmissions(mission);
                    }}
                  >
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View submissions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMission(mission);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit mission</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMission(mission.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete mission</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SubmissionCard = ({ submission }: { submission: MissionSubmission }) => {
    // Debug: log the submission object to check status value
    console.log('SubmissionCard:', submission);
    return (
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={submission.user_avatar || ''} alt={submission.user_name} />
                <AvatarFallback>{submission.user_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{submission.user_name}</h3>
                <p className="text-sm text-gray-500">{submission.user_email}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              submission.status === 'approved' ? 'bg-green-100 text-green-800' :
              submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {submission.status}
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>{submission.photo_upload_count} photo(s) uploaded</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{new Date(submission.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Show Approve/Reject buttons only if status is pending (case-insensitive) */}
          {submission.status === 'PENDING' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleApproveSubmission(submission.user_id, submission.mission_id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleRejectSubmission(submission.user_id, submission.mission_id)}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XIcon className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Mission Management
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading missions...
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
            Mission Management
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] text-red-600">
            Error loading missions: {error}
          </p>
        </div>
      </div>
    );
  }

  const activeMissions = missions.filter(m => m.status === 'active').length;
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-10 space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView === 'submissions' && selectedMission && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentView('missions');
                        setSelectedMission(null);
                      }}
                      className="h-10 w-10"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Back to missions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
                {currentView === 'missions' ? 'Mission Management' : `Submissions: ${selectedMission?.title}`}
              </h1>
              <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
                {currentView === 'missions' 
                  ? 'Create and manage monthly missions for users'
                  : `Review and approve user submissions for ${selectedMission?.title}`
                }
              </p>
            </div>
          </div>
          
          {currentView === 'missions' && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#009A5A] hover:bg-[#008a50] text-white py-6 px-8 text-lg font-semibold w-full lg:w-auto">
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Create Mission
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Mission</DialogTitle>
                </DialogHeader>
                <MissionForm mode="create" onSubmit={handleCreateMission} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-[#009A5A]/10 rounded-lg mr-4">
                  <TargetIcon className="h-8 w-8 text-[#009A5A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Missions</p>
                  <p className="text-2xl font-bold text-gray-900">{missions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Missions</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <ImageIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content based on current view */}
        {currentView === 'missions' ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 md:p-6">
              {/* Search Bar */}
              <div className="relative w-full mb-6">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  className="pl-10 h-12 bg-white text-base"
                  placeholder="Search missions by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-center md:justify-start">
                  <TabsList className="bg-[#F3F4F6] p-1.5 rounded-lg">
                    <TabsTrigger 
                      value="all" 
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      All Missions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="active"
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger 
                      value="upcoming"
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed"
                      className="px-6 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#009A5A] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                  {filteredMissions.length === 0 && (
                    <div className="text-center py-12">
                      <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchQuery ? 'No missions match your search.' : 'No missions found. Create your first mission!'}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.filter(mission => mission.status === 'active').map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="upcoming" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.filter(mission => mission.status === 'upcoming').map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.filter(mission => mission.status === 'completed').map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 md:p-6">
              {/* Search and Filter Bar */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <div className="relative w-full lg:w-[280px]">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-10 h-10 bg-white"
                    placeholder="Search submissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      statusFilter === 'all' 
                        ? 'bg-white text-[#009A5A] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      statusFilter === 'pending' 
                        ? 'bg-white text-[#009A5A] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      statusFilter === 'approved' 
                        ? 'bg-white text-[#009A5A] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setStatusFilter("approved")}
                  >
                    Approved
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      statusFilter === 'rejected' 
                        ? 'bg-white text-[#009A5A] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Rejected
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSubmissions.map((submission) => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </div>
              
              {filteredSubmissions.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No submissions found for this mission.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Mission</DialogTitle>
            </DialogHeader>
            {selectedMission && (
              <MissionForm 
                mode="edit" 
                mission={selectedMission} 
                onSubmit={(formData) => handleEditMission(selectedMission.id, formData)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Mission Details</DialogTitle>
            </DialogHeader>
            {selectedMission && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{selectedMission.title}</h2>
                <p className="text-gray-600">{selectedMission.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Points Reward</p>
                    <p className="text-2xl font-bold text-[#009A5A]">{selectedMission.points}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedMission.submission_count || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Start: {new Date(selectedMission.start_date).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>End: {new Date(selectedMission.end_date).toLocaleDateString()}</span>
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMission.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedMission.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedMission.status}
                  </span>
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleViewSubmissions(selectedMission);
                    }}
                    className="bg-[#009A5A] hover:bg-[#008a50] text-white"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Submissions
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