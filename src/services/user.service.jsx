 
import supabase from "@/lib/supabase";

export const getProfileData = async userid => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("userid", userid)
      .single();
    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const getUserProfile = async (userid) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "userid, userhandle, \
         firstname, age, gender, \
         city, state, \
         phonenumber, email, bio, images,\
         facebook, instagram, linkedin, \
         questionairevalues, \
         questionairevaluesset, \
         timeoflogin, \
         userstate, \
         idverified, \
         termsaccepted"
       )
      .eq("userid", userid)
      .single();

    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const updateUserInfo = async (userid, data) => {
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("userid", userid);

    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const checkIfHandleTaken = async (handle) => {
  try {
    const { data, error } = await supabase.rpc("check_if_handle_taken", {
      handle: handle,
    });

    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    } else {
      return {
        success: true,
        handleTaken: data //data?.rows[0].exists
      };
    }
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Something wrong. Try later again");
      return {
        success: false,
        msg: error?.message
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
}

export const deleteUser = async (userId) => {
  try {
    // First delete from users table
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("userid", userId);

    if (userError) {
      return {
        success: false,
        msg: userError.message
      };
    }

    // Then delete from auth (this requires admin privileges or RLS policies)
    // For now, we'll just delete from the users table
    // The auth deletion would need to be handled server-side or with proper permissions

    return {
      success: true,
      msg: "Account deleted successfully"
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};
