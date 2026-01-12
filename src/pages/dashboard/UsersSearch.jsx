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
      <Card className="bg-transparent mx-4 mt-2 border-none shadow-none hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between md:mx-2 lg:mx-10">
          <CardTitle>Search users around you</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center w-full space-y-4">
          <form
            className="w-full md:w-[84%] lg:w-[72%]"
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

              <div className="grid gap-2 md:mb-2 w-full md:w-1/4">
                <div className="flex items-center">
                  <Label htmlFor="password">Age From</Label>
                </div>
                <Input
                  required
                  id="agefrom"
                  type="number"
                  min={21}
                  max={45}
                  onChange={formik.handleChange}
                  value={formik.values.agefrom}
                />
              </div>

              <div className="grid gap-2 mb-2 w-full md:w-1/4">
                <div className="flex items-center">
                  <Label htmlFor="password">Age To</Label>
                </div>
                <Input
                  required
                  id="ageto"
                  type="number"
                  min={getMin()}
                  max={48}
                  onChange={formik.handleChange}
                  value={formik.values.ageto}
                />
              </div>
              {error == "" ? (
                <Button
                  type="submit"
                  className="w-full md:w-1/4 md:mt-5 bg-teal-600 hover:bg-[#0D9488]/90"
                  variant="secondary"
                >
                  Search
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="w-full md:w-1/4 md:mt-5 bg-teal-600 hover:bg-[#0D9488]/90"
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

          {isObjEmpty(searchUsersData) && (searchdone.current == false) && (!isLoading) && (
            <Card className="mt-3 w-full lg:w-[80%]">
              <div className="grid gap-4 text-xl px-3">
                Searched users info will be shown here.
              </div>
            </Card>
          )}

          {isObjEmpty(searchUsersData) && (searchdone.current == true) && (!isLoading) && (
            <>
            <Card className="mt-3 w-full lg:w-[80%] border border-red-500">
              <CardContent className="">
                <div className='flex '>
                  No users found of your search criteria.
                  <button
                      type="button"
                      className='text-red-700 rounded bg-transparent border-0 ms-auto'
                      onClick={(e) => {
                          setSearchUsersData(null);
                          searchdone.current = false;
                      }}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="14" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                  </button>
                </div>
              </CardContent>
            </Card>
            </>
          )}

          <div>
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
            {!isObjEmpty(searchUsersData) && (
              <UserList
                users={searchUsersData}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
} 