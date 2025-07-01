import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { ImageUpload } from "../../components/ui/image-upload";
import { 
  CalendarIcon,
  ShieldIcon,
  LockIcon,
  CameraIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  EyeIcon,
  EyeOffIcon
} from "lucide-react";
import { useAuthContext } from "../../components/Auth/AuthProvider";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
}

interface SecurityFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const AdminProfile = (): JSX.Element => {
  const { user, profile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    bio: 'Passionate about sustainability and environmental conservation. Leading EcoWave initiatives to create a greener future.',
    avatar_url: profile?.avatar_url || ''
  });

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleProfileSave = () => {
    // Here you would typically save to your backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // Show success message
  };

  const handlePasswordChange = () => {
    if (securityForm.new_password !== securityForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    if (securityForm.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // Here you would typically update the password
    console.log('Changing password');
    setIsChangePasswordOpen(false);
    setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
    // Show success message
  };

  return (
    <div className="p-4 md:p-10 space-y-7">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
          Admin Profile
        </h1>
        <p className="mt-2 md:mt-4 text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Header */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.avatar_url || profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {profileData.first_name.charAt(0)}{profileData.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-[#009A5A] hover:bg-[#008a50] text-white shadow-lg"
                >
                  <CameraIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {profileData.first_name} {profileData.last_name}
                  </h2>
                  <p className="text-lg text-gray-600 mt-1">{profileData.email}</p>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${
                      isEditing 
                        ? 'bg-gray-600 hover:bg-gray-700' 
                        : 'bg-[#009A5A] hover:bg-[#008a50]'
                    } text-white`}
                  >
                    {isEditing ? (
                      <>
                        <XIcon className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordOpen(true)}
                  >
                    <LockIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <ShieldIcon className="h-4 w-4 mr-2 text-[#009A5A]" />
                  <span className="font-medium">Role:</span>
                  <span className="ml-2 capitalize">{profile?.role || 'Admin'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-[#009A5A]" />
                  <span className="font-medium">Joined:</span>
                  <span className="ml-2">
                    {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                rows={4}
              />
            </div>

            {/* Profile Picture Upload - Only show when editing */}
            {isEditing && (
              <div className="md:col-span-2">
                <ImageUpload
                  label="Profile Picture"
                  value={profileData.avatar_url || ''}
                  onChange={(url) => setProfileData(prev => ({ ...prev, avatar_url: url }))}
                  placeholder="Upload a profile picture or enter image URL"
                  maxSize={2}
                />
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfileSave}
                className="bg-[#009A5A] hover:bg-[#008a50] text-white"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={securityForm.current_password}
                  onChange={(e) => setSecurityForm(prev => ({ ...prev, current_password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? "text" : "password"}
                  value={securityForm.new_password}
                  onChange={(e) => setSecurityForm(prev => ({ ...prev, new_password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={securityForm.confirm_password}
                  onChange={(e) => setSecurityForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="bg-[#009A5A] hover:bg-[#008a50] text-white"
              >
                <LockIcon className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};