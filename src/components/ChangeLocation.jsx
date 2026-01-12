import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isObjEmpty } from "../utils/util";
import { cities } from '@/lib/cities'
import { coords } from '@/lib/defaultcoords'
import { useAuth } from "@/context/AuthContext";
import { useOnlineStatus} from "@/hooks/useOnlineStatus";
import { updateUserInfo } from "@/services/user.service";
import dayjs from 'dayjs'

const delay = ms => new Promise(res => setTimeout(res, ms));

const getCity = (stateIn) => {
  if (!isObjEmpty(stateIn)) {
    return cities[stateIn]?.map((city, idx) => {
      return (
        <SelectItem key={idx} value={city}>
          {city}
        </SelectItem>
      );
    });
  }
};

export function ChangeLocation() {
  const {user, userSession, profiledata, setProfiledata} = useAuth();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("");
  const [city, setCity] = useState("")
  const [opaque, setOpaque] = useState("");
  const isOnline = useOnlineStatus();
  const [allowlocationchange, setAllowlocationchange] = useState(false);
  const datenow = new Date(Date.now());

  useEffect(() => {
    if (!isObjEmpty(profiledata)) {
        if (!isObjEmpty(profiledata?.dateoflocation)) {
            let dif = Math.abs(datenow - new Date(profiledata?.dateoflocation))
            let dayssincelocationchange = Math.floor(dif/(1000 * 3600 * 24))
            if (dayssincelocationchange > 30) { //1 month
                ////console.log("useEffect isOpen allow change true")
                setAllowlocationchange(true)
            } else {
                setAllowlocationchange(false) 
            }
        } else {
          setAllowlocationchange(true)
        }
    }
  }, []);

  const handleLocationSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      if (isOnline) {
          if (userSession) {
              let dateoflocation = (new Date()).toISOString().substring(0, 10).toString();
            //  setOpaque("opacity-35 bg-[#F5F5F5]")
              try {
                  let newlocationdata = { 
                      state: state,
                      city: city,
                      latitude: coords[state][city].lat,
                      longitude: coords[state][city].lng,
                      defaultcoordsset: true,
                      usercoordsset: false, 
                      exactcoordsset: false,
                      dateoflocation: dateoflocation
                  }

                  const res = await updateUserInfo(user?.id, newlocationdata);
                  if (res.success) {
                      setProfiledata({...profiledata,
                          state: state,
                          city: city,
                          latitude: coords[state][city].lat,
                          longitude: coords[state][city].lng,
                          defaultcoordsset: true,
                          usercoordsset: false, 
                          exactcoordsset: false,
                          dateoflocation: dateoflocation
                      });
                  }

                  delay(1000).then(async () => {
                      setLoading(false)
                      //setOpaque("")
                  })
              } catch (_error) {
                  setLoading(false)
                  alert('Something wrong. Try later')
              }
          } else {
              alert ("Error, logout and login again")
          }
      } else {
          alert('You are offline. check your internet connection.')
      }
  }

  return (
    <DialogContent>
        {loading && (
          <Spinner 
            className="absolute top-[50%] left-[50%] cursor-pointer"
            size={50}
            withText={true}
            text="Changing Location..."
          />
        )}
        <DialogTitle>
          {allowlocationchange ? "Select your new Location" : "Location change not allowed"}
          <br />
          <span className="text-sm mt-2">Current:({profiledata?.city}, {profiledata?.state})</span>
        </DialogTitle>
        <DialogDescription></DialogDescription>
        <div>
          {allowlocationchange ?
              <form onSubmit={handleLocationSubmit}>
                <div className="flex flex-col md:flex-row gap-2">
                  <Select
                    required
                    name="state"
                    onValueChange={(value) => {
                        setState(value)
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[48%]">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
                        <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                        <SelectItem value="Michigan">Michigan</SelectItem>
                        <SelectItem value="Minnesota">Minnesota</SelectItem>
                        <SelectItem value="Mississipi">Mississippi</SelectItem>
                        <SelectItem value="Missouri">Missouri</SelectItem>
                        <SelectItem value="Montana">Montana</SelectItem>
                        <SelectItem value="Nebraska">Nebraska</SelectItem>
                        <SelectItem value="Nevada">Nevada</SelectItem>
                        <SelectItem value="new Hampshire">New Hampshire</SelectItem>
                        <SelectItem value="New Jersey">New Jersey</SelectItem>
                        <SelectItem value="New Mexico">New Mexico</SelectItem>
                        <SelectItem value="New york">New York</SelectItem>
                        <SelectItem value="North Carolina">North Carolina</SelectItem>
                        <SelectItem value="North Dakota">North Dakota</SelectItem>
                        <SelectItem value="Ohio">Ohio</SelectItem>
                        <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                        <SelectItem value="Oregon">Oregon</SelectItem>
                        <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                        <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                        <SelectItem value="South Carolina">South Carolina</SelectItem>
                        <SelectItem value="South Dakota">South Dakota</SelectItem>
                        <SelectItem value="Tennessee">Tennessee</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Utah">Utah</SelectItem>
                        <SelectItem value="Vermont">Vermont</SelectItem>
                        <SelectItem value="Virginia">Virginia</SelectItem>
                        <SelectItem value="Washington">Washington</SelectItem>
                        <SelectItem value="West Virginia">West Virginia</SelectItem>
                        <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                        <SelectItem value="Wyoming">Wyoming</SelectItem>
                        <SelectItem value="Washington DC">Washington DC</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                      required
                      name="city"
                      onValueChange={(value) => {
                        setCity(value)
                      }}
                      >
                      <SelectTrigger className="w-full  md:w-[48%]">
                          <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                              {getCity(state)}
                          </SelectGroup>
                      </SelectContent>
                  </Select>
                </div>
                <div className="flex mt-3">
                  <Button className="ms-auto" type="submit">
                      Submit
                  </Button>
                </div>
              </form>
              :
              <>
              <div className='text-red-700 text-lg'>
                  Only one location change is allowed per month.
              </div>
              <div className='text-md'>
                  Your last set date: &nbsp;
                  <span className='text-green-700 font-bold'>
                  {dayjs(profiledata?.dateoflocation).format('MMM D, YYYY')}
                  </span>
              </div>
              </>
            }
        </div>
    </DialogContent>
  );
}