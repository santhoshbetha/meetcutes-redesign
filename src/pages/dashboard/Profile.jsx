import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { LocationDialog } from "@/components/LocationDialog";
import { ChangeLocation } from "@/components/ChangeLocation";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from '@/components/ui/Spinner';
import { Editable } from "@/components/Editable";
import { HandleCard } from "@/components/HandleCard";
import EdiText from "react-editext";
import { useAuth } from "@/context/AuthContext";
import { isObjEmpty } from "@/utils/util";
import { updateUserInfo } from "@/services/user.service";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function Profile() {
  const { user, userSession, profiledata, setProfiledata } = useAuth();
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [phone, setPhone] = useState(isObjEmpty(profiledata?.phonenumber) ? "" : profiledata?.phonenumber);
  const [facebook, setFacebook] = useState(isObjEmpty(profiledata?.facebook) ? "" : profiledata?.facebook);
  const [instagram, setInstagram] = useState(isObjEmpty(profiledata?.instagram) ? "" : profiledata?.instagram);
  const [linkedin, setLinkedIn] = useState(isObjEmpty(profiledata?.linkedin) ? "" : profiledata?.linkedin);
  const [reload, setReload] = useState(false);
  const [change, setChange] = useState(false);
  const [isCoordinatesModalOpen, setIsCoordinatesModalOpen] = useState(false);
  const [isHandleCardModalOpen, setIsHandleCardModalOpen] = useState(false);
  const [isChangeLocationModalOpen, setIsChangeLocationModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const gotoQuestionaire = () => {
    //navigate('/verify', {state:{userid: userid}})
    navigate("/questionaire");
  };

  //console.log('Profile render', profiledata);

  useEffect(() => {
    if (!isObjEmpty(profiledata) && reload) {
      setPhone(isObjEmpty(profiledata?.phonenumber) ? "" : profiledata?.phonenumber)
      setFacebook(isObjEmpty(profiledata?.facebook) ? "" : profiledata?.facebook)
      setInstagram(isObjEmpty(profiledata?.instagram) ? "" : profiledata?.instagram)
      setLinkedIn(isObjEmpty(profiledata?.linkedin) ? "" : profiledata?.linkedin)
      setReload(false)
    }
  }, [profiledata, reload]);
  
  const handlesaveSocials = async (e) => {
    e.preventDefault()
    setChange(false)

    var phoneregex = /^\d{10}$/;
    if (phone.match(phoneregex)) {
      setEditing(true)
      if (isOnline) {
          if (userSession) {
              const res = await updateUserInfo(user?.id, {
                  phonenumber: phone,
                  facebook: facebook,
                  instagram: instagram,
                  linkedin: linkedin
              });
              if (res.success) {
                  setProfiledata({...profiledata,
                      phonenumber: phone,
                      facebook: facebook,
                      instagram: instagram,
                      linkedin: linkedin
                  });
              } else {
                  alert('Something wrong. Try later')
              }
              setEditing(false)
          } else {
            setEditing(false)
            alert ("Error, logout and login again")
          }
      } else {
          setEditing(false)
          alert('You are offline. check your internet connection.')
      }

      setEditing(false)
    } else {
      setEditing(false)
      alert("invalid phonenumber! try again");
    }
    return;
  };

  async function addbiodata(editdata) {
      setEditing(true)
      if (isOnline) {
          if (userSession) {
              const res = await updateUserInfo(user?.id, {bio: editdata.bio});
              if (res.success) {
                  setProfiledata({...profiledata, bio: editdata.bio});
              } else {
                  alert ('Edit Biodata Error.. try again later')
              }
              setEditing(false)
          } else {
              setEditing(false)
              alert ("Error, logout and login again")
          }
      } else {
          setEditing(false)
          alert('You are offline. check your internet connection.')
      }
  }

  const handleSave = async (val) => {
      let editdata = {
        bio: val
      }
      if (isOnline) {
        if (userSession) {
          // add bio data to database
          if (String(val) !== String(profiledata?.bio)) {
              await addbiodata(editdata)
              setEditing(false)
          }
        } else {
          alert ("Error, logout and login again")
        }
      } else {
        alert('You are offline. check your internet connection.')
        return;
      }
  };

  return (
    <div>
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_380px] gap-2 md:gap-4">
          <Card className="p-6 md:p-8 shadow-lg w-full lg:w-fit mx-auto border-blue-100 dark:border-blue-900/80">
            <div className="w-full max-w-[280px] lg:w-72 aspect-square mx-auto overflow-hidden rounded-2xl">
              <img
                src="/professional-headshot-of-a-young-man-with-brown-ha.jpg"
                alt="Profile picture of Alan Smith"
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          <Card className="p-6 md:p-8 shadow-lg border-border/50 relative dark:border-blue-900/80">
            {editing && (
              <Spinner className="absolute top-[50%] left-[50%] z-50 cursor-pointer size-10" />
            )}
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">{profiledata?.firstname}, {profiledata?.city}</h2>
              {!isObjEmpty(profiledata?.userhandle) ?
                  <>
                  ({profiledata?.userhandle.toLowerCase()})
                  </>
                  :
                  <>
                  </>
              }
            </div>

            <form  onSubmit={handlesaveSocials}>
              <div className="space-y-4 md:space-y-0">
                <div className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/90 font-medium break-all">
                    {profiledata?.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <Editable
                    text={phone}
                    placeholder="Click to enter your Phonenumber"
                    type="input"
                  >
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Your Phonenumber"
                      value={phone}
                      onChange={(e) => {
                        setChange(true)
                        setPhone(e.target.value);
                      }}
                    />
                  </Editable>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <FaFacebook className="w-5 h-5 text-blue-600" />
                  </div>
                  <Editable
                    text={facebook}
                    placeholder="Click to enter your Facebook link"
                    type="input"
                  >
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Your Facebook Link"
                      value={facebook}
                      onChange={(e) => {
                        setChange(true)
                        setFacebook(e.target.value);
                      }}
                    />
                  </Editable>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500/20 transition-colors">
                    <FaInstagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <Editable
                    text={instagram}
                    placeholder="Click to enter your Instagram"
                    type="input"
                  >
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Your Instagram Link"
                      value={instagram}
                      onChange={(e) => {
                        setChange(true)
                        setInstagram(e.target.value);
                      }}
                    />
                  </Editable>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-700/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700/20 transition-colors">
                    <FaLinkedin className="w-5 h-5 text-blue-700" />
                  </div>
                  <Editable
                    text={linkedin}
                    placeholder="Click to enter your LinkedIn link"
                    type="input"
                  >
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Your LinkedIn Link"
                      value={linkedin}
                      onChange={(e) => {
                        setChange(true)
                        setLinkedIn(e.target.value);
                      }}
                    />
                  </Editable>
                </div>
              </div>
              <div className='my-2 py-3 mx-3'>
                  <EdiText
                      value={!isObjEmpty(profiledata?.bio) ? profiledata?.bio : "Write about you here (optional)"}
                      type="textarea"
                      onSave={handleSave}
                      editButtonProps={{
                        style: {
                          color: 'blue',
                          backgroundColor: '#E0E7FF',
                        },
                      }}
                      inputProps={{
                          style: {
                            outline: 'none',
                            minWidth: 'auto'
                          },
                          rows: 5
                      }}
                  />
              </div>
              {change == true ?
                  <div className='flex py-4 px-4'>
                      <Button 
                          className='ms-auto'
                          type="submit"
                      >
                          SAVE
                      </Button>
                  </div>
              :
                  <></>
              }
            </form>
          </Card>

          <div className="space-y-3 md:space-y-4 lg:col-span-2 xl:col-span-1 mt-2">
            <div className="flex flex-col md:flex-row md:w-[49%] space-y-4 md:space-y-0 md:gap-4 xl:flex-col xl:w-full">
              {isObjEmpty(profiledata?.userhandle) ?
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-300 to-red-500 text-accent-foreground font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      SET HANDLE
                    </Button>
                  </DialogTrigger>
                  <HandleCard onClose={() => setIsHandleCardModalOpen(false)} />
                </Dialog>
                :
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                  HANDLE IS SET
                </Button>
              }

              <Button
                onClick={() => setIsCoordinatesModalOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                COORDINATES
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:w-[49%] space-y-4 md:space-y-0 md:gap-4 xl:flex-col xl:w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setIsChangeLocationModalOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                  >
                    CHANGE LOCATION
                  </Button>
                </DialogTrigger>
                <ChangeLocation
                  onClose={() => setIsChangeLocationModalOpen(false)}
                />
              </Dialog>

              <Button
                onClick={gotoQuestionaire}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                MINDSET QUESTIONAIRE
              </Button>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-5 md:py-6 text-xs md:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]" 
              hidden>
              IQ TEST
            </Button>
          </div>
        </div>
      </main>
      <LocationDialog
        isOpen={isCoordinatesModalOpen}
        onClose={() => setIsCoordinatesModalOpen(false)}
        user={user}
        profiledata={profiledata}
        setProfiledata={setProfiledata}
      />
    </div>
  );
}
