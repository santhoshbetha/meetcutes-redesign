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

const sampleProfiles = [
  {
    id: 1,
    name: "Abbie",
    age: 23,
    education: "Bachelor's level",
    location: "Asan Nadia, Yishun",
    status: "Middleclass",
    language: "Marathi",
    lastLogin: "Jan 11th, 11:14 pm",
    handle: "abbie_handle",
    phone: "3332344434",
    email: "abbie@example.com",
    facebook: "abbieFB",
    instagram: "abbieIG",
    linkedin: "AbbieLinkedIn",
    bio: "Here we go",
  },
];

export function UserEventsSub1({profiledata, userhandle, latitude, longitude, userstate }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {searchUsersData, setSearchUsersData} = useContext(SearchAndUserEventsDataContext);
   // const [isLoading, setIsLoading] = useState(false);


   const [selectedUser, setSelectedUser] = useState(sampleProfiles[0]);
   const [currentPage, setCurrentPage] = useState(1);
   const usersPerPage = 10;
   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const currentUsers = sampleProfiles.slice(indexOfFirstUser, indexOfLastUser);

  const { isLoading, error, data, status, refetch } = useUserEvents1({
      userid: profiledata?.userid
  });

  return (
    <>
      {/* User Profile Dialog */}
      <Dialog>
        <Card className="bg-transparent border-accent border-none shadow-none hover:shadow-none">
          <div className="flex flex-row items-center justify-between md:mx-2 lg:mx-4">
            <CardTitle>
              <span className="md:text-lg">Events you have created</span>
            </CardTitle>
            <DialogTrigger asChild>
              <button className="text-sm md:text-base font-medium text-primary hover:text-primary/80 transition-colors">
                  Create Event
              </button>
            </DialogTrigger>
          </div>
          <CardContent className="space-y-2">
            {isObjEmpty(data) && (
              <Card className="mt-3 w-full lg:w-[80%] bg-yellow-50 dark:bg-background">
                <div className="py-4 px-4 text-xl">
                    Nothing here. Create new events to see them listed here.
                </div>
              </Card>
            )}
          </CardContent>
        <CreateEvent/>
        </Card>
        {!isObjEmpty(data) && (
          <EventList
            events={data}
            userhandle={userhandle}
            userlatitude={latitude}
            userlongitude={longitude}
            />
        )}
      </Dialog>
    </>
  );
}

/*
      <UserList
        users={searchUsersData}
        setIsLoading={setIsLoading}
      />
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

                <CreateEvent 
                  onClose={() => setShowCreateModal(false)} 
                />

                    <>
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
            Create Event 33
          </Button>
        </div>
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
          />
      )}

    </>
*/
