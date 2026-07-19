import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Mail, Phone, Settings, Calendar, Eye, Users, ShieldAlert } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from '@/components/ui/Spinner';
import { Editable } from "@/components/Editable";
import { EditableBio } from "@/components/EditableBio";
import { useAuth } from "@/context/AuthContext";
import { isObjEmpty } from "@/utils/util";
import { updateUserInfo } from "@/services/user.service";
import { uploadImage } from "@/services/image.service";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from "sonner";


const CreateEvent = lazy(() => import("@/components/CreateEvent").then((module) => ({ default: module.CreateEvent })));
const ImageUploader = lazy(() => import("@/components/ImageUploader").then((module) => ({ default: module.ImageUploader })));

const ProfileModalFallback = ({ text = "Loading visual component..." }) => (
  <div className="p-6 text-sm text-center font-medium text-muted-foreground animate-pulse">{text}</div>
);

export function Profile() {
  const { user, userSession, profiledata, setProfiledata } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  // State Declarations
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [editingProfileImage, setEditingProfileImage] = useState(false);

  // Field Form Controls
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedIn] = useState("");

  // Populate form states safely when profile data resolves
  useEffect(() => {
    if (!isObjEmpty(profiledata)) {
      setPhone(profiledata.phonenumber || "");
      setFacebook(profiledata.facebook || "");
      setInstagram(profiledata.instagram || "");
      setLinkedIn(profiledata.linkedin || "");
    }
  }, [profiledata]);

  // Unified Central Change Evaluator
  const checkUnsavedChanges = (updatedPhone, updatedFb, updatedInsta, updatedLn) => {
    const isPhoneChanged = String(updatedPhone) !== String(profiledata?.phonenumber || "");
    const isFbChanged = String(updatedFb) !== String(profiledata?.facebook || "");
    const isInstaChanged = String(updatedInsta) !== String(profiledata?.instagram || "");
    const isLnChanged = String(updatedLn) !== String(profiledata?.linkedin || "");

    setHasUnsavedChanges(isPhoneChanged || isFbChanged || isInstaChanged || isLnChanged);
  };

  const handleSocialSubmit = async (e) => {
    if (e) e.preventDefault();
    setHasUnsavedChanges(false);

    const phoneregex = /^\d{10}$/;
    if (phone && !phone.match(phoneregex)) {
      toast.error("Invalid phone number! Please ensure it is exactly 10 digits.");
      return;
    }

    if (!isOnline) {
      toast.error('You are currently offline. Please check your network connection.');
      return;
    }

    if (!userSession) {
      toast.error("Session identity expired. Please log out and sign in again.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserInfo(user?.id, {
        phonenumber: phone,
        facebook: facebook,
        instagram: instagram,
        linkedin: linkedin
      });

      if (res.success) {
        setProfiledata({
          ...profiledata,
          phonenumber: phone,
          facebook: facebook,
          instagram: instagram,
          linkedin: linkedin
        });
        toast.success('Profile contact channels synchronized successfully!');
      } else {
        toast.error(res.msg || 'Failed to update remote directory. Try again later.');
      }
    } catch (err) {
      toast.error('An error occurred during communication pipeline negotiation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBioSave = async (val) => {
    if (String(val) === String(profiledata?.bio || "")) return;

    if (!isOnline) {
      toast.error('Connection state validation failed. Action canceled.');
      return;
    }

    if (!userSession) {
      toast.error("Authentication session token missing.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserInfo(user?.id, { bio: val });
      if (res.success) {
        setProfiledata({ ...profiledata, bio: val });
        toast.success('Biography details saved to data layer.');
      } else {
        toast.error('Failed to submit user biography properties.');
      }
    } catch (err) {
      toast.error('Network thread operation rejected.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageCropped = async (blob) => {
    if (!isOnline) {
      toast.error('Cannot transfer binary blobs while operating offline.');
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = Date.now();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const res = await uploadImage(profiledata?.userid, file, 1, timestamp);

      if (res.success) {
        const imagesObj = profiledata?.images ? [...profiledata.images] : [];
        while (imagesObj.length < 1) imagesObj.push('');
        imagesObj[0] = `first?t=${timestamp}`;

        const res2 = await updateUserInfo(user?.id, { images: imagesObj });

        if (res2.success) {
          setProfiledata({ ...profiledata, images: imagesObj });
          setEditingProfileImage(false);
          toast.success('Profile avatar updated successfully!');
        } else {
          toast.error(res2.msg || 'Database reference rewrite rejected.');
        }
      } else {
        toast.error(res.msg || 'Object storage compilation failed.');
      }
    } catch (err) {
      toast.error('An unhandled exception occurred during media asset transmission.');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe Dynamic Image Fallback Resolution Chain
  const avatarImageSrc = useMemo(() => {
    if (profiledata?.images && profiledata.images[0]) {
      return `https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images/${profiledata.userid}/${profiledata.images[0]}`;
    }
    return "/professional-headshot-of-a-young-man-with-brown-ha.jpg";
  }, [profiledata]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <form onSubmit={handleSocialSubmit} className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">

        {/* Core Profile Context Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-1">
            Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal verification tokens and interface presentation hooks
          </p>
        </div>

        {/* Master Responsive Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 md:gap-8 items-start">

          {/* LEFT COLUMN: Avatar Summary Node */}
          <Card className="relative overflow-hidden shadow-xl border border-border bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm sticky top-24">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <CardContent className="p-6 space-y-4 text-center">

              {/* Profile Avatar Frame */}
              <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto group">
                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-primary/10 shadow-xl bg-muted">
                  <img
                    src={avatarImageSrc}
                    alt="Active node graphic reference identifier"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProfileImage(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
                  aria-label="Upload custom image attachment"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity Descriptions */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {profiledata?.firstname || "Kollective"} {profiledata?.lastname || "User"}
                </h2>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
                  <span>{profiledata?.city || "Unknown Location"}, {profiledata?.state || "NA"}</span>
                </div>
                {profiledata?.userhandle && (
                  <Badge variant="secondary" className="mt-1 font-mono text-xs bg-primary/10 text-primary border-transparent">
                    @{profiledata.userhandle}
                  </Badge>
                )}
              </div>

              {/* Visibility Preference Mapping Row */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {profiledata?.visibilityPreference === 'events-only' ? (
                  <><Calendar className="w-3.5 h-3.5 text-primary" /> <span>Events Only</span></>
                ) : profiledata?.visibilityPreference === 'online-only' ? (
                  <><Users className="w-3.5 h-3.5 text-primary" /> <span>Online Only</span></>
                ) : (
                  <><Eye className="w-3.5 h-3.5 text-primary" /> <span>Both Online and Events</span></>
                )}
              </div>

            </CardContent>
          </Card>

          {/* RIGHT COLUMN: Detailed Information Stacks */}
          <div className="space-y-6">

            {/* Context Card: Contact Information inputs */}
            <Card className="shadow-lg border border-border bg-card/80 backdrop-blur-md">
              <CardHeader className="pb-3 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Mail className="w-4 h-4" /></div>
                <div>
                  <CardTitle className="text-base font-bold">Contact Directory</CardTitle>
                  <p className="text-xs text-muted-foreground">Personal contact routing references</p>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Registered Email</Label>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/40 text-sm font-medium text-foreground/80 break-all select-all">
                    {profiledata?.email || "No secure email set"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    Phone Link <Edit2 className="w-2.5 h-2.5 text-muted-foreground/60" />
                  </Label>
                  <Editable text={phone} placeholder="Assign 10-digit number..." type="input">
                    <input
                      type="text"
                      placeholder="e.g. 5125550199"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        checkUnsavedChanges(e.target.value, facebook, instagram, linkedin);
                      }}
                      className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </Editable>
                </div>
              </CardContent>
            </Card>

            {/* Context Card: Social Media Hooks */}
            <Card className="shadow-lg border border-border bg-card/80 backdrop-blur-md">
              <CardHeader className="pb-3 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="w-4 h-4" /></div>
                <div>
                  <CardTitle className="text-base font-bold">Social Architecture</CardTitle>
                  <p className="text-xs text-muted-foreground">Synchronize external media endpoints</p>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Facebook Handle */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FaFacebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                  </Label>
                  <Editable text={facebook} placeholder="Link account URL..." type="input">
                    <input
                      type="text"
                      placeholder="Profile address..."
                      value={facebook}
                      onChange={(e) => {
                        setFacebook(e.target.value);
                        checkUnsavedChanges(phone, e.target.value, instagram, linkedin);
                      }}
                      className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-sm outline-none focus:border-primary"
                    />
                  </Editable>
                </div>

                {/* Instagram Handle */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FaInstagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                  </Label>
                  <Editable text={instagram} placeholder="Link handle..." type="input">
                    <input
                      type="text"
                      placeholder="@handle..."
                      value={instagram}
                      onChange={(e) => {
                        setInstagram(e.target.value);
                        checkUnsavedChanges(phone, facebook, e.target.value, linkedin);
                      }}
                      className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-sm outline-none focus:border-primary"
                    />
                  </Editable>
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FaLinkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn
                  </Label>
                  <Editable text={linkedin} placeholder="Link identifier..." type="input">
                    <input
                      type="text"
                      placeholder="Professional link..."
                      value={linkedin}
                      onChange={(e) => {
                        setLinkedIn(e.target.value);
                        checkUnsavedChanges(phone, facebook, instagram, e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-sm outline-none focus:border-primary"
                    />
                  </Editable>
                </div>

              </CardContent>
            </Card>

            {/* Context Card: Biography Editor Panel */}
            <Card className="shadow-lg border border-border bg-card/80 backdrop-blur-md">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Edit2 className="w-4 h-4" /></div>
                <div>
                  <CardTitle className="text-base font-bold">About Node</CardTitle>
                  <p className="text-xs text-muted-foreground">Personal positioning statements</p>
                </div>
              </CardHeader>
              <CardContent>
                <EditableBio
                  value={!isObjEmpty(profiledata?.bio) ? profiledata?.bio : ""}
                  onSave={handleBioSave}
                  placeholder="Tell others about your interests, technical stack specialties, or creative domains..."
                />
              </CardContent>
            </Card>

            {/* Sticky Action Row for Unsaved changes */}
            {hasUnsavedChanges && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-4 animate-slideIn">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-primary">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Unsaved alterations detected in current card views.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhone(profiledata?.phonenumber || "");
                      setFacebook(profiledata?.facebook || "");
                      setInstagram(profiledata?.instagram || "");
                      setLinkedIn(profiledata?.linkedin || "");
                      setHasUnsavedChanges(false);
                    }}
                  >
                    Discard
                  </Button>
                  <Button type="submit" size="sm" className="shadow-md">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM SECTION: Navigation Actions & Account Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-4">

          <Card className="shadow-md border border-border bg-card/70">
            <CardHeader className="pb-3 flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Settings className="w-4 h-4" /></div>
              <CardTitle className="text-sm font-bold">Account Configurations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button type="button" onClick={() => navigate('/settings')} variant="outline" className="w-full justify-start text-xs font-bold">
                <Settings className="w-3.5 h-3.5 mr-2" /> Settings
              </Button>
              <Button type="button" onClick={() => navigate('/changepassword')} variant="outline" className="w-full justify-start text-xs font-bold">
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Change Password
              </Button>
              <Button type="button" onClick={() => navigate('/settings?tab=preferences')} variant="outline" className="w-full justify-start text-xs font-bold">
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Preferences
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-border bg-card/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Quick Routing Nodes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button type="button" onClick={() => navigate('/dashboard?tab=events')} variant="ghost" className="w-full justify-start text-xs font-bold hover:bg-primary/5 hover:text-primary">
                <Calendar className="w-3.5 h-3.5 mr-2" /> My Events
              </Button>
              <Button type="button" onClick={() => navigate('/dashboard?tab=users')} variant="ghost" className="w-full justify-start text-xs font-bold hover:bg-primary/5 hover:text-primary">
                <Mail className="w-3.5 h-3.5 mr-2" /> Search Users
              </Button>

              <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
                <Button type="button" onClick={() => setCreateEventOpen(true)} variant="ghost" className="w-full justify-start text-xs font-bold hover:bg-primary/5 hover:text-primary">
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Create Event
                </Button>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-y-auto">
                  {createEventOpen && (
                    <Suspense fallback={<ProfileModalFallback text="Initializing event manifest framework..." />}>
                      <CreateEvent onClose={() => setCreateEventOpen(false)} />
                    </Suspense>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

        </div>
      </form>

      {/* Dynamic Dedicated Image Editor Modal Window Context Layer */}
      <Dialog open={editingProfileImage} onOpenChange={setEditingProfileImage}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogTitle>Update Profile Avatar</DialogTitle>
          <DialogDescription>Select and crop an absolute square aspect-ratio viewport frame alignment.</DialogDescription>
          <div className="mt-2 min-h-[260px] flex items-center justify-center bg-muted/20 border border-dashed border-border/60 rounded-xl p-4">
            {editingProfileImage && (
              <Suspense fallback={<ProfileModalFallback text="Compiling asset manipulation views..." />}>
                <ImageUploader onImageCropped={handleProfileImageCropped} minimal className="w-full" />
              </Suspense>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Processing State Screen Overlay blocking interaction grids */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-xs w-full text-center">
            <Spinner size={40} withText text="Committing alterations..." className="mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}