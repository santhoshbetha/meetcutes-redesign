import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/Spinner"
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import { ScrollArea } from "@/components/ui/scroll-area";
import usePasswordToggle from "@/hooks/usePasswordToggle";
import { checkIfUserExists } from "../../services/register.service";
import { successAlert, errorAlert } from "@/services/alert.service";
import { coords } from "@/lib/defaultcoords";
import { cities } from "@/lib/cities"
import supabase from "@/lib/supabase";

function isEmpty(val) {
  return val === undefined || val == null || val.length <= 0 ? true : false;
}

function calcAge(dateString) {
  var birthday = +new Date(dateString);
  return ~~((Date.now() - birthday) / 31557600000);
}

const getCity = (stateIn) => {
  if (!isEmpty(stateIn)) {
    return cities[stateIn]?.map((city, idx) => {
      return (
        <SelectItem key={idx} value={city}>
          {city}
        </SelectItem>
      );
    });
  }
};

export function Signup({ setOpenSignup, setOpenLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("");
  const [PasswordInputType, ToggleIcon] = usePasswordToggle();
  const [dobDate, setDobDate] = useState(new Date("2002-01-01"));

  const forgotPassword = (e) => {
    setOpenSignup(false);
  };

  function handleAlready() {
    setOpenSignup(false);
    setOpenLogin(true);
  }

  const doRegister = async (values, actions) => {
    const res = await checkIfUserExists({
        email: formik.values.email.trim().toLowerCase(),
        phonenumber: formik.values.phonenumber.trim()
    })
    let userExists = false;
    if (res.success) {
        if (res.userExists) {
            userExists = true;
            errorAlert('Signup Error', "User with given email or phone number exists!.");
        }
    }

    if (!userExists) {
        const dateofbirth = dobDate == '' ? (new Date('2002-01-01')).toISOString()
                                          : (new Date(`${dobDate}`)).toISOString();
        const dateofcreation = (new Date()).toISOString();                                 
        const age = calcAge(dateofbirth.toString());
        const dataIn = {
            firstname: formik.values.firstname.trim(),
            lastname: formik.values.lastname.trim(),
            dateofbirth: dateofbirth,
            age: age,
            gender: formik.values.gender,
            email: formik.values.email.trim().toLowerCase(),
            phonenumber: formik.values.phonenumber.trim(),
            city: formik.values.city,
            state: formik.values.state,
            latitude: coords[formik.values.state.trim()][formik.values.city.trim()].lat,
            longitude: coords[formik.values.state.trim()][formik.values.city.trim()].lng,
            dateoflocation: dateofcreation,
            dateofcoordinates: dateofcreation

        }
        try {
            setLoading(true);
            const {data, error} = await supabase.auth.signUp({
                email: formik.values.email.trim(),
                password: formik.values.password.trim(),
                options: {
                    data: dataIn,
                    emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/login`
                }
            });

            if (error) {
                alert("Signup Error")
                errorAlert('Signup Error:', `${String(error).substring(14)}`);
            }

            if (!error) {
                if (data?.user?.id) {
                    navigate('/')
                    const { error } = await supabase.auth.signOut();
                    successAlert('', `Signup Successful!`);
                    successAlert('', `Verify email to confirm signup.`);
                } 
            }

            setOpenSignup(false);  //this closes "register" popup window
            setLoading(false)
        } catch (error) {
            errorAlert('Error registering', "Please try again. If the error persists, contact support.");
            setLoading(false)
            throw error;
        } finally {
            actions.setSubmitting(false)
            setLoading(false)
        }
    }
  }

  const onSubmit = async (values, actions) => {
    doRegister (values, actions);
  };

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      gender: "",
      dob: "",
      state: "",
      city: "",
      phonenumber: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string()
        .min(3, "Too Short! (min 3 characters)")
        .max(20, "Too Long! (max 20 characters)")
        .required("Required"),
      lastname: Yup.string()
        .min(3, "Too Short! (min 3 characters)")
        .max(40, "Too Long! (max 40 characters)")
        .required("Required"),
      phonenumber: Yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .length(10)
        .required("required"),
      email: Yup.string().email().required("Required"),
      password: Yup.string()
        .min(8, "Too Short! (min 8 characters)")
        .required("Required"),
    }),

    onSubmit,
  });

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-[725px] pb-0">
      {loading && (
        <Spinner
          className="fixed top-[50%] left-[50%] z-50 cursor-pointer"
          size="medium"
        />
      )}
      <DialogTitle></DialogTitle>
      <ScrollArea className="h-[80vh] w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Signup</CardTitle>
          <CardDescription className="text-xl">
            Fill up below to signup
          </CardDescription>
        </CardHeader>
        <CardContent className="w-[95%] mt-4">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="grid gap-2 w-full md:w-80">
                  <Label htmlFor="firstname">First name</Label>
                  <Input
                    name="firstname"
                    id="firstname"
                    type="text"
                    placeholder=""
                    required
                    value={formik.values.firstname}
                    onChange={(e) => {
                      formik.handleChange(e);
                      //formik.values.firstname = e.target.value
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.firstname && formik.errors.firstname ? (
                    <p className="text-red-700">{formik.errors.firstname} </p>
                  ) : null}
                </div>
                <div className="grid gap-2 w-full md:w-80">
                  <Label htmlFor="lastname">Last name</Label>
                  <Input
                    name="lastname"
                    id="lastname"
                    type="text"
                    placeholder=""
                    required
                    value={formik.values.lastname}
                    onChange={(e) => {
                      formik.handleChange(e);
                      //formik.values.lastname = e.target.value
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.lastname && formik.errors.lastname ? (
                    <p className="text-red-700">{formik.errors.lastname} </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    required
                    onValueChange={(value) => {
                      formik.values.gender = value;
                    }}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 w-full md:w-80">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    type="date"
                    id="dob"
                    name="dob"
                    max="2004-01-01"
                    min="1973-01-01"
                    onChange={(e) => {
                      setDobDate(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    required
                    name="state"
                    onValueChange={(value) => {
                      //formik.handleChange(value)
                      formik.values.state = value;
                      setState(value);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Alabama">Alabama</SelectItem>
                        <SelectItem value="Alaska">Alaska</SelectItem>
                        <SelectItem value="Arizona">Arizona</SelectItem>
                        <SelectItem value="Arkansas">Arkansas</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Colorado">Colorado</SelectItem>
                        <SelectItem value="Connecticut">Connecticut</SelectItem>
                        <SelectItem value="Delaware">Delaware</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Hawaii">Hawaii</SelectItem>
                        <SelectItem value="Idaho">Idaho</SelectItem>
                        <SelectItem value="Illinois">Illinois</SelectItem>
                        <SelectItem value="Indiana">Indiana</SelectItem>
                        <SelectItem value="Iowa">Iowa</SelectItem>
                        <SelectItem value="Kansas">Kansas</SelectItem>
                        <SelectItem value="Kentucky">Kentucky</SelectItem>
                        <SelectItem value="Louisiana5">Louisiana</SelectItem>
                        <SelectItem value="Maine">Maine</SelectItem>
                        <SelectItem value="Maryland">Maryland</SelectItem>
                        <SelectItem value="Massachusetts">
                          Massachusetts
                        </SelectItem>
                        <SelectItem value="Michigan">Michigan</SelectItem>
                        <SelectItem value="Minnesota">Minnesota</SelectItem>
                        <SelectItem value="Mississipi">Mississippi</SelectItem>
                        <SelectItem value="Missouri">Missouri</SelectItem>
                        <SelectItem value="Montana">Montana</SelectItem>
                        <SelectItem value="Nebraska">Nebraska</SelectItem>
                        <SelectItem value="Nevada">Nevada</SelectItem>
                        <SelectItem value="new Hampshire">
                          New Hampshire
                        </SelectItem>
                        <SelectItem value="New Jersey">New Jersey</SelectItem>
                        <SelectItem value="New Mexico">New Mexico</SelectItem>
                        <SelectItem value="New york">New York</SelectItem>
                        <SelectItem value="North Carolina">
                          North Carolina
                        </SelectItem>
                        <SelectItem value="North Dakota">
                          North Dakota
                        </SelectItem>
                        <SelectItem value="Ohio">Ohio</SelectItem>
                        <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                        <SelectItem value="Oregon">Oregon</SelectItem>
                        <SelectItem value="Pennsylvania">
                          Pennsylvania
                        </SelectItem>
                        <SelectItem value="Rhode Island">
                          Rhode Island
                        </SelectItem>
                        <SelectItem value="South Carolina">
                          South Carolina
                        </SelectItem>
                        <SelectItem value="South Dakota">
                          South Dakota
                        </SelectItem>
                        <SelectItem value="Tennessee">Tennessee</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Utah">Utah</SelectItem>
                        <SelectItem value="Vermont">Vermont</SelectItem>
                        <SelectItem value="Virginia">Virginia</SelectItem>
                        <SelectItem value="Washington">Washington</SelectItem>
                        <SelectItem value="West Virginia">
                          West Virginia
                        </SelectItem>
                        <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                        <SelectItem value="Wyoming">Wyoming</SelectItem>
                        <SelectItem value="Washington DC">
                          Washington DC
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    required
                    name="city"
                    onValueChange={(value) => {
                      //formik.handleChange(value)
                      formik.values.city = value;
                    }}
                  >
                    <SelectTrigger className="w-full mr-52">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>{getCity(state)}</SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phonenumber">Phone number</Label>
                <Input
                  id="phonenumber"
                  name="phonenumber"
                  type="text"
                  placeholder=""
                  required
                  value={formik.values.phonenumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phonenumber && formik.errors.phonenumber ? (
                  <p className="text-red-700">{formik.errors.phonenumber} </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email adderss</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  name="email"
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-red-700">{formik.errors.email} </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgotpassword"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    onClick={forgotPassword}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    required
                    className="pr-9"
                    type={PasswordInputType}
                    value={formik.values.password}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                  />
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500
                                              hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-background"
                  >
                    {ToggleIcon}
                  </span>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-red-700">{formik.errors.password} </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full">
                Signup
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already a user?{" "}
              <span
                className="underline underline-offset-4"
                onClick={handleAlready}
              >
                Login
              </span>
            </div>
          </form>
        </CardContent>
      </ScrollArea>
    </DialogContent>
  );
}
