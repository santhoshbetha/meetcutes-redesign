import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, Users, Heart, Coffee, Music, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { haversine, isObjEmpty } from "../utils/util";
import dayjs from "dayjs";

const getEventIcon = (locationName) => {
  const name = locationName?.toLowerCase() || '';
  if (name.includes('target') || name.includes('store') || name.includes('shop')) return '🛍️';
  if (name.includes('ross') || name.includes('clothing')) return '👕';
  if (name.includes('music') || name.includes('concert')) return '🎵';
  if (name.includes('photo') || name.includes('camera')) return '📷';
  return '❤️';
};

const getSampleInterests = () => {
  const interests = [
    { name: 'Shopping', icon: Coffee },
    { name: 'Music', icon: Music },
    { name: 'Photography', icon: Camera },
    { name: 'Food', icon: Heart },
  ];
  return interests.slice(0, Math.floor(Math.random() * 3) + 1);
};

export function EventCard({ setSelectedEvent, event, userlatitude, userlongitude, profiledata }) {
  const [distance, setDistance] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendingCount, setAttendingCount] = useState(0);
  const interests = getSampleInterests();

  // Function to get attendees count from attendeeslist
  const getAttendeesCount = (attendeeslist) => {
    if (isObjEmpty(attendeeslist)) return 0;
    
    if (Array.isArray(attendeeslist) === false) {  // if string (from postgres)
      return attendeeslist?.replace(/\{|\}/gm, "").split(",").filter(attendee => attendee && attendee.trim()).length;
    } else {
      return attendeeslist.filter(attendee => attendee && attendee.trim()).length;
    }
  };

  useEffect(() => {
    const distance = haversine(userlatitude, userlongitude, event?.latitude, event?.longitude);
    setDistance(distance);
  }, [event?.latitude, event?.longitude, userlatitude, userlongitude]);

  useEffect(() => {
    if (isObjEmpty(event?.attendeeslist)) {
        setIsRegistered(false);
        setAttendingCount(0);
    } else {
        let attendeeslistObj3
        if (Array.isArray(event?.attendeeslist) == false) {  // if string (from postgres)
            attendeeslistObj3 = event?.attendeeslist?.replace(/\{|\}/gm, "").split(",")
        } else {
            attendeeslistObj3 = event?.attendeeslist
        }

        const count = attendeeslistObj3.filter(attendee => attendee && attendee.trim()).length;
        setAttendingCount(count);

        if (attendeeslistObj3?.map(attendee => attendee?.toLowerCase()).includes(profiledata?.userhandle?.toLowerCase())) {
            setIsRegistered(true)
        } else {
            setIsRegistered(false)
        }
    }
  }, [event, profiledata]);

  // Listen for external updates to this event (register/unregister from dialog/page)
  useEffect(() => {
    const handler = (e) => {
      try {
        const detail = e?.detail || {};
        const eventId = detail.eventId;
        if (!eventId) return;
        const thisEventId = event?.eventid || event?.id;
        if (String(thisEventId) !== String(eventId)) return;

        const updatedList = detail.attendeeslist;
        if (!updatedList || updatedList.length === 0) {
          setIsRegistered(false);
          setAttendingCount(0);
          return;
        }
        
        const count = Array.isArray(updatedList) 
          ? updatedList.filter(attendee => attendee && attendee.trim()).length 
          : updatedList.replace(/\{|\}/gm, "").split(",").filter(attendee => attendee && attendee.trim()).length;
        setAttendingCount(count);
        
        const normalized = updatedList.map(h => (h || "").toString().toLowerCase());
        if (normalized.includes((profiledata?.userhandle || "").toString().toLowerCase())) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('event-updated', handler);
    return () => window.removeEventListener('event-updated', handler);
  }, [event, profiledata]);

  return (
    <Card
      key={event?.id}
      onClick={() => setSelectedEvent(event)}
      className="group relative p-3 sm:p-4 md:p-6 shadow-xl border-2 border-border/80 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-primary bg-linear-to-br from-card via-card/95 to-card/90 overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Registered indicator */}
      {isRegistered && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">R</span>
          </div>
        </div>
      )}

      <div className="relative p-6">
        {/* Header with icon and title */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl border border-primary/20 shrink-0">
            {getEventIcon(event?.locationdata?.locationname)}
          </div>
          <div className="flex-1 min-w-0">
            {/* Event Title */}
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-1 truncate">
              {event?.title || event?.name || 'Event Title'}
            </h3>
            {/* Location Name */}
            <p className="text-sm sm:text-base font-medium text-muted-foreground mb-2 truncate">
              📍 {event?.locationdata?.locationname || event?.location}
            </p>
            <div className="w-6 h-0.5 sm:w-8 bg-linear-to-r from-primary to-primary/60 rounded-full"></div>
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-background/60 rounded-lg border border-border/30 hover:bg-background/80 transition-colors">
            <div className="p-1.5 sm:p-2 bg-primary/15 rounded-lg shrink-0">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {event?.starttime?.substring(0, 5)} - {event?.endtime?.substring(0, 5)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-background/60 rounded-lg border border-border/30 hover:bg-background/80 transition-colors">
            <div className="p-1.5 sm:p-2 bg-blue-500/15 rounded-lg shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {dayjs(event?.eventdate).format('MMM D, YYYY')}
            </span>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-background/60 rounded-lg border border-border/30 hover:bg-background/80 transition-colors">
            <div className="p-1.5 sm:p-2 bg-green-500/15 rounded-lg mt-0.5 shrink-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground leading-relaxed line-clamp-2">
              {event?.locationdata?.address1}
            </span>
          </div>
        </div>

        {/* Interests tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4" hidden>
          {interests.map((interest) => (
            <Badge
              key={interest.name}
              variant="secondary"
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <interest.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              {interest.name}
            </Badge>
          ))}
        </div>

        <Separator className="my-3 sm:my-4" />

        {/* Footer with attendees and distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{attendingCount} attending</span>
          </div>
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-linear-to-r from-primary/20 to-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs sm:text-sm font-bold text-primary">
              {distance.toFixed(1)} mi
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
