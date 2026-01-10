import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UsersSearch } from "./UsersSearch";
import { SearchAndUserEventsDataContext } from '@/context/SearchAndUserEventsDataContext';
import { AutoCompleteDataContext } from '@/context/AutoCompleteDataContext';
import { UserEventsMain } from "./UserEvents/UserEventsMain";
import { Profile } from "./Profile";
import { EventsSearch } from "./EventsSearch";
import { useAuth } from "../../context/AuthContext";
import { isObjEmpty } from "../../utils/util";
import { updateUserInfo } from "../../services/user.service";
import { getAutoCompleteData } from '@/services/location.service';
import { updatePasswordRetryCount } from '@/services/register.service';

export function Dashboard() {
  const {user, profiledata, setProfiledata} = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const datenow = new Date(Date.now());
  const profiledataupdate = useRef(0);
  const {logininitsDone, setLogininitsDone} = useContext(SearchAndUserEventsDataContext);
  const {autocompletedata, setAutoCompletedata} = useContext(AutoCompleteDataContext);

  useEffect(() => {
    if (!user) {
      navigate('/')
    } 
  }, []);

  const loadAutoCompletedata = async (latitude, longitude) => {
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
    setLoading(false);
  };

  const updateTimeOfLogin = async (logintimedata) => {
    const res = await updateUserInfo(user?.id, logintimedata);
    if (res.success) {
      setProfiledata({...profiledata, ...logintimedata});
    } else {
      console.log(res.msg);
    }
    setLoading(false);
  }

  useEffect(() => {
    const loginInits = async () => {        
      if (!isObjEmpty(profiledata) && (!logininitsDone)) {
        //
        // reset password retry count to zero
        //
        if (profiledata?.password_retry_count > 0) {
          const res = await updatePasswordRetryCount({
            email: profiledata?.email,
            count: 0
          });
        }
        //
        //
        //
        setLoading(true);
        updateTimeOfLogin({timeoflogin: user?.last_sign_in_at});
        setLoading(false);

        setLogininitsDone(true)
      }
    }
    
    loginInits();
  }, []);

  useEffect(() => {
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
  }, [profiledata]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/60 shadow-lg sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("search")}
              className={`group relative px-6 md:px-10 py-6 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === "search"
                  ? "text-primary bg-gradient-to-b from-primary/10 to-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Search Events
              {activeTab === "search" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`group relative px-6 md:px-10 py-6 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === "events"
                  ? "text-primary bg-gradient-to-b from-primary/10 to-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Your Events
              {activeTab === "events" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`group relative px-6 md:px-10 py-6 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === "profile"
                  ? "text-primary bg-gradient-to-b from-primary/10 to-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Your Profile
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`group relative px-6 md:px-10 py-6 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === "users"
                  ? "text-primary bg-gradient-to-b from-primary/10 to-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Search Users
              {activeTab === "users" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

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
          userstate={profiledata?.userstate}
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
      ) : activeTab === "profile" ? (
        <Profile />
      ) : (
        <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {activeTab === "search" ? "Search" : "Search Users"}
          </h1>
          <p className="text-muted-foreground">
            This page is under construction.
          </p>
        </main>
      )}
    </div>
  );
}
