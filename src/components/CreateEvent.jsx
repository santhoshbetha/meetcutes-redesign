import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cities } from "@/lib/cities";
import { isObjEmpty } from "../utils/util";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { postNewEvent } from "@/utils/util";
import { format } from "date-fns"
import { useFormik } from "formik";
import { useAuth } from "../context/AuthContext";
import { AutoComplete } from "@/components/AutoComplete";
import { AutoCompleteDataContext } from "@/context/AutoCompleteDataContext";
import { cn } from "@/lib/utils"
import { LoadingButton } from '@/components/ui/loading-button';

const getCity = (stateIn)  => {
    if (!isObjEmpty(stateIn)) {
        return cities[stateIn]?.map((city, idx) => {
                return <SelectItem key={idx} value={city}>{city}</SelectItem>;
            }
        );
    }
}

export function CreateEvent({ onClose }) {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus();
  const { userSession, profiledata } = useAuth();
  const [alertMsg, setAlertMsg] = useState("");
  const {autocompletedata} = useContext(AutoCompleteDataContext);
  const [state, setState] = useState("");
  const [description, setDescription] = useState("")
  const [date1, setDate1] = useState("")
  const [open, setOpen] = useState(false)
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("09:00")
  const [loading, setLoading] = useState(false);
  let locationid = null;
  const [eventerrpopup, setEventerrpopup] = useState(false);

  const formik = useFormik({
    initialValues: {
        location: "",
        address1: "",
        state: "",
        city: "",
        zip: ""
    },
    
    onSubmit: async (values) => {
        if (!isOnline) {
            alert('You are offline. check your internet connection.')
            return;
        }
        if (!userSession) {
            alert ("Error, logout and login again")
            return;
        }
        
        autocompletedata.forEach((each) => {
          if (each.address1 == values.address1 && each.state == values.state && each.city == values.city && each.zipcode == values.zip) {
              locationid = each.locationid
          }
        });

        const postresp = await postNewEvent(
          formik.values.location,
          formik.values.address1, //addressOne
          formik.values.state,
          formik.values.city, 
          formik.values.zip, 
          (new Date(date1)).toISOString().substring(0, 10).toString(),
          startTime,
          endTime, 
          description,
          profiledata?.userid,
          profiledata?.latitude,
          profiledata?.longitude,
          locationid,
          setLoading
        )

        if (postresp == -2) {
          setLoading(false)
          setEventerrpopup(true)
          setAlertMsg("You can only create events around 150 miles of you. Try again.")
          alert ("Create Event Failed! Far from your area!!")
        }
        if (postresp == 0) {
          alert ("Create Event Succesful")
          navigate('/dashboard')
        } else if (postresp == -1) {
          setLoading(false)
          alert ("Create Event Failed. Try again")
        } else if (postresp == -3) {
          setEventerrpopup(true)
          setLoading(false)
          setAlertMsg("Event timing conflicts at the given location. try different time.")
          alert ("Timing Conflicts!!")
        }
    }
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {loading && (
        <Spinner
          className='fixed top-[50%] left-[50%] z-[10010] -translate-x-1/2 -translate-y-1/2'
          size="xlarge" 
        />
      )}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card dark:bg-[#071226] dark:border-gray-800 border border-gray-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 z-[10005]"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-200" />
        </button>

        {/* Header */}
        <div className="text-center pt-12 pb-8 px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-3">
            Create Event
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Fill in the details for your event
          </p>
        </div>

        {/* Form */}
        <form 
            className="px-8 md:px-12 pb-12 space-y-8"
            onSubmit={formik.handleSubmit} 
        >
          {/* Location Name */}
          <div className="space-y-2">
            <Label
              htmlFor="locationName"
              className="text-sm font-medium text-gray-300"
            >
              Location Name
            </Label>
            <Input
              id='location'
              name='location'
              type='text'
              onChange={formik.handleChange}
              className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20"
              placeholder="e.g., TARGET, Starbucks"
              required
            />
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label
              htmlFor="streetAddress"
              className="text-sm font-medium text-gray-700"
            >
              Street Address
            </Label>
            <AutoComplete
              data={autocompletedata}
              formik={formik}
            />
          </div>

          {/* State, City, Zipcode Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-gray-700"
              >
                State
              </Label>
              <Select
                required
                id="state"
                name="state" 
                value={state}
                onValueChange={(value) => {
                    formik.values.state = value
                    setState(value)
                }}
              >
                <SelectTrigger className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20 w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alabama">Alabama</SelectItem>
                  <SelectItem value="Alaska">Alaska</SelectItem>
                  <SelectItem value="Arizona">Arizona</SelectItem>
                  <SelectItem value="Arkansas">Arkansas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Colorado">Colorado</SelectItem>
                  <SelectItem value="Connecticut">Connecticut</SelectItem>
                  <SelectItem value="Delaware">Delaware</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Hawaii">Hawaii</SelectItem>
                  <SelectItem value="Idaho">Idaho</SelectItem>
                  <SelectItem value="Illinois">Illinois</SelectItem>
                  <SelectItem value="Indiana">Indiana</SelectItem>
                  <SelectItem value="Iowa">Iowa</SelectItem>
                  <SelectItem value="Kansas">Kansas</SelectItem>
                  <SelectItem value="Kentucky">Kentucky</SelectItem>
                  <SelectItem value="Louisiana5">Louisiana</SelectItem>
                  <SelectItem value="Maine">Maine</SelectItem>
                  <SelectItem value="Maryland">Maryland</SelectItem>
                  <SelectItem value="Massachusetts">
                    Massachusetts
                  </SelectItem>
                  <SelectItem value="Michigan">Michigan</SelectItem>
                  <SelectItem value="Minnesota">Minnesota</SelectItem>
                  <SelectItem value="Mississipi">Mississippi</SelectItem>
                  <SelectItem value="Missouri">Missouri</SelectItem>
                  <SelectItem value="Montana">Montana</SelectItem>
                  <SelectItem value="Nebraska">Nebraska</SelectItem>
                  <SelectItem value="Nevada">Nevada</SelectItem>
                  <SelectItem value="new Hampshire">
                    New Hampshire
                  </SelectItem>
                  <SelectItem value="New Jersey">New Jersey</SelectItem>
                  <SelectItem value="New Mexico">New Mexico</SelectItem>
                  <SelectItem value="New york">New York</SelectItem>
                  <SelectItem value="North Carolina">
                    North Carolina
                  </SelectItem>
                  <SelectItem value="North Dakota">
                    North Dakota
                  </SelectItem>
                  <SelectItem value="Ohio">Ohio</SelectItem>
                  <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                  <SelectItem value="Oregon">Oregon</SelectItem>
                  <SelectItem value="Pennsylvania">
                    Pennsylvania
                  </SelectItem>
                  <SelectItem value="Rhode Island">
                    Rhode Island
                  </SelectItem>
                  <SelectItem value="South Carolina">
                    South Carolina
                  </SelectItem>
                  <SelectItem value="South Dakota">
                    South Dakota
                  </SelectItem>
                  <SelectItem value="Tennessee">Tennessee</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="Utah">Utah</SelectItem>
                  <SelectItem value="Vermont">Vermont</SelectItem>
                  <SelectItem value="Virginia">Virginia</SelectItem>
                  <SelectItem value="Washington">Washington</SelectItem>
                  <SelectItem value="West Virginia">
                    West Virginia
                  </SelectItem>
                  <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                  <SelectItem value="Wyoming">Wyoming</SelectItem>
                  <SelectItem value="Washington DC">
                    Washington DC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700"
              >
                City
              </Label>
              <Select
                required
                id="city"
                name="city" 
                onValueChange={(value) => {
                  //formik.handleChange(value)
                  formik.values.city = value
                }}
              >
                <SelectTrigger className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20 w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                    {getCity(state)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="zipcode"
                className="text-sm font-medium text-gray-700"
              >
                Zipcode
              </Label>
              <Input
                id='zip'
                name='zip'
                type='text'
                onChange={formik.handleChange}
                className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20"
                placeholder="95630"
                maxLength={5}
                required
              />
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="eventDate"
                className="text-sm font-medium text-gray-700"
              >
                Event Date
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date1 && "text-muted-foreground"
                        )}
                    >
                    <CalendarIcon />
                    {date1 ? format(date1, "PPP") : <span>Event date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date1}
                        //onSelect={setDate1}
                        onSelect={(date) => {
                          setDate1(date)
                          setOpen(false)
                        }}
                        initialFocus
                    />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="startTime"
                className="text-sm font-medium text-gray-700"
              >
                Start Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id='startTime'
                  name='startTime'
                  type='time'
                  onChange={e => {
                      setStartTime(e.target.value)
                  }} 
                  className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endTime"
                className="text-sm font-medium text-gray-700"
              >
                End Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id='endTime'
                  name='endTime'
                  type='time'
                  onChange={e => {
                    setEndTime(e.target.value)
                  }}
                  className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20 pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description/Special Instructions (if any)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500/20 min-h-[120px] resize-none"
              placeholder="Provide details about the event"
            />
          </div>

          {/* Submit Button */}
          {!loading &&
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
            >
              CREATE EVENT
            </Button>
          }
          {
            loading &&
            <LoadingButton loading
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all">
              Submitting Event...
            </LoadingButton>
          }
        </form>
      </div>
    </div>
  );
}
