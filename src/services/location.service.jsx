import supabase from "@/lib/supabase";

export const getAutoCompleteData = async (dataIn) => {
  try {
    const { data, error } = await supabase.rpc("get_autocomplete_data", {
      lat: dataIn.lat,
      long: dataIn.lng,
      distance: dataIn.distance,
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
  } catch (error) {
    return {
      success: false,
      msg: error,
    };
  }
};
