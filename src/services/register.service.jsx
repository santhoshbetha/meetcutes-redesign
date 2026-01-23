import supabase from "@/lib/supabase";

export const checkIfUserExists = async (userdata) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.rpc("check_if_user_exists", {
      email: userdata.email,
      phonenumber: userdata.phonenumber
    }, { signal: controller.signal });
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
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out'
      };
    }
    return {
      success: false,
      msg: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getPasswordRetryCount = async (email) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("password_retry_count", { signal: controller.signal })
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
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out'
      };
    }
    return {
      success: false,
      msg: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const updatePasswordRetryCount = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { error } = await supabase
      .from("users")
      .update({ password_retry_count: dataIn.count }, { signal: controller.signal })
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
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out'
      };
    }
    return {
      success: false,
      msg: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
