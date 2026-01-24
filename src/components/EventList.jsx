import { useRef, useState, useMemo } from "react";
import { EventCard } from "./EventCard";
import EventDetailsDialog from "./EventDetailsDialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Filter, Calendar, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { haversine } from "../utils/util";

export function EventList({ events, userlatitude, userlongitude, setIsLoading, profiledata }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortBy, setSortBy] = useState("Date");
  const resultsRef = useRef(null);

  // Memoized sorted events
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    const eventsCopy = [...events];
    if (sortBy === "Date") {
      return eventsCopy.sort((a, b) => new Date(a.eventdate || a.date) - new Date(b.eventdate || b.date));
    } else if (sortBy === "Distance") {
      // Calculate distance for each event and sort
      return eventsCopy.map(event => ({
        ...event,
        distance: haversine(userlatitude, userlongitude, event.latitude, event.longitude)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return eventsCopy;
  }, [events, sortBy, userlatitude, userlongitude]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header with stats and sorting */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Events</h2>
            </div>
            {sortedEvents?.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                {sortedEvents.length} events found
              </Badge>
            )}
          </div>

          {sortedEvents?.length > 1 && (
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Date">Sort by Date</SelectItem>
                    <SelectItem value="Distance">Sort by Distance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-8" ref={resultsRef}>
        {sortedEvents?.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100"
          >
            {sortedEvents?.map((event, index) => (
              <EventCard
                key={event?.id || `event-${index}`}
                setSelectedEvent={setSelectedEvent}
                event={event}
                userlatitude={userlatitude}
                userlongitude={userlongitude}
                profiledata={profiledata}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria or check back later for new events.</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          profiledata={profiledata}
        />
      )}
    </div>
  );
}
