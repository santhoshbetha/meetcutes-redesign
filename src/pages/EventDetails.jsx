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
import { useAuth } from "../context/AuthContext";
import { isObjEmpty } from "../utils/util";
import toast from "react-hot-toast";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profiledata } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
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
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // This would be replaced with actual API call
        // For demo purposes, we'll create a mock event
        const mockEvent = {
          id: id,
          name: "Sample Event",
          locationdata: {
            locationname: "Sample Location",
            address1: "123 Sample Street"
          },
          starttime: "14:00",
          endtime: "16:00",
          eventdate: new Date().toISOString(),
          details: "Join us for a wonderful meetup experience! This is a great opportunity to meet new people, share interests, and create lasting connections. We'll have plenty of activities planned to ensure everyone has a great time.",
          males: 5,
          females: 3,
          attendeeslist: ["user1", "user2", "user3"]
        };

        setEvent(mockEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/search')} className="w-full">
            Browse Events
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{getEventIcon(event?.locationdata?.locationname || event?.name)}</div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
                {event?.locationdata?.locationname || event?.name}
              </h1>
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
                  <p className="text-3xl font-bold text-blue-600">{event?.males || 0}</p>
                  <p className="text-sm text-muted-foreground">Males</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
                  <p className="text-3xl font-bold text-pink-600">{event?.females || 0}</p>
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
                    {isRegistered ? 'UNREGISTER FROM EVENT' : 'REGISTER FOR EVENT'}
                  </div>
                )}
              </Button>
            </Card>
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
                      className="min-h-[100px] resize-none"
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