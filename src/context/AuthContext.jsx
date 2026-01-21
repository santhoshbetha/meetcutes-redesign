import { createContext, useState, useContext, useEffect } from "react";
import supabase from "@/lib/supabase";
import { getProfileData } from "@/services/user.service";

const AuthContext = createContext();

//https://stackoverflow.com/questions/72385641/supabase-onauthstatechanged-how-do-i-properly-wait-for-the-request-to-finish-p

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [profiledata, setProfiledata] = useState(null);
    const [userSession, setUserSession] = useState(null);

    const setAuth = (authUser) => {
        setUser(authUser)
    }

    //const setUserData = (userData) => {
    //  setProfiledata({...userData})
    //}

    const updateUserData = async (user) => {
      let res = await getProfileData(user?.id);
      console.log("updateUserData res ", res)
      if (res.success == true){
        setProfiledata({...res.data});
      }
    }

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
          setUserSession(session);
          setUser(session?.user ?? null);
      });
  
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          //console.log(`Supabase auth event: ${event}`);

          if (session) {
              //console.log("session?.user::", session?.user)
              setAuth(session?.user);
              //setUser(session?.user ?? null);
              setUserSession(session);
              updateUserData(session?.user)
              
              // Set dark mode as default for logged-in users if no theme preference exists
              const savedTheme = localStorage.getItem("theme");
              if (!savedTheme) {
                  localStorage.setItem("theme", "dark");
                  document.documentElement.classList.add("dark");
              }
          } else {
              setAuth(null);
              //setUser(null);
              setUserSession(null);
          }
      });
  
      return () => {
          authListener.subscription.unsubscribe();
      };
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            userSession,
            profiledata,
            setProfiledata,
            setAuth
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);