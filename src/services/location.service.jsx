import supabase from "@/lib/supabase";

export const getAutoCompleteData = async (dataIn) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.rpc("get_autocomplete_data", {
      lat: dataIn.lat,
      long: dataIn.lng,
      distance: dataIn.distance,
    }, { signal: controller.signal });

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
    if (error.name === 'AbortError') {
      return {
        success: false,
        msg: 'Request timed out'
      };
    }
    return {
      success: false,
      msg: error,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
