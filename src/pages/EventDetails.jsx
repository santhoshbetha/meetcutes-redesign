import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Calendar, MapPin, Users, Heart, CheckCircle, AlertCircle, MessageCircle, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../context/AuthContext";
import { isObjEmpty } from "../utils/util";
import { useRegisterToAnEvent, useUnregisterToAnEvent, eventDetailsQueryOptions } from '@/hooks/useEvents'
import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from "sonner";

const delay = ms => new Promise(res => setTimeout(res, ms));

let attendeesdata;
let registeredattendees = [];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userSession, profiledata } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showRegistrationConfirm, setShowRegistrationConfirm] = useState(false);
  const { data: eventdata } = useSuspenseQuery(eventDetailsQueryOptions(id));

  const [attendeeslistObj, setAttendeeslistObj] = useState({}); // eslint-disable-line no-unused-vars
  const [attendeesdataObj, setAttendeesdataObj] = useState({}); // eslint-disable-line no-unused-vars
  const [malesCount, setMalesCount] = useState(0);
  const [femalesCount, setFemalesCount] = useState(0);

  // localStorage helpers for cross-tab/dialog sync
  const getStorageKey = (eventId) => `event_${eventId}_attendees`;
  const saveToLocalStorage = (eventId, attendeeslist, attendeesdata) => {
    try {
      // compute counts from attendeesdata if possible
      let males = 0;
      let females = 0;
      try {
        const arr = Array.isArray(attendeesdata) ? attendeesdata : (attendeesdata ? JSON.parse(attendeesdata) : []);
        (arr || []).forEach((a) => {
          const g = (a?.attendeegender || "").toString().toLowerCase();
          if (g.startsWith('m')) males += 1;
          else if (g.startsWith('f')) females += 1;
        });
      } catch (err) {
        males = 0; females = 0;
      }
      const payload = { attendeeslist: attendeeslist ?? null, attendeesdata: attendeesdata ?? null, males, females, ts: Date.now() };
      localStorage.setItem(getStorageKey(eventId), JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save event attendees to localStorage', e);
    }
  };

  const registerToAnEvent = useRegisterToAnEvent();
  const unregisterToAnEvent = useUnregisterToAnEvent();

  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Alice Johnson",
      avatar: "👩‍💼",
      text: "This looks like a great event! I'm really excited to meet everyone.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      user: "Bob Smith",
      avatar: "👨‍💻",
      text: "Will there be any food provided? Just wondering about the logistics.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the event data from an API
    // For now, we'll simulate loading
    const setEventData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        //await new Promise(resolve => setTimeout(resolve, 1000));

        // This would be replaced with actual API call
        // For demo purposes, we'll use the eventdata from the query
        
        // Merge any locally stored attendees info for this event
        try {
          const eventId = eventdata?.eventid || eventdata?.id;
          const storageKey = getStorageKey(eventId);
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            const merged = {
              ...eventdata,
              attendeeslist: parsed.attendeeslist !== undefined ? parsed.attendeeslist : eventdata.attendeeslist,
              attendeesdata: parsed.attendeesdata !== undefined ? parsed.attendeesdata : eventdata.attendeesdata,
            };
            setEvent(merged);
          } else {
            setEvent(eventdata);
          }
        } catch (e) {
          setEvent(eventdata);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    setEventData();
  }, [id, eventdata]);

  useEffect(() => {
    if (event && profiledata) {
      if (isObjEmpty(event?.attendeeslist)) {
        setIsRegistered(false);
      } else {
        let attendeeslistObj3;
        if (Array.isArray(event?.attendeeslist) === false) {  // if string (from postgres)
          attendeeslistObj3 = event?.attendeeslist?.replace(/\{|\}/gm, "").split(",");
        } else {
          attendeeslistObj3 = event?.attendeeslist;
        }

        if (attendeeslistObj3?.map(attendee => attendee?.toLowerCase()).includes(profiledata?.userhandle.toLowerCase())) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      }
    }
  }, [event, profiledata]);

  // Listen for external event updates (from dialog or card) and apply them
  useEffect(() => {
    const handler = (e) => {
      try {
        const detail = e?.detail || {};
        const eventId = detail.eventId;
        if (!eventId) return;
        if (String(eventId) !== String(id)) return;

        // Update local event with provided attendeeslist/attendeesdata
        setEvent((prev) => {
          const next = structuredClone(prev) || {};
          if (detail.attendeeslist !== undefined) next.attendeeslist = detail.attendeeslist && detail.attendeeslist.length > 0 ? detail.attendeeslist : null;
          if (detail.attendeesdata !== undefined) next.attendeesdata = detail.attendeesdata || null;
          return next;
        });

        // Update derived attendeesdataObj if attendeesdata is provided
        if (detail.attendeesdata !== undefined) {
          try {
            const parsed = detail.attendeesdata ? (Array.isArray(detail.attendeesdata) ? detail.attendeesdata : JSON.parse(detail.attendeesdata)) : null;
            setAttendeesdataObj(parsed);
          } catch (err) {
            setAttendeesdataObj(null);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('event-updated', handler);
    return () => window.removeEventListener('event-updated', handler);
  }, [id]);

  // Listen for storage events (changes from dialog or other tabs) and apply updates
  useEffect(() => {
    const handler = (e) => {
      try {
        const eventId = id;
        const key = getStorageKey(eventId);
        if (e.key !== key) return;
        if (!e.newValue) {
          // cleared
          setEvent((prev) => ({ ...prev, attendeeslist: null, attendeesdata: null }));
          setAttendeesdataObj(null);
          return;
        }
        const parsed = JSON.parse(e.newValue);
        setEvent((prev) => ({ ...prev, attendeeslist: parsed.attendeeslist ?? prev?.attendeeslist, attendeesdata: parsed.attendeesdata ?? prev?.attendeesdata }));
        // If counts are provided use them, otherwise derive from attendeesdata
        if (parsed.males !== undefined && parsed.females !== undefined) {
          setMalesCount(parsed.males || 0);
          setFemalesCount(parsed.females || 0);
          try {
            const ad = parsed.attendeesdata ? (Array.isArray(parsed.attendeesdata) ? parsed.attendeesdata : JSON.parse(parsed.attendeesdata)) : null;
            setAttendeesdataObj(ad);
          } catch (err) {
            setAttendeesdataObj(null);
          }
        } else {
          try {
            const ad = parsed.attendeesdata ? (Array.isArray(parsed.attendeesdata) ? parsed.attendeesdata : JSON.parse(parsed.attendeesdata)) : null;
            setAttendeesdataObj(ad);
          } catch (err) {
            setAttendeesdataObj(null);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [id]);

  useEffect(() => {
    if (!isObjEmpty(event?.attendeeslist)) {
      if (Array.isArray(event?.attendeeslist) == false) {  // if string (from postgres)
        setAttendeeslistObj(event?.attendeeslist?.replace(/\{|\}/gm, "").split(","))
      } else {
        setAttendeeslistObj(event?.attendeeslist)
      }
    } else {
      setAttendeeslistObj(null)
    }

    if (!isObjEmpty(event?.attendeesdata)) {
      if (Array.isArray(event?.attendeesdata) == false) { 
        setAttendeesdataObj(JSON.parse(event?.attendeesdata));
      } else {
        setAttendeesdataObj(event?.attendeesdata);
      }
    } else {
      setAttendeesdataObj(null);
    }
  }, [event]);

  useEffect(() => {
    // Compute male/female counts from attendeesdataObj when available
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
      // fallback to server-provided counts when attendeesdataObj not present
      setMalesCount(event?.males || 0);
      setFemalesCount(event?.females || 0);
    }
  }, [attendeesdataObj, event]);

  const handleRegistration = () => {
    if (!userSession) {
      setRegistrationMessage("Please log in to register for events.");
      return;
    }

    let newattendee = {
      attendeehandle:  profiledata?.userhandle.toLowerCase(),
      attendeegender: profiledata?.gender
    }

    let attendeesdataObj1;
    if (isObjEmpty(event?.attendeesdata)) {
      attendeesdata = [newattendee] 
    } else {
      if (Array.isArray(event?.attendeesdata) == false) { //string from supabase
          attendeesdataObj1 = JSON.parse(event?.attendeesdata);
      } else {
          attendeesdataObj1 = event?.attendeesdata;
      }
      let temparray =  [...attendeesdataObj1, newattendee];
      attendeesdata = temparray.filter((obj, index) => {
                        return index === temparray.findIndex(o => obj.attendeehandle == o.attendeehandle);
                      });
    }

    if (!isObjEmpty(event?.attendeesdata)) {
      attendeesdataObj1?.forEach((eachattendee) => {
        if (eachattendee?.attendeegender != profiledata?.gender) {
            registeredattendees.push(eachattendee?.attendeehandle)
        }
      });
    }

    if (isObjEmpty(profiledata?.previouseventsattendeeslist)) {
      //
      // Insert "previouseventsattendeesstartdate"
      //
      setShowRegistrationConfirm(false);
      confirmRegistration();
    }

    let countofattendessfromprev = 0  
    if (!isObjEmpty(profiledata?.previouseventsattendeeslist)) {
      //
      // Get attendees of previous events
      // 
      registeredattendees.forEach((eachattendee) => {
        if (profiledata?.previouseventsattendeeslist.includes(eachattendee)) {
          countofattendessfromprev = countofattendessfromprev + 1; 
        }
      })
      
      //
      // Compare and alert
      //
      if (countofattendessfromprev > registeredattendees.length/2 && registeredattendees.length > 5) {
        setShowRegistrationConfirm(true);
        ////console.log("More than half of this event attendees are from your previous events")
      } else {
        setShowRegistrationConfirm(false);
        confirmRegistration();
      }
    }
  };

  const confirmRegistration = async () => {
    console.log("Confirming registration for event:", id);
    setShowRegistrationConfirm(false);
    setIsRegistering(true);
    setRegistrationMessage("");

    try {
      if (!isRegistered) {
        // Use the actual register hook
        await registerToAnEvent.mutateAsync({ 
          eventId: id, 
          userhandle: profiledata?.userhandle.toLowerCase(),
          attendeesdata: attendeesdata,
          registeredattendees: registeredattendees
        });

        if (!registerToAnEvent.isError) {
          //
          // update event details to reflect current page
          //
          let newEvent = structuredClone(event);
          let attendeeslistObj4;

          if (!isObjEmpty(newEvent?.attendeeslist)) {
            if (Array.isArray(newEvent?.attendeeslist) == false) {  // if string (from postgres)
              attendeeslistObj4 = newEvent?.attendeeslist?.replace(/\{|\}/gm, "").split(",");
              console.log("here if")
              console.log("attendeeslistObj4 if::", attendeeslistObj4);
            } else {
              attendeeslistObj4 = newEvent?.attendeeslist
              console.log("here else")
              console.log("attendeeslistObj4 else::", attendeeslistObj4);
            }
          }
          setEvent({
            ...event, 
            attendeesdata: JSON.stringify(attendeesdata),
            attendeeslist: isObjEmpty(newEvent?.attendeeslist) ? 
                [profiledata?.userhandle.toLowerCase()]
                : 
                [...new Set([...attendeeslistObj4, profiledata?.userhandle.toLowerCase()])]
          });
          try {
            const payload = {
              eventId: id,
              attendeeslist: isObjEmpty(newEvent?.attendeeslist) ? [profiledata?.userhandle.toLowerCase()] : [...new Set([...attendeeslistObj4, profiledata?.userhandle.toLowerCase()])],
              attendeesdata: JSON.stringify(attendeesdata),
            };
            window.dispatchEvent(new CustomEvent('event-updated', { detail: payload }));
            // persist to localStorage so dialog/other tabs can pick up the change
            try {
              saveToLocalStorage(id, payload.attendeeslist, payload.attendeesdata);
            } catch (e) {
              // ignore
            }
          } catch (e) {
            console.warn('Failed to dispatch event-updated from EventDetails', e);
          }
        }
        setRegistrationMessage("Successfully registered for this event!");
        setIsRegistered(true);
      } else {
        // Use the actual unregister hook
        await unregisterToAnEvent.mutateAsync({ eventId: id, userhandle: profiledata?.userhandle?.toLowerCase() });

        // Update local event and attendees data after successful unregister
        try {
          let newEvent = structuredClone(event);

          // Update attendeeslist
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

          // Update attendeesdata (remove attendee object)
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

          setEvent(newEvent);
          setAttendeesdataObj(updatedData.length > 0 ? updatedData : null);
          try {
            const payload = {
              eventId: id,
              attendeeslist: updatedList,
              attendeesdata: newEvent.attendeesdata,
            };
            window.dispatchEvent(new CustomEvent('event-updated', { detail: payload }));
            // persist to localStorage so dialog/other tabs can pick up the change
            try {
              saveToLocalStorage(id, payload.attendeeslist, payload.attendeesdata);
            } catch (e) {
              // ignore
            }
          } catch (e) {
            console.warn('Failed to dispatch event-updated after unregister in EventDetails', e);
          }

          // Recompute counts
          let males = 0;
          let females = 0;
          updatedData.forEach((a) => {
            const g = (a?.attendeegender || "").toString().toLowerCase();
            if (g.startsWith("m")) males += 1;
            else if (g.startsWith("f")) females += 1;
          });
          setMalesCount(males);
          setFemalesCount(females);
        } catch (e) {
          // If anything fails, fallback to default counts
          setMalesCount(event?.males || 0);
          setFemalesCount(event?.females || 0);
        }

        setRegistrationMessage("You've been unregistered from this event.");
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationMessage("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePostComment = async () => {
    if (!profiledata?.userhandle) {
      toast.error("Please log in to post comments");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsPostingComment(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment = {
        id: comments.length + 1,
        user: profiledata?.name || profiledata?.userhandle || "Anonymous User",
        avatar: "👤",
        text: newComment.trim(),
        timestamp: new Date(),
      };

      setComments(prev => [comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsPostingComment(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard?tab=search')} className="w-full">
            Browse Events
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Global Loading Overlay for Operations */}
      {(isRegistering || isPostingComment) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="xlarge" className="mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              {isRegistering ? (isRegistered ? 'Unregistering from event...' : 'Registering for event...') : 'Posting comment...'}
            </p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{getEventIcon(event?.locationdata?.locationname || event?.name)}</div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
                {event?.title || event?.name || 'Event Title'}
              </h1>
              <p className="text-xl font-medium text-muted-foreground mb-4">
                📍 {event?.locationdata?.locationname || event?.location}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
                  Event
                </Badge>
                {isRegistered && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-lg px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Registered
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/30">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-medium text-foreground block">{event?.starttime?.substring(0, 5)} - {event?.endtime?.substring(0, 5)}</span>
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/30">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-lg font-medium text-foreground block">
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

                <div className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border border-border/30">
                  <div className="p-3 bg-green-500/10 rounded-lg mt-1">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-medium text-foreground block leading-relaxed">
                      {event?.locationdata?.address1 || event?.location}
                    </span>
                    <span className="text-sm text-muted-foreground">Location</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                People
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
                  <p className="text-3xl font-bold text-blue-600">{malesCount ?? (event?.males || 0)}</p>
                  <p className="text-sm text-muted-foreground">Males</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
                  <p className="text-3xl font-bold text-pink-600">{femalesCount ?? (event?.females || 0)}</p>
                  <p className="text-sm text-muted-foreground">Females</p>
                </div>
              </div>
            </Card>

            {/* Registration */}
            <Card className="p-6">
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
            </Card>

            {/* Registration Confirmation Dialog */}
            <AlertDialog open={showRegistrationConfirm} onOpenChange={setShowRegistrationConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    {isRegistered ? 'Unregister from Event' : 'Register for Event'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRegistered
                      ? 'Are you sure you want to unregister from this event? You will no longer be listed as an attendee.'
                      : 'More than half of this event attendees are from your previous events. Press \'Register\' to continue to register for this event.'
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmRegistration}
                    className={isRegistered ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  >
                    {isRegistered ? 'Unregister' : 'Register'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Event Description and Discussion Tabs - Full Width */}
        <Card className="p-6 mt-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Event Description
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Discussion ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {event?.details ||
                  "Join us for a wonderful meetup experience! This is a great opportunity to meet new people, share interests, and create lasting connections. We'll have plenty of activities planned to ensure everyone has a great time. Feel free to bring your enthusiasm and an open mind!"}
              </p>
            </TabsContent>

            <TabsContent value="discussion" className="mt-6">
              <div className="space-y-6">
                {/* Comment Input */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Join the Discussion</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share your thoughts about this event..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-25 resize-none"
                      disabled={isPostingComment}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handlePostComment}
                        disabled={isPostingComment || !newComment.trim()}
                        className="flex items-center gap-2"
                      >
                        {isPostingComment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">Comments ({comments.length})</h4>
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 bg-background/50 rounded-lg border border-border/30">
                          <div className="text-2xl">{comment.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-foreground">{comment.user}</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.timestamp.toLocaleDateString()} at {comment.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}