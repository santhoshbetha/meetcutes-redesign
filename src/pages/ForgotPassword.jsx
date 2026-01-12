import { useState } from "react";
import { Container } from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import * as Yup from "yup";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required("required"),
    }),
  });

  const handleForgotPassSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <Container
      className="mt-3 flex justify-center"
      variant="fullMobileBreakpointPadded"
    >
      <Card className="bg-card sm: w-full md:w-[60%] lg:w-[45%] xl:w-[35%] border border-accent-foreground/60 pb-3">
        {loading && (
          <Spinner
            className="fixed top-[20vh] left-[50%] z-50 cursor-pointer"
            size="medium"
          />
        )}
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassSubmit}>
            <Label htmlFor="email">Enter your email</Label>
            <Input
              id="text"
              type="email"
              name="email"
              placeholder=""
              value={formik.values.email}
              className="border-amber-100 mt-3"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-700">{formik.errors.email} </p>
            ) : null}

            <div className="flex mt-3">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
              >
                Cancel
              </Button>
              {formik.errors.email && formik.touched.email ? (
                <Button type="submit" className="ms-auto" disabled>
                  Send password reset email
                </Button>
              ) : (
                <Button type="submit" className="ms-auto">
                  Send password reset email
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
