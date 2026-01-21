import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, X, Users, Heart, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { isObjEmpty } from "../utils/util";

export default function EventDetailsDialog({ event, onClose, profiledata, loading = false }) {
  const [eventDetails, setEventDetails] = useState(event || {});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  console.log('EventDetailsDialog profiledata', profiledata);

  useEffect(() => {
    if (event) {
      setEventDetails(event);
    }
  }, [event]);

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

  const handleRegistration = async () => {
    if (!profiledata?.userhandle) {
      setRegistrationMessage("Please log in to register for events.");
      return;
    }

    setIsRegistering(true);
    setRegistrationMessage("");

    try {
      // Simulate API call - replace with actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isRegistered) {
        setRegistrationMessage("You've been unregistered from this event.");
        setIsRegistered(false);
      } else {
        setRegistrationMessage("Successfully registered for this event!");
        setIsRegistered(true);
      }
    } catch {
      setRegistrationMessage("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const getEventIcon = (locationName) => {
    const name = locationName?.toLowerCase() || '';
    if (name.includes('target') || name.includes('store') || name.includes('shop')) return '🛍️';
    if (name.includes('ross') || name.includes('clothing')) return '👕';
    if (name.includes('music') || name.includes('concert')) return '🎵';
    if (name.includes('photo') || name.includes('camera')) return '📸';
    if (name.includes('coffee') || name.includes('cafe')) return '☕';
    if (name.includes('book') || name.includes('library')) return '📚';
    if (name.includes('park') || name.includes('walk')) return '🌳';
    if (name.includes('art') || name.includes('gallery')) return '🎨';
    if (name.includes('food') || name.includes('truck')) return '🍔';
    return '📅';
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto dark:border-3">
        {/* Global Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <Spinner size="xlarge" className="mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Loading event details...</p>
            </div>
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            {/* Event Title */}
            <div className="flex items-start gap-4 flex-1">
              <div className="text-4xl">{getEventIcon(event?.locationdata?.locationname || event?.name)}</div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {event?.locationdata?.locationname || event?.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Event
                  </Badge>
                  {isRegistered && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Registered
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                className="bg-background hover:bg-muted rounded-lg transition-colors group"
                onClick={() => window.open(`/event/${event?.id || event?.eventid}`, '_blank')}
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5 text-dark group-hover:text-foreground" />
              </Button>
              <Button
                className="bg-background hover:bg-muted rounded-lg transition-colors group"
                onClick={onClose}
              >
                <X className="w-5 h-5 text-dark group-hover:text-foreground" />
              </Button>
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-bold text-primary mb-3">Details</h3>
            <div className="flex items-center gap-3 text-muted-foreground px-4 bg-background/50 rounded-xl border border-border/30">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-base font-medium text-foreground block">{event?.starttime?.substring(0, 5)} - {event?.endtime?.substring(0, 5)}</span>
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-blue-600 px-4 bg-background/50 rounded-xl border border-border/30">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-base font-medium text-foreground block">
                  {event?.eventdate ? new Date(event.eventdate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : event?.date}
                </span>
                <span className="text-sm text-muted-foreground">Date</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-dark px-4 bg-background/50 rounded-xl border border-border/30">
              <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-base font-medium text-foreground block leading-relaxed">
                  {event?.locationdata?.address1 || event?.location}
                </span>
                <span className="text-sm text-muted-foreground">Location</span>
              </div>
            </div>
          </div>

          {/* Attendees Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              People
            </h3>
            <div className="grid grid-cols-2 gap-2 pl-7">
              <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                <p className="text-2xl font-bold text-blue-600">{event?.males || 0}</p>
                <p className="text-sm text-muted-foreground">Males</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                <p className="text-2xl font-bold text-pink-600">{event?.females || 0}</p>
                <p className="text-sm text-muted-foreground">Females</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Event Details</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {event?.details ||
                "Join us for a wonderful meetup experience! This is a great opportunity to meet new people, share interests, and create lasting connections. We'll have plenty of activities planned to ensure everyone has a great time. Feel free to bring your enthusiasm and an open mind!"}
            </p>
          </div>

          {/* Registration Message */}
          {registrationMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${
              registrationMessage.includes('Successfully') || registrationMessage.includes('unregistered')
                ? 'bg-green-500/10 border-green-500/20 text-green-700'
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                {registrationMessage.includes('Successfully') || registrationMessage.includes('unregistered') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{registrationMessage}</span>
              </div>
            </div>
          )}

          {/* Register Button */}
          <Button
            onClick={handleRegistration}
            disabled={isRegistering}
            className={`w-full font-semibold py-4 rounded-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
              isRegistered
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isRegistering ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                {isRegistered ? 'Unregistering...' : 'Registering...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isRegistered ? 'fill-current' : ''}`} />
                {isRegistered ? 'UNREGISTER FROM EVENT' : 'REGISTER FOR THIS EVENT'}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
