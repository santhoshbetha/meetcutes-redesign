import { useState, useEffect } from "react";
import { Container } from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Spinner } from "@/components/ui/Spinner";

export default function Questionaire() {
  const [loading, setLoading] = useState(false);
  //const {user, userSession, profiledata, setProfiledata} = useAuth();
  let [valueschanged, setValueschanged] = useState(false);
  const navigate = useNavigate();
  //const isOnline = useOnlineStatus();
  const [confirmClick, setConfirmClick] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  const [q1value, setQ1Value] = useState(20);
  const [q2value, setQ2Value] = useState(20);
  const [q3value, setQ3Value] = useState(20);
  const [q4value, setQ4Value] = useState(20);
  const [q5value, setQ5Value] = useState(20);
  const [q6value, setQ6Value] = useState(20);
  const [q7value, setQ7Value] = useState(20);
  const [q8value, setQ8Value] = useState(20);
  const [q9value, setQ9Value] = useState(20);
  const [q10value, setQ10Value] = useState(20);
  const [q11value, setQ11Value] = useState(20);
  const [q12value, setQ12Value] = useState(20);
  const [q13value, setQ13Value] = useState(20);
  const [q14value, setQ14Value] = useState(20);
  const [questionairevalues, setquestionairevalues] = useState({});

  const handleChange1 = (val) => {};
  const handleChange2 = (val) => {};
  const handleChange3 = (val) => {};
  const handleChange4 = (val) => {};
  const handleChange5 = (val) => {};
  const handleChange6 = (val) => {};
  const handleChange7 = (val) => {};
  const handleChange8 = (val) => {};
  const handleChange9 = (val) => {};

  const handleChange10 = (val) => {};

  const handleChange11 = (val) => {};

  const handleChange12 = (val) => {};

  const handleChange13 = (val) => {};

  const handleChange14 = (val) => {};

  function handlePopupClose() {
    setConfirmPopup(false);
  }

  const clickQuestionaireSubmissionConfirm = async (e) => {
    e.preventDefault();
    setConfirmClick(true);
  };

  const formik = useFormik({
    initialValues: {},

    onSubmit: async (values) => {},
  });

  return (
    <Container variant="fullMobileBreakpointPadded">
      <Card className="bg-card dark:bg-background pt-3">
        {loading && (
          <Spinner
            className="fixed top-[50%] left-[50%] z-50 cursor-pointer"
            size="large"
          />
        )}
        {confirmPopup && (
          <div className="popup-alert">
            <Alert>
              <AlertTitle>
                This is one time submission. Cannot be reversed. Press to
                confirm.
              </AlertTitle>
              <AlertDescription>
                <div className="flex justify-between mt-3">
                  <Button
                    variant="outline"
                    onClick={handlePopupClose}
                    disabled={confirmClick}
                  >
                    <span className="p-0 text-md">X</span>
                  </Button>
                  {!confirmClick ? (
                    <Button
                      data-dismiss="modal"
                      disabled={confirmClick}
                      onClick={(e) => {
                        clickQuestionaireSubmissionConfirm(e);
                      }}
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
        <div className="flex flex-row items-center me-3">
          <button
            type="button"
            className="text-red-700 rounded bg-transparent border-0 ms-auto"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
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
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">Questionaire</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action=""
            method="post"
            role="form"
            className=""
            onSubmit={formik.handleSubmit}
          >
            {true ? (
              <>
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-2 text-sm">Android</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q1value]}
                      onChange={(e) => handleChange1(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">iPhone</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4 ">
                  <div className="col-span-2 text-sm">Capitalism</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q2value]}
                      onChange={(e) => handleChange2(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Equal Oppurtunities
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Truck</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q3value]}
                      onChange={(e) => handleChange3(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">BMW</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Socialism</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q4value]}
                      onChange={(e) => handleChange4(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Pyramid Scheme
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Modern Family</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q5value]}
                      onChange={(e) => handleChange5(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Traditional Family
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Suit/Formal dress</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q6value]}
                      onChange={(e) => handleChange6(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Jeans and T-shirt
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Partner</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q7value]}
                      onChange={(e) => handleChange7(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Title Wife</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Concerts/Clubs</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q8value]}
                      onChange={(e) => handleChange8(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Movie at home</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">End goal Happiness</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q9value]}
                      onChange={(e) => handleChange9(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    End goal Family/kids
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Credit card</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q10value]}
                      onChange={(e) => handleChange10(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Cash/Debit card
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-2 text-sm">Android</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q1value]}
                      onChange={(e) => handleChange1(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">iPhone</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4 ">
                  <div className="col-span-2 text-sm">Trader Joe's</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q2value]}
                      onChange={(e) => handleChange2(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">ALDI/WINCO</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Tesla</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q3value]}
                      onChange={(e) => handleChange3(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Toyota</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Costco</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q4value]}
                      onChange={(e) => handleChange4(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Whole Foods</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Woman Rights</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q5value]}
                      onChange={(e) => handleChange5(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Transwoman is woman
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Pro-Choice</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q6value]}
                      onChange={(e) => handleChange6(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Pro-Life</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">KOHL'S</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q7value]}
                      onChange={(e) => handleChange7(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">NORDSTROM</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Enchanted (film)</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[q8value]}
                      onChange={(e) => handleChange8(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Barbie (film)</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Power Couple</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange9(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Traditional Relationalship
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Concerts/Clubs</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange10(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Movie at home</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Title Husband</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange11(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Pertner</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">End goal Happiness</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange12(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    End goal Family/kids
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Credit card</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange13(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">
                    Cash/Debit card
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1 mt-4">
                  <div className="col-span-2 text-sm">Dog Mom/Cat Mom</div>
                  <span className="col-span-8">
                    <Slider
                      className="mt-3"
                      defaultValue={[33]}
                      onChange={(e) => handleChange14(e.target.value)}
                      max={100}
                      step={1}
                    />
                  </span>
                  <span className="ms-4 col-span-2 text-sm">Pet Owner</span>
                </div>
              </>
            )}

            <div className="flex flex-row mt-3" hidden={!valueschanged}>
              <Button type="submit" className="ms-auto me-2">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
