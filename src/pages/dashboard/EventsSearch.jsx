/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Clock, Users, Filter, Search, RefreshCw, SlidersHorizontal, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EventList } from "@/components/EventList";
import { useFormik } from "formik";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query"
import { getEventsData } from "@/services/events.service";
import { isObjEmpty } from "@/utils/util";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

let distanceMap = new Map([
  ["5", 8046],
  ["10", 16093],
  ["25", 40233],
  ["50", 80467],
  ["75", 120699],
  ["100", 160934],
  ["200", 321869],
]);

function addOneDay(date = new Date(Date.now())) {
  date.setDate(date.getDate() + 1);
  return date;
}

function getSaturday(date = new Date(Date.now())) {
  const d = new Date(Date.now());
  let day = d.getDay();
  if (day != 6) {
    date.setDate(date.getDate() + (6 - day));
  } else {
    date.setDate(date.getDate());
  }
  return date;
}

function getSunday(date = new Date(Date.now())) {
  const d = new Date(Date.now());
  let day = d.getDay();
  if (day != 0) {
    date.setDate(date.getDate() + (7 - day));
  } else {
    date.setDate(date.getDate());
  }
  return date;
}

var deg2rad = function (value) {
  return value * 0.017453292519943295;
};

function haversine(latIn1, lonIn1, latIn2, lonIn2) {
  // Retuns the great circle distance between two coordinate points in miles
  var dLat = deg2rad(latIn2 - latIn1);
  var dLon = deg2rad(lonIn2 - lonIn1);
  var lat1 = deg2rad(latIn1);
  var lat2 = deg2rad(latIn2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 3960 * c;
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

let searchinfo = null;

const STORAGE_KEYS = {
  SEARCH_PARAMS: 'eventsSearchParams',
  SEARCH_RESULTS: 'eventsSearchResults',
  SEARCH_SUCCESS: 'eventsSearchSuccess',
  SEARCH_DATE: 'eventsSearchDate',
  FORM_VALUES: 'eventsSearchFormValues'
};

export function EventsSearch({
  profiledata,
  userhandle,
  latitude,
  longitude,
  questionairevaluesset,
  userstate,
  onetimepaymentrequired
}) {
  const [searchDate, setSearchDate] = useState(new Date(Date.now()));
  const [open, setOpen] = useState(false)
  const [searchAll, setSearchAll] = useState(false);
  const [disabledDate, setDisabledDate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchsuccess = useRef(false);
  const [sortmsg, setSortmsg] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileError, setMobileError] = useState("");

  const [searchData, setSearchData] = useState();

  // Utility functions for localStorage persistence
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  const clearSearchStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Restore search state on component mount
  useEffect(() => {
    const storedSearchSuccess = loadFromStorage(STORAGE_KEYS.SEARCH_SUCCESS, false);
    const storedSearchResults = loadFromStorage(STORAGE_KEYS.SEARCH_RESULTS);
    const storedSearchParams = loadFromStorage(STORAGE_KEYS.SEARCH_PARAMS);
    const storedSearchDate = loadFromStorage(STORAGE_KEYS.SEARCH_DATE);
    const storedFormValues = loadFromStorage(STORAGE_KEYS.FORM_VALUES);

    if (storedSearchSuccess) {
      searchsuccess.current = true;
      if (storedSearchResults) {
        setSearchData(storedSearchResults);
      }
      if (storedSearchParams) {
        searchinfo = storedSearchParams;
      }
      if (storedSearchDate) {
        setSearchDate(new Date(storedSearchDate));
      }
      if (storedFormValues) {
        // Restore form values
        formik.setValues(storedFormValues);
        // Restore UI state based on form values
        if (storedFormValues.day) {
          const dayValue = storedFormValues.day;
          if (['today', 'tomorrow', 'saturday', 'sunday', 'weekend', 'all'].includes(dayValue)) {
            setDisabledDate(true);
            setSearchAll(dayValue === 'all');
          } else if (dayValue === 'pickdate') {
            setDisabledDate(false);
            setSearchAll(false);
          }
        }
      }
    }
  }, []);
  const eventsSearchQueryKey = () => ["eventssearch"];

  const {status, data: querydata, error: fetcherror, refetch} = useQuery({
    queryKey: eventsSearchQueryKey(),
    queryFn: async () => {
      if (!isObjEmpty(searchinfo)) {
          const response = await getEventsData(searchinfo);
          return response.data || null;
      } else {
          return null;
      }
    },
    // enabled: false,
    refetchInterval: 7 * (60 * 1000), // 7 min
    refetchOnMount: false
  });

  useEffect (() => {
    if (!isObjEmpty(querydata)) {
        setSearchData(querydata);
        // Save search results to localStorage
        saveToStorage(STORAGE_KEYS.SEARCH_RESULTS, querydata);
    }
  }, [querydata]);

  useEffect(() => {
    if (!isObjEmpty (searchData)) {
        for (let key in searchData) {
            const distance = haversine(latitude, longitude, searchData[key].latitude, searchData[key].longitude);
            searchData[key].distance = distance;
        }
    }
  }, [searchData]);

  useEffect (() => {
    //if (!questionairevaluesset) {
    //  setError("Finish questinaire to start searching")
    //} else
    if (onetimepaymentrequired) {
        //if (verified) {
            setError("One time fees required, click on 'SERVICE FEES' button")
        //}
    } else
    if (isObjEmpty(userhandle)) {
        setError("Set handle to start searching")
    } else if (isObjEmpty(latitude)) {
        setError("Set co-ordinates to start searching")
    } else if (userstate != 'active') {
        setError("Activate your Profile")
    } else {
        setError("")
    }
  }, [userhandle, latitude, questionairevaluesset, userstate]);

  const formik = useFormik({
    initialValues: {
      day: "",
      searchdistance: 0,
      sortby: "",
    },

    onSubmit: async (values) => {
      console.log("onSubmit call..")
      // Close the mobile sheet when search is initiated
      setOpen(false);

      let objectDate = new Date(searchDate);
      let day = objectDate.getDate();
      let month = objectDate.getMonth() + 1; //because getMonth() returns '0' based values
      let year = objectDate.getFullYear();
      let dateformatted;
      let enddateformatted = null;
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      dateformatted = `${year}-${month}-${day}`;

      if (values.day == "weekend") {
        let dayplus1 = objectDate.addDays(1);
        day = dayplus1.getDate();
        month = dayplus1.getMonth() + 1;
        year = dayplus1.getFullYear();
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        enddateformatted = `${year}-${month}-${day}`;
      }

      if (values.day == "all") {
        //2 months
        let dayplus60 = objectDate.addDays(60);
        day = dayplus60.getDate();
        month = dayplus60.getMonth() + 1;
        year = dayplus60.getFullYear();
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        enddateformatted = `${year}-${month}-${day}`;
      }

      searchinfo = {
        lat: latitude,
        long: longitude,
        startdate: dateformatted,
        enddate: enddateformatted,
        searchdistance: distanceMap.get(formik.values.searchdistance),
      };

      // Save search parameters to localStorage
      saveToStorage(STORAGE_KEYS.SEARCH_PARAMS, searchinfo);
      saveToStorage(STORAGE_KEYS.SEARCH_DATE, searchDate);
      saveToStorage(STORAGE_KEYS.FORM_VALUES, values);

      setIsLoading(true);

      const res = await refetch();

      if (res.status == "success") {
          //setSearchData(res.data);
          if (res.data.length == 0) {
              setSearchData([]);
              setSuccessMessage("Search completed! No events found in your area.");
          } else {
              setSuccessMessage(`Search completed! Found ${res.data.length} event${res.data.length === 1 ? '' : 's'} in your area.`);
          }
      } else {
          setSearchData([]);
          setSuccessMessage("Search completed, but no events were found.");
      }
      searchsuccess.current = true;

      // Save search success state
      saveToStorage(STORAGE_KEYS.SEARCH_SUCCESS, true);

      setIsLoading(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-400 mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Discover Events
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find amazing events and meetups in your area. Connect with people who share your interests.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            {searchsuccess.current && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearSearchStorage();
                  searchinfo = null;
                  searchsuccess.current = false;
                  setSearchData(null);
                  setSuccessMessage("");
                  formik.resetForm();
                  setSearchDate(new Date(Date.now()));
                  setDisabledDate(false);
                  setSearchAll(false);
                }}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <Search className="w-4 h-4 mr-2" />
                New Search
              </Button>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-900/10 mb-6 max-w-2xl mx-auto backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Banner */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 mb-6 max-w-2xl mx-auto backdrop-blur-sm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold">!</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      {/* Search Form */}
      <Card className="mb-8 shadow-lg bg-card/50 dark:bg-card/40 backdrop-blur-sm border-2 border-border">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Find Your Perfect Event</CardTitle>
                <p className="text-sm text-muted-foreground">Discover events in your area</p>
              </div>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden bg-white/50 dark:bg-gray-700/50"
                  onClick={() => setMobileError("")}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Search Filters
                  </SheetTitle>
                  <SheetDescription>
                    Customize your event search preferences to find the perfect matches
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-4">
                    {/* Mobile Date and Distance Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
                        <Select
                          value={formik.values.day}
                          onValueChange={(value) => {
                            formik.values.day = value;
                            if (value == "today") {
                              setSearchAll(false);
                              setDisabledDate(true);
                              setSearchDate(new Date(Date.now()));
                            } else if (value == "tomorrow") {
                              setSearchAll(false);
                              setDisabledDate(true);
                              setSearchDate(addOneDay());
                            } else if (value == "saturday") {
                              setSearchAll(false);
                              setDisabledDate(true);
                              setSearchDate(getSaturday());
                            } else if (value == "sunday") {
                              setSearchAll(false);
                              setDisabledDate(true);
                              setSearchDate(getSunday());
                            } else if (value == "weekend") {
                              setSearchAll(false);
                              setDisabledDate(true);
                              setSearchDate(getSaturday());
                            } else if (value == "pickdate") {
                              setSearchAll(false);
                              setDisabledDate(false);
                              setSearchDate(new Date(Date.now()));
                            } else if (value == "all") {
                              setSearchAll(true);
                              setDisabledDate(true);
                              setSearchDate(new Date(Date.now()));
                            } else {
                              setSearchAll(false);
                              setDisabledDate(false);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="saturday">This Saturday</SelectItem>
                            <SelectItem value="sunday">This Sunday</SelectItem>
                            <SelectItem value="weekend">This Weekend</SelectItem>
                            <SelectItem value="pickdate">Pick Date</SelectItem>
                            <SelectItem value="all">All (from today)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Distance</Label>
                        <Select
                          value={formik.values.searchdistance}
                          onValueChange={(value) => {
                            formik.setFieldValue('searchdistance', value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select distance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Miles</SelectItem>
                            <SelectItem value="10">10 Miles</SelectItem>
                            <SelectItem value="25">25 Miles</SelectItem>
                            <SelectItem value="50">50 Miles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!disabledDate && (
                      <div>
                        <Label className="text-sm font-medium">Pick Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !searchDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {searchDate ? format(searchDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" side="bottom" align="start" sideOffset={8}>
                            <Calendar
                              mode="single"
                              selected={searchDate}
                              onSelect={setSearchDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    <Button onClick={() => formik.handleSubmit()} className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Find Events
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Desktop Filters */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date
                </Label>
                <Select
                  required
                  name="day"
                  value={formik.values.day}
                  onValueChange={(value) => {
                    formik.values.day = value;
                    if (value == "today") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(new Date(Date.now()));
                    } else if (value == "tomorrow") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(addOneDay());
                    } else if (value == "saturday") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSaturday());
                    } else if (value == "sunday") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSunday());
                    } else if (value == "weekend") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSaturday());
                    } else if (value == "pickdate") {
                      setSearchAll(false);
                      setDisabledDate(false);
                      setSearchDate(new Date(Date.now()));
                    } else if (value == "all") {
                      setSearchAll(true);
                      setDisabledDate(true);
                      setSearchDate(new Date(Date.now()));
                    } else {
                      setSearchAll(false);
                      setDisabledDate(false);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="saturday">This Saturday</SelectItem>
                    <SelectItem value="sunday">This Sunday</SelectItem>
                    <SelectItem value="weekend">This Weekend</SelectItem>
                    <SelectItem value="pickdate">Pick a Date</SelectItem>
                    <SelectItem value="all">All (from today)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              {!disabledDate && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pick a Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !searchDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {searchDate ? format(searchDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" side="bottom" align="start" sideOffset={8}>
                      <Calendar
                        mode="single"
                        selected={searchDate}
                        onSelect={setSearchDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Distance Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Distance
                </Label>
                <Select
                  required
                  name="searchdistance"
                  value={formik.values.searchdistance}
                  onValueChange={(value) => {
                    formik.setFieldValue('searchdistance', value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Miles</SelectItem>
                    <SelectItem value="10">10 Miles</SelectItem>
                    <SelectItem value="25">25 Miles</SelectItem>
                    <SelectItem value="50">50 Miles</SelectItem>
                    <SelectItem value="75">75 Miles</SelectItem>
                    <SelectItem value="100">100 Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium opacity-0">Search</Label>
                <Button type="submit" className="w-full h-10" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Events
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              {mobileError && (
                <Alert className="border-destructive/50 bg-destructive/5 mb-4">
                  <AlertDescription className="text-destructive">
                    {mobileError}
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={() => {
                  if (!formik.values.day || !formik.values.searchdistance) {
                    setMobileError("Please select both date and distance filters before searching.");
                    return;
                  }
                  setMobileError("");
                  formik.handleSubmit();
                }} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Events
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        {searchsuccess.current && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="pb-4">
                    <h2 className="text-xl font-semibold text-foreground">Search Results</h2>
                    <p className="text-sm text-muted-foreground">Events found in your area</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {searchData && (
                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                      {Array.isArray(searchData) ? searchData.length : 0} events found
                    </Badge>
                  )}
                  {searchData && Array.isArray(searchData) && searchData.length > 0 && (
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50">
                      <Filter className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event List */}
        {!isObjEmpty(searchData) && (
          <div className="min-h-100">
            <EventList
              events={searchData}
              userhandle={userhandle}
              userlatitude={latitude}
              userlongitude={longitude}
              setIsLoading={setIsLoading}
              profiledata={profiledata}
            />
          </div>
        )}
       
        {/* Empty State */}
        {searchsuccess.current && isObjEmpty(searchData) && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or expanding your search radius.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
