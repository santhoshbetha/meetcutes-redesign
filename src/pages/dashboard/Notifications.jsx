import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getEventsData } from "@/services/events.service";
import { useAuth } from "@/context/AuthContext";

export function Notifications() {
  const { profiledata } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Get current date and next 30 days
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const startDate = today.toISOString().split('T')[0];
      const endDate = thirtyDaysFromNow.toISOString().split('T')[0];

      // Use user's location or default coordinates
      const latitude = profiledata?.latitude || 40.7128; // Default to NYC
      const longitude = profiledata?.longitude || -74.0060;

      const searchParams = {
        lat: latitude,
        long: longitude,
        startdate: startDate,
        enddate: endDate,
        searchdistance: 80467, // 50 miles in meters
      };

      const response = await getEventsData(searchParams);

      if (response.success && response.data) {
        // Sort by date and limit to 20 events
        const sortedEvents = response.data
          .sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate))
          .slice(0, 20);
        setEvents(sortedEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load upcoming events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [profiledata?.latitude, profiledata?.longitude]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Notifications
                  </h1>
                  <p className="text-muted-foreground">
                    Upcoming events in your area
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading upcoming events...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Events</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchUpcomingEvents} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground mb-4">
                  There are no events scheduled in your area within the next 30 days.
                </p>
                <Link to="/events">
                  <Button>
                    Browse All Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Events ({events.length})
                </h2>
                <Badge variant="secondary" className="text-xs text-blue-700">
                  Within 50 miles
                </Badge>
              </div>

              <div className="grid gap-4">
                {events.map((event, index) => (
                  <Card key={event.id || index} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {event.eventname || 'Unnamed Event'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{getDaysUntil(event.eventdate)}</span>
                                </div>
                                {event.eventtime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(event.eventtime)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate max-w-32">
                                    {event.location || 'Location TBD'}
                                  </span>
                                </div>
                                {event.maxattendees && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>Up to {event.maxattendees}</span>
                                  </div>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Link to={`/event/${event.id}`}>
                            <Button size="sm" variant="outline">
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
                <div className="text-center pt-4">
                  <Link to="/events">
                    <Button variant="outline">
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