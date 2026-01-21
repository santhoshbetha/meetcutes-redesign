import { useState, useContext } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/EventList";
import { CreateEvent } from "@/components/CreateEvent";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useUserEvents1 } from "@/hooks/useEvents";
import { isObjEmpty } from "@/utils/util";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchAndUserEventsDataContext } from '@/context/SearchAndUserEventsDataContext'
import { UserCard } from "../../../components/UserCard";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export function UserEventsSub1({profiledata, userhandle, latitude, longitude, userstate }) {
  const { isLoading, error, data, status, refetch } = useUserEvents1({
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
            <Card className="mt-3 w-full lg:w-[80%] bg-yellow-50 dark:bg-background">
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
          profiledata={profiledata}
        />
      )}
    </>
  );
}