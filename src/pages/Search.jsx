import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { isObjEmpty } from "../utils/util";
import { useAuth } from "../context/AuthContext";
import { searchUser } from "../services/search.service";

export function Search() {
  const navigate = useNavigate();
  const { profiledata } = useAuth();
  const [searchtext, setSearchtext] = useState("");
  const [userdata, setUserdata] = useState({});
  const [usercoordsset, setUsercoordsset] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchdone = useRef(false);

  useEffect(() => {
      if (!isObjEmpty(userdata)) {
        setUsercoordsset(userdata?.defaultcoordsset || userdata?.usercoordsset || userdata?.exactcoordsset)
      }
  }, [userdata]);

    const handleSearchSubmit = async (e) => {
        e.preventDefault()
        
        var phoneregex = /^\d{10}$/;
        var emailregex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        var useridregex = /^\d{5,7}$/;

        //https://www.makeuseof.com/regular-expressions-validate-user-account/
        //he number of characters must be between 5 and 15
        //The string should only contain alphanumeric characters and/or underscores (_). 
        //The first character of the string should be alphabetic. 
        var userhandleregex = /^[A-Za-z][A-Za-z0-9_]{4,14}$/;

        if (searchtext.match(emailregex) || searchtext.match(phoneregex) || searchtext.match(userhandleregex)) 
        {
          setLoading(true)
          const res = await searchUser(searchtext);
          if (res.success) {
            setUserdata(res.data)
          } else {
            setUserdata({})
          }
        } else {
          alert("invalid email or phonenumber or handle");
        }
        setSearchtext("");
        searchdone.current = true;
        setLoading(false) //false
    }

  return (
    <>
      <div className="mt-3 flex flex-col items-center justify-center gap-2 px-6 sm:px-20 md:px-14">
        <Card className="bg-card dark:bg-background w-full sm:w-[80%] md:w-[60%] lg:w-[50%] xl:w-[40%] dark:border-blue-900/60 py-3">
          <CardHeader className="pt-4 pb-0">
            <CardTitle className="text-xl">Search User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit}>
              <Label htmlFor="email">Email or Phonenumber or Handle</Label>
              <Input
                className="mt-2"
                id="searchtext"
                type="text"
                placeholder="m@example.com"
                required
                 value={searchtext}
                 onChange={(e) => setSearchtext(e.target.value)}
              />
              <div className="flex mt-3">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(-1)
                  }}
                >
                  Cancel
                </Button>
                {profiledata?.userstate == 'active' ?
                  <Button
                      type='submit'
                      className="ms-auto bg-teal-600 hover:bg-[#0D9488]/90"
                  >
                      Search
                  </Button>
                  :
                  <Button
                    type="submit"
                    className="ms-auto bg-teal-600 hover:bg-[#0D9488]/90"
                    disabled={true}
                  >
                    Search
                  </Button>
                }
              </div>
            </form>
          </CardContent>
        </Card>
        <br/>
        {isObjEmpty(userdata) && searchdone.current && (
          <div className="border-4 border-yellow-500 rounded-lg bg-yellow-200 dark:bg-background p-3">
            <div className="flex flex-row items-center">
              No user found
              <Button
                type="button"
                className="text-danger rounded bg-transparent border-0 ms-auto mb-1"
                variant="secondary"
                onClick={e => {
                  searchdone.current = false;
                  setUserdata(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20"
                  width="14"
                  viewBox="0 0 384 512"
                  fill="currentColor"
                >
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              </Button>
            </div>
          </div>
        )}
        {!isObjEmpty(userdata) && (
          <Link
            to={{ pathname: `/user/${userdata?.userid}` }}
            onClick={() => {
              localStorage.setItem('userstate', JSON.stringify({ backbutton: false }));
            }}
            target="_blank"
          >
            <UserCard
              profile={userdata}
              userid={userdata?.userid}
              firstname={userdata?.firstname}
              age={userdata?.age}
              setUserdata={setUserdata}
            />
          </Link>
        )}
      </div>
    </>
  );
}
