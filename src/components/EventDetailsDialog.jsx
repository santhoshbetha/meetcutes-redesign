import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, X, Users, Heart, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { isObjEmpty } from "../utils/util";
import { useAuth } from "@/context/AuthContext";
import { useRegisterToAnEvent, useUnregisterToAnEvent } from "@/hooks/useEvents";

export default function EventDetailsDialog({ event, onClose, profiledata, loading = false }) {
  const [eventDetails, setEventDetails] = useState(event || {});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [attendeesdataObj, setAttendeesdataObj] = useState(null);
  const [malesCount, setMalesCount] = useState(0);
  const [femalesCount, setFemalesCount] = useState(0);

  useEffect(() => {
    if (event) {
      // Merge event prop with any locally stored attendees info for this event
      try {
        const eventId = event?.eventid || event?.id;
        const storageKey = `event_${eventId}_attendees`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const merged = {
            ...event,
            attendeeslist: parsed.attendeeslist !== undefined ? parsed.attendeeslist : event.attendeeslist,
            attendeesdata: parsed.attendeesdata !== undefined ? parsed.attendeesdata : event.attendeesdata,
          };
          setEventDetails(merged);
        } else {
          setEventDetails(event);
        }
      } catch (e) {
        setEventDetails(event);
      }
    }
  }, [event]);

  // Scroll to center the dialog when it opens
  useEffect(() => {
    if (event) {
      // Small delay to ensure the dialog is rendered before scrolling
      const timer = setTimeout(() => {
        // Scroll to center the dialog vertically on screen
        const dialogHeight = 600; // Approximate height of the dialog
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const centerPosition = scrollY + (viewportHeight / 2) - (dialogHeight / 2);
        
        // Only scroll if the dialog would be positioned too low
        if (centerPosition > scrollY + 100) {
          window.scrollTo({
            top: Math.max(0, centerPosition - 100), // Add some padding from top
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [event]);

  // localStorage helpers
  const getStorageKey = (eventId) => `event_${eventId}_attendees`;
  const computeCountsFromData = (data) => {
    try {
      const arr = Array.isArray(data) ? data : (data ? JSON.parse(data) : []);
      let males = 0;
      let females = 0;
      (arr || []).forEach((a) => {
        const g = (a?.attendeegender || "").toString().toLowerCase();
        if (g.startsWith("m")) males += 1;
        else if (g.startsWith("f")) females += 1;
      });
      return { males, females };
    } catch (err) {
      return { males: 0, females: 0 };
    }
  };

  const saveToLocalStorage = (eventId, attendeeslist, attendeesdata, malesParam, femalesParam) => {
    try {
      const counts = (typeof malesParam === 'number' && typeof femalesParam === 'number') ? { males: malesParam, females: femalesParam } : computeCountsFromData(attendeesdata);
      const payload = { attendeeslist: attendeeslist ?? null, attendeesdata: attendeesdata ?? null, males: counts.males, females: counts.females, ts: Date.now() };
      localStorage.setItem(getStorageKey(eventId), JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save event attendees to localStorage', e);
    }
  };

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

  // Parse attendeesdata into an object/array for counts
  useEffect(() => {
    try {
      if (!isObjEmpty(eventDetails?.attendeesdata)) {
        const parsed = Array.isArray(eventDetails.attendeesdata) ? eventDetails.attendeesdata : JSON.parse(eventDetails.attendeesdata);
        setAttendeesdataObj(parsed);
      } else {
        setAttendeesdataObj(null);
      }
    } catch (err) {
      setAttendeesdataObj(null);
    }
  }, [eventDetails?.attendeesdata]);

  // Compute male/female counts from attendeesdataObj
  useEffect(() => {
    if (Array.isArray(attendeesdataObj)) {
      let males = 0;
      let females = 0;
      attendeesdataObj.forEach((a) => {
        const g = (a?.attendeegender || "").toString().toLowerCase();
        if (g.startsWith("m")) males += 1;
        else if (g.startsWith("f")) females += 1;
      });
      setMalesCount(males);
      setFemalesCount(females);
    } else {
      setMalesCount(event?.males || 0);
      setFemalesCount(event?.females || 0);
    }
  }, [attendeesdataObj, event]);

  // Listen for external updates to this event and update dialog state
  useEffect(() => {
    const handler = (e) => {
      try {
        const detail = e?.detail || {};
        const eventId = detail.eventId;
        const thisEventId = eventDetails?.eventid || eventDetails?.id;
        if (!eventId || String(thisEventId) !== String(eventId)) return;

        if (detail.attendeeslist !== undefined) {
          const list = detail.attendeeslist && detail.attendeeslist.length > 0 ? detail.attendeeslist : null;
          setEventDetails((prev) => ({ ...prev, attendeeslist: list }));
        }

        if (detail.attendeesdata !== undefined) {
          const ad = detail.attendeesdata ? (Array.isArray(detail.attendeesdata) ? detail.attendeesdata : JSON.parse(detail.attendeesdata)) : null;
          setEventDetails((prev) => ({ ...prev, attendeesdata: detail.attendeesdata }));
          // if counts provided in detail, use them
          if (detail.males !== undefined && detail.females !== undefined) {
            setMalesCount(detail.males || 0);
            setFemalesCount(detail.females || 0);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('event-updated', handler);
    return () => window.removeEventListener('event-updated', handler);
  }, [eventDetails]);

  // Listen for storage events (other tabs/windows) and update dialog state
  useEffect(() => {
    const handler = (e) => {
      try {
        const eventId = eventDetails?.eventid || eventDetails?.id;
        if (!eventId) return;
        const key = getStorageKey(eventId);
        if (e.key !== key) return;
        if (!e.newValue) {
          // cleared
          setEventDetails((prev) => ({ ...prev, attendeeslist: null, attendeesdata: null }));
          return;
        }
        const parsed = JSON.parse(e.newValue);
        setEventDetails((prev) => ({ ...prev, attendeeslist: parsed.attendeeslist ?? prev.attendeeslist, attendeesdata: parsed.attendeesdata ?? prev.attendeesdata }));
        if (parsed.males !== undefined && parsed.females !== undefined) {
          setMalesCount(parsed.males || 0);
          setFemalesCount(parsed.females || 0);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [eventDetails]);

  const { userSession } = useAuth();

  const registerToAnEvent = useRegisterToAnEvent();
  const unregisterToAnEvent = useUnregisterToAnEvent();

  const handleRegistration = async () => {
    if (!userSession) {
      setRegistrationMessage("Please log in to register for events.");
      return;
    }

    setRegistrationMessage("");

    // Build new attendee object
    const newattendee = {
      attendeehandle: profiledata?.userhandle.toLowerCase(),
      attendeegender: profiledata?.gender,
    };

    // Build attendeesdata array
    let attendeesdataLocal;
    let attendeesdataObj1;
    if (isObjEmpty(eventDetails?.attendeesdata)) {
      attendeesdataLocal = [newattendee];
    } else {
      if (Array.isArray(eventDetails?.attendeesdata) == false) {
        attendeesdataObj1 = JSON.parse(eventDetails?.attendeesdata);
      } else {
        attendeesdataObj1 = eventDetails?.attendeesdata;
      }
      let temparray = [...attendeesdataObj1, newattendee];
      attendeesdataLocal = temparray.filter((obj, index) => {
        return index === temparray.findIndex((o) => obj.attendeehandle == o.attendeehandle);
      });
    }

    // Build list of registered attendees from attendeesdata (different gender)
    let registeredattendeesLocal = [];
    if (!isObjEmpty(eventDetails?.attendeesdata)) {
      (attendeesdataObj1 || []).forEach((eachattendee) => {
        if (eachattendee?.attendeegender != profiledata?.gender) {
          registeredattendeesLocal.push(eachattendee?.attendeehandle);
        }
      });
    }

    // Proceed to confirm/perform registration
    await confirmRegistration(attendeesdataLocal, registeredattendeesLocal);
  };

  const confirmRegistration = async (attendeesdataParam, registeredattendeesParam) => {
    setIsRegistering(true);
    setRegistrationMessage("");

    try {
      const eventId = eventDetails?.eventid || eventDetails?.id;
      if (!isRegistered) {
        await registerToAnEvent.mutateAsync({
          eventId: eventId,
          userhandle: profiledata?.userhandle.toLowerCase(),
          attendeesdata: attendeesdataParam,
          registeredattendees: registeredattendeesParam,
        });

        if (!registerToAnEvent.isError) {
          // Update local eventDetails to reflect registration
          let newEvent = structuredClone(eventDetails);
          let attendeeslistObj4;

          if (!isObjEmpty(newEvent?.attendeeslist)) {
            if (Array.isArray(newEvent?.attendeeslist) == false) {
              attendeeslistObj4 = newEvent?.attendeeslist?.replace(/\{|\}/gm, "").split(",");
            } else {
              attendeeslistObj4 = newEvent?.attendeeslist;
            }
          }

          setEventDetails({
            ...eventDetails,
            attendeesdata: JSON.stringify(attendeesdataParam),
            attendeeslist: isObjEmpty(newEvent?.attendeeslist)
              ? [profiledata?.userhandle.toLowerCase()]
              : [...new Set([...(attendeeslistObj4 || []), profiledata?.userhandle.toLowerCase()])],
          });
          // Notify other components about the update
          try {
            const updatedList = isObjEmpty(newEvent?.attendeeslist)
              ? [profiledata?.userhandle.toLowerCase()]
              : [...new Set([...(attendeeslistObj4 || []), profiledata?.userhandle.toLowerCase()])];
            const payload = {
              eventId: eventId,
              attendeeslist: updatedList,
              attendeesdata: JSON.stringify(attendeesdataParam),
            };
            window.dispatchEvent(new CustomEvent('event-updated', { detail: payload }));
            // persist to localStorage so other pages/tabs can pick up the change
            try {
              const counts = computeCountsFromData(attendeesdataParam);
              saveToLocalStorage(eventId, updatedList, JSON.stringify(attendeesdataParam), counts.males, counts.females);
            } catch (e) {
              // ignore
            }
          } catch (e) {
            console.warn('Failed to dispatch event-updated', e);
          }
        }
        setRegistrationMessage("Successfully registered for this event!");
        setIsRegistered(true);
      } else {
        await unregisterToAnEvent.mutateAsync({ eventId: eventId, userhandle: profiledata?.userhandle?.toLowerCase() });

        // Update local eventDetails to remove the user
        try {
          let newEvent = structuredClone(eventDetails);
          let currentList = [];
          if (!isObjEmpty(newEvent?.attendeeslist)) {
            if (Array.isArray(newEvent.attendeeslist) == false) {
              currentList = newEvent.attendeeslist.replace(/\{|\}/gm, "").split(",");
            } else {
              currentList = [...newEvent.attendeeslist];
            }
          }
          const cleanedHandle = profiledata?.userhandle?.toLowerCase();
          const updatedList = currentList.filter((h) => h?.toLowerCase() !== cleanedHandle);

          let currentData = [];
          if (!isObjEmpty(newEvent?.attendeesdata)) {
            if (Array.isArray(newEvent.attendeesdata) == false) {
              currentData = JSON.parse(newEvent.attendeesdata);
            } else {
              currentData = [...newEvent.attendeesdata];
            }
          }
          const updatedData = currentData.filter((a) => a?.attendeehandle?.toLowerCase() !== cleanedHandle);

          newEvent.attendeeslist = updatedList.length > 0 ? updatedList : null;
          newEvent.attendeesdata = updatedData.length > 0 ? JSON.stringify(updatedData) : null;
          setEventDetails(newEvent);

          // Notify other components about the update
          try {
            const payload = {
              eventId: eventId,
              attendeeslist: updatedList,
              attendeesdata: newEvent.attendeesdata,
            };
            window.dispatchEvent(new CustomEvent('event-updated', { detail: payload }));
            // persist to localStorage so other pages/tabs can pick up the change
            try {
              const counts2 = computeCountsFromData(newEvent.attendeesdata);
              saveToLocalStorage(eventId, updatedList, newEvent.attendeesdata, counts2.males, counts2.females);
            } catch (e) {
              // ignore
            }
          } catch (e) {
            console.warn('Failed to dispatch event-updated', e);
          }
        } catch (e) {
          console.warn('Failed to update local eventDetails after unregister', e);
        }

        setRegistrationMessage("You've been unregistered from this event.");
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
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
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-border dark:border-3">
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
                  {event?.title || event?.name || 'Event Title'}
                </h2>
                <p className="text-lg font-medium text-muted-foreground mb-3">
                  📍 {event?.locationdata?.locationname || event?.location}
                </p>
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
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              </Button>
              <Button
                className="bg-background hover:bg-muted rounded-lg transition-colors group"
                onClick={onClose}
              >
                <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
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
                <p className="text-2xl font-bold text-blue-600">{malesCount || 0}</p>
                <p className="text-sm text-muted-foreground">Males</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                <p className="text-2xl font-bold text-pink-600">{femalesCount || 0}</p>
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
                : 'bg-green-500 hover:bg-green-600 text-white'
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
