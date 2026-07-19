import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUpcomingEventsSearchParams, useNotifyEvents } from "@/hooks/useEvents";
import { Container } from "@/components/Container";

export function Notifications() {
  const { profiledata } = useAuth();
  const notificationSearchParams = getUpcomingEventsSearchParams(profiledata);
  const {
    data: events = [],
    isLoading: loading,
    error,
    refetch: fetchUpcomingEvents,
  } = useNotifyEvents(notificationSearchParams);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysUntil = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return formatDate(eventDate);
  };

  const pickFirstText = (...values) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  };

  const getEventLocation = (event) => {
    return (
      pickFirstText(
        event?.locationdata?.locationname,
        event?.location,
        event?.locationname,
        event?.venue,
        event?.venue_name,
      ) || 'Location TBD'
    );
  };

  const getEventName = (event) => {
    return (
      pickFirstText(
        event?.title,
        event?.eventname,
        event?.name,
        event?.eventtitle,
        event?.event_title,
        event?.headline,
      ) ||
      (getEventLocation(event) !== 'Location TBD'
        ? `Event at ${getEventLocation(event)}`
        : 'Upcoming Event')
    );
  };

  const getEventTimeText = (event) => {
    return event?.eventtime || event?.starttime || event?.start_time || '';
  };

  const getEventId = (event, index) => {
    return event?.eventid || event?.id || index;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">

        {/* Header Block Container */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">
                  Notifications
                </h1>
                <p className="text-sm text-muted-foreground break-words">
                  Upcoming events in your area
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area Context */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading upcoming events...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
              <CardContent className="pt-12 pb-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Events</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">{error?.message || 'Failed to load upcoming events'}</p>
                <Button onClick={fetchUpcomingEvents} variant="outline" size="sm">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Events</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  There are no events scheduled in your area within the next 30 days.
                </p>
                <Link to="/dashboard?tab=search">
                  <Button size="sm">
                    Search All Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Dynamic Header Counter Tiers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Upcoming Events ({events.length})
                </h2>
                <div className="self-start sm:self-auto">
                  <Badge variant="secondary" className="text-xs text-blue-700 whitespace-nowrap">
                    Within 50 miles
                  </Badge>
                </div>
              </div>

              {/* Grid Context Container */}
              <div className="grid gap-4">
                {events.map((event, index) => (
                  <Card key={getEventId(event, index)} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors overflow-hidden">
                    <CardContent className="p-4 sm:p-5">

                      {/* Refactored Layout Stack: Columns on Mobile, Rows on Desktop */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                                {getEventName(event)}
                              </h3>

                              {/* Metadata Badge Rows with explicit line breaking safety maps */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{getDaysUntil(event.eventdate)}</span>
                                </div>
                                {getEventTimeText(event) && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{formatTime(getEventTimeText(event))}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 min-w-0 max-w-[160px] sm:max-w-none">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">
                                    {getEventLocation(event)}
                                  </span>
                                </div>
                                {event.maxattendees && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Users className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Up to {event.maxattendees}</span>
                                  </div>
                                )}
                              </div>

                              {event.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-3 line-clamp-2 break-words">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic full-width button breakdown matching mobile styles */}
                        <div className="w-full sm:w-auto shrink-0 sm:ml-2">
                          <Link
                            to={`/event/${getEventId(event, index)}`}
                            state={{ from: "/notifications" }}
                            className="w-full block"
                          >
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              View Details
                            </Button>
                          </Link>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {events.length >= 20 && (
                <div className="text-center pt-2">
                  <Link to="/dashboard?tab=events" className="inline-block w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                      View All Events
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}