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
import { CalendarIcon } from "lucide-react";
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
    // enabled: false,
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
          //setSearchData(res.data);
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
    <div>
      <Card className="bg-transparent mx-4 mt-2 border-none shadow-none hover:shadow-none">
        <CardHeader className="pb-0">
          <CardTitle>Search events near your area</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center w-[100%]">
          <form className="w-[100%] lg:w-[80%]" onSubmit={formik.handleSubmit}>
            <div className="flex flex-col md:flex-row gap-3">
              <Select
                required
                name="day"
                value={formik.values.day}
                onValueChange={(value) => {
                  formik.values.day = value;
                  if (value == "Today") {
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
                <SelectTrigger className="w-full md:w-1/4">
                  <SelectValue placeholder="Select Day/Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="saturday">This Saturday</SelectItem>
                    <SelectItem value="sunday">This Sunday</SelectItem>
                    <SelectItem value="weekend">This Weekend</SelectItem>
                    <SelectItem value="pickdate">Pick Date</SelectItem>
                    <SelectItem value="all">All (from today)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-1/4 justify-start text-left font-normal",
                      !searchDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon />
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
                    //onSelect={setSearchDate}
                    onSelect={(date) => {
                      setSearchDate(date)
                      setOpen(false)
                    }}
                   // disabled={disabledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select
                required
                name="searchdistance"
                onValueChange={(value) => {
                  formik.values.searchdistance = value;
                }}
              >
                <SelectTrigger className="w-full md:w-1/4">
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5">5 Miles</SelectItem>
                    <SelectItem value="10">10 Miles</SelectItem>
                    <SelectItem value="25">25 Miles</SelectItem>
                    <SelectItem value="50">50 Miles</SelectItem>
                    <SelectItem value="100">100 Miles</SelectItem>
                    <SelectItem value="150">150 Miles</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {error == "" ? (
                <Button
                  type="submit"
                  className="w-full md:w-1/4 bg-teal-600 hover:bg-[#0D9488]/90 font-bold text-white"
                  variant="secondary"
                >
                  Search
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="w-full md:w-1/4 bg-teal-600 hover:bg-[#0D9488]/90"
                    variant="secondary"
                    disabled={true}
                  >
                    Search
                  </Button>
                  {error && <div className="error_msg">{error}</div>}
                </>
              )}
            </div>
          </form>
        
          {isObjEmpty(searchData) && (searchData?.length == undefined) && (!isLoading) && (
            <Card className="mt-3 w-[100%] lg:w-[80%]">
              <div className="grid gap-4 py-4 text-xl px-3">
                Searched events will be shown here.
              </div>
            </Card>
          )}
        
          {isObjEmpty(searchData) && (searchData?.length == 0) && (!isLoading) && (
            <Card className="mt-3 w-[100%] lg:w-[80%]">
              <CardContent className="">
                <div className='flex'>
                  No events found of your search criteria.
                  <button
                    type="button"
                    className='text-red-700 rounded bg-transparent border-0 ms-auto'
                    onClick={(e) => {setSearchData(null)}}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="14" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-5">
            <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-500 ${
                  isLoading ? 'w-full animate-pulse' : 'w-0'
                }`}
                style={{
                  animation: isLoading ? 'progress 1s ease-in-out infinite' : 'none',
                }}
              />
            </div>

          </div>
        </CardContent>
      </Card>
      <div>
        <EventList
          events={searchData}
          userhandle={userhandle}
          userlatitude={latitude}
          userlongitude={longitude}
          setIsLoading={setIsLoading}
          profiledata={profiledata}
        />
      </div>
    </div>
  );
}
