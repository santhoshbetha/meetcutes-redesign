import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, X, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { isObjEmpty } from "../utils/util";

export default function EventDetailsDialog({ event, onClose, profiledata }) {
  const [eventDetails, setEventDetails] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (isObjEmpty(eventDetails?.attendeeslist)) {
        setIsRegistered(false)
    } else {
        let attendeeslistObj3
        if (Array.isArray(eventDetails?.attendeeslist) == false) {  // if string (from postgres)
            attendeeslistObj3 = eventDetails?.attendeeslist?.replace(/\{|\}/gm, "").split(",")
        } else {
            attendeeslistObj3 = eventDetails?.attendeeslist
        }
    
        if (attendeeslistObj3?.map(attendee => attendee?.toLowerCase()).includes(profiledata?.userhandle.toLowerCase())) {
            setIsRegistered(true)
        } else {
            setIsRegistered(false)
        }
    }
  }, [eventDetails, profiledata]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-border/50 animate-in zoom-in-95 duration-200 pt-0 dark:border-3">
        <div className="p-6 md:p-8">
          <div className="flex justify-between">
            {/* Event Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {event?.name}33
            </h2>
            {/* Close Button */}
            <Button
              className="bg-background hover:bg-muted rounded-lg transition-colors group"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-dark group-hover:text-foreground" />
            </Button>
          </div>

          {/* Event Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-medium">{event?.time}</span>
            </div>

            <div className="flex items-center gap-3 text-blue-600">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-medium">{event?.date}</span>
            </div>

            <div className="flex items-center gap-3 text-dark">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-base font-medium">{event?.location}</span>
            </div>
          </div>

          {/* Attendees Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendees
            </h3>
            <div className="space-y-2 pl-7">
              <p className="text-base text-muted-foreground">
                <span className="font-medium">Males:</span> {event?.males || 0}
              </p>
              <p className="text-base text-muted-foreground">
                <span className="font-medium">Females:</span>{" "}
                {event?.females || 0}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Details</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {event?.details ||
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}
            </p>
          </div>

          {/* Register Button */}
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            CLICK TO REGISTER
          </button>
        </div>
      </Card>
    </div>
  );
}
