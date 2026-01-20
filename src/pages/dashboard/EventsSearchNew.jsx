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
import { CalendarIcon, MapPin, Clock, Users, Filter, Search, RefreshCw, SlidersHorizontal } from "lucide-react";
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
  // Returns the great circle distance between two coordinate points in miles
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

  const [searchData, setSearchData] = useState();
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
    refetchInterval: 7 * (60 * 1000), // 7 min
    refetchOnMount: false
  });

  useEffect (() => {
    if (!isObjEmpty(querydata)) {
        setSearchData(querydata)
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
    if (onetimepaymentrequired) {
        setError("One time fees required, click on 'SERVICE FEES' button")
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

      setIsLoading(true);

      const res = await refetch();

      if (res.status == "success") {
          if (res.data.length == 0) {
              setSearchData([]);
          }
      } else {
          setSearchData([]);
      }
      searchsuccess.current = true
      setIsLoading(false);
    },
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Discover Events
            </h1>
            <p className="text-muted-foreground">
              Find amazing events and meetups in your area
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="hidden md:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Form */}
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Search Filters</CardTitle>
                <p className="text-sm text-muted-foreground">Customize your event search</p>
              </div>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                  <SheetDescription>
                    Customize your event search preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">When</Label>
                      <Select
                        value={formik.values.day}
                        onValueChange={(value) => {
                          formik.values.day = value;
                          if (value === "today") {
                            setSearchAll(false);
                            setDisabledDate(true);
                            setSearchDate(new Date(Date.now()));
                          } else if (value === "tomorrow") {
                            setSearchAll(false);
                            setDisabledDate(true);
                            setSearchDate(addOneDay());
                          } else if (value === "weekend") {
                            setSearchAll(false);
                            setDisabledDate(true);
                            setSearchDate(getSaturday());
                          } else if (value === "all") {
                            setSearchAll(true);
                            setDisabledDate(true);
                            setSearchDate(new Date(Date.now()));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="weekend">This Weekend</SelectItem>
                          <SelectItem value="all">All Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Distance</Label>
                      <Select
                        value={formik.values.searchdistance}
                        onValueChange={(value) => {
                          formik.values.searchdistance = value;
                        }}
                      >
                        <SelectTrigger>
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Events
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
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* When Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  When
                </Label>
                <Select
                  required
                  name="day"
                  value={formik.values.day}
                  onValueChange={(value) => {
                    formik.values.day = value;
                    if (value === "today") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(new Date(Date.now()));
                    } else if (value === "tomorrow") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(addOneDay());
                    } else if (value === "saturday") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSaturday());
                    } else if (value === "sunday") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSunday());
                    } else if (value === "weekend") {
                      setSearchAll(false);
                      setDisabledDate(true);
                      setSearchDate(getSaturday());
                    } else if (value === "pickdate") {
                      setSearchAll(false);
                      setDisabledDate(false);
                      setSearchDate(new Date(Date.now()));
                    } else if (value === "all") {
                      setSearchAll(true);
                      setDisabledDate(true);
                      setSearchDate(new Date(Date.now()));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="saturday">This Saturday</SelectItem>
                    <SelectItem value="sunday">This Sunday</SelectItem>
                    <SelectItem value="weekend">This Weekend</SelectItem>
                    <SelectItem value="pickdate">Pick Date</SelectItem>
                    <SelectItem value="all">All Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchDate ? (
                        format(searchDate, "PPP")
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchDate}
                      onSelect={(date) => {
                        setSearchDate(date);
                        setOpen(false);
                      }}
                      disabled={disabledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                    formik.values.searchdistance = value;
                  }}
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label className="text-sm font-medium opacity-0">Search</Label>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Events
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Events
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {searchsuccess.current && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              {searchData && (
                <Badge variant="secondary" className="ml-2">
                  {Array.isArray(searchData) ? searchData.length : 0} events found
                </Badge>
              )}
            </div>
            {searchData && Array.isArray(searchData) && searchData.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Event List */}
        <div className="min-h-[400px]">
          <EventList
            events={searchData}
            isLoading={isLoading}
            userlatitude={latitude}
            userlongitude={longitude}
            setIsLoading={setIsLoading}
            profiledata={profiledata}
          />
        </div>
      </div>
    </div>
  );
}