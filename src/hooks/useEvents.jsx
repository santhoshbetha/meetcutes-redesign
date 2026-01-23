import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getUserEvents1,
  getUserEvents2,
  getEventsData,
  registerToAnEvent,
  unregisterToAnEvent,
  getEventDetails,
} from "@/services/events.service";
import {
  useQueryClient,
  QueryObserver,
  queryOptions,
} from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { isObjEmpty } from "@/utils/util";
import { getAutoCompleteData } from "../services/location.service";

//export function getMeals(client) {
//  return client.from("meals").select().limit(50);
//}

export const userEvents1QueryKey = () => ["userevents1"];
export const userEvents2QueryKey = () => ["userevents2"];
export const eventsSearchQueryKey = () => ["eventssearch"];
export const notifyEventsQueryKey = () => ["notifyevents"];

export function useUserEvents1(dataIn) {
  return useQuery({
    queryKey: userEvents1QueryKey(),
    queryFn: async () => {
      const response = await getUserEvents1(dataIn);
      return response.data || null;
    },
    //staleTime: 1 * (10 * 1000), // 2 mins
    //cacheTime: 15 * (60 * 1000), // 15 mins ,
    refetchInterval: 3 * (60 * 1000), // 3 min
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useUserEvents2(dataIn) {

  return useQuery({
    queryKey: userEvents2QueryKey(),
    queryFn: async () => {
      const response = await getUserEvents2(dataIn);
      return response.data || null;
    },
    //staleTime: 2 * (60 * 1000), // 2 mins
    //cacheTime: 15 * (60 * 1000), // 15 mins,
    refetchInterval: 3 * (60 * 1000), // 3 min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useNotifyEvents(dataIn) {
  return useQuery({
    queryKey: notifyEventsQueryKey(),
    queryFn: async () => {
      if (!isObjEmpty(dataIn?.lat) && !isObjEmpty(dataIn?.long)) {
        const response = await getEventsData(dataIn);
        return response.data || null;
      }
    },
    //staleTime: 20 * (60 * 1000), // 20 mins
    //cacheTime: 15 * (60 * 1000), // 15 mins
    refetchInterval: 3 * (60 * 1000), // 3 min
    //refetchOnMount: false
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAutoCompleteData(dataIn) {
  return useQuery({
    queryKey: ["autocompletedata"],
    queryFn: async () => {
      const response = await getAutoCompleteData(dataIn);
      return response.data || null;
    },
    staleTime: 4 * (60 * 1000), // 2 mins
    cacheTime: 15 * (60 * 1000), // 15 mins
  });
}

export function useEventsSearch(dataIn) {
  return useQuery({
    queryKey: eventsSearchQueryKey(),
    queryFn: async () => {
      const response = await getEventsData(dataIn);
      return response.data || null;
    },
  });
}

export const useRegisterToAnEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataIn) => {
      return registerToAnEvent(dataIn);
    },
    onSuccess: (registerStatusData) => {
      queryClient.setQueriesData(
        [["userEvents1"], ["userEvents2"], ["eventssearch"], ["notifyevents"]],
        (old) => {
          if (registerStatusData.success == false) {
            return old;
          }

          if (Object.prototype.toString.call(old) == "[object Object]") {
            if (old.eventid == registerStatusData.data.eventid) {
              if (old?.attendeeslist) {
                let attendeeslistObj2;
                if (Array.isArray(old?.attendeeslist) == false) {
                  // if string (from postgres)
                  attendeeslistObj2 = old?.attendeeslist
                    ?.replace(/\{|\}/gm, "")
                    .split(",");
                } else {
                  attendeeslistObj2 = old?.attendeeslist;
                }
                return {
                  ...old,
                  attendeesdata: JSON.stringify(
                    registerStatusData.data.attendeesdata,
                  ),
                  attendeeslist: [
                    ...new Set([
                      ...attendeeslistObj2,
                      registerStatusData.data.userhandle.toLowerCase(),
                    ]),
                  ],
                  //[...new Set(arr)] (to remove duplicates)
                };
              } else {
                return {
                  ...old,
                  attendeesdata: JSON.stringify(
                    registerStatusData.data.attendeesdata,
                  ),
                  attendeeslist: [
                    registerStatusData.data.userhandle.toLowerCase(),
                  ],
                };
              }
            } else {
              return old;
            }
          } else if (Object.prototype.toString.call(old) == "[object Array]") {
            return old.map((eachevent) => {
              if (eachevent?.eventid == registerStatusData.data.eventid) {
                if (eachevent?.attendeeslist) {
                  let attendeeslistObj2;
                  if (Array.isArray(eachevent?.attendeeslist) == false) {
                    // if string (from postgres)
                    attendeeslistObj2 = eachevent?.attendeeslist
                      ?.replace(/\{|\}/gm, "")
                      .split(",");
                  } else {
                    attendeeslistObj2 = eachevent?.attendeeslist;
                  }
                  return {
                    ...eachevent,
                    attendeesdata: JSON.stringify(
                      registerStatusData.data.attendeesdata,
                    ),
                    attendeeslist: [
                      ...new Set([
                        ...attendeeslistObj2,
                        registerStatusData.data.userhandle.toLowerCase(),
                      ]),
                    ],
                    //[...new Set(arr)] (to remove duplicates)
                  };
                } else {
                  return {
                    ...eachevent,
                    attendeesdata: JSON.stringify(
                      registerStatusData.data.attendeesdata,
                    ),
                    attendeeslist: [
                      registerStatusData.data.userhandle.toLowerCase(),
                    ],
                  };
                }
              } else {
                return eachevent;
              }
            });
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey: userEvents1QueryKey,
        type: "inactive",
        refetchType: "none",
      });
    },
    onError: (err, context) => {
      console.error("mutation err::", err);
      queryClient.invalidateQueries({ queryKey: userEvents1QueryKey });
      //toast.error("Failed to upvote post");
      if (context?.prevData) {
        queryClient.setQueriesData(
          { queryKey: userEvents1QueryKey, type: "active" },
          context.prevData,
        );
        queryClient.invalidateQueries({
          queryKey: userEvents1QueryKey,
        });
      }
    },
  });
};

export const useUnregisterToAnEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataIn) => {
      return unregisterToAnEvent(dataIn);
    },
    onSuccess: (unregisterStatusData) => {
      queryClient.setQueriesData(
        [["userEvents1"], ["userEvents2"], ["eventssearch"], ["notifyevents"]],
        (old) => {
          if (old) {
            if (unregisterStatusData.success == false) {
              return old;
            }
            if (Object.prototype.toString.call(old) == "[object Object]") {
              if (old.eventid == unregisterStatusData.data.eventid) {
                let templist = structuredClone(old.attendeeslist);
                let removeindex = templist.indexOf(
                  unregisterStatusData.data.userhandle,
                );
                if (removeindex > -1) {
                  templist?.splice(removeindex, 1);
                }
                return {
                  ...old,
                  attendeesdata: JSON.stringify(
                    unregisterStatusData.data.attendeesdata,
                  ),
                  attendeeslist: isObjEmpty(old.attendeeslist) ? [] : templist,
                };
              } else {
                return old;
              }
            } else if (
              Object.prototype.toString.call(old) == "[object Array]"
            ) {
              return old.map((eachevent) => {
                if (eachevent?.eventid == unregisterStatusData.data.eventid) {
                  let templist = structuredClone(eachevent?.attendeeslist);
                  let removeindex = templist.indexOf(
                    unregisterStatusData.data.userhandle,
                  );
                  if (removeindex > -1) {
                    templist?.splice(removeindex, 1);
                  }
                  return {
                    ...eachevent,
                    attendeesdata: JSON.stringify(
                      unregisterStatusData.data.attendeesdata,
                    ),
                    attendeeslist: isObjEmpty(eachevent?.attendeeslist)
                      ? []
                      : templist,
                  };
                } else {
                  return eachevent;
                }
              });
            }
          }
        },
      );
      queryClient.invalidateQueries({
        queryKey: userEvents1QueryKey,
        type: "inactive",
        refetchType: "none",
      });
    },
    onError: (err, context) => {
      console.error("mutation err::", err);
      queryClient.invalidateQueries({ queryKey: userEvents1QueryKey });
      //toast.error("Failed to upvote post");
      if (context?.prevData) {
        queryClient.setQueriesData(
          { queryKey: userEvents1QueryKey, type: "active" },
          context.prevData,
        );
        queryClient.invalidateQueries({
          queryKey: userEvents1QueryKey,
        });
      }
    },
  });
};

//https://dev.to/franklin030601/managing-state-with-react-query-1842
export const useUserEvents1Observer = (dataIn) => {
  const get_user_events1 = useUserEvents1(dataIn);

  const queryClient = useQueryClient();

  const [userEvents1, setUserEvents1] = useState(() => {
    const data = queryClient.getQueryData(["userevents1"]);
    return data ?? [];
  });

  useEffect(() => {
    const observer = new QueryObserver(queryClient, {
      queryKey: ["userevents1"],
      refetchOnMount: false,
    });

    const unsubscribe = observer.subscribe((result) => {
      if (result.data) {
        setUserEvents1(result.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...get_user_events1,
    data: userEvents1,
  };
};

export const useUserEvents2Observer = (dataIn) => {
  const get_user_events2 = useUserEvents2(dataIn);

  const queryClient = useQueryClient();

  const [userEvents2, setUserEvents2] = useState(() => {
    const data = queryClient.getQueryData(["userevents2"]);
    return data ?? [];
  });

  useEffect(() => {
    const observer = new QueryObserver(queryClient, {
      queryKey: ["userevents2"],
      refetchOnMount: false,
    });

    const unsubscribe = observer.subscribe((result) => {
      if (result.data) {
        setUserEvents2(result.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...get_user_events2,
    data: userEvents2,
  };
};

export const useNotifyEventsObserver = (dataIn) => {
  const get_notify_events2 = useNotifyEvents(dataIn);

  const queryClient = useQueryClient();

  const [notifyEvents, setNotifyEvents] = useState(() => {
    const data = queryClient.getQueryData(["notifyevents"]);
    return data ?? [];
  });

  useEffect(() => {
    const observer = new QueryObserver(queryClient, {
      queryKey: ["notifyevents"],
      //refetchOnMount: false
    });

    const unsubscribe = observer.subscribe((result) => {
      if (result.data) {
        setNotifyEvents(result.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...get_notify_events2,
    data: notifyEvents,
  };
};

export const eventDetailsQueryOptions = (eventid) => {
  return queryOptions({
    queryKey: ["eventdetails", eventid],
    queryFn: async () => {
      const response = await getEventDetails(eventid);
      return response.data || null;
    },
    staleTime: Infinity,
    retry: false,
    throwOnError: true,
  });
};

/*export function useEventsSearch(dataIn) {
    return useInfiniteQuery({
        queryKey: eventsSearchQueryKey(), 
        queryFn: async () => {
            const response = await getEventsData(dataIn);
            return response.data || null;
        },
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });
}*/

//https://dev.to/otamnitram/react-query-a-practical-example-167j

/*const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery('movies', getPopularMovies, {
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });*/

//https://medium.com/@ctrlaltmonique/how-to-implement-infinite-scroll-with-react-query-supabase-pagination-in-next-js-6db8ed4f664c
//https://dev.to/otamnitram/react-query-a-practical-example-167j
//https://tkdodo.eu/blog/mastering-mutations-in-react-query
