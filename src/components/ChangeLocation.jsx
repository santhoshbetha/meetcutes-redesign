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
        <Spinner className="absolute top-[50%] left-[50%] z-50 cursor-pointer size-10" />
      )}
      <DialogTitle>
        {allowlocationchange ? "Select your new Location" : "Location change not allowed"}
        <br />
        <span className="text-sm mt-2">Current:({profiledata?.city}, {profiledata?.state})</span>
      </DialogTitle>
      <DialogDescription></DialogDescription>
    </DialogContent>
  )
}