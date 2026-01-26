import { useState, useEffect } from "react";
import { X, MapPin, Navigation, RefreshCw, Target, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { coords } from '@/lib/defaultcoords'
import { isObjEmpty } from "../utils/util";
import { updateUserInfo } from "../services/user.service";
import dayjs from "dayjs";
import { haversine } from "../utils/util";
import { toast } from "sonner";

const delay = ms => new Promise(res => setTimeout(res, ms));

var toKilometers = function(miles) {
    return Math.round(miles * 1.609344);
};

const centerdefault = {
    lat: 43.6680928,
    lng: -92.9744896
};

export function LocationDialog({ isOpen, onClose, user, profiledata, setProfiledata }) {
  const center = isObjEmpty(profiledata) || isObjEmpty(coords[profiledata?.state][profiledata?.city]) ? centerdefault : coords[profiledata?.state][profiledata?.city]
  const [coordinates, setCoordinates] = useState(center);
  const [markerPosition, setMarkerPosition] = useState(center);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [confirmClick, setConfirmClick] = useState(false);
  const [showGeoConfirmDialog, setShowGeoConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allowCoordsChange, setAllowCoordsChange] = useState(false);
  const [resetCoordsConfirmClick, setResetCoordsConfirmClick] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  useEffect(() => {
    //setLatlng(getcoords(profiledata?.city))
    //setCoordinates(coords[profiledata?.state][profiledata?.city]);
    //setLatlngdefault(getcoords(profiledata?.city))
    const datenow = new Date(Date.now());
    let dif = Math.abs(datenow - new Date(profiledata?.dateofcoordinates));
    let dayssincecoordschange = Math.floor(dif / (1000 * 3600 * 24));
    if (dayssincecoordschange > 30) {
      //1 month
      setAllowCoordsChange(true);
    } else {
      setAllowCoordsChange(false);
    }
  }, [isOpen]);

  const resetCoords = async (coords) => {
    console.log("resetCoords coords::", coords)
    let geodata = {
      latitude: coords.lat,
      longitude: coords.lng,
      defaultcoordsset: true,
      usercoordsset: false,
    };

    try {
      const res = await updateUserInfo(user?.id, geodata);
      if (res.success) {
        setProfiledata({ ...profiledata, ...geodata });
        toast.success('Location reset to default successfully!', {
          position: 'top-center',
          duration: 4000,
        });
        onClose(); // Close dialog after success
      } else {
        toast.error(res.msg || 'Failed to reset location. Please try again.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      toast.error('An error occurred while resetting location.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resetCoordsConfirmClick == true) {
      if (!isObjEmpty(profiledata?.dateofcoordinates)) {
        const datenow = new Date(Date.now());
        let dif = Math.abs(datenow - new Date(profiledata?.dateofcoordinates));
        let dayssincecoordschange = Math.floor(dif / (1000 * 3600 * 24));
        setLoading(true);
        if (dayssincecoordschange > 30) {
          //1 month
          delay(2000).then(async () => {
            await resetCoords(coords[profiledata?.state][profiledata?.city]);
            setShowResetConfirmDialog(false);
            setResetCoordsConfirmClick(false);
            setLoading(false);
          });
        } else {
          toast.error('Error! Only one reset per month is allowed!', {
            position: 'top-center',
            duration: 5000,
          });
          setLoading(false);
          setShowResetConfirmDialog(false);
          setResetCoordsConfirmClick(false);
        }
      } else {
        console.log('profiledata location empty');
      }
    }
  }, [resetCoordsConfirmClick]);

  const saveGeoCodes = async (coords) => {
    let dateofcoordinates = new Date().toISOString().substring(0, 10).toString();
    let geodata = {
      latitude: coords[0],
      longitude: coords[1],
      defaultcoordsset: false,
      usercoordsset: true,
      dateofcoordinates: dateofcoordinates,
    };

    try {
      const res = await updateUserInfo(user?.id, geodata);
      if (res.success) {
        setProfiledata({ ...profiledata, ...geodata });
        toast.success('Location coordinates saved successfully!', {
          position: 'top-center',
          duration: 4000,
        });
        onClose(); // Close dialog after success
      } else {
        toast.error(res.msg || 'Failed to save coordinates. Please try again.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      toast.error('An error occurred while saving coordinates.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (confirmClick == true) {
      setLoading(true);
      delay(4000).then(async () => {
        await saveGeoCodes([coordinates?.lat, coordinates?.lng]);
        setConfirmClick(false);
        setLoading(false);
        setShowGeoConfirmDialog(false);
      });
    }
  }, [confirmClick]);

  useEffect(() => {
    if (!isOpen) return;

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, [isOpen]);

  const initMap = () => {
    if (typeof window === "undefined" || !window.L) return;

    const L = window.L;
    // Try to find either map container
    let mapContainer = document.getElementById("coordinates-map") || document.getElementById("coordinates-map-new");

    if (!mapContainer) return;

    // Clear existing map
    mapContainer.innerHTML = "";

    const map = L.map(mapContainer.id).setView(
      [markerPosition.lat, markerPosition.lng],
      13,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([markerPosition.lat, markerPosition.lng], {
      draggable: true,
    }).addTo(map);

    marker.bindPopup("<b>Your location</b>").openPopup();

    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      setMarkerPosition({ lat: position.lat, lng: position.lng });
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setMarkerPosition({ lat, lng });
    });
  };
  
  function verifygeo(coordsIn) {
    for (var i = 0; i < coords.length; i++) {
      if (coords[i].city == profiledata?.city) {
        const distance = haversine(
          coordsIn.latitude,
          coordsIn.longitude,
          coords[i].coords.lat,
          coords[i].coords.lng,
        );
        if (toKilometers(distance) < 250) {
          return true;
        }
      }
    }
    return false;
  }

  function successCallback(pos) {
    var coords = pos.coords;
    if (!verifygeo(coords)) {
      const newCoords = {
        lat: coords?.latitude,
        lng: coords?.longitude,
      };

      setMarkerPosition(newCoords);
      setCoordinates(newCoords);
      setIsGettingLocation(false);
      setShowGeoConfirmDialog(true);
    } else {
      toast.error('Location error: Coordinates are far from your city. Please try again or set location manually.', {
        position: 'top-center',
        duration: 5000,
      });
      setIsGettingLocation(false);
    }
  }

  function errorsCallback(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
    let errorMessage = 'Unable to get your location. ';
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Location access denied. Please enable location permissions.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage += 'Location request timed out.';
        break;
      default:
        errorMessage += 'Please mark your location manually on the map.';
        break;
    }
    toast.error(errorMessage, {
      position: 'top-center',
      duration: 5000,
    });
    setIsGettingLocation(false);
  }

  var options = {
    enableHighAccuracy: true,
    timeout: 27000,
    maximumAge: 0,
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
        if (result.state === 'granted') {
          //If granted then you can directly call your function here
          navigator.geolocation.getCurrentPosition(successCallback);
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(successCallback, errorsCallback, options);
        } else if (result.state === 'denied') {
          //If denied then you have to show instructions to enable location
          toast.error('Location access denied. Please enable location permissions in your browser settings.', {
            position: 'top-center',
            duration: 5000,
          });
        }
        result.onchange = function () {
          //console.log(result.state);
        };
      });
    } else {
      toast.error('Geolocation is not supported by your browser. Please mark your location manually on the map.', {
        position: 'top-center',
        duration: 5000,
      });
    }
  };

  const getCurrentLocationX = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(newCoords);
          setCoordinates(newCoords);
          setIsGettingLocation(false);
          setTimeout(initMap, 100);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          toast.error('Unable to get your location. Please mark it manually on the map.', {
            position: 'top-center',
            duration: 5000,
          });
        },
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by your browser. Please mark your location manually on the map.', {
        position: 'top-center',
        duration: 5000,
      });
    }
  };

  const handleSetCoordinates = () => {
    setCoordinates(markerPosition);
    //alert(
    //  `Coordinates set to: ${markerPosition.lat.toFixed(4)}, ${markerPosition.lng.toFixed(4)}`,
    //);
  };

  if (!isOpen) return null;

  // Helper function to get coordinate status
  const getCoordinateStatus = () => {
    if (profiledata?.usercoordsset) {
      return { type: 'custom', label: 'Custom Location Set', color: 'bg-green-500' };
    } else if (profiledata?.defaultcoordsset) {
      return { type: 'default', label: 'Default Location', color: 'bg-blue-500' };
    }
    return { type: 'none', label: 'No Location Set', color: 'bg-gray-500' };
  };

  const status = getCoordinateStatus();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border-border/50 animate-in zoom-in-95 duration-200 relative">
          {/* Global Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <Spinner size="xlarge" className="mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Updating your location...</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Set GPS Coordinates</h2>
                <p className="text-sm text-muted-foreground">Pinpoint your exact location for better matches</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={`${status.color} text-white text-xs px-2 py-1`}>
                    {status.label}
                  </Badge>
                  {profiledata?.usercoordsset && (
                    <span className="text-xs text-muted-foreground">
                      ({profiledata.latitude?.toFixed(4)}, {profiledata.longitude?.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Alert Dialogs */}
        <AlertDialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                Reset to Default Location
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>This will reset your coordinates to the default location for your city.</p>
                {!allowCoordsChange && (
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      Last changed: {dayjs(profiledata?.dateofcoordinates).format('MMM D, YYYY')}
                      <br />
                      You can reset again after 30 days.
                    </AlertDescription>
                  </Alert>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  setResetCoordsConfirmClick(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!allowCoordsChange}
              >
                {allowCoordsChange ? 'Reset Location' : 'Not Available'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showGeoConfirmDialog} onOpenChange={setShowGeoConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Confirm Location
              </AlertDialogTitle>
              <AlertDialogDescription>
                Set your coordinates to:
                <span className="font-mono text-green-600 dark:text-green-400 ml-2">
                  ({markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)})
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmClick(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Location
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Content */}
        <div className="flex flex-col h-[calc(95vh-120px)]">
          {/* Status and Actions */}
          {profiledata?.usercoordsset && (
            <div className="px-6 py-4 border-b border-border/50">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Custom location set:</strong> Your coordinates are manually configured.
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 h-7"
                    onClick={() => setShowResetConfirmDialog(true)}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {!profiledata?.usercoordsset && (
              <div className="p-6 space-y-6">
                {/* Quick Location Button */}
                <div className="text-center">
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Navigation className="w-5 h-5 mr-3" />
                    {isGettingLocation ? 'Getting Your Location...' : 'Use My Current Location'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Automatically detect and set your GPS coordinates
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-sm text-muted-foreground font-medium">OR</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Manual Location Setting */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Set Location Manually</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag the marker on the map to your exact location, then save your coordinates
                    </p>
                  </div>

                  {/* Coordinate Display */}
                  <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Current Marker Position</p>
                      <p className="font-mono text-lg font-semibold text-foreground">
                        {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Section */}
            {!profiledata?.usercoordsset && (
              <div className="px-6 pb-6">
                <div className="relative rounded-xl overflow-hidden border border-border shadow-lg bg-muted/20">
                  <div
                    id="coordinates-map-new"
                    className="w-full h-[400px] sm:h-[500px] bg-muted"
                  ></div>

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => {
                        const mapElement = document.getElementById("coordinates-map-new");
                        if (mapElement) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            mapElement.requestFullscreen();
                          }
                        }
                      }}
                      className="bg-card dark:bg-gray-800 p-2 rounded-lg shadow-md hover:shadow-lg transition-all z-[1000]"
                      aria-label="Toggle fullscreen"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Map Instructions */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                        Click on the map or drag the marker to set your location
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!profiledata?.usercoordsset && (
            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSetCoordinates();
                    setShowGeoConfirmDialog(true);
                  }}
                  className="bg-primary hover:bg-primary/90 px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Save Location
                </Button>
              </div>
            </div>
          )}

          {/* Close button for set coordinates */}
          {profiledata?.usercoordsset && (
            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
              <div className="flex justify-end">
                <Button
                  onClick={onClose}
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
}