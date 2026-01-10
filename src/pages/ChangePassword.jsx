import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerror, setCustomError] = useState("");

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordconfirm: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().min(6).required("required"),
      passwordconfirm: Yup.string().oneOf(
        [Yup.ref("password"), null],
        "Passwords must match",
      ),
    }),
  });

  const handleChangePassSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
    } catch (error) {
      alert("Something wrong. Try again later");
      setLoading(false);
      setCustomError("Password reset failed, try again");
      navigate("/");
    }
  };

  return (
    <div className="mt-2 flex justify-center">
      <Card className="bg-card dark:bg-background sm: w-[100%] md:w-[60%] lg:w-[45%] xl:w-[35%] dark:border-blue-900/80 pb-4">
        <CardHeader className="pt-4 pb-0">
          <CardTitle className="text-2xl">Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassSubmit} className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="text"
              type="text"
              placeholder=""
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-700">{formik.errors.password} </p>
            ) : null}

            <Label htmlFor="passwordconfirm" className="mt-2">
              New Password (Confirm)
            </Label>
            <Input
              id="text"
              type="password"
              placeholder=""
              name="passwordconfirm"
              value={formik.values.passwordconfirm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.passwordconfirm && formik.errors.passwordconfirm ? (
              <p className="text-red-700">{formik.errors.passwordconfirm} </p>
            ) : null}

            <div className="flex mt-3">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="ms-auto">
                Confirm New Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}