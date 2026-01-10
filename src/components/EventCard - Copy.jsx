import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { haversine } from "../utils/util";
import dayjs from "dayjs";

export function EventCard({ setSelectedEvent, event, userlatitude, userlongitude }) {
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const distance = haversine(userlatitude, userlongitude, event?.latitude, event?.longitude);
    setDistance(distance)
  }, [event?.eventdate])

  return (
    <Card
      key={event?.id}
      onClick={() => setSelectedEvent(event)}
      className="group p-0 shadow-xl border-border/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-primary/40 bg-gradient-to-br from-card to-card/90"
    >
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
            {event?.locationdata?.locationname}
          </h3>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-background/50 rounded-xl border border-border/30">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-base font-semibold text-foreground">
              {event?.starttime?.substring(0, 5)}-{event?.endtime?.substring(0, 5)}
            </span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-background/50 rounded-xl border border-border/30">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-foreground">
              {dayjs(event?.eventdate).format('MMM D, YYYY')}
            </span>
          </div>

          <div className="flex items-start gap-4 p-3 bg-background/50 rounded-xl border border-border/30">
            <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-base font-medium text-foreground leading-relaxed">
              {event?.locationdata?.address1}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-lg">
              <p className="text-base font-bold text-primary">
                {distance.toFixed(1)} mi
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  /*
 
  */
}
