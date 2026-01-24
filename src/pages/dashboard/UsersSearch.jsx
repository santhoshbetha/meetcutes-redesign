import { useRef, useState, useEffect, useContext, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Search, RefreshCw, Filter, Users, Heart, MapPin, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInfiniteQuery } from "@tanstack/react-query";

let distanceMap = new Map([
  ["5", 8046],
  ["10", 16093],
  ["25", 40233],
  ["50", 80467],
  ["75", 120699],
  ["100", 160934],
  ["200", 321869],
]);

export function UsersSearch({ userhandle, gender, latitude, longitude, questionairevaluesset, userstate, onetimepaymentrequired}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const {searchUsersData, setSearchUsersData} = useContext(SearchAndUserEventsDataContext);
  const searchdone = useRef(false);

  // Form state for search parameters
  const [searchParams, setSearchParams] = useState(null);

  // Infinite query for search results
  const {
    data,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: ['searchUsers', searchParams],
    queryFn: async ({ pageParam = 0 }) => {
      if (!searchParams) return { success: false, data: [] };
      return await searchUsers(searchParams, pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage?.nextPage !== undefined) {
        return lastPage.nextPage;
      }
      return undefined;
    },
    enabled: !!searchParams && !error,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten the paginated data
  const allUsers = useMemo(() => {
    return data?.pages?.flatMap(page => page.data || []) || [];
  }, [data]);

  // Update context when data changes
  useEffect(() => {
    if (allUsers.length > 0) {
      setSearchUsersData(allUsers);
    }
  }, [allUsers, setSearchUsersData]);

  // Restore search data from context on mount
  useEffect(() => {
    if (searchUsersData && searchUsersData.length > 0 && !searchdone.current) {
      searchdone.current = true;
    }
  }, [searchUsersData]);

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
  }, [userhandle, latitude, questionairevaluesset, userstate, onetimepaymentrequired]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setSearchError(queryError?.message || 'Search failed');
    } else {
      setSearchError(null);
    }
  }, [queryError]);

  const formik = useFormik({
    initialValues: {
      searchdistance: 0,
      agefrom: 21,
      ageto: 21,
    },
    onSubmit: async (values) => {
     console.log("onSubmit call..")
     
     // Validate required fields
     if (!values.searchdistance) {
       setSearchError("Please select distance before searching.");
       return;
     }
     
     // Clear any previous search error
     setSearchError(null);
     
      let searchdata = {
          gender: gender,
          agefrom: values.agefrom < 21 ? 21 : values.agefrom,
          ageto: values.ageto,//values.ageto < values.agefrom ? (values.agefrom < 21 ? 21 : values.agefrom) : values.ageto,
          latitude: latitude,
          longitude: longitude,
          searchdistance: distanceMap.get(values.searchdistance),
      }

      // Set search parameters to trigger the query
      setSearchParams(searchdata);
      searchdone.current = true;
    },
  });

  // Clear search error when form values change
  useEffect(() => {
    setSearchError(null);
  }, [formik.values.searchdistance]);

  // Ethnicity filter state (frontend filter applied after search)
  const [ethnicityFilter, setEthnicityFilter] = useState([]);

  const toggleEthnicityFilter = (eth) => {
    if (eth === 'all') {
      setEthnicityFilter(['all']);
      return;
    }
    setEthnicityFilter((prev) => {
      if (prev.includes('all')) return [eth];
      if (prev.includes(eth)) return prev.filter((p) => p !== eth);
      return [...prev, eth];
    });
  };

  const filteredResults = useMemo(() => {
    // Use context data if available and no new search has been performed
    const dataToFilter = searchUsersData && searchUsersData.length > 0 && !searchParams ? searchUsersData : allUsers;
    if (!dataToFilter || !Array.isArray(dataToFilter)) return [];
    if (ethnicityFilter.length === 0 || ethnicityFilter.includes('all')) return dataToFilter;
    return dataToFilter.filter((u) => {
      const e = (u.ethnicity || u.ethnicity_text || "").toString().toLowerCase();
      return ethnicityFilter.some((sel) => e.includes(String(sel).toLowerCase()));
    });
  }, [allUsers, searchUsersData, searchParams, ethnicityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
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

        {/* Search Error Banner */}
        {searchError && (
          <Card className="border-destructive/50 bg-destructive/5 mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                <p className="text-sm font-medium">{searchError}</p>
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
                <CardTitle className="text-lg">Search Users</CardTitle>
                <p className="text-sm text-muted-foreground">Find people in your area</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Search Form - Always Visible */}
          <div className="md:hidden space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Distance</Label>
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
              <div>
                <Label className="text-sm font-medium">Ethnicity</Label>
                <div className="text-sm text-muted-foreground">Choose filters after searching</div>
              </div>
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

            <Button onClick={() => formik.handleSubmit()} className="w-full" disabled={isQueryLoading || isRefetching || !!error}>
              {isQueryLoading || isRefetching ? (
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

              {/* Ethnicity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ethnicity</Label>
                <div className="text-sm text-muted-foreground">Filter results after search</div>
              </div>
            </div>

            {/* Search Button */}
            <div className="hidden md:block">
              <Button type="submit" className="w-full md:w-auto" disabled={isQueryLoading || isRefetching || !!error}>
                {isQueryLoading || isRefetching ? (
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
        {/* Loading Progress Bar */}
        {(isLoading || isQueryLoading || isFetchingNextPage || isRefetching) && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-medium text-foreground">
                    {isLoading || isQueryLoading ? "Searching for users..." : "Loading more users..."}
                  </span>
                </div>
                <Progress value={undefined} className="w-full max-w-md" />
              </div>
            </CardContent>
          </Card>
        )}

        {searchdone.current && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              {filteredResults && (
                <Badge variant="secondary" className="ml-2 text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  {Array.isArray(filteredResults) ? filteredResults.length : 0} matches found
                </Badge>
              )}
            </div>
            {filteredResults && Array.isArray(filteredResults) && filteredResults.length > 0 && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      {ethnicityFilter.length === 0 || ethnicityFilter.includes('all') ? 'Ethnicity: All' : ethnicityFilter.join(', ')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="p-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="all-filter"
                            checked={ethnicityFilter.includes('all')}
                            onChange={(e) => toggleEthnicityFilter('all')}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="all-filter">All</Label>
                        </div>
                        {[
                          "Asian",
                          "Black / African American",
                          "Hispanic / Latino",
                          "Middle Eastern",
                          "Native American",
                          "Pacific Islander",
                          "White / Caucasian",
                          "East Indian",
                        ].map((ethnicity) => (
                          <div key={ethnicity} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${ethnicity}-filter`}
                              checked={ethnicityFilter.includes(ethnicity)}
                              onChange={() => toggleEthnicityFilter(ethnicity)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`${ethnicity}-filter`}>{ethnicity}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}

        {/* User List */}
        <div className="min-h-100">
          {!isObjEmpty(filteredResults) && (
            <UserList
              users={filteredResults}
              isLoading={isQueryLoading || isRefetching}
            />
          )}
        </div>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              className="w-full md:w-auto"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-4 h-4 mr-2" />
                  Load More Results
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 