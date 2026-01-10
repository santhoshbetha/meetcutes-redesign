import { useRef, useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserList } from "@/components/UserList";
import { SearchAndUserEventsDataContext } from '@/context/SearchAndUserEventsDataContext'
import { searchUsers } from "../../services/search.service";
import { isObjEmpty } from "../../utils/util";

let distanceMap = new Map([
  ["5", 8046],
  ["10", 16093],
  ["25", 40233],
  ["50", 80467],
  ["75", 120699],
  ["100", 160934],
  ["200", 321869],
]);

export function UsersSearch({ user, userhandle, gender, latitude, longitude, questionairevaluesset, userstate, onetimepaymentrequired}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {searchUsersData, setSearchUsersData} = useContext(SearchAndUserEventsDataContext);
  const searchdone = useRef(false);

  const getMin = () => {
    return formik.values.agefrom;
  };

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
      searchdistance: 0,
      agefrom: 21,
      ageto: 21,
    },
    onSubmit: async (values) => {
      //alert(JSON.stringify(values, null, 2));
      let searchdata = {
          gender: gender,
          agefrom: values.agefrom < 21 ? 21 : values.agefrom,
          ageto: values.ageto,//values.ageto < values.agefrom ? (values.agefrom < 21 ? 21 : values.agefrom) : values.ageto,
          latitude: latitude,
          longitude: longitude,
          searchdistance: distanceMap.get(values.searchdistance)
      }
      setIsLoading(true);

      const res = await searchUsers(searchdata)
      if (res.success) {
          setSearchUsersData(res.data);
          if (res.data?.length == 0) {
            console.log("Search results Zero")
          }
      }
      searchdone.current = true
      setIsLoading(false);
    },
  });

  return (
    <>
      <Card className="bg-transparent mx-4 mt-2 border-non shadow-none hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between md:mx-2 lg:mx-10">
          <CardTitle>Search users around you</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center w-[100%] space-y-4">
          <form
            className="w-[100%] md:w-[84%] lg:w-[72%]"
            onSubmit={formik.handleSubmit}
          >
            <div className="flex flex-col md:flex-row gap-2">
              <Select
                required
                name="searchdistance"
                onValueChange={(value) => {
                  formik.values.searchdistance = value;
                }}
              >
                <SelectTrigger className="w-full md:w-1/4 md:mt-5 h-12 rounded-xl px-4">
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5">5 Miles</SelectItem>
                    <SelectItem value="10">10 Miles</SelectItem>
                    <SelectItem value="25">25 Miles</SelectItem>
                    <SelectItem value="50">50 Miles</SelectItem>
                    <SelectItem value="75">75 Miles</SelectItem>
                    <SelectItem value="100">100 Miles</SelectItem>
                    <SelectItem value="200">200 Miles</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <Input
                required
                name="agefrom"
                type="number"
                placeholder="Age from"
                value={formik.values.agefrom}
                onChange={formik.handleChange}
                className="w-full md:w-1/4 md:mt-5 h-12 rounded-xl px-4"
              />
              <Input
                required
                name="ageto"
                type="number"
                placeholder="Age to"
                value={formik.values.ageto}
                onChange={formik.handleChange}
                className="w-full md:w-1/4 md:mt-5 h-12 rounded-xl px-4"
              />
            </div>
            </form>
          </CardContent>
      </Card>
    </>
  );
} 