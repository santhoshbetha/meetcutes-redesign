import { toast } from "react-toastify";

export const alertService = {
  successAlert,
  errorAlert,
  infoAlert,
  warn,
};

export const alertType = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

// convenience methods

export function errorAlert(title, message) {
  //alert({ type: alertType.error, message, title });
  toast.error(message, {
    position: "top-right",
  });
}

export function successAlert(title, message) {
  //alert({ type: alertType.success, message, title });
  toast.success(message, {
    position: "top-right",
  });
}

export function infoAlert(title, message) {
  //alert({ type: alertType.info, message, title });
  toast.info(message, {
    position: "top-right",
  });
}

export function warn(title, message) {
  //alert({ ...options, type: alertType.warning, message, title });
  toast.warning(message, {
    position: "top-right",
  });
}

// core alert method (not used)
