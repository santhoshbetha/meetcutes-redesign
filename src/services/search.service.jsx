import supabase from "@/lib/supabase";

const digits = (num, count = 0) => {
  if (num) {
    return digits(Math.floor(num / 10), ++count);
  }
  return count;
};

export const searchUsers = async (searchinput, pageParam = 0, limit = 20) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const gender = searchinput.gender;
    let lat = searchinput.latitude;
    let lng = searchinput.longitude;
    let ageto = searchinput.ageto;
    let agefrom = searchinput.agefrom;

    // Client shows 20 items per page, server fetches 100 items every 5 pages
    const clientLimit = 20; // Always 20 items per client page
    const serverLimit = 100; // Server fetches 100 items at a time
    const pagesPerServerFetch = 5; // 5 client pages per server fetch (5 * 20 = 100)

    // Calculate which server page to fetch based on client page
    const serverPage = Math.floor(pageParam / pagesPerServerFetch);

    const requestBody = {
      gender: gender,
      agefrom: agefrom,
      ageto: ageto,
      lat: lat,
      long: lng,
      searchdistance: searchinput?.searchdistance,
      ethnicity: searchinput?.ethnicity,
      page: serverPage,
      limit: serverLimit, // Server fetches 100 items
    };

    const { data, error } = await supabase.functions.invoke('search-users', {
      body: requestBody,
      signal: controller.signal
    });

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }

    // Filter out users who have set visibility to 'events-only'
    let serverData = data?.users?.filter(user => user.visibilityPreference !== 'events-only') || [];

    // Filter by ethnicity if provided
    if (requestBody.ethnicity && requestBody.ethnicity.length > 0 && !requestBody.ethnicity.includes("all")) {
      serverData = serverData.filter(user => requestBody.ethnicity.includes(user.ethnicity));
    }

    // Calculate which 20 items to return for this client page
    const clientPageWithinServerBatch = pageParam % pagesPerServerFetch;
    const startIndex = clientPageWithinServerBatch * clientLimit;
    const endIndex = startIndex + clientLimit;
    const paginatedData = serverData.slice(startIndex, endIndex);

    // Check if there are more pages available
    const hasMore = data?.hasMore || (serverData.length > endIndex);

    return {
      success: true,
      data: paginatedData,
      nextPage: hasMore ? pageParam + 1 : undefined,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out',
      };
    }
    return {
      success: false,
      msg: error?.message || 'An error occurred',
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const searchUser = async (searchtext) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    console.log("Searching for user:", searchtext);
    let dataout = {
      data: null,
      error: null
    };

    var emailregex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (digits(Number(searchtext.trim())) == 10) {
      console.log("Searching by phone number:", searchtext);
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate, \
          latitude, longitude, onlyhundredmileevisiblity, \
          defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilitypreference",
          { signal: controller.signal }
        )
        .textSearch("phonenumber", Number(searchtext))
        .eq("phonenumbersearch", true)
        .single();
    } else if (searchtext.match(emailregex)) {
      console.log("Searching by email:", searchtext);
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate, \
          latitude, longitude, onlyhundredmileevisiblity, \
          defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilitypreference",
          { signal: controller.signal }
        )
        //   .textSearch('userid', searchtext.toLowerCase())
        .eq("emailsearch", true)
        .eq("email", searchtext.toLowerCase())
        .single();
    } else {
      console.log("Searching by user handle:", searchtext);
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate, \
           latitude, longitude, onlyhundredmileevisiblity, \
           defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilitypreference",
          { signal: controller.signal }
        )
        //   .textSearch('userhandle', searchtext)
        .eq("userhandlesearch", true)
        .eq("userhandle", searchtext)
        .single();
    }

    console.log("Search result:", dataout);

    if (dataout.error) {
      return {
        success: false,
        msg: dataout.error?.message
      };
    }

    // Filter out users who have set visibility to 'events-only'
    if (dataout.data && dataout.data.visibilityPreference === 'events-only') {
      return {
        success: false,
        msg: 'User not found or not visible in search'
      };
    }

    return {
      success: true,
      data: dataout.data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out'
      };
    }
    return {
      success: false,
      msg: error?.message || error
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const searchEvents = async (searchinput, pageParam = 0, limit = 20) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    let lat = searchinput.lat;
    let lng = searchinput.long;
    let startdate = searchinput.startdate;
    let enddate = searchinput.enddate;

    // Client shows 20 items per page, server fetches 100 items every 5 pages
    const clientLimit = 20; // Always 20 items per client page
    const serverLimit = 100; // Server fetches 100 items at a time
    const pagesPerServerFetch = 5; // 5 client pages per server fetch (5 * 20 = 100)

    // Calculate which server page to fetch based on client page
    const serverPage = Math.floor(pageParam / pagesPerServerFetch);

    const requestBody = {
      lat: lat,
      long: lng,
      searchdistance: searchinput?.searchdistance,
      startdate: startdate,
      enddate: enddate,
      page: serverPage,
      limit: serverLimit, // Server fetches 100 items
    };

    const { data, error } = await supabase.functions.invoke('search-events', {
      body: requestBody,
      signal: controller.signal
    });

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    }

    // Calculate which 20 items to return for this client page
    const clientPageWithinServerBatch = pageParam % pagesPerServerFetch;
    const startIndex = clientPageWithinServerBatch * clientLimit;
    const endIndex = startIndex + clientLimit;
    const paginatedData = (data?.events || []).slice(startIndex, endIndex);

    // Check if there are more pages available
    const hasMore = data?.hasMore || ((data?.events || []).length > endIndex);

    return {
      success: true,
      data: paginatedData,
      nextPage: hasMore ? pageParam + 1 : undefined,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out',
      };
    }
    return {
      success: false,
      msg: error?.message || 'An error occurred',
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
