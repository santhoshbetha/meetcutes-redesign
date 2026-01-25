import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function EventCard({ setSelectedEvent, event, userlatitude, userlongitude, profiledata }) {
  const [distance, setDistance] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendingCount, setAttendingCount] = useState(0);

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
      className="group relative p-3 shadow-lg border-2 border-border/80 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.01] cursor-pointer hover:border-primary bg-card overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Registered indicator */}
      {isRegistered && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">R</span>
          </div>
        </div>
      )}

      <div className="relative p-4">
        {/* Header with icon and title */}
        <div className="flex items-start gap-2 mb-3">
          <div className="p-1.5 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 shrink-0">
            {getEventIcon(event?.locationdata?.locationname)}
          </div>
          <div className="flex-1 min-w-0">
            {/* Event Title */}
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-1 truncate">
              {event?.title || event?.name || 'Event Title'}
            </h3>
            {/* Location Name */}
            <p className="text-sm font-medium text-muted-foreground truncate">
              📍 {event?.locationdata?.locationname || event?.location}
            </p>
          </div>
        </div>

        {/* Event details - compact layout */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {event?.starttime?.substring(0, 5)} - {event?.endtime?.substring(0, 5)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {dayjs(event?.eventdate).format('MMM D, YYYY')}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-foreground leading-tight line-clamp-2">
              {event?.locationdata?.address1}
            </span>
          </div>
        </div>

        {/* Footer with attendees and distance */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{attendingCount} attending</span>
          </div>
          <div className="px-2 py-1 bg-linear-to-r from-primary/20 to-primary/10 rounded-md border border-primary/20">
            <p className="text-xs font-bold text-primary">
              {distance.toFixed(1)} mi
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
