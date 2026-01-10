import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEventsSub1 } from "./UserEventsSub1";
import { UserEventsSub2 } from "./UserEventsSub2";

export function UserEventsMain({ profiledata, userhandle, latitude, longitude, userstate }) {
  return (
    <Card className="bg-transparent mx-4 mt-2 border-none shadow-none hover:shadow-none">
      <CardHeader className="pb-0">
        <CardTitle>Your Events</CardTitle>
      </CardHeader>
      <Tabs defaultValue="createdevents" className="px-5 pb-4">
        <TabsList className="grid w-full grid-cols-2 pb-14 sm:pb-0">
          <TabsTrigger value="createdevents">
            Events you have created
          </TabsTrigger>
          <TabsTrigger value="registeredevents">
            Events you are registered
          </TabsTrigger>
        </TabsList>
        <TabsContent value="createdevents">
          <UserEventsSub1 
            profiledata={profiledata}
            userhandle={userhandle}
            latitude={latitude}
            longitude={longitude}
            userstate={userstate}
          />
        </TabsContent>
        <TabsContent value="registeredevents">
          <UserEventsSub2
            profiledata={profiledata}
            userhandle={userhandle}
            latitude={latitude}
            longitude={longitude}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
