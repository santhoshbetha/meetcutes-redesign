import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, Users, Heart, Coffee, Music, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { haversine } from "../utils/util";
import dayjs from "dayjs";

const getEventIcon = (locationName) => {
  const name = locationName?.toLowerCase() || '';
  if (name.includes('target') || name.includes('store') || name.includes('shop')) return <Coffee className="w-5 h-5" />;
  if (name.includes('ross') || name.includes('clothing')) return <Heart className="w-5 h-5" />;
  if (name.includes('music') || name.includes('concert')) return <Music className="w-5 h-5" />;
  if (name.includes('photo') || name.includes('camera')) return <Camera className="w-5 h-5" />;
  return <Heart className="w-5 h-5" />;
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

export function EventCard({ setSelectedEvent, event, userlatitude, userlongitude }) {
  const [distance, setDistance] = useState(0);
  const interests = getSampleInterests();

  useEffect(() => {
    const distance = haversine(userlatitude, userlongitude, event?.latitude, event?.longitude);
    setDistance(distance);
  }, [event?.latitude, event?.longitude, userlatitude, userlongitude]);

  return (
    <Card
      key={event?.id}
      onClick={() => setSelectedEvent(event)}
      className="group relative p-3 sm:p-4 md:p-6 shadow-xl border-2 border-border/80 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-primary bg-linear-to-br from-card via-card/95 to-card/90 overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Header with icon and title */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl border border-primary/20 shrink-0">
            {getEventIcon(event?.locationdata?.locationname)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-1 truncate">
              {event?.locationdata?.locationname}
            </h3>
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
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {interests.map((interest, index) => (
            <Badge
              key={index}
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
            <span>{(event?.males || 0) + (event?.females || 0)} attending</span>
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
