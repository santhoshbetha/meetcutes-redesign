import supabase from "@/lib/supabase";

export const checkIfUserExists = async (userdata) => {
  try {
    const { data, error } = await supabase.rpc("check_if_user_exists", {
      email: userdata.email,
      phonenumber: userdata.phonenumber
    });
    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    } else {
      return {
        success: true,
        userExists: data //data?.rows[0].exists
      };
    }
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const getPasswordRetryCount = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("password_retry_count")
      .eq("email", email)
      .single();

    if (error) {
      return {
        success: false,
        msg: error?.message
      };
    }
    return {
      success: true,
      passwordretrycount: data.password_retry_count
    };
  } catch (error) {
    return {
      success: false,
      msg: error.message
    };
  }
};

export const updatePasswordRetryCount = async (dataIn) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ password_retry_count: dataIn.count })
      .eq("email", dataIn.email);

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
