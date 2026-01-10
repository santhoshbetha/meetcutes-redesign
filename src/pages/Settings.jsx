import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/Spinner";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useFormik } from "formik";

export function Settings() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [emailsearch, setEmailsearch] = useState(true);
  const [phonenumbersearch, setPhonenumbersearch] = useState(false);
  const [userhandlesearch, setUserhandlesearch] = useState(false);
  const [onlyhundredmileevisiblity, setOnlyhundredmileevisiblity] =
    useState(true);

  let [value1changed, setValue1changed] = useState(false);
  let [value2changed, setValue2changed] = useState(false);
  let [value3changed, setValue3changed] = useState(false);
  let [value4changed, setValue4changed] = useState(false);
  const [confirmClick, setConfirmClick] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  function handlePopupClose() {
    setConfirmPopup(false);
  }

  const formik = useFormik({
    initialValues: {},

    onSubmit: async (values) => {},
  });

  return (
    <div className="mt-2 flex justify-center">
      <Card className="bg-card dark:bg-background sm: w-[100%] md:w-[80%] lg:w-[67%] xl:w-[60%] dark:border-blue-900/80">
        {confirmPopup && (
          <div className="popup-alert">
            <Alert>
              <AlertTitle>
                Your account will be deleted. Press to confirm.
              </AlertTitle>
              <AlertDescription>
                <div className="flex mt-3 justify-between">
                  <Button
                    variant="outline"
                    className="btn btn-sm"
                    onClick={handlePopupClose}
                    disabled={confirmClick}
                  >
                    <span className="p-0 text-md">X</span>
                  </Button>
                  {!confirmClick ? (
                    <Button
                      data-dismiss="modal"
                      disabled={confirmClick}
                      // onClick={(e) => {
                      //     clickDeleteConfirm(e)
                      //  }}
                    >
                      Confirm
                    </Button>
                  ) : (
                    <LoadingButton className="text-white" loading>
                      Confirming...
                    </LoadingButton>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        <CardHeader className="flex flex-row justify-center">
          <CardTitle className="text-black dark:text-white text-2xl">
            Settings
          </CardTitle>
          <button
            type="button"
            className="text-red-700 rounded bg-transparent border-0 ms-auto"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="14"
              viewBox="0 0 384 512"
              fill=""
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  );
}