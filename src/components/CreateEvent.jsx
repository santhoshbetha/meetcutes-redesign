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
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { AutoComplete } from "@/components/AutoComplete";
import { AutoCompleteDataContext } from "@/context/AutoCompleteDataContext";
import { cn } from "@/lib/utils"
import { LoadingButton } from '@/components/ui/loading-button';
import { DialogTitle, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin } from "lucide-react";

const validationSchema = Yup.object({
  location: Yup.string().required("Location name is required"),
  address1: Yup.string(),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  zip: Yup.string().required("Zipcode is required").matches(/^\d{5}$/, "Must be 5 digits"),
  date: Yup.date().required("Date is required").min(new Date(new Date().setHours(0, 0, 0, 0)), "Date must be today or later"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string().required("End time is required").test("is-after-start", "End time must be after start time", function (value) {
    const { startTime } = this.parent;
    if (!startTime || !value) return true;
    return value > startTime;
  }),
  description: Yup.string()
});

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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  let locationid = null;
  const [eventerrpopup, setEventerrpopup] = useState(false);

  const formik = useFormik({
    initialValues: {
        location: "",
        address1: "",
        state: "",
        city: "",
        zip: "",
        date: undefined,
        startTime: "08:00",
        endTime: "09:00",
        description: ""
    },
    validationSchema,
    
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
          values.location,
          values.address1, //addressOne
          values.state,
          values.city, 
          values.zip, 
          values.date.toISOString().substring(0, 10).toString(),
          values.startTime,
          values.endTime, 
          values.description,
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
      <DialogContent className='flex max-h-[min(900px,80vh)] min-w-[calc(70vw-2rem)] flex-col gap-0 p-0 sm:max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
        <ScrollArea className='flex max-h-full flex-col overflow-hidden'>
        <div className="relative">
            {loading && (
              <Spinner
                className='absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50'
                size="xlarge" 
                text="Creating Event..."
              />
            )}
            <DialogTitle></DialogTitle>
            <div
              className="w-full max-w-3xlX overflow-y-auto bg-transparent border-none rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Header */}
                <div className="text-center pt-6 pb-4 px-8 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-2xl">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Create New Event
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                    Share your event with the community and connect with like-minded people
                  </p>
                </div>

                {/* Form */}
                <form 
                    className="px-8 md:px-12 pb-12 space-y-6 bg-white dark:bg-gray-900 rounded-b-2xl"
                    onSubmit={formik.handleSubmit} 
                >
                  {/* Location Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="locationName"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Location Name
                    </Label>
                    <Input
                      id='location'
                      name='location'
                      type='text'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.location}
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      placeholder="e.g., TARGET, Starbucks, Central Park"
                      required
                    />
                    {formik.errors.location && formik.touched.location && (
                      <p className="text-red-500 text-sm">{formik.errors.location}</p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2" hidden>
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
                        className="text-sm font-medium text-foreground"
                      >
                        State
                      </Label>
                      <Select
                        required
                        id="state"
                        name="state" 
                        value={formik.values.state}
                        onValueChange={(value) => {
                            formik.setFieldValue('state', value);
                            formik.setFieldValue('city', '');
                            formik.setFieldTouched('state', true);
                        }}
                      >
                        <SelectTrigger className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 w-full">
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
                          <SelectItem value="Louisiana">Louisiana</SelectItem>
                          <SelectItem value="Maine">Maine</SelectItem>
                          <SelectItem value="Maryland">Maryland</SelectItem>
                          <SelectItem value="Massachusetts">
                            Massachusetts
                          </SelectItem>
                          <SelectItem value="Michigan">Michigan</SelectItem>
                          <SelectItem value="Minnesota">Minnesota</SelectItem>
                          <SelectItem value="Mississippi">Mississippi</SelectItem>
                          <SelectItem value="Missouri">Missouri</SelectItem>
                          <SelectItem value="Montana">Montana</SelectItem>
                          <SelectItem value="Nebraska">Nebraska</SelectItem>
                          <SelectItem value="Nevada">Nevada</SelectItem>
                          <SelectItem value="New Hampshire">
                            New Hampshire
                          </SelectItem>
                          <SelectItem value="New Jersey">New Jersey</SelectItem>
                          <SelectItem value="New Mexico">New Mexico</SelectItem>
                          <SelectItem value="New York">New York</SelectItem>
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
                      {formik.errors.state && formik.touched.state && (
                        <p className="text-red-500 text-sm">{formik.errors.state}</p>
                      )}
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
                        value={formik.values.city}
                        onValueChange={(value) => {
                          formik.setFieldValue('city', value);
                          formik.setFieldTouched('city', true);
                        }}
                        disabled={!formik.values.state}
                      >
                        <SelectTrigger className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 w-full">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {getCity(formik.values.state)}
                        </SelectContent>
                      </Select>
                      {formik.errors.city && formik.touched.city && (
                        <p className="text-red-500 text-sm">{formik.errors.city}</p>
                      )}
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
                        onBlur={formik.handleBlur}
                        value={formik.values.zip}
                        className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
                        placeholder="95630"
                        maxLength={5}
                        required
                      />
                      {formik.errors.zip && formik.touched.zip && (
                        <p className="text-red-500 text-sm">{formik.errors.zip}</p>
                      )}
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
                                    !formik.values.date && "text-muted-foreground"
                                )}
                            >
                            <CalendarIcon />
                            {formik.values.date ? format(formik.values.date, "PPP") : <span>Event date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formik.values.date}
                                onSelect={(date) => {
                                  formik.setFieldValue('date', date);
                                  formik.setFieldTouched('date', true);
                                  setOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                      </Popover>
                      {formik.errors.date && formik.touched.date && (
                        <p className="text-red-500 text-sm">{formik.errors.date}</p>
                      )}
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
                          onChange={(e) => {
                              formik.setFieldValue('startTime', e.target.value);
                              formik.setFieldTouched('startTime', true);
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.startTime}
                          className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 pl-10"
                          required
                        />
                      </div>
                      {formik.errors.startTime && formik.touched.startTime && (
                        <p className="text-red-500 text-sm">{formik.errors.startTime}</p>
                      )}
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
                          onChange={(e) => {
                            formik.setFieldValue('endTime', e.target.value);
                            formik.setFieldTouched('endTime', true);
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.endTime}
                          className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 pl-10"
                          required
                        />
                      </div>
                      {formik.errors.endTime && formik.touched.endTime && (
                        <p className="text-red-500 text-sm">{formik.errors.endTime}</p>
                      )}
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
                      name="description"
                      value={formik.values.description}
                      onChange={(e) => {
                        formik.setFieldValue('description', e.target.value);
                        formik.setFieldTouched('description', true);
                      }}
                      onBlur={formik.handleBlur}
                      className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 min-h-[120px] resize-none"
                      placeholder="Provide details about the event"
                    />
                    {formik.errors.description && formik.touched.description && (
                      <p className="text-red-500 text-sm">{formik.errors.description}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  {!loading &&
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      CREATE EVENT
                    </Button>
                  }
                  {
                    loading &&
                    <LoadingButton loading
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all">
                      Submitting Event...
                    </LoadingButton>
                  }
                </form>
              </div>
            </div>
        </div>
        </ScrollArea>
    </DialogContent>
  );
}

/*
    <DialogContent className='flex min-w-[calc(70vw-2rem)] justify-center'>
          {loading && (
            <Spinner
              className='absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2'
              size="xlarge" 
              text="Creating Event..."
            />
          )}
                    <DialogTitle></DialogTitle>
                    
            
*/