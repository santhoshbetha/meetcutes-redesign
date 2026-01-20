import supabase from "@/lib/supabase";

const digits = (num, count = 0) => {
  if (num) {
    return digits(Math.floor(num / 10), ++count);
  }
  return count;
};

export const searchUsers = async (searchinput) => {
  const gender = searchinput.gender;
  let lat = searchinput.latitude;
  let lng = searchinput.longitude;
  let ageto = searchinput.ageto;
  let agefrom = searchinput.agefrom;

  var cols = {
    gender: gender == "Male" ? "Female" : "Male",
    agefrom: agefrom,
    ageto: ageto,
    lat: lat,
    long: lng,
    searchdistance: searchinput?.searchdistance,
  };

  const { data, error } = await supabase.rpc("search_by_distance", {
    gender: cols.gender,
    agefrom: cols.agefrom,
    ageto: cols.ageto,
    lat: cols.lat,
    long: cols.long,
    searchdistance: cols.searchdistance,
  });

  if (error) {
    return {
      success: false,
      msg: error?.message,
    };
  }

  // Filter out users who have set visibility to 'events-only'
  const filteredData = data?.filter(user => user.visibilityPreference !== 'events-only') || [];

  return {
    success: true,
    data: filteredData,
  };
};

export const searchUser = async (searchtext) => {
  try {
    let dataout = {
      data: null,
      error: null
    };

  var emailregex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (digits(Number(searchtext.trim())) == 10) {
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate,\
                                            latitude, longitude, onlyhundredmileevisiblity, \
                                            defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilityPreference",
        )
        .textSearch("phonenumber", Number(searchtext))
        .eq("phonenumbersearch", true)
        // .eq('phonenumber', Number(searchtext))
        .single();
    } else if (searchtext.match(emailregex)) {
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate,\
                                        latitude, longitude, onlyhundredmileevisiblity, \
                                        defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilityPreference",
        )
        //   .textSearch('userid', searchtext.toLowerCase())
        .eq("emailsearch", true)
        .eq("email", searchtext.toLowerCase())
        .single();
    } else {
      dataout = await supabase
        .from("users")
        .select(
          "userid, userhandle, firstname, age, gender, userstate,\
                                        latitude, longitude, onlyhundredmileevisiblity, \
                                        defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin, visibilityPreference",
        )
        //   .textSearch('userhandle', searchtext)
        .eq("userhandlesearch", true)
        .eq("userhandle", searchtext)
        .single();
    }

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
    return {
      success: false,
      msg: error
    };
  }
};
