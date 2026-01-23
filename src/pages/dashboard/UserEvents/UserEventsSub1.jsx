import { useState, useEffect } from "react";
import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/EventList";
import { CreateEvent } from "@/components/CreateEvent";
import { useUserEvents1 } from "@/hooks/useEvents";
import { isObjEmpty } from "@/utils/util";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Sparkles } from "lucide-react";

const delay = ms => new Promise(res => setTimeout(res, ms));

export function UserEventsSub1({profiledata, userhandle, latitude, longitude, error }) {
  const [reload, setReload] = useState(true);
  const { isLoading, error, data, status, refetch } = useUserEvents1({
      userid: profiledata?.userid
  });

  // Rate-limited refetch: only refetch at most once every 20s when userid becomes available
  const lastRefetchRef = useRef(0);
  const [refreshDisabled, setRefreshDisabled] = useState(false);

  useEffect(() => {
    if (typeof refetch !== 'function' || !profiledata?.userid) return;
    const now = Date.now();
    if (now - lastRefetchRef.current >= 20000) {
      lastRefetchRef.current = now;
      refetch();
    } else {
      console.log("UserEventsSub1 refetch skipped due to rate limiting");
    }
  }, [refetch, profiledata?.userid]);

  //console.log("UserEventsSub1 data:", data);

  useEffect(() => {
    if (reload == false) {
      delay(10000).then(async () => {
        setReload(true)
      })
    }
  }, [reload]);
  
  return (
    <>
      {/* User Profile Dialog */}
      <Card className="bg-transparent border-accent border-none shadow-none hover:shadow-none">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
          <CardTitle>
            <span className="md:text-lg">Events you have created</span>
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <button disabled={!!error} className="text-sm md:text-base font-medium text-primary hover:text-primary/80 transition-colors">
                  Create Event
              </button>
            </DialogTrigger>
            <CreateEvent/>
          </Dialog>
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
            <Card className="mt-3 w-full bg-gradient-to-br from-primary/5 via-background to-muted/20 border-2 border-primary/10 shadow-lg backdrop-blur-sm">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Events Created Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start creating amazing events and connect with people in your community. Your events will appear here once created.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90" disabled={!!error}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </DialogTrigger>
                  <CreateEvent/>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      {!isObjEmpty(data) && (
        <EventList
          events={data}
          userhandle={userhandle}
          userlatitude={latitude}
          userlongitude={longitude}
          profiledata={profiledata}
        />
      )}
    </>
  );
}