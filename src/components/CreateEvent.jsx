import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import { MeetCutesSpinner } from "@/components/ui/MeetCutesSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar"
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
import { MapPin, Clock } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

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

// State options for Combobox
const stateOptions = [
  { value: "Alabama", label: "Alabama" },
  { value: "Alaska", label: "Alaska" },
  { value: "Arizona", label: "Arizona" },
  { value: "Arkansas", label: "Arkansas" },
  { value: "California", label: "California" },
  { value: "Colorado", label: "Colorado" },
  { value: "Connecticut", label: "Connecticut" },
  { value: "Delaware", label: "Delaware" },
  { value: "Florida", label: "Florida" },
  { value: "Georgia", label: "Georgia" },
  { value: "Hawaii", label: "Hawaii" },
  { value: "Idaho", label: "Idaho" },
  { value: "Illinois", label: "Illinois" },
  { value: "Indiana", label: "Indiana" },
  { value: "Iowa", label: "Iowa" },
  { value: "Kansas", label: "Kansas" },
  { value: "Kentucky", label: "Kentucky" },
  { value: "Louisiana", label: "Louisiana" },
  { value: "Maine", label: "Maine" },
  { value: "Maryland", label: "Maryland" },
  { value: "Massachusetts", label: "Massachusetts" },
  { value: "Michigan", label: "Michigan" },
  { value: "Minnesota", label: "Minnesota" },
  { value: "Mississippi", label: "Mississippi" },
  { value: "Missouri", label: "Missouri" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "Nevada", label: "Nevada" },
  { value: "New Hampshire", label: "New Hampshire" },
  { value: "New Jersey", label: "New Jersey" },
  { value: "New Mexico", label: "New Mexico" },
  { value: "New York", label: "New York" },
  { value: "North Carolina", label: "North Carolina" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Ohio", label: "Ohio" },
  { value: "Oklahoma", label: "Oklahoma" },
  { value: "Oregon", label: "Oregon" },
  { value: "Pennsylvania", label: "Pennsylvania" },
  { value: "Rhode Island", label: "Rhode Island" },
  { value: "South Carolina", label: "South Carolina" },
  { value: "South Dakota", label: "South Dakota" },
  { value: "Tennessee", label: "Tennessee" },
  { value: "Texas", label: "Texas" },
  { value: "Utah", label: "Utah" },
  { value: "Vermont", label: "Vermont" },
  { value: "Virginia", label: "Virginia" },
  { value: "Washington", label: "Washington" },
  { value: "West Virginia", label: "West Virginia" },
  { value: "Wisconsin", label: "Wisconsin" },
  { value: "Wyoming", label: "Wyoming" },
  { value: "Washington DC", label: "Washington DC" },
];

// Function to get city options for Combobox
const getCityOptions = (stateIn) => {
  if (!isObjEmpty(stateIn) && cities[stateIn]) {
    return cities[stateIn].map((city) => ({
      value: city,
      label: city,
    }));
  }
  return [];
};

export function CreateEvent() {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus();
  const { userSession, profiledata } = useAuth();
  const {autocompletedata} = useContext(AutoCompleteDataContext);
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  let locationid = null;

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
          alert ("Create Event Failed! Far from your area!!")
        }
        if (postresp == 0) {
          alert ("Create Event Succesful")
          navigate('/dashboard')
        } else if (postresp == -1) {
          setLoading(false)
          alert ("Create Event Failed. Try again")
        } else if (postresp == -3) {
          setLoading(false)
          alert ("Timing Conflicts!!")
        }
    }
  });

  console.log("formik.errors.state", formik.errors.state);
  console.log("formik.errors.city", formik.errors.city);

  return (
      <DialogContent className='flex max-h-[min(900px,80vh)] min-w-[calc(70vw-2rem)] flex-col gap-0 p-0 sm:max-w-md bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
        <ScrollArea className='flex max-h-full flex-col overflow-hidden'>
        <div className="relative">
          {loading && (
            <MeetCutesSpinner
              className='absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50'
              size="xlarge"
            />
          )}
          <div className="flex flex-col">
              <DialogTitle></DialogTitle>
              <div
                className="w-full max-w-3xlX overflow-y-auto bg-transparent border-none rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  {/* Header */}
                  <div className="text-center pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-8 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-2xl">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Create New Event 🎉
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto px-4">
                      Share your event with the community and connect with like-minded people
                    </p>
                  </div>

                  {/* Form */}
                  <form
                      className="px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 space-y-4 sm:space-y-6 bg-white dark:bg-gray-900 rounded-b-2xl mt-4"
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
                        className="bg-background border-border focus:border-primary focus:ring-primary/20 h-10"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-sm font-medium text-foreground"
                        >
                          State
                        </Label>
                        <Combobox
                          options={stateOptions}
                          value={formik.values.state}
                          onValueChange={(value) => {
                            formik.setFieldValue('state', value);
                            formik.setFieldValue('city', '');
                            formik.setFieldTouched('state', true);
                            // Don't reset city touched state - let validation show when touched
                          }}
                          placeholder="Select state"
                          searchPlaceholder="Search states..."
                          emptyMessage="No state found."
                          className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
                        />
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
                        <Combobox
                          options={getCityOptions(formik.values.state)}
                          value={formik.values.city}
                          onValueChange={(value) => {
                            formik.setFieldValue('city', value);
                            formik.setFieldTouched('city', true);
                          }}
                          placeholder="Select city"
                          searchPlaceholder="Search cities..."
                          emptyMessage="No city found."
                          disabled={!formik.values.state}
                          className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
                        />
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
                          className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 w-full h-10"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                                      "w-full justify-start text-left font-normal h-10",
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
                            className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 pl-10 w-full h-10"
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
                            className="bg-card dark:bg-slate-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20 pl-10 w-full h-10"
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