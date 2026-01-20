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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, RefreshCw, Filter, Users, Heart, MapPin, SlidersHorizontal } from "lucide-react";
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
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Find Connections
            </h1>
            <p className="text-muted-foreground">
              Discover amazing people and build meaningful relationships
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
      <Card className="mb-6 shadow-lg bg-card/50 dark:bg-card/40 backdrop-blur-sm border-2 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Search Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">Find people who match your interests</p>
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
                  <SheetTitle>Search Preferences</SheetTitle>
                  <SheetDescription>
                    Customize your search to find the perfect matches
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Age From</Label>
                        <Input
                          type="number"
                          min="21"
                          max="99"
                          value={formik.values.agefrom}
                          onChange={(e) => {
                            formik.setFieldValue('agefrom', parseInt(e.target.value) || 21);
                          }}
                          placeholder="21"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Age To</Label>
                        <Input
                          type="number"
                          min="21"
                          max="99"
                          value={formik.values.ageto}
                          onChange={(e) => {
                            formik.setFieldValue('ageto', parseInt(e.target.value) || 21);
                          }}
                          placeholder="99"
                        />
                      </div>
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
                          Find Matches
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

              {/* Age From */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age From</Label>
                <Input
                  type="number"
                  min="21"
                  max="99"
                  value={formik.values.agefrom}
                  onChange={(e) => {
                    formik.setFieldValue('agefrom', parseInt(e.target.value) || 21);
                  }}
                  placeholder="21"
                  className="h-10"
                />
              </div>

              {/* Age To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age To</Label>
                <Input
                  type="number"
                  min="21"
                  max="99"
                  value={formik.values.ageto}
                  onChange={(e) => {
                    formik.setFieldValue('ageto', parseInt(e.target.value) || 21);
                  }}
                  placeholder="99"
                  className="h-10"
                />
              </div>

              {/* Search Button */}
              <div className="space-y-2">
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
                      Find Matches
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
                    Find Matches
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {searchdone.current && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              {searchUsersData && (
                <Badge variant="secondary" className="ml-2 text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  {Array.isArray(searchUsersData) ? searchUsersData.length : 0} matches found
                </Badge>
              )}
            </div>
            {searchUsersData && Array.isArray(searchUsersData) && searchUsersData.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </div>
            )}
          </div>
        )}

        {/* User List */}
        <div className="min-h-[400px]">
          {!isObjEmpty(searchUsersData) && (
            <UserList
              users={searchUsersData}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
} 