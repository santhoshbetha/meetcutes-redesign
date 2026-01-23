/* eslint-disable no-unused-vars */
import supabase from "@/lib/supabase";
const supabaseUrl = "https://yrxymkmmfrkrfccmutvr.supabase.co";

const CDNURL = "https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images/";

//https://github.com/supabase/storage/issues/266

export const getImagesList = async (userid) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .list(`images/${userid}`, {
        limit: 4,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
        signal: controller.signal,
      });

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    } else {
      return {
        success: true,
        data: data, //data?.rows[0].exists
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
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/meetfirst/images/${filePath}`,
    }; //supabase filePath
  }
  return null;
};

export const getImage = async (userid, imagename) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .list(`images/${userid}/${imagename}`, { signal: controller.signal });

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    } else {
      return {
        success: true,
        data: getSupabaseFileUrl(`${userid}/${imagename}`),
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
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const uploadImage = async (userid, file, imageid) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let imagename;
  switch (imageid) {
    case 0:
      imagename = 'face.png';
      break;
    case 1:
      imagename = 'first';
      break;
    case 2:
      imagename = 'second';
      break;
    case 3:
      imagename = 'third';
      break;
    case 4:
      imagename = 'fourth';
      break;
    case 5:
      imagename = 'fifth';
      break;
    case 6:
      imagename = 'sixth';
      break;
    case 7:
      imagename = 'seventh';
      break;
    case 8:
      imagename = 'eighth';
      break;
    case 9:
      imagename = 'ninth';
      break;
    case 10:
      imagename = 'tenth';
      break;
    default:
      imagename = 'other';
      break;
  }
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .upload(`images/${userid}/${imagename}` + "/", file, {
        cacheControl: "3600",
        upsert: true,
        signal: controller.signal,
      });
    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    } else {
      return {
        success: true,
        data: data,
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
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const uploadFaceImage = async (userid, file) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .upload(`images/${userid}/face` + "/", file, { signal: controller.signal });
    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    } else {
      return {
        success: true,
        data: data,
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
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const deleteImage = async (userid, imageid) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let imagename;
  switch (imageid) {
    case 0:
      imagename = 'face.png';
      break;
    case 1:
      imagename = 'first';
      break;
    case 2:
      imagename = 'second';
      break;
    case 3:
      imagename = 'third';
      break;
    case 4:
      imagename = 'fourth';
      break;
    case 5:
      imagename = 'fifth';
      break;
    case 6:
      imagename = 'sixth';
      break;
    case 7:
      imagename = 'seventh';
      break;
    case 8:
      imagename = 'eighth';
      break;
    case 9:
      imagename = 'ninth';
      break;
    case 10:
      imagename = 'tenth';
      break;
    default:
      imagename = 'other';
      break;
  }

  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .remove([`images/${userid}/${imagename}`], { signal: controller.signal });

    if (error) {
      return {
        success: false,
        msg: error?.message,
      };
    } else {
      return {
        success: true,
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
      msg: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
