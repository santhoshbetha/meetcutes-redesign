import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isObjEmpty, haversine } from "@/utils/util";
import { useUserEvents2 } from "@/hooks/useEvents";
import secureLocalStorage from "react-secure-storage";
import { Separator } from '@/components/ui/separator';
import { EventList } from "@/components/EventList";
import { CalendarIcon, Search, Heart } from "lucide-react";

const delay = ms => new Promise(res => setTimeout(res, ms));

export function UserEventsSub2({ profiledata, userhandle, latitude, longitude }) {
  const navigate = useNavigate();
  const [reload, setReload] = useState(true);
  const  { isLoading, error, data, status, refetch }  = useUserEvents2({
      userhandle: userhandle,
      lat: latitude,
      long: longitude
  });

  // Ensure we refetch when this tab mounts (and when userhandle becomes available)
  // Rate-limited refetch: only refetch at most once every 20s when userhandle becomes available
  const lastRefetchRef = useRef(0);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  useEffect(() => {
    if (typeof refetch !== 'function' || !userhandle) return;
    const now = Date.now();
    
    if (now - lastRefetchRef.current >= 20000) {
      lastRefetchRef.current = now;
      refetch();
    } else {
      console.log("UserEventsSub2 refetch skipped due to rate limiting");
    }
  }, [refetch, userhandle]);

  useEffect(() => {
    if (reload == false) {
        delay(10000).then(async () => {
            setReload(true)
        })
    }
}, [reload]);

  //console.log("UserEventsSub2 data:", data);

  useEffect(() => {
    if (!isObjEmpty (data)) {
        for (let key in data) {
            const distance = haversine(latitude, longitude, data[key].latitude, data[key].longitude);
            data[key].distance = distance;
        }
        //console.log("data here::", data)
    }

    if (data?.length > 0) {
        secureLocalStorage.setItem("data" , JSON.stringify(data));
    }
  }, [data, latitude, longitude]);

  return (
    <Card className="bg-transparent border-accent border-none shadow-none hover:shadow-none">
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
        <CardTitle>
          <span className="md:text-lg">Your Upcoming Events</span>
        </CardTitle>
        <div className="ml-2">
          <Button variant="outline" disabled={refreshDisabled} onClick={() => {
            if (typeof refetch === 'function') {
              lastRefetchRef.current = Date.now();
              refetch();
              setRefreshDisabled(true);
              setTimeout(() => setRefreshDisabled(false), 10000);
            }
          }}>
            Refresh
          </Button>
        </div>
      </div>
      <Separator />
      <CardContent className="space-y-2">
        {isObjEmpty(data) && (
          <Card className="mt-3 w-full bg-linear-to-br from-primary/5 via-background to-muted/20 border-2 border-primary/10 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Upcoming Events Yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Discover amazing events and meetups in your area. Start exploring and register for events that interest you!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/dashboard?tab=search')}>
                  <Search className="w-4 h-4 mr-2" />
                  Find Events
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard?tab=users')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Find People
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!isObjEmpty(data) && (
          <EventList 
            events={data}
            userhandle={userhandle}
            userlatitude={latitude}
            userlongitude={longitude}
            profiledata={profiledata}
          />
        )}
      </CardContent>
    </Card>
  );
}
