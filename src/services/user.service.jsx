 
import supabase from "@/lib/supabase";

export const getProfileData = async userid => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*", { signal: controller.signal })
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
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getUserProfile = async (userid) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "userid, userhandle, \
         firstname, age, gender, \
         city, state, \
         ethnicity, \
         phonenumber, email, bio, images,\
         facebook, instagram, linkedin, \
         questionairevalues, \
         questionairevaluesset, \
         timeoflogin, \
         userstate, \
         idverified, \
         termsaccepted"
       , { signal: controller.signal })
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
  } finally {
    clearTimeout(timeoutId);
  }
};

export const updateUserInfo = async (userid, data) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { error } = await supabase
      .from("users")
      .update(data, { signal: controller.signal })
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
  } finally {
    clearTimeout(timeoutId);
  }
};

export const checkIfHandleTaken = async (handle) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.rpc("check_if_handle_taken", {
      handle: handle,
    }, { signal: controller.signal });

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
  } finally {
    clearTimeout(timeoutId);
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Update userstate to "delete" instead of actually deleting
    const { error: userError } = await supabase
      .from("users")
      .update({ userstate: "delete" }, { signal: controller.signal })
      .eq("userid", userId);

    if (userError) {
      return {
        success: false,
        msg: userError.message
      };
    }

    return {
      success: true,
      msg: "Account deleted successfully"
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
