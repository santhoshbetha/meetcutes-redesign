import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import supabase from "@/lib/supabase";
import { toast } from "sonner";

export function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'signup') {
        setVerifying(true);
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            setError(error.message);
            toast.error('Email verification failed. Please try again.');
          } else if (data) {
            setVerified(true);
            toast.success('Email verified successfully! Welcome to MeetCutes.');
            // Redirect to dashboard after successful verification
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } catch (err) {
          setError('An unexpected error occurred during verification.');
          toast.error('Verification failed. Please try again.');
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        });

        if (error) {
          toast.error('Failed to resend verification email.');
        } else {
          toast.success('Verification email sent! Please check your inbox.');
        }
      }
    } catch (err) {
      toast.error('Unable to resend verification email.');
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-0">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-r from-green-400 via-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-green-500 via-green-500 to-emerald-500 bg-clip-text text-transparent">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your email has been successfully verified. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-r from-red-400 via-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-red-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-center text-base">
              We couldn't verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {error || "The verification link may be expired or invalid. Please try again."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                className="w-full bg-linear-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold"
              >
                Resend Verification Email
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-0">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-orange-400 via-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center text-base">
            We've sent you a verification link to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the verification link in your email to activate your MeetCutes account and start connecting with amazing people.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              className="w-full bg-linear-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold"
            >
              Resend Verification Email
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}