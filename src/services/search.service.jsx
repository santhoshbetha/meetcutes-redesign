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
  return {
    success: true,
    data: data,
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
                                            defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin",
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
                                        defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin",
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
                                        defaultcoordsset, usercoordsset, exactcoordsset, timeoflogin",
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
