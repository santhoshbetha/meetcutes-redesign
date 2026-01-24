import { Container } from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { checkIfUserExists, getPasswordRetryCount, updatePasswordRetryCount } from "@/services/register.service";
import { updateUserInfo } from "@/services/user.service";
import supabase from "@/lib/supabase";
import { toast } from "sonner";

function isObjEmpty(val) {
  return val == null ||
    val.length <= 0 ||
    (Object.keys(val).length === 0 && val.constructor === Object)
    ? true
    : false;
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const { user, profiledata, userSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const isOnline = useOnlineStatus();

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Countdown finished, navigate to logout
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown, navigate]);

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

    try {
      if (!isOnline) {
        toast.error('You are offline. Check your internet connection.');
        return;
      }

      // If user is logged in, check if email matches their profile
      if (!isObjEmpty(userSession)) {
        if (!isObjEmpty(profiledata)) {
          if (formik.values.email.trim() !== profiledata?.email) {
            toast.error('Email entered does not match your account email. Please try again.');
            return;
          }
        }
      }

      let passwordretrycount = 0;
      let userExists = false;

      // If user is logged in
      if (!isObjEmpty(userSession)) {
        if (!isObjEmpty(profiledata)) {
          userExists = true;
          passwordretrycount = profiledata?.password_retry_count || 0;
        }
      }

      // If user is not logged in, check if user exists
      if (isObjEmpty(userSession)) {
        setLoading(true);
        const res1 = await checkIfUserExists({
          email: formik.values.email.trim(),
          phonenumber: '1111122222', // dummy value
        });

        if (res1.success) {
          if (res1.userExists) {
            userExists = true;
            const res2 = await getPasswordRetryCount(formik.values.email.trim());
            if (res2.success) {
              passwordretrycount = res2.passwordretrycount || 0;
            } else {
              toast.error('Something went wrong. Please try again later.');
              return;
            }
          } else {
            toast.error('No account found with this email address.');
            return;
          }
        } else {
          toast.error('Something went wrong. Please try again later.');
          return;
        }
      }

      if (passwordretrycount > 6) {
        toast.error('Password reset limit exceeded. Please contact support.');
        return;
      }

      // Increment password retry count
      if (!isObjEmpty(userSession)) {
        await updateUserInfo(user?.id, {
          password_retry_count: (profiledata?.password_retry_count || 0) + 1,
        });
      } else {
        await updatePasswordRetryCount({
          email: formik.values.email.trim(),
          count: passwordretrycount + 1,
        });
      }

      if (passwordretrycount <= 5 && userExists) {
        setLoading(true);

        const { data, error } = await supabase.auth.resetPasswordForEmail(formik.values.email.trim(), {
          redirectTo: `${import.meta.env.VITE_SITE_URL}/changepassword`,
        });

        setLoading(false);
        if (data) {
          toast.success('Password reset email sent! Please check your inbox and follow the instructions.', {
            duration: 10000,
          });
          // Start countdown timer for security
          setCountdown(10);
        }
        if (error) {
          toast.error('Failed to send reset email. Please try again later.');
        }
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Container
      className="mt-3 flex justify-center"
      variant="fullMobileBreakpointPadded"
    >
      <Card className="bg-linear-to-br from-card via-card to-card/95 backdrop-blur-sm border-0 shadow-2xl w-full max-w-md relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <CardHeader className="pb-6 px-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-linear-to-r from-orange-400 via-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <p className="text-center text-muted-foreground text-base mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleForgotPassSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                value={formik.values.email}
                className="h-12"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="text-red-700 text-sm">{formik.errors.email}</p>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 h-12 bg-linear-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${
                  (formik.errors.email && formik.touched.email) || countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={(formik.errors.email && formik.touched.email) || countdown > 0}
              >
                {countdown > 0 ? 'Email Sent' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        </CardContent>
        {countdown > 0 && (
          <div className="px-8 pb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
                {isObjEmpty(userSession) 
                  ? `Redirecting to login in ${countdown} seconds for security reasons...` 
                  : `Logging out in ${countdown} seconds for security reasons...`
                }
              </p>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}
