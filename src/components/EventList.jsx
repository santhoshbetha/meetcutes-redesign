import { useRef, useState, useMemo } from "react";
import { EventCard } from "./EventCard";
import EventDetailsDialog from "./EventDetailsDialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, LayoutGrid, Filter, Calendar, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventList({ events, userlatitude, userlongitude, setIsLoading, profiledata }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Date");
  const eventsPerPage = 8;
  const resultsRef = useRef(null);

  // Memoized sorted events
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    const eventsCopy = [...events];
    if (sortBy === "Date") {
      return eventsCopy.sort((a, b) => new Date(a.eventdate || a.date) - new Date(b.eventdate || b.date));
    } else if (sortBy === "Distance") {
      return eventsCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return eventsCopy;
  }, [events, sortBy]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedEvents?.length / eventsPerPage);

  // Get current page events
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents?.slice(indexOfFirstEvent, indexOfLastEvent);

  // Pagination handlers
  const goToPage = page => {
    if (page !== currentPage) {
      setIsLoading(true);
      setCurrentPage(page);
      localStorage.setItem('page', page);
      setTimeout(() => {
        setIsLoading(false);
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Helper function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Near the beginning: show 1, 2, 3, 4, ..., last
      pages.push(2, 3, 4);
      pages.push('ellipsis-end');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end: show 1, ..., last-3, last-2, last-1, last
      pages.push('ellipsis-start');
      pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push('ellipsis-start');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return pages;
  };

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

          {currentEvents?.length > 1 && (
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
        {currentEvents?.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100"
          >
            {currentEvents?.map((event, index) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Previous Button */}
          <Button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            variant="outline"
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent border-primary/20 hover:border-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {getPageNumbers().map((page, index) => {
              if (typeof page === 'string') {
                // Render ellipsis
                return (
                  <span
                    key={`${page}-${index}`}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }
              // Render page number button
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background border border-border hover:bg-muted text-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            variant="outline"
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent border-primary/20 hover:border-primary"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

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
