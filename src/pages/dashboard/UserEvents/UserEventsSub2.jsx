import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isObjEmpty, haversine } from "@/utils/util";
import { useUserEvents2 } from "@/hooks/useEvents";
import secureLocalStorage from "react-secure-storage";
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Search, Heart } from "lucide-react";

export function UserEventsSub2({ profiledata, userhandle, latitude, longitude }) {
  const navigate = useNavigate();
  const { data } = useUserEvents2({
      userhandle: userhandle,
      lat: latitude,
      long: longitude
  });

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
      <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
        <CardTitle>
          <span className="md:text-lg">Your Upcoming Events</span>
        </CardTitle>
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
