import { useState, useEffect } from "react";
import { X, MapPin, Navigation } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { coords } from '@/lib/defaultcoords'
import { isObjEmpty } from "../utils/util";
import { updateUserInfo } from "../services/user.service";
import dayjs from "dayjs";
import { haversine } from "../utils/util";

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

  const resetCoords = async coords => {
    console.log("resetCoords coords::", coords)
    let geodata = {
      latitude: coords.lat,
      longitude: coords.lng,
      defaultcoordsset: true,
      usercoordsset: false,
    };
    const res = await updateUserInfo(user?.id, geodata);
    if (res.success) {
      setProfiledata({ ...profiledata, ...geodata });
      alert('Reset Coords Successful');
    } else {
      alert('Reset Coords Error, try again or contact us.');
    }
    setLoading(false);
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
          alert('Error! Only one reset per month is allowed!!');
          setLoading(false);
          setShowResetConfirmDialog(false);
          setResetCoordsConfirmClick(false);
        }
      } else {
        console.log('profiledata location empty');
      }
    }
  }, [resetCoordsConfirmClick]);

  const saveGeoCodes = async coords => {
    let dateofcoordinates = new Date().toISOString().substring(0, 10).toString();
    let geodata = {
      latitude: coords[0],
      longitude: coords[1],
      defaultcoordsset: false,
      usercoordsset: true,
      dateofcoordinates: dateofcoordinates,
    };
    const res = await updateUserInfo(user?.id, geodata);
    if (res.success) {
      setProfiledata({ ...profiledata, ...geodata });
      alert('Coordinates Set Successful');
    } else {
      alert('Location Set Error, try again or contact us.');
    }
    setLoading(false);
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
    const mapContainer = document.getElementById("coordinates-map");

    if (!mapContainer) return;

    // Clear existing map
    mapContainer.innerHTML = "";

    const map = L.map("coordinates-map").setView(
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
      alert('GEO ERROR, CO-ORDINATES ARE FAR FROM YOUR CITY. TRY AGAIN');
    }
  }

  function errorsCallback(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
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
        }
        result.onchange = function () {
          //console.log(result.state);
        };
      });
    } else {
      alert(
        "Unable to get your location?. Please mark it manually on the map.",
      );
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
          alert(
            "Unable to get your location?. Please mark it manually on the map.",
          );
        },
      );
    } else {
      setIsGettingLocation(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSetCoordinates = () => {
    setCoordinates(markerPosition);
    //alert(
    //  `Coordinates set to: ${markerPosition.lat.toFixed(4)}, ${markerPosition.lng.toFixed(4)}`,
    //);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border-border/50 animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-card border-b border-border/50 px-6 py-1 flex items-center justify-between z-10 bg-teal-400d">
          {loading && (
            <Spinner className="fixed top-[50%] left-[50%] z-50 cursor-pointer size-10" />
          )}
          <AlertDialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog} >
            <AlertDialogContent>
              {loading && (
                <Spinner className="absolute top-[40%] left-[50%] z-50 cursor-pointer size-10" />
              )}
              <AlertDialogHeader>
                <AlertDialogTitle>Press confirm to reset co-ordinates.</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="text-lg font-semibold mb-3">
                    Only one reset per month is allowed.
                  </span>
                  {allowCoordsChange ? (
                    <></>
                  ) : (
                    <>
                      Your last change was on
                      <span className="ms-1 text-red-600">
                        {dayjs(profiledata?.dateofcoordinates).format('MMM D, YYYY')}
                      </span>
                      .
                    </>
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
                >
                  Confirm33
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={showGeoConfirmDialog} onOpenChange={setShowGeoConfirmDialog}>
            <AlertDialogContent>
              {loading && (
                <Spinner className="absolute top-[40%] left-[50%] z-50 cursor-pointer size-10" />
              )}
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your location co-ordinates will be set to
                  <span className="ms-1 text-green-700">
                    ({markerPosition.lat.toFixed(4)},{" "}
                    {markerPosition.lng.toFixed(4)})
                  </span>
                  . Press to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmClick(true);
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="">
            <div className="text-2xl font-bold text-foreground">
              Set GPS Co-ordinates
            </div>
            <div className="text-sm text-red-600 mt-1">
              (Use this on computer or large screen for accuracy)
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

        <Separator />

        <div>
          {!isObjEmpty(profiledata?.usercoordsset) && profiledata?.usercoordsset == true && (
            <>
              <div className="px-6" role="">
                Your co-ordinates are set to
                <span className="text-orange-600 mx-2">
                  ({profiledata?.latitude}, {profiledata?.longitude})
                </span>
                .
                <div>
                  You may reset using button below or email us the co-ordinates.
                  <Button
                    className="mt-0 opacity-75"
                    data-toggle="tooltip"
                    title="Reset coordinates"
                    onClick={e => {
                      e.preventDefault();
                      setShowResetConfirmDialog(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="white"
                      viewBox="0 0 512 512"
                    >
                      <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                    </svg>
                    <span className="text-white ms-1 d-none d-sm-block">Reset</span>
                  </Button>
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}
        </div>

        <div className="px-6 space-y-2">
          <div className="space-y-2">
            {!isObjEmpty(profiledata?.defaultcoordsset) && profiledata?.defaultcoordsset == true && (
              <div className="text-sm text-blue-900 dark:text-blue-100">
                Default co-ordinates are set. Change it through map below or email
                us the co-ordinates.
              </div>
            )}

            {!isObjEmpty(profiledata?.usercoordsset) && profiledata?.usercoordsset == false && (
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-6 shadow-md hover:shadow-lg transition-all"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isGettingLocation
                ? "Getting location?..."
                : "GET MY COORDINATES AND SET"}
            </Button>
            )}
          </div>

          {!isObjEmpty(profiledata?.usercoordsset) && profiledata?.usercoordsset == false && (
            <>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground font-medium">
                  OR
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-sm font-medium text-foreground">
                  Mark your exact location on below map and then click below "Save
                  Coordinates" button
                </p>
                <Button
                  hidden
                  onClick={handleSetCoordinates}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-md hover:shadow-lg transition-all"
                >
                  CLICK TO SET
                </Button>
              </div>

              <div className="flex items-center gap-2 justify-center py-2">
                <MapPin className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">
                  Co-ordinates:
                </span>
                <span className="text-base font-bold text-destructive">
                  ({markerPosition.lat.toFixed(4)},{" "}
                  {markerPosition.lng.toFixed(4)})
                </span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
              <div
                id="coordinates-map"
                className="w-full h-[500px] bg-muted"
              ></div>
              <button
                onClick={() => {
                  const mapElement = document.getElementById("coordinates-map");
                  if (mapElement) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      mapElement.requestFullscreen();
                    }
                  }
                }}
                className="absolute top-4 right-4 bg-card dark:bg-gray-800 p-2 rounded-lg shadow-md hover:shadow-lg transition-all z-[1000]"
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

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6 font-medium bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSetCoordinates();
                  setShowGeoConfirmDialog(true);
                  //onClose();
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Save Coordinates
              </Button>
            </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

/*
  //<AlertDialogTrigger asChild>
  //  <Button variant="outline">Save Coordinates</Button>
  //</AlertDialogTrigger>
*/
