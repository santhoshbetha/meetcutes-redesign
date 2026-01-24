import { createEvent } from "@/services/events.service";
import { toast } from "sonner";
import secureLocalStorage from "react-secure-storage";

// API base URL (Vite env var fallback). Set VITE_API_URL in your .env if needed.
const url = import.meta?.env?.VITE_API_URL || "";

export function isObjEmpty(val) {
  return (
    val == null ||
    (typeof val === "string" || Array.isArray(val) ? val.length <= 0 : false) ||
    (Object.keys(val || {}).length === 0 && val?.constructor === Object)
  );
}

var deg2rad = function (value) {
  return value * 0.017453292519943295;
};

export function haversine(latIn1, lonIn1, latIn2, lonIn2) {
  // Retuns the great circle distance between two coordinate points in miles
  var dLat = deg2rad(latIn2 - latIn1);
  var dLon = deg2rad(lonIn2 - lonIn1);
  var lat1 = deg2rad(latIn1);
  var lat2 = deg2rad(latIn2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 3960 * c;
}

export const generateID = () => Math.random().toString(36).substring(2, 10);

export const slugToSentence = (slug) => {
  const words = slug.split("-");
  const sentence = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return sentence;
};

const getCoordsAndAddress = async (address1, city, state, zip) => {
  let lat = null;
  let lng = null;
  let addressOut = null;
  let addressIn_array = address1.split(" ");
  //let address1 = null
  await fetch(
    //`https://geocode.maps.co/search?street=${address1}&city=${city}&state=${state}&postalcode=${zip}&country=US`
    `https://geocode.maps.co/search?street=${address1}&city=${city}&state=${state}&postalcode=${zip}&country=US&api_key=65d672d5ba63a875516520xnm3d9f46`,
  )
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let display_name_array = data[i].display_name.split(", ");
        let zipdata = display_name_array[display_name_array.length - 2].slice(
          0,
          5,
        );
        if (zipdata.substring(0, 3) == zip.substring(0, 3)) {
          lat = data[i].lat;
          lng = data[i].lon;
          if (addressIn_array[0] == display_name_array[0]) {
            addressOut = display_name_array[0] + " " + display_name_array[1];
            break;
          } else if (addressIn_array[0] == display_name_array[1]) {
            addressOut = display_name_array[1] + " " + display_name_array[2];
            break;
          }
        }
      }
    });
  return { lat, lng, addressOut };
};

export const postNewEvent = async (
  title,
  location,
  address1,
  state,
  city,
  zip,
  eventlat,
  eventlng,
  date1,
  startTime,
  endTime,
  description,
  userid,
  userlat,
  userlng,
  locationid,
  setLoading,
) => {
  let addressOne;
  let event_lat = eventlat;
  let event_lng = eventlng;
  setLoading(true);

  if (locationid == null || eventlat == null || eventlng == null) {
    const coordsandaddress = await getCoordsAndAddress(
      address1,
      city,
      state,
      zip,
    );
    event_lat = coordsandaddress.lat;
    event_lng = coordsandaddress.lng;
    addressOne = coordsandaddress.addressOut;

    if (event_lat != null && event_lng != null) {
      const distance = haversine(userlat, userlng, event_lat, event_lng);
      if (distance > 150) {
        setLoading(false);
        return -2;
      }
    }

    if (event_lat == null || event_lng == null) {
      setLoading(false);
      toast({
        title: "Address Error",
        description: "Try again or rephrase or recheck city",
        variant: "destructive",
      });
      return;
    } else {
      if (addressOne == null) {
        addressOne = address1;
      }
    }
  } else {
    addressOne = address1;
  }

  const res = await createEvent({
    userid: userid,
    location: location,
    locationid: locationid,
    address1: addressOne,
    state: state,
    city: city,
    zipcode: zip,
    eventlat: eventlat,
    eventlng: eventlng,
    eventdate: date1,
    start_time: startTime,
    end_time: endTime,
    comments: [],
    attendees: [],
    title: title,
    description: description,
  });

  console.log("Create Event Response:", res);

  if (res.success) {
    setLoading(false);
    return 0;
  } else {
    console.error(res.msg);
    setLoading(false);
    if (res.msg == "conflict"){
      return -3;
    }
    return -1;
  }
};

export const postRegisterForEvent = async (
  attendeesdata,
  userhandle,
  eventid,
  registeredattendees,
  navigate,
  setLoading,
) => {
  var response = await fetch(`${url}/register/event`, {
    method: "POST",
    body: JSON.stringify({
      attendeesdata,
      registeredattendees,
      userhandle,
      eventid,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    setLoading(false);
    return -1;
  });

  if (response.status == 200) {
    await response.json();
    setLoading(false);
    return 0;
  } else {
    setLoading(false);
    return -1;
  }
};

export const postUnregisterForEvent = async (
  attendeesdata,
  userhandle,
  eventid,
  setLoading,
) => {
  var response = await fetch(`${url}/unregister/event`, {
    method: "POST",
    body: JSON.stringify({ attendeesdata, userhandle, eventid }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    setLoading(false);
    return -1;
  });

  if (response.status == 200) {
    await response.json();
    setLoading(false);
    return 0;
  } else {
    setLoading(false);
    return -1;
  }
};

export const postEventComment = async (commentsdata, eventid) => {
  var response = await fetch(`${url}/event/comment`, {
    method: "POST",
    body: JSON.stringify({ commentsdata, eventid }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    /*.then((res) => res.json())
		.then((data) => {
			if (data.message) {
				alert(data.message);
			}
		})*/
    .catch((err) => {
      console.error(err);
      //setLoading(false)
      return -1;
    });

  if (response.status == 200) {
    await response.json();
    return 0;
  } else {
    return -1;
  }
};

export const postUserComment = async (commentsdata, userid) => {
  var response = await fetch(`${url}/user/comment`, {
    method: "POST",
    body: JSON.stringify({ commentsdata, userid }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    /*.then((res) => res.json())
		.then((data) => {
			if (data.message) {
				alert(data.message);
			}
		})*/
    .catch((err) => {
      console.error(err);
      //setLoading(false)
      return -1;
    });

  if (response.status == 200) {
    await response.json();
    return 0;
  } else {
    return -1;
  }
};

//fetch my created events
export const fetchMyEvents1 = async (userid, setUserEvents1) => {
  var response = await fetch(`${url}/user/events1`, {
    method: "POST",
    body: JSON.stringify({ userid }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    return -1;
  });

  if (response.status == 200) {
    const _data = await response.json();
    setUserEvents1(_data.events);
    return 0;
  } else {
    return -1;
  }
};

//fetch my registered events
export const fetchMyEvents2 = async (userhandle, setUserEvents2) => {
  var response = await fetch(`${url}/user/events2`, {
    method: "POST",
    body: JSON.stringify({ userhandle }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    return -1;
  });

  if (response.status == 200) {
    const data = await response.json();
    setUserEvents2(data.events);
    return 0;
  } else {
    return -1;
  }
};

export const postUserTags = async (tagsdata, useruserid, userid, taggerid) => {
  //check later
  var response = await fetch(`${url}/user/posttags/${useruserid}`, {
    method: "POST",
    body: JSON.stringify({ tagsdata, userid, taggerid }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    return -1;
  });

  if (response.status == 200) {
    await response.json();
    return 0;
  } else {
    return -1;
  }
};

// Global function to handle authentication errors
export const handleAuthError = (error) => {
  // Check if error is related to authentication/token expiration
  if (error?.message?.includes('JWT') ||
      error?.message?.includes('token') ||
      error?.message?.includes('expired') ||
      error?.message?.includes('unauthorized') ||
      error?.status === 401 ||
      error?.status === 403) {

    console.log("Authentication error detected, logging out user");
    toast({
      title: "Session Expired",
      description: "Authentication error detected, logging out user",
      variant: "destructive",
    });
    
    // Clear all stored data
    localStorage.clear();
    secureLocalStorage.clear();
    // Note: setSearchUsersData(null) should be called from components that have access to SearchAndUserEventsDataContext
    
    // Import supabase here to avoid circular dependencies
    import("@/lib/supabase").then(({ default: supabase }) => {
      supabase.auth.signOut().then(() => {
        // Clear local state and redirect
        window.location.href = '/';
      }).catch(err => {
        console.error("Error during auth error logout:", err);
        // Force redirect even if signOut fails
        window.location.href = '/';
      });
    });
    return true; // Indicates auth error was handled
  }
  return false; // Not an auth error
};