import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "./ui/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { HandleChecker } from "./HandleChecker";

export function HandleCard() {
  const navigate = useNavigate();
  const [handletext, setHandletext] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleFocused, setHandleFocused] = useState(false);
  const [valid] = useState(false);
  const [handleValidity] = useState({
    minChar: null,
    maxChar: null,
    firstChar: null,
    specialChar: null,
  });

  const handleHandleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setLoading(false);
    setHandletext("");
  };

  // inline handle change in input to avoid unused param

  return (
    <DialogContent className="w-[90%] sm:max-w-[425px] relative">
      <DialogTitle></DialogTitle>
      {loading && (
        <Spinner
          className="absolute top-[50%] left-[50%] z-50 cursor-pointer"
          size="medium"
        />
      )}
      <CardHeader>
        <CardTitle className="text-2xl">Create Handle</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="" onSubmit={handleHandleSubmit}>
          <Label>Enter a unique handle name for your account</Label>
          <Input
            type="text"
            className="form-control mt-2"
            name="handletext"
            placeholder=""
            onFocus={() => setHandleFocused(true)}
            value={handletext}
            onChange={(e) => {
              setHandletext(e.target.value.trim());
            }}
            autoFocus
          />
          <div className="flex mt-3">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setLoading(false);
                navigate(-1);
              }}
            >
              Cancel
            </Button>
            <Button
              className="ms-auto bg-green-700"
              type="submit"
              //disabled
              disabled={!valid}
            >
              Submit
            </Button>
          </div>
        </form>
        {handleFocused && !valid && <HandleChecker validity={handleValidity} />}
      </CardContent>
    </DialogContent>
  );
}
