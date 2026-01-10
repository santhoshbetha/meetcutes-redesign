/* eslint-disable no-unused-vars */
import supabase from "@/lib/supabase";
const supabaseUrl = "https://yrxymkmmfrkrfccmutvr.supabase.co";

const CDNURL = "https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images/";

//https://github.com/supabase/storage/issues/266

export const getImagesList = async (userid) => {
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .list(`images/${userid}`, {
        limit: 4,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
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
    return {
      success: false,
      msg: error.message,
    };
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
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .list(`images/${userid}/${imagename}`);

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
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const uploadImage = async (userid, file, imageid) => {
  let imagename;
  switch (imageid) {
    case 1:
      imagename = "first";
      break;
    case 2:
      imagename = "second";
      break;
    case 3:
      imagename = "third";
      break;
    case 0:
      imagename = "face.png";
      break;
    default:
      imagename = "other";
      break;
  }
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .upload(`images/${userid}/${imagename}` + "/", file, {
        cacheControl: "3600",
        upsert: true,
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
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const uploadFaceImage = async (userid, file) => {
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .upload(`images/${userid}/face` + "/", file);
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
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteImage = async (userid, imagename) => {
  try {
    const { data, error } = await supabase.storage
      .from("meetfirst")
      .remove(["images/OHHrvhkQmg/second"]);

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
    return {
      success: false,
      msg: error.message,
    };
  }
};
