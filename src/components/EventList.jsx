import { useRef, useState } from "react";
import { EventCard } from "./EventCard";
import EventDetailsDialog from "./EventDetailsDialog";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isObjEmpty } from "../utils/util";

const eventsX = [
  {
    id: 1,
    name: "TARGET",
    time: "10:23-11:34",
    date: "Oct 17, 2025",
    location: "10107 Research Boulevard, Austin",
    distance: "8.43 miles away",
    males: 5,
    females: 7,
    details:
      "Join us for a shopping meetup at Target! This is a great opportunity to meet new people while browsing the latest deals. We'll meet at the main entrance and explore the store together. Feel free to bring your shopping list!",
  },
  {
    id: 2,
    name: "ROSS",
    time: "03:44-04:55",
    date: "Oct 15, 2025",
    location: "1501 E Whitestone Blvd, Cedar Park",
    distance: "18.17 miles away",
    males: 3,
    females: 4,
    details:
      "Discover amazing deals at Ross! This casual meetup is perfect for bargain hunters and those who love finding hidden gems. We'll explore the store together and share our best finds. All shopping enthusiasts welcome!",
  },
  {
    id: 3,
    name: "TARGET",
    time: "11:03-15:00",
    date: "Oct 24, 2025",
    location: "1101 C-Bar Ranch Trail, Cedar Park",
    distance: "18.27 miles away",
    males: 8,
    females: 6,
    details:
      "Extended shopping session at Target! With more time to explore, we can check out all departments and grab lunch at the in-store cafe. Perfect for those who want a relaxed shopping experience with new friends.",
  },
    {
    id: 1,
    name: "TARGET",
    time: "10:23-11:34",
    date: "Oct 17, 2025",
    location: "10107 Research Boulevard, Austin",
    distance: "8.43 miles away",
    males: 5,
    females: 7,
    details:
      "Join us for a shopping meetup at Target! This is a great opportunity to meet new people while browsing the latest deals. We'll meet at the main entrance and explore the store together. Feel free to bring your shopping list!",
  },
  {
    id: 2,
    name: "ROSS",
    time: "03:44-04:55",
    date: "Oct 15, 2025",
    location: "1501 E Whitestone Blvd, Cedar Park",
    distance: "18.17 miles away",
    males: 3,
    females: 4,
    details:
      "Discover amazing deals at Ross! This casual meetup is perfect for bargain hunters and those who love finding hidden gems. We'll explore the store together and share our best finds. All shopping enthusiasts welcome!",
  },
  {
    id: 3,
    name: "TARGET",
    time: "11:03-15:00",
    date: "Oct 24, 2025",
    location: "1101 C-Bar Ranch Trail, Cedar Park",
    distance: "18.27 miles away",
    males: 8,
    females: 6,
    details:
      "Extended shopping session at Target! With more time to explore, we can check out all departments and grab lunch at the in-store cafe. Perfect for those who want a relaxed shopping experience with new friends.",
  },
    {
    id: 1,
    name: "TARGET",
    time: "10:23-11:34",
    date: "Oct 17, 2025",
    location: "10107 Research Boulevard, Austin",
    distance: "8.43 miles away",
    males: 5,
    females: 7,
    details:
      "Join us for a shopping meetup at Target! This is a great opportunity to meet new people while browsing the latest deals. We'll meet at the main entrance and explore the store together. Feel free to bring your shopping list!",
  },
  {
    id: 2,
    name: "ROSS",
    time: "03:44-04:55",
    date: "Oct 15, 2025",
    location: "1501 E Whitestone Blvd, Cedar Park",
    distance: "18.17 miles away",
    males: 3,
    females: 4,
    details:
      "Discover amazing deals at Ross! This casual meetup is perfect for bargain hunters and those who love finding hidden gems. We'll explore the store together and share our best finds. All shopping enthusiasts welcome!",
  },
  {
    id: 3,
    name: "TARGET",
    time: "11:03-15:00",
    date: "Oct 24, 2025",
    location: "1101 C-Bar Ranch Trail, Cedar Park",
    distance: "18.27 miles away",
    males: 8,
    females: 6,
    details:
      "Extended shopping session at Target! With more time to explore, we can check out all departments and grab lunch at the in-store cafe. Perfect for those who want a relaxed shopping experience with new friends.",
  },
    {
    id: 1,
    name: "TARGET",
    time: "10:23-11:34",
    date: "Oct 17, 2025",
    location: "10107 Research Boulevard, Austin",
    distance: "8.43 miles away",
    males: 5,
    females: 7,
    details:
      "Join us for a shopping meetup at Target! This is a great opportunity to meet new people while browsing the latest deals. We'll meet at the main entrance and explore the store together. Feel free to bring your shopping list!",
  },
  {
    id: 2,
    name: "ROSS",
    time: "03:44-04:55",
    date: "Oct 15, 2025",
    location: "1501 E Whitestone Blvd, Cedar Park",
    distance: "18.17 miles away",
    males: 3,
    females: 4,
    details:
      "Discover amazing deals at Ross! This casual meetup is perfect for bargain hunters and those who love finding hidden gems. We'll explore the store together and share our best finds. All shopping enthusiasts welcome!",
  },
  {
    id: 3,
    name: "TARGET",
    time: "11:03-15:00",
    date: "Oct 24, 2025",
    location: "1101 C-Bar Ranch Trail, Cedar Park",
    distance: "18.27 miles away",
    males: 8,
    females: 6,
    details:
      "Extended shopping session at Target! With more time to explore, we can check out all departments and grab lunch at the in-store cafe. Perfect for those who want a relaxed shopping experience with new friends.",
  },
    {
    id: 1,
    name: "TARGET",
    time: "10:23-11:34",
    date: "Oct 17, 2025",
    location: "10107 Research Boulevard, Austin",
    distance: "8.43 miles away",
    males: 5,
    females: 7,
    details:
      "Join us for a shopping meetup at Target! This is a great opportunity to meet new people while browsing the latest deals. We'll meet at the main entrance and explore the store together. Feel free to bring your shopping list!",
  },
  {
    id: 2,
    name: "ROSS",
    time: "03:44-04:55",
    date: "Oct 15, 2025",
    location: "1501 E Whitestone Blvd, Cedar Park",
    distance: "18.17 miles away",
    males: 3,
    females: 4,
    details:
      "Discover amazing deals at Ross! This casual meetup is perfect for bargain hunters and those who love finding hidden gems. We'll explore the store together and share our best finds. All shopping enthusiasts welcome!",
  },
  {
    id: 3,
    name: "TARGET",
    time: "11:03-15:00",
    date: "Oct 24, 2025",
    location: "1101 C-Bar Ranch Trail, Cedar Park",
    distance: "18.27 miles away",
    males: 8,
    females: 6,
    details:
      "Extended shopping session at Target! With more time to explore, we can check out all departments and grab lunch at the in-store cafe. Perfect for those who want a relaxed shopping experience with new friends.",
  },
];

export function EventList({ events, userhandle, userlatitude, userlongitude, setIsLoading, profiledata }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const resultsRef = useRef(null);

  // Calculate total pages
  const totalPages = Math.ceil(events?.length / eventsPerPage);

  // Get current page events
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events?.slice(indexOfFirstEvent, indexOfLastEvent);

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
    <div className="w-[90%] mx-auto">
      {currentEvents?.length > 1 && (
        <div className="flex justify-between mb-2">
          <Select
            className='ms-auto'
            required
            name="sortby"
            onValueChange={(value) => {
              if (value == "Date") {
                events.sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate));
              } else if (value == "Distance") {
                events.sort((a, b) => a.distance - b.distance);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Date">Date</SelectItem>
                <SelectItem value="Distance">Distance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Events Grid */}
      <div className="" ref={resultsRef}>
        <div
          className={`col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 transition-opacity duration-300 ${
            false ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {currentEvents?.map((event) => (
            <EventCard
              key={event?.id}
              setSelectedEvent={setSelectedEvent}
              event={event}
              userlatitude={userlatitude}
              userlongitude={userlongitude}
            />
          ))}
        </div>
      </div>
    
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="my-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Previous Button */}
          <Button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            variant="outline"
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
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
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
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
