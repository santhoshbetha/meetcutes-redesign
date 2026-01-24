import { useRef, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UsersSearch } from "./UsersSearch";
import { SearchAndUserEventsDataContext } from '@/context/SearchAndUserEventsDataContext';
import { AutoCompleteDataContext } from '@/context/AutoCompleteDataContext';
import { UserEventsMain } from "./UserEvents/UserEventsMain";
import { Profile } from "./Profile";
import { EventsSearch } from "./EventsSearch";
import { Settings } from "../Settings";
import { Photos } from "../Photos";
import { useAuth } from "../../context/AuthContext";
import { isObjEmpty } from "../../utils/util";
import { updateUserInfo, logoutUser } from "../../services/user.service";
import { getAutoCompleteData } from '@/services/location.service';
import { updatePasswordRetryCount } from '@/services/register.service';
import { successAlert } from "@/services/alert.service";
import { useQueryClient } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import {
  Search,
  Calendar,
  User,
  Users,
  Menu,
  X,
  Home,
  Settings as SettingsIcon,
  LogOut,
  Camera,
  CalendarSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MeetCutesSpinner } from '@/components/ui/MeetCutesSpinner';

export function Dashboard() {
  const {user, profiledata, profileLoading, setProfiledata, userSession} = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const profiledataupdate = useRef(0);
  const queryClient = useQueryClient();
  const {logininitsDone, setLogininitsDone, setSearchUsersData} = useContext(SearchAndUserEventsDataContext);
  const {autocompletedata, setAutoCompletedata} = useContext(AutoCompleteDataContext);

  const navigationItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      description: "Manage your profile information"
    },
    {
      id: "photos",
      label: "My Photos",
      icon: Camera,
      description: "Upload and manage your photos"
    },
    {
      id: "events",
      label: "My Events",
      icon: CalendarSearch,
      description: "Manage your created events"
    },
    {
      id: "search",
      label: "Search Events",
      icon: Search,
      description: "Find and discover events"
    },
    {
      id: "users",
      label: "Search Users",
      icon: Users,
      description: "Find and connect with users"
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      description: "Account and privacy settings"
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/')
    } 
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'photos', 'events', 'search', 'users', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabId);
    navigate(`/dashboard?${newSearchParams.toString()}`, { replace: true });
  };

  const loadAutoCompletedata = useCallback(async (latitude, longitude) => {
    const distance = 241401; // 150 miles
    const res = await getAutoCompleteData({
      lat: latitude,
      lng: longitude,
      distance: distance
    });
    if (res.success) {
      if (res.data.length == 0) {
          await setAutoCompletedata(['123 Address']);
      } else {
          await setAutoCompletedata(res.data);
      }
    } else {
      setAutoCompletedata([])
    }
  }, [setAutoCompletedata]);

  const updateTimeOfLogin = useCallback(async (logintimedata) => {
    const res = await updateUserInfo(user?.id, logintimedata);
    if (res.success) {
      setProfiledata({...profiledata, ...logintimedata});
    } else {
      console.log(res.msg);
    }
  }, [user?.id, setProfiledata, profiledata]);

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) {
      localStorage.clear();
      setSearchUsersData(null);
      secureLocalStorage.clear();
      setAutoCompletedata(null);
      navigate('/');
      successAlert('', 'Logout Successful');
    } else {
      localStorage.clear();
      setSearchUsersData(null);
      secureLocalStorage.clear();
      setAutoCompletedata(null);
      navigate('/');
    }
    queryClient.clear();
  };

  useEffect(() => {
    const loginInits = async () => {        
      if (!isObjEmpty(profiledata) && (!logininitsDone)) {
        //
        // reset password retry count to zero
        //
        if (profiledata?.password_retry_count > 0) {
          await updatePasswordRetryCount({
            email: profiledata?.email,
            count: 0
          });
        }
        //
        //
        //
        updateTimeOfLogin({timeoflogin: user?.last_sign_in_at});

        setLogininitsDone(true)
      }
    }
    
    loginInits();
  }, [profiledata, logininitsDone, setLogininitsDone, updateTimeOfLogin, user?.last_sign_in_at]);

  useEffect(() => {
      const datenow = new Date(Date.now());
      const loadAutodata = async () => {
        await loadAutoCompletedata(profiledata?.latitude, profiledata?.longitude)
      }

      async function resetPrevious() {
        const newdateofprevious = (new Date()).toLocaleDateString('en-US', { timeZone: 'America/New_York' });

        const res = await updateUserInfo(user?.id, {
          previouseventsattendeeslist: null,
          previouseventsattendeesdate: newdateofprevious
        });
        if (res.success) {
          setProfiledata({...profiledata, 
              previouseventsattendeeslist: null,
              previouseventsattendeesdate: newdateofprevious
          }); 
        } 
      }
      
      if (!isObjEmpty(profiledata)) {
        profiledataupdate.current = profiledataupdate.current + 1
        //setRerender(true)
        //
        //
        //
        if (isObjEmpty(autocompletedata)) {
          loadAutodata();
        }

        //
        // Clear previouseventsattendeeslist and update previouseventsattendeesdate
        //
        if (!isObjEmpty(profiledata?.previouseventsattendeesdate)) {
          let dif = Math.abs(datenow - new Date(profiledata?.previouseventsattendeesdate))
          let dayssinceprevious = Math.floor(dif/(1000 * 3600 * 24));

          if (dayssinceprevious > 123) { //4 months
              resetPrevious();
          }
        }
      }
  }, [profiledata, autocompletedata, loadAutoCompletedata, setProfiledata, user?.id]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Loading Spinner for Profile Data */}
      {(profileLoading || (user && !profiledata)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <MeetCutesSpinner size="large" />
            <p className="mt-4 text-lg font-medium text-foreground">Loading your profile...</p>
            <p className="text-sm text-muted-foreground">Please wait while we set up your dashboard</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs mt-0.5 ${
                      activeTab === item.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Logout</div>
                <div className="text-xs mt-0.5 text-muted-foreground">
                  Sign out of your account
                </div>
              </div>
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {profiledata?.userhandle || user?.email || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profiledata?.userstate || 'Online'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto lg:pb-0 pb-20">
          {activeTab === "search" ? (
            <EventsSearch
              profiledata={profiledata}
              userhandle={profiledata?.userhandle}
              latitude={profiledata?.latitude}
              longitude={profiledata?.longitude}
              questionairevaluesset={profiledata?.questionairevaluesset}
              userstate={profiledata?.userstate}
              onetimepaymentrequired={profiledata?.onetimefeesrequired && !profiledata?.onetimefeespaid}
            />
          ) : activeTab === "events" ? (
            <UserEventsMain
              profiledata={profiledata}
              userhandle={profiledata?.userhandle}
              latitude={profiledata?.latitude}
              longitude={profiledata?.longitude}
              questionairevaluesset={profiledata?.questionairevaluesset}
              userstate={profiledata?.userstate}
              onetimepaymentrequired={profiledata?.onetimefeesrequired && !profiledata?.onetimefeespaid}
            />
          ) : activeTab === "users" ? (
            <UsersSearch
              user={user}
              userhandle={profiledata?.userhandle}
              gender={profiledata?.gender}
              latitude={profiledata?.latitude}
              longitude={profiledata?.longitude}
              questionairevaluesset={profiledata?.questionairevaluesset}
              userstate={profiledata?.userstate}
              onetimepaymentrequired={profiledata?.onetimefeesrequired && !profiledata?.onetimefeespaid}
            />
          ) : activeTab === "photos" ? (
            <Photos />
          ) : activeTab === "profile" ? (
            <Profile />
          ) : activeTab === "settings" ? (
            <Settings />
          ) : (
            <div className="max-w-400 mx-auto px-4 md:px-8 py-8 md:py-12">
              <h1 className="text-2xl md:text-3xl font-bold mb-6">
                {activeTab === "search" ? "Search Events" : "Search Users"}
              </h1>
              <p className="text-muted-foreground">
                This page is under construction.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate hidden sm:block">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
