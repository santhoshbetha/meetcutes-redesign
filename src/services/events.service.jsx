/* eslint-disable no-unused-vars */
import supabase from "@/lib/supabase";
import ShortUniqueId from "short-unique-id";
import { isObjEmpty, handleAuthError } from "@/utils/util";

export const createEvent = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let locationid = dataIn?.locationid;
  let latitude, longitude;
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("locationid, latitude, longitude", { signal: controller.signal })
      .eq("address1", dataIn?.address1)
      .eq("state", dataIn?.state)
      .eq("city", dataIn?.city)
      .eq("zipcode", dataIn?.zipcode);

    //
    // if location not found, insert new
    //
    if (data && !error) {
      if (data?.length == 0) {
        const { data: data2, error: error2 } = await supabase
          .from("locations")
          .insert({
            locationname: dataIn?.location,
            address1: dataIn?.address1,
            state: dataIn?.state,
            zipcode: dataIn?.zipcode,
            city: dataIn?.city,
            latitude: dataIn?.eventlat,
            longitude: dataIn?.eventlng,
          }, { signal: controller.signal })
          .select();

        if (data2) {
          if (isObjEmpty(locationid)) {
            locationid = data2[0].locationid;
            latitude = data2[0].latitude;
            longitude = data2[0].longitude;
          }
        }

        if (error2) {
          return {
            success: false,
            msg: error2?.message,
          };
        }
      } else {
        locationid = data[0].locationid;
        latitude = data[0].latitude;
        longitude = data[0].longitude;
      }
    }

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }

    //
    // check conflicts if already existing location
    //
    let conflict1 = false;
    let conflict2 = false;
    let conflict3 = false;
    if (data?.length > 0) {
      const { data: data3, error: error3 } = await supabase
        .from("events")
        .select("locationid", { signal: controller.signal })
        .eq("locationid", locationid)
        .eq("eventdate", dataIn?.eventdate)
        .gte("starttime", dataIn?.start_time)
        .lt("starttime", dataIn?.end_time);

      if (data3?.length > 0) {
        conflict1 = true;
      }

      if (error3) {
        return {
          success: false,
          msg: error3.message,
        };
      }

      if (data3?.length == 0) {
        const { data: data4, error: error4 } = await supabase
          .from("events")
          .select("locationid", { signal: controller.signal })
          .eq("locationid", locationid)
          .eq("eventdate", dataIn?.eventdate)
          .gt("endtime", dataIn?.start_time)
          .lte("endtime", dataIn?.end_time);

        if (data4?.length > 0) {
          conflict2 = true;
        }

        if (error4) {
          return {
            success: false,
            msg: error4.message,
          };
        }

        if (data4?.length == 0) {
          const { data: data5, error: error5 } = await supabase
            .from("events")
            .select("locationid", { signal: controller.signal })
            .eq("locationid", locationid)
            .eq("eventdate", dataIn?.eventdate)
            .lte("starttime", dataIn?.start_time)
            .gte("endtime", dataIn?.end_time);

          if (data5?.length > 0) {
            conflict3 = true;
          }

          if (error5) {
            return {
              success: false,
              msg: error5.message,
            };
          }
        }
      }
    }

    //Create Event Entry
    let creatorid = dataIn?.userid;
    if (conflict1 || conflict2 || conflict3) {
      return {
        success: false,
        msg: "conflict",
      };
    } else {
      const event_uid = new ShortUniqueId({ length: 10 });
      const event_id = event_uid.rnd();
      const { data: data6, error: error6 } = await supabase
        .from("events")
        .insert({
          eventid: event_id,
          creatorid: creatorid,
          locationid: locationid,
          eventdate: dataIn?.eventdate,
          starttime: dataIn?.start_time,
          latitude: latitude,
          longitude: longitude,
          endtime: dataIn?.end_time,
          description: dataIn?.description,
          title: dataIn?.title,
        }, { signal: controller.signal })
        .select();

      if (data6 && !error6) {
        //TODO
        const { data: data7, error: error7 } = await supabase
          .from("events_backup")
          .insert({
            eventid: event_id, //TODO
            creatorid: creatorid,
            locationid: locationid,
            eventdate: dataIn?.eventdate,
            starttime: dataIn?.start_time,
            latitude: latitude,
            longitude: longitude,
            endtime: dataIn?.end_time,
            title: dataIn?.title,
            description: dataIn?.description,
          }, { signal: controller.signal })
          .select();
      }

      if (error6) {
        // Check if this is an authentication error
        if (handleAuthError(error6)) {
          return {
            success: false,
            msg: "Session expired. Please log in again.",
          };
        }
        return {
          success: false,
          msg: error6.message,
        };
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Check if this is an authentication error
    if (handleAuthError(error)) {
      return {
        success: false,
        msg: "Session expired. Please log in again.",
      };
    }
    
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getEventDetails = async (eventid) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let eventdata = {};
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*", { signal: controller.signal })
      .eq("eventid", eventid);

    if (data?.length > 0 && !error) {
      const { data: data2, error: error2 } = await supabase
        .from("locations")
        .select("locationid, locationname, address1, state, city, zipcode", { signal: controller.signal })
        .eq("locationid", data[0].locationid);

      if (data2?.length > 0 && !error2) {
        eventdata = { ...data[0], locationdata: data2[0] };
      }

      return {
        success: true,
        data: eventdata,
      };
    }

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }
    return {
      success: true,
      data: data[0],
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getEventsData = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let eventsdata = new Array();
  try {
    const distance = 241401; // 150 miles
    let data1, error1;
    if (dataIn?.enddate == null) {
      const { data, error } = await supabase.rpc(
        "get_events_by_distance_date",
        {
          lat: dataIn?.lat,
          long: dataIn?.long,
          distance: dataIn?.searchdistance ? dataIn?.searchdistance : distance,
          startdate: dataIn?.startdate,
        },
        { signal: controller.signal }
      );
      data1 = data;
      error1 = error;
    } else {
      const { data, error } = await supabase.rpc(
        "get_events_by_distance_range",
        {
          lat: dataIn?.lat,
          long: dataIn?.long,
          distance: dataIn?.searchdistance ? dataIn?.searchdistance : distance,
          startdate: dataIn?.startdate,
          enddate: dataIn?.enddate,
        },
        { signal: controller.signal }
      );
      data1 = data;
      error1 = error;
    }

    let locationidlist = new Array();
    data1?.forEach((e) => {
      locationidlist.push(e?.locationid);
    });

    if (data1?.length > 0 && !error1) {
      const { data: data2, error: error2 } = await supabase
        .from("locations")
        .select("locationid, locationname, address1, state, city, zipcode", { signal: controller.signal })
        .filter("locationid", "in", `(${locationidlist})`); // `(${data})`

      if (data2?.length > 0 && !error2) {
        data1?.forEach((e) => {
          data2?.forEach((l) => {
            if (l.locationid == e.locationid) {
              let newevent = { ...e, locationdata: l };
              eventsdata.push(newevent);
            }
          });
        });
      }

      return {
        success: true,
        data: eventsdata,
      };
    }

    if (error1) {
      return {
        success: false,
        msg: error1?.message,
      };
    }
    return {
      success: true,
      data: data1,
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getUserEvents1 = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let eventsdata = new Array();
  try {
    const dateminus7 = new Date();
  dateminus7.setDate(dateminus7.getDate() - 7);
  let year = dateminus7.getFullYear();
  let month = dateminus7.getMonth() + 1; //because getMonth() returns '0' based values
  let day = dateminus7.getDate();
  let dateformatted = `${year}-${month}-${day}`;

  const { data, error } = await supabase
    .from("events")
    .delete({ signal: controller.signal })
    .lte("eventdate", dateformatted);

  const { data: data2, error: error2 } = await supabase
    .from("events")
    .select("*", { signal: controller.signal })
    .eq("creatorid", dataIn?.userid);

  let locationidlist = new Array();
  data2?.forEach((e) => {
    locationidlist.push(e?.locationid);
  });

  if (data2?.length > 0 && !error2) {
    const { data: data3, error: error3 } = await supabase
      .from("locations")
      .select("locationid, locationname, address1, state, city, zipcode", { signal: controller.signal })
      .filter("locationid", "in", `(${locationidlist})`); // `(${data})`;

    if (data3?.length > 0 && !error2) {
      data2?.forEach((e) => {
        data3?.forEach((l) => {
          if (l.locationid == e.locationid) {
            let newevent = { ...e, locationdata: l };
            eventsdata.push(newevent);
          }
        });
      });
    }

    return {
      success: true,
      data: eventsdata,
    };
  }

  if (error2) {
    return {
      success: false,
      msg: error2?.message,
    };
  }

  return {
    success: true,
    data: data2,
  };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getUserEvents2 = async (dataIn) => {
  console.log("getUserEvents2 dataIn:", dataIn);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let userEvents = [];
  let eventsdata = new Array();
  try {
    const dateminus7 = new Date();
    dateminus7.setDate(dateminus7.getDate() - 7);
    let year = dateminus7.getFullYear();
    let month = dateminus7.getMonth() + 1; //because getMonth() returns '0' based values
    let day = dateminus7.getDate();
    let dateformatted = `${year}-${month}-${day}`;

    //
    // delete old events
    //
    const { data, error } = await supabase
      .from("events")
      .delete({ signal: controller.signal })
      .lte("eventdate", dateformatted);

    const distance = 241401; // 150 miles
    const { data: data2, error: error2 } = await supabase.rpc(
      "get_events_by_distance",
      {
        lat: dataIn?.lat,
        long: dataIn?.long,
        distance: distance, //150 miles
      },
      { signal: controller.signal }
    );

    if (data2 && !error2) {
      if (data2?.length != 0) {
        data2?.forEach((e) => {
          if (e?.attendeeslist != null) {
            let result = e?.attendeeslist?.filter(
              (attendee) =>
                attendee.toLowerCase() == dataIn?.userhandle.toLowerCase(),
            );
            if (result.length > 0) {
              userEvents.push(e);
            }
          }
        });
      }
    }

    let locationidlist = new Array();
    userEvents?.forEach((e) => {
      locationidlist.push(e?.locationid);
    });

    if (userEvents?.length > 0 && !error2) {
      const { data: data3, error: error3 } = await supabase
        .from("locations")
        .select("locationid, locationname, address1, state, city, zipcode", { signal: controller.signal })
        .filter("locationid", "in", `(${locationidlist})`); // `(${data})`

      if (data3?.length > 0 && !error2) {
        userEvents?.forEach((e) => {
          data3?.forEach((l) => {
            if (l.locationid == e.locationid) {
              let newevent = { ...e, locationdata: l };
              eventsdata.push(newevent);
            }
          });
        });
      }

      return {
        success: true,
        data: eventsdata,
      };
    }

    if (!error2 && userEvents?.length == 0) {
      return {
        success: true,
        data: [],
      };
    }

    if (error2) {
      return {
        success: false,
        msg: error2?.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const registerToAnEvent = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("events")
      .select("attendeesdata, attendeeslist", { signal: controller.signal })
      .eq("eventid", dataIn?.eventId.toString()) //'8sZa5Zjjf1' //8sZa5Zjjf1
      .single();

    console.log("data:", data);
    console.log("error:", error);

    if (data && !error) {
      let data2out = {
        data: null,
        error: null,
      };
      if (
        data?.attendeeslist == null ||
        !data?.attendeeslist.includes(dataIn?.userhandle.toLowerCase())
      ) {
        if (data?.attendeeslist == null) {
           data2out = await supabase
              .from("events")
              .update({ attendeeslist: [dataIn?.userhandle.toLowerCase()] })
              .eq("eventid", dataIn?.eventId.toString())
              .abortSignal(controller.signal); // Chain the signal here

          console.log("data2out data::", data2out);

        } else {
          //   console.log("append to array")
          data2out = await supabase.rpc("append_to_attendeeslist", {
                      userhandle: dataIn?.userhandle.toLowerCase(),
                      eventid: dataIn?.eventId.toString(),
                    }, { signal: controller.signal });
        }

        console.log("data2out data::", data2out.data);
        console.log("data2out error::", data2out.error);

        if (data2out.error) {
          return {
            success: false,
            msg: data2out.error.message,
          };
        }

        if (!data2out.error) {
          const { data: data3, error: error3 } = await supabase.rpc(
            "add_or_update_attendeesdata",
            {
              attendeesdata: JSON.stringify(dataIn?.attendeesdata),
              eventid: dataIn?.eventId
            },
            { signal: controller.signal }
          );

          const { data: data4, error: error4 } = await supabase.rpc(
            "update_eventsbackup",
            {
              //  userhandle: dataIn?.userhandle.toLowerCase(),
              attendeesdata: JSON.stringify(dataIn?.attendeesdata),
              eventid: dataIn?.eventId
            },
            { signal: controller.signal }
          );
        }
      }
    } else {
      console.log("userhandle already exists in attendeeslist");
    }

    if (dataIn?.registeredattendees?.length > 0) {
      let colValues = isObjEmpty(dataIn?.registeredattendees)? [] : [...dataIn?.registeredattendees];
      colValues = [dataIn?.userhandle.toLowerCase(), ...colValues];

      let listnew = ["mikehandle", "danielk"];

      const { data: data5, error: error5 } = await supabase
        .from("users")
        .select("previouseventsattendeeslist, userhandle", { signal: controller.signal })
        //  .filter('userhandle', 'in', `(${listnew})`);  //test works!!
        .filter("userhandle", "in", `(${colValues})`);

      let n;
      if (data5 && !error5) {
        if (data5?.length != 0) {
          data5?.forEach(async (e) => {
            if (isObjEmpty(e?.previouseventsattendeeslist)) {
              n = [dataIn?.userhandle.toLowerCase()];
            } else {
              n = e?.previouseventsattendeeslist;
              n.push(dataIn?.userhandle.toLowerCase());
            }

            const { data: data6, error: error6 } = await supabase
              .from("users")
              .update({ previouseventsattendeeslist: n }, { signal: controller.signal })
              .eq("userhandle", e.userhandle);
          });
        }
      }

      if (error5) {
        return {
          success: false,
          msg: error5?.message,
        };
      }
    }

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }

    return {
      success: true,
      data: {
        eventid: dataIn?.eventId.toString(),
        userhandle: dataIn?.userhandle,
        attendeesdata: dataIn?.attendeesdata,
      },
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const unregisterToAnEvent = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("events")
      .select("attendeeslist", { signal: controller.signal })
      .eq("eventid", dataIn?.eventId.toString())
      .single();

  if (data && !error) {
    if (
      data?.attendeeslist != null ||
      data?.attendeeslist?.includes(dataIn?.userhandle.toLowerCase())
    ) {
      const { data: data2, error: error2 } = await supabase.rpc(
        "remove_from_attendeeslist",
        {
          userhandle: dataIn?.userhandle.toLowerCase(),
          eventid: dataIn?.eventId.toString(),
        },
        { signal: controller.signal }
      );

      if (!error2) {
        const { data: data3, error: error3 } = await supabase.rpc(
          "add_or_update_attendeesdata",
          {
            attendeesdata: JSON.stringify(dataIn?.attendeesdata),
            eventid: dataIn?.eventId.toString(),
          },
          { signal: controller.signal }
        );

        const { data: data4, error: error4 } = await supabase.rpc(
          "update_eventsbackup",
          {
            //   userhandle: dataIn?.userhandle.toLowerCase(),
            attendeesdata: JSON.stringify(dataIn?.attendeesdata),
            eventid: dataIn?.eventId.toString(),
          },
          { signal: controller.signal }
        );
      }
    }
  }

  if (error) {
    return {
      success: false,
      msg: error?.message,
    };
  }

  return {
    success: true,
    data: {
      eventid: dataIn?.eventId.toString(),
      userhandle: dataIn?.userhandle,
      attendeesdata: dataIn?.attendeesdata,
    },
  };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const postEventComment = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("events")
      .update({ comments: JSON.stringify(dataIn?.commentsdata) }, { signal: controller.signal })
      .eq("eventid", dataIn?.eventId.toString());
    const { data: data2, error: error2 } = await supabase
      .from("events_backup")
      .update({ comments: JSON.stringify(dataIn?.commentsdata) }, { signal: controller.signal })
      .eq("eventid", dataIn?.eventId.toString());

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const postUserComment = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ comments: JSON.stringify(dataIn?.commentsdata) }, { signal: controller.signal })
      .eq("eventid", dataIn?.eventId.toString());

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
