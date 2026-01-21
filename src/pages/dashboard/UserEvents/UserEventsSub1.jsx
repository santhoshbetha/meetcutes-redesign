import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/EventList";
import { CreateEvent } from "@/components/CreateEvent";
import { useUserEvents1 } from "@/hooks/useEvents";
import { isObjEmpty } from "@/utils/util";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Sparkles } from "lucide-react";

export function UserEventsSub1({profiledata, userhandle, latitude, longitude }) {
  const { data } = useUserEvents1({
      userid: profiledata?.userid
  });
  

  return (
    <>
      {/* User Profile Dialog */}
      <Card className="bg-transparent border-accent border-none shadow-none hover:shadow-none">
        <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
          <CardTitle>
            <span className="md:text-lg">Events you have created</span>
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm md:text-base font-medium text-primary hover:text-primary/80 transition-colors">
                  Create Event
              </button>
            </DialogTrigger>
            <CreateEvent/>
          </Dialog>
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
                    <Button className="bg-primary hover:bg-primary/90">
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