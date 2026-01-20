import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isObjEmpty, haversine } from "@/utils/util";
import { useUserEvents2 } from "@/hooks/useEvents";
import secureLocalStorage from "react-secure-storage";
import { Separator } from '@/components/ui/separator';

export function UserEventsSub2({ profiledata, userhandle, latitude, longitude }) {
  const [loading, setLoading] = useState(false);
  const [sortmsg, setSortmsg] = useState("Sort by date");
  
  const { isLoading, error, data, status, refetch } = useUserEvents2({
      userhandle: profiledata?.userhandle,
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
  }, [data]);

  const sortClick = (e) => {
      e.preventDefault();
      if (sortmsg == "Sort by date") {
        setSortmsg("Sort by distance")
        data.sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate));
      } else if (sortmsg == "Sort by distance") {
        data.sort((a, b) => a.distance - b.distance);
        setSortmsg("Sort by date")
      }
  };

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
          <Card className="mt-3 w-full lg:w-[80%] bg-yellow-50 dark:bg-background">
            <div className="py-4 px-4 text-xl">
              Nothing here. Search and register to events in your area.
            </div>
          </Card>
        )}
        {!isObjEmpty(data) && (
          <EventList 
            events={data}
            userhandle={userhandle}
            userlatitude={latitude}
            userlongitude={longitude}
          />
        )}
      </CardContent>
    </Card>
  );
}
