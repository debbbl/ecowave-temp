import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ChevronDownIcon,
  GiftIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SearchIcon,
  UsersIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { useAuthContext } from "../Auth/AuthProvider";

export const Layout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  
  const navItems = [
    {
      icon: <LayoutDashboardIcon size={21} />,
      label: "Dashboard",
      path: "/",
    },
    { 
      icon: <CalendarIcon size={21} />,
      label: "Events",
      path: "/events",
    },
    { 
      icon: <UsersIcon size={21} />,
      label: "Users",
      path: "/users",
    },
    { 
      icon: <MessageSquareIcon size={21} />,
      label: "Mission",
      path: "/missions",
    },
    { 
      icon: <GiftIcon size={21} />,
      label: "Rewards",
      path: "/rewards",
    },
    { 
      icon: <MessageSquareIcon size={21} />,
      label: "Feedback",
      path: "/feedback",
    },
    { 
      icon: <HistoryIcon size={21} />,
      label: "Admin History",
      path: "/admin-history",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    navigate('/admin-profile');
    setIsProfileMenuOpen(false);
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      // Navigate to appropriate page based on search context
      // For now, we'll navigate to users page with search
      navigate(`/users?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  return (
    <div className="flex w-full items-start relative bg-[#f8f8f8]">
      {/* Sidebar */}
      <div className="flex flex-col w-[238px] h-screen bg-white relative">
        {/* Header */}
        <header className="w-full h-[52px] p-3 bg-transparent">
          <div className="flex items-center">
            <img
              className="w-[75px] h-[41px] object-cover"
              alt="Roche logo"
              src="/roche-logo.png"
            />
            <div className="ml-2 font-bold text-black text-xl [font-family:'Sansation',Helvetica]">
              EcoWave Hub
            </div>
          </div>
          <Separator className="mt-2" />
        </header>

        {/* Navigation Menu */}
        <nav className="mt-[23px] px-[13px] flex-1">
          <ul className="space-y-[5px]">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link to={item.path}>
                  <div
                    className={`flex items-center p-2.5 rounded-[30px] ${
                      location.pathname === item.path ? "bg-[#d7fde4]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-[25px] flex justify-center">
                      {item.icon}
                    </div>
                    <span className="ml-5 font-normal text-black text-sm [font-family:'Roboto',Helvetica]">
                      {item.label}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-[13px] border-t">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start p-2.5 rounded-[30px] hover:bg-gray-50"
          >
            <div className="w-[25px] flex justify-center">
              <LogOutIcon size={21} />
            </div>
            <span className="ml-5 font-normal text-black text-sm [font-family:'Roboto',Helvetica]">
              Sign Out
            </span>
          </Button>
        </div>
        
        <Separator orientation="vertical" className="absolute right-0 h-full" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen">
        {/* Top Header */}
        <div className="w-full h-16 bg-white relative">
          <div className="flex justify-between items-center h-full px-[30px]">
            {/* Global Search */}
            <form onSubmit={handleGlobalSearch} className="relative w-[182px] h-9">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="h-[22px] w-[22px] text-gray-400" />
              </div>
              <Input
                className="pl-10 h-9 rounded-[30px] border-[#cacaca]"
                placeholder="Global search..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
              />
            </form>

            {/* Profile Dropdown */}
            <Dialog open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center border border-black rounded-full h-9 px-1 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Avatar className="h-[30px] w-[30px]">
                    <AvatarImage src={profile?.avatar_url || "/image.png"} alt="User" />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="mx-2 text-sm font-medium">
                    {profile?.full_name || user?.email}
                  </span>
                  <ChevronDownIcon className="h-[30px] w-[19px] ml-1" />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px] p-0" side="bottom">
                <DialogHeader className="sr-only">
                  <DialogTitle>Profile Menu</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || "/image.png"} alt="User" />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{profile?.full_name || user?.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{profile?.role || 'Admin'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 h-auto"
                      onClick={handleProfileClick}
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      <span className="text-sm">View Profile</span>
                    </Button>
                  </div>
                  
                  <div className="border-t py-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOutIcon className="h-4 w-4 mr-3" />
                      <span className="text-sm">Sign Out</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="absolute bottom-0 w-full" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};