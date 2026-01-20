import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Mail, Phone, Settings, Calendar, Eye, Users, MapPin, Flag } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Spinner } from '@/components/ui/Spinner';
import { getUserProfile } from "@/services/user.service";
import { isObjEmpty } from "@/utils/util";

export function UserProfile() {
  const { userid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile(userid);
        if (response.success) {
          setUserData(response.data);
        } else {
          setError(response.msg || 'User not found');
        }
      } catch {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchUserProfile();
    }
  }, [userid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Spinner size="xlarge" withText={true} text="Loading profile..." />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || 'The user profile you are looking for does not exist or is not accessible.'}</p>
            <Button onClick={() => navigate('/search')} variant="outline">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Eye className="w-4 h-4" />
            User Profile
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            {userData?.firstname} {userData?.lastname}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            View profile information and connect
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Profile Image */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                    <img
                      src="/professional-headshot-of-a-young-man-with-brown-ha.jpg"
                      alt="Profile picture"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name and Location */}
                  <div className="space-y-1 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {userData?.firstname} {userData?.lastname}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs font-medium">
                        {userData?.city}, {userData?.state}
                      </span>
                    </div>
                    {!isObjEmpty(userData?.userhandle) && (
                      <p className="text-sm font-semibold text-primary">
                        @{userData.userhandle}
                      </p>
                    )}
                  </div>

                  {/* Visibility Preference */}
                  <div className="pt-4 border-t border-border/50 w-full">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {userData?.visibilityPreference === 'events-only' && (
                        <>
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Events Only</span>
                        </>
                      )}
                      {userData?.visibilityPreference === 'online-only' && (
                        <>
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Online Only</span>
                        </>
                      )}
                      {userData?.visibilityPreference === 'both' && (
                        <>
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Visible Everywhere</span>
                        </>
                      )}
                      {(!userData?.visibilityPreference || userData?.visibilityPreference === '') && (
                        <>
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Visible Everywhere</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50 w-full">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">12</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Events Attending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">28</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Events Created</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information Card */}
            <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                    <p className="text-sm text-muted-foreground">Contact details and social profiles</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </label>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground font-medium break-all">
                        {userData?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Primary contact email</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </label>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground font-medium">
                        {userData?.phonenumber || 'Not provided'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Contact phone number</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Card */}
            <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FaFacebook className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Social Media</CardTitle>
                    <p className="text-sm text-muted-foreground">Connect on social platforms</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Facebook */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FaFacebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </label>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground font-medium">
                        {userData?.facebook || 'Not connected'}
                      </p>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FaInstagram className="w-4 h-4 text-pink-600" />
                      Instagram
                    </label>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground font-medium">
                        {userData?.instagram || 'Not connected'}
                      </p>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FaLinkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </label>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground font-medium">
                        {userData?.linkedin || 'Not connected'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Me Card */}
            {!isObjEmpty(userData?.bio) && (
              <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Edit2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">About Me</CardTitle>
                      <p className="text-sm text-muted-foreground">A bit about this person</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {userData?.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-xl border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/search')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Search
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}