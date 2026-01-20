import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEventsSub1 } from "./UserEventsSub1";
import { UserEventsSub2 } from "./UserEventsSub2";
import { Calendar, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserEventsMain({ profiledata, userhandle, latitude, longitude, userstate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Events
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Manage your created events and track the events you're attending
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

      {/* Events Tabs */}
      <Card className="shadow-lg bg-card/50 dark:bg-card/40 backdrop-blur-sm border-2 border-border">
        <CardHeader className="pb-6">
          <Tabs defaultValue="createdevents" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 h-12">
              <TabsTrigger value="createdevents" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Events You Created</span>
                <span className="sm:hidden">Created</span>
              </TabsTrigger>
              <TabsTrigger value="registeredevents" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Events You're Attending</span>
                <span className="sm:hidden">Attending</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="createdevents" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Your Created Events</h3>
                    <p className="text-sm text-muted-foreground">
                      Events you've organized and are managing
                    </p>
                  </div>
                </div>
                <UserEventsSub1
                  profiledata={profiledata}
                  userhandle={userhandle}
                  latitude={latitude}
                  longitude={longitude}
                  userstate={userstate}
                />
              </div>
            </TabsContent>

            <TabsContent value="registeredevents" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Events You're Attending</h3>
                    <p className="text-sm text-muted-foreground">
                      Events you've registered for and plan to attend
                    </p>
                  </div>
                </div>
                <UserEventsSub2
                  profiledata={profiledata}
                  userhandle={userhandle}
                  latitude={latitude}
                  longitude={longitude}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      </div>
    </div>
  );
}
