import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/Spinner";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Settings as SettingsIcon,
  AlertTriangle,
  Trash2,
  User,
  MapPin,
  Target,
  Brain,
  Edit
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserInfo, deleteUser } from "@/services/user.service";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { HandleCard } from "@/components/HandleCard";
import { LocationDialog } from "@/components/LocationDialog";
import { ChangeLocation } from "@/components/ChangeLocation";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export function Settings() {
  const { user, profiledata, setProfiledata } = useAuth();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [emailsearch, setEmailsearch] = useState(profiledata?.emailsearch ?? true);
  const [phonenumbersearch, setPhonenumbersearch] = useState(profiledata?.phonenumbersearch ?? false);
  const [userhandlesearch, setUserhandlesearch] = useState(profiledata?.userhandlesearch ?? false);
  const [onlyhundredmileevisiblity, setOnlyhundredmileevisiblity] = useState(profiledata?.onlyhundredmileevisiblity ?? true);

  let [valueschanged, setValueschanged] = useState(false);
  const [confirmClick, setConfirmClick] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  // Modal states for profile actions
  const [isCoordinatesModalOpen, setIsCoordinatesModalOpen] = useState(false);

  const gotoQuestionaire = () => {
    navigate("/questionaire");
  };

  const clickDeleteConfirm = async () => {
    if (!isOnline) {
      toast.error('You are offline. Check your internet connection', {
        position: 'top-center',
      });
      return;
    }

    setConfirmClick(true);

    try {
      const res = await deleteUser(user?.id);

      if (res.success) {
        toast.success('Account deleted successfully!', {
          position: 'top-center',
        });
        // Navigate to login or home page after successful deletion
        navigate("/");
      } else {
        toast.error(res.msg || 'Failed to delete account', {
          position: 'top-center',
        });
      }
    } catch {
      toast.error('An error occurred while deleting your account', {
        position: 'top-center',
      });
    } finally {
      setConfirmClick(false);
      setConfirmPopup(false);
    }
  };

  const formik = useFormik({
    initialValues: {},

    onSubmit: async () => {
      if (!isOnline) {
        toast.error('You are offline. Check your internet connection', {
          position: 'top-center',
        });
        return;
      }

      if (
        emailsearch === profiledata?.emailsearch &&
        phonenumbersearch === profiledata?.phonenumbersearch &&
        userhandlesearch === profiledata?.userhandlesearch &&
        onlyhundredmileevisiblity === profiledata?.onlyhundredmileevisiblity
      ) {
        setValueschanged(false);
        return;
      }

      let settingsdata = {
        emailsearch: emailsearch,
        phonenumbersearch: phonenumbersearch,
        userhandlesearch: userhandlesearch,
        onlyhundredmileevisiblity: onlyhundredmileevisiblity,
      };

      if (valueschanged) {
        setLoading(true);
        const res = await updateUserInfo(user?.id, settingsdata);

        if (res.success) {
          setProfiledata({ ...profiledata, ...settingsdata });
          toast.success('Settings updated successfully!', {
            position: 'top-center',
          });
        } else {
          toast.error(res.msg, {
            position: 'top-center',
          });
        }
        setLoading(false);
        setValueschanged(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      {loading && (
        <Spinner
          className="top-[50%] left-[50%] z-50 absolute"
          size="medium"
          withText={true}
          text="Saving..."
        />
      )}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <Card className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
        <AlertDialog open={confirmPopup} onOpenChange={setConfirmPopup}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={confirmClick}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={clickDeleteConfirm}
                disabled={confirmClick}
                className="bg-destructive hover:bg-destructive/90"
              >
                {confirmClick ? (
                  <>
                    <Spinner size="small" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 px-6 py-8 border-b border-border flex items-start justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-primary">Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage your privacy and account preferences</p>
            </div>
          </div>
          <button
            type="button"
            className="text-red-700 rounded bg-transparent border-0"
            onClick={() => navigate("/dashboard")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="14"
              viewBox="0 0 384 512"
              fill=""
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Privacy Settings</h2>
            </div>

            <div className="space-y-4">
              <Card className="border border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">Email Search Visibility</h3>
                      <p className="text-sm text-muted-foreground">Allow others to find your profile via email search</p>
                    </div>
                    <Switch
                      checked={emailsearch}
                      onCheckedChange={(value) => {
                        setEmailsearch(value);
                        setValueschanged(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">Phone Search Visibility</h3>
                      <p className="text-sm text-muted-foreground">Allow others to find your profile via phone number search</p>
                    </div>
                    <Switch
                      checked={phonenumbersearch}
                      onCheckedChange={(value) => {
                        setPhonenumbersearch(value);
                        setValueschanged(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">UserHandle Search Visibility</h3>
                      <p className="text-sm text-muted-foreground">Allow others to find your profile via username search</p>
                    </div>
                    <Switch
                      checked={userhandlesearch}
                      onCheckedChange={(value) => {
                        setUserhandlesearch(value);
                        setValueschanged(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">Distance Visibility</h3>
                      <p className="text-sm text-muted-foreground">Only show your profile to people within 100 miles</p>
                    </div>
                    <Switch
                      checked={onlyhundredmileevisiblity}
                      onCheckedChange={(value) => {
                        setOnlyhundredmileevisiblity(value);
                        setValueschanged(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {valueschanged && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmailsearch(profiledata.emailsearch || false);
                    setPhonenumbersearch(profiledata.phonenumbersearch || false);
                    setUserhandlesearch(profiledata.userhandlesearch || false);
                    setOnlyhundredmileevisiblity(profiledata.onlyhundredmileevisiblity || false);
                    setValueschanged(false);
                  }}
                  disabled={!valueschanged}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={formik.handleSubmit}
                  disabled={!valueschanged || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Spinner size="small" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Profile Actions Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Profile Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Set Handle */}
              <Card className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">Set Handle</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a unique username for your profile
                      </p>
                      {profiledata?.userhandle ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">
                            @{profiledata.userhandle}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Set
                          </span>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="mt-2">
                              Set Handle
                            </Button>
                          </DialogTrigger>
                          <HandleCard />
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coordinates */}
              <Card className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">Coordinates</h3>
                      <p className="text-sm text-muted-foreground">
                        View and manage your location coordinates
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCoordinatesModalOpen(true)}
                        className="mt-2"
                      >
                        View Coordinates
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Location */}
              <Card className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">Change Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your city and location information
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="mt-2">
                            Change Location
                          </Button>
                        </DialogTrigger>
                        <ChangeLocation />
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mindset Questionnaire */}
              <Card className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">Mindset Questionnaire</h3>
                      <p className="text-sm text-muted-foreground">
                        Take our personality assessment to improve matches
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={gotoQuestionaire}
                        className="mt-2"
                      >
                        Take Questionnaire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            </div>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmPopup(true)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <LocationDialog
        isOpen={isCoordinatesModalOpen}
        onClose={() => setIsCoordinatesModalOpen(false)}
        user={user}
        profiledata={profiledata}
        setProfiledata={setProfiledata}
      />
      </div>
    </div>
  );
}