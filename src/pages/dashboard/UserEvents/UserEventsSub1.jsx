import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/EventList";
import { CreateEvent } from "@/components/CreateEvent";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useUserEvents1 } from "@/hooks/useEvents";
import { isObjEmpty } from "@/utils/util";

export function UserEventsSub1({profiledata, userhandle, latitude, longitude, userstate }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { isLoading, error, data, status, refetch } = useUserEvents1({
      userid: profiledata?.userid
  });

  return (
    <div>
      <Card className="bg-transparent border-accent border-none shadow-none hover:shadow-none">
        <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
          <CardTitle>
            <span className="md:text-lg">Events you have created</span>
          </CardTitle>
          <Button
            onClick={() => setShowCreateModal(true)}
            data-toggle="tooltip"
            title="Set userhandle to create event"
            variant="ghost"
            className="text-teal-700"
          >
            Create Event
          </Button>
        </div>
        <CardContent className="space-y-2">
           {isObjEmpty(data) && (
            <Card className="mt-3 w-[100%] lg:w-[80%] bg-yellow-50 dark:bg-background">
              <div className="py-4 px-4 text-xl">
                  Nothing here. Create new events to see them listed here.
              </div>
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
          />
      )}

      {showCreateModal && (
        <CreateEvent 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
}

/*
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold">Events you have created</h2>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
                <RefreshCw className="w-4 h-4 text-primary group-hover:text-primary/80 group-hover:rotate-180 transition-all duration-300" />
            </button>
            </div>
            <a href="#" className="text-sm md:text-base font-medium text-primary hover:text-primary/80 transition-colors">
                Create Event
            </a>
        </div>
*/
