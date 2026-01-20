import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Mail, Phone, Settings, Calendar, Eye, Users } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { LocationDialog } from "@/components/LocationDialog";
import { ChangeLocation } from "@/components/ChangeLocation";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from '@/components/ui/Spinner';
import { Editable } from "@/components/Editable";
import { HandleCard } from "@/components/HandleCard";
import { EditableBio } from "@/components/EditableBio";
import { useAuth } from "@/context/AuthContext";
import { isObjEmpty } from "@/utils/util";
import { updateUserInfo } from "@/services/user.service";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function Profile() {
  const { user, userSession, profiledata, setProfiledata } = useAuth();
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [phone, setPhone] = useState(isObjEmpty(profiledata?.phonenumber) ? "" : profiledata?.phonenumber);
  const [facebook, setFacebook] = useState(isObjEmpty(profiledata?.facebook) ? "" : profiledata?.facebook);
  const [instagram, setInstagram] = useState(isObjEmpty(profiledata?.instagram) ? "" : profiledata?.instagram);
  const [linkedin, setLinkedIn] = useState(isObjEmpty(profiledata?.linkedin) ? "" : profiledata?.linkedin);
  const [reload, setReload] = useState(false);
  const [change, setChange] = useState(false);
  const isOnline = useOnlineStatus();

  //console.log('Profile render', profiledata);

  useEffect(() => {
    if (!isObjEmpty(profiledata) && reload) {
      setPhone(isObjEmpty(profiledata?.phonenumber) ? "" : profiledata?.phonenumber)
      setFacebook(isObjEmpty(profiledata?.facebook) ? "" : profiledata?.facebook)
      setInstagram(isObjEmpty(profiledata?.instagram) ? "" : profiledata?.instagram)
      setLinkedIn(isObjEmpty(profiledata?.linkedin) ? "" : profiledata?.linkedin)
      setReload(false)
    }
  }, [profiledata, reload]);
  
  const handlesaveSocials = async (e) => {
    e.preventDefault()
    setChange(false)

    var phoneregex = /^\d{10}$/;
    if (phone.match(phoneregex)) {
      setEditing(true)
      if (isOnline) {
          if (userSession) {
              const res = await updateUserInfo(user?.id, {
                  phonenumber: phone,
                  facebook: facebook,
                  instagram: instagram,
                  linkedin: linkedin
              });
              if (res.success) {
                  setProfiledata({...profiledata,
                      phonenumber: phone,
                      facebook: facebook,
                      instagram: instagram,
                      linkedin: linkedin
                  });
              } else {
                  alert('Something wrong. Try later')
              }
              setEditing(false)
          } else {
            setEditing(false)
            alert ("Error, logout and login again")
          }
      } else {
          setEditing(false)
          alert('You are offline. check your internet connection.')
      }

      setEditing(false)
    } else {
      setEditing(false)
      alert("invalid phonenumber! try again");
    }
    return;
  };

  async function addbiodata(editdata) {
      setEditing(true)
      if (isOnline) {
          if (userSession) {
              const res = await updateUserInfo(user?.id, {bio: editdata.bio});
              if (res.success) {
                  setProfiledata({...profiledata, bio: editdata.bio});
              } else {
                  alert ('Edit Biodata Error.. try again later')
              }
              setEditing(false)
          } else {
              setEditing(false)
              alert ("Error, logout and login again")
          }
      } else {
          setEditing(false)
          alert('You are offline. check your internet connection.')
      }
  }

  const handleSave = async (val) => {
      let editdata = {
        bio: val
      }
      if (isOnline) {
        if (userSession) {
          // add bio data to database
          if (String(val) !== String(profiledata?.bio)) {
              await addbiodata(editdata)
              setEditing(false)
          }
        } else {
          alert ("Error, logout and login again")
        }
      } else {
        alert('You are offline. check your internet connection.')
        return;
      }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your personal information and social connections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 md:gap-8">
          {/* Profile Picture & Basic Info Card */}
          <Card className="relative overflow-hidden shadow-xl border-2 border-border bg-linear-to-br from-card via-card to-card/95 backdrop-blur-sm h-fit">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
            <CardContent className="p-6 relative">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                    <img
                      src="/professional-headshot-of-a-young-man-with-brown-ha.jpg"
                      alt="Profile picture"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <Edit2 className="w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                {/* Name and Location */}
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">
                    {profiledata?.firstname} {profiledata?.lastname}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-medium">
                      {profiledata?.city}, {profiledata?.state}
                    </span>
                  </div>
                  {!isObjEmpty(profiledata?.userhandle) && (
                    <p className="text-sm font-semibold text-primary">
                      @{profiledata.userhandle}
                    </p>
                  )}
                </div>

                {/* Visibility Preference */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {profiledata?.visibilityPreference === 'events-only' && (
                      <>
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Events Only</span>
                      </>
                    )}
                    {profiledata?.visibilityPreference === 'online-only' && (
                      <>
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Online Only</span>
                      </>
                    )}
                    {profiledata?.visibilityPreference === 'both' && (
                      <>
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Visible Everywhere</span>
                      </>
                    )}
                    {(!profiledata?.visibilityPreference || profiledata?.visibilityPreference === '') && (
                      <>
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Visible Everywhere</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50">
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

          {/* Main Profile Information */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                    <p className="text-sm text-muted-foreground">Your contact details and communication preferences</p>
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
                        {profiledata?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Primary contact email</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                      <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
                    </label>
                    <Editable
                      text={phone}
                      placeholder="Click to add phone number"
                      type="input"
                    >
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => {
                          setChange(true)
                          setPhone(e.target.value);
                        }}
                        className="w-full p-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background transition-all hover:bg-muted/20 cursor-text"
                      />
                    </Editable>
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
                    <p className="text-sm text-muted-foreground">Connect your social profiles and expand your network</p>
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
                      <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
                    </label>
                    <Editable
                      text={facebook}
                      placeholder="Click to add Facebook"
                      type="input"
                    >
                      <input
                        type="text"
                        name="facebook"
                        placeholder="https://facebook.com/yourprofile"
                        value={facebook}
                        onChange={(e) => {
                          setChange(true)
                          setFacebook(e.target.value);
                        }}
                        className="w-full p-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background transition-all hover:bg-muted/20 cursor-text"
                      />
                    </Editable>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FaInstagram className="w-4 h-4 text-pink-600" />
                      Instagram
                      <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
                    </label>
                    <Editable
                      text={instagram}
                      placeholder="Click to add Instagram"
                      type="input"
                    >
                      <input
                        type="text"
                        name="instagram"
                        placeholder="@yourusername or full URL"
                        value={instagram}
                        onChange={(e) => {
                          setChange(true)
                          setInstagram(e.target.value);
                        }}
                        className="w-full p-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background transition-all hover:bg-muted/20 cursor-text"
                      />
                    </Editable>
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FaLinkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                      <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
                    </label>
                    <Editable
                      text={linkedin}
                      placeholder="Click to add LinkedIn "
                      type="input"
                    >
                      <input
                        type="text"
                        name="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedin}
                        onChange={(e) => {
                          setChange(true)
                          setLinkedIn(e.target.value);
                        }}
                        className="w-full p-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background transition-all hover:bg-muted/20 cursor-text"
                      />
                    </Editable>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Me Card */}
            <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">About Me</CardTitle>
                    <p className="text-sm text-muted-foreground">Share your story and what makes you unique</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EditableBio
                  value={!isObjEmpty(profiledata?.bio) ? profiledata?.bio : ""}
                  onSave={handleSave}
                  placeholder="Tell others about yourself, your interests, and what you're looking for in connections..."
                />
              </CardContent>
            </Card>

            {/* Save Changes Button */}
            {change && (
              <Card className="shadow-xl border-2 border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Unsaved Changes</h3>
                      <p className="text-sm text-muted-foreground">You have unsaved changes to your profile</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setChange(false);
                          setPhone(isObjEmpty(profiledata?.phonenumber) ? "" : profiledata?.phonenumber);
                          setFacebook(isObjEmpty(profiledata?.facebook) ? "" : profiledata?.facebook);
                          setInstagram(isObjEmpty(profiledata?.instagram) ? "" : profiledata?.instagram);
                          setLinkedIn(isObjEmpty(profiledata?.linkedin) ? "" : profiledata?.linkedin);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="social-form"
                        className="bg-primary hover:bg-primary/90 shadow-lg"
                        disabled={editing}
                      >
                        {editing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Section - Account Settings & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8">
          {/* Account Settings Card */}
          <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Account Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your account preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/dashboard?tab=settings')}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Account Settings
                </Button>

                <Button
                  onClick={() => navigate('/change-password')}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Edit2 className="w-4 h-4 mr-3" />
                  Change Password
                </Button>

                <Button
                  onClick={() => navigate('/questionaire')}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Edit2 className="w-4 h-4 mr-3" />
                  Update Preferences
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  Need help? Contact our support team
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-xl border-2 border-border bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard?tab=events')}
                variant="ghost"
                className="w-full justify-start h-12 hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
              >
                <Calendar className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                View My Events
              </Button>

              <Button
                onClick={() => navigate('/dashboard?tab=search')}
                variant="ghost"
                className="w-full justify-start h-12 hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
              >
                <Mail className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                Find Connections
              </Button>

              <Button
                onClick={() => navigate('/create-event')}
                variant="ghost"
                className="w-full justify-start h-12 hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
              >
                <Edit2 className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hidden form for social media submission */}
        <form id="social-form" onSubmit={handlesaveSocials} className="hidden" />
      </main>

      {/* Loading Overlay */}
      {editing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 shadow-xl">
            <Spinner size={50} withText={true} text="Saving changes..." />
          </div>
        </div>
      )}
    </div>
  );
}
