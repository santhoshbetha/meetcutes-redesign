import { createContext, useState, useContext, useEffect } from "react";
import supabase from "@/lib/supabase";
import { getProfileData } from "@/services/user.service";
import { toast } from "sonner";
import secureLocalStorage from "react-secure-storage";

const AuthContext = createContext();

//https://stackoverflow.com/questions/72385641/supabase-onauthstatechanged-how-do-i-properly-wait-for-the-request-to-finish-p

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [profiledata, setProfiledata] = useState(null);
    const [userSession, setUserSession] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const setAuth = (authUser) => {
        setUser(authUser)
    }

    //const setUserData = (userData) => {
    //  setProfiledata({...userData})
    //}

    const updateUserData = async (user) => {
      setProfileLoading(true);
      let res = await getProfileData(user?.id);
      //console.log("updateUserData res ", res)
      if (res.success == true){
        setProfiledata({...res.data});
            } else {
                // Ensure profiledata is at least an empty object so UIs depending on its presence don't spin forever
                setProfiledata({});
      }
      setProfileLoading(false);
    }

    // Function to check if JWT token is expired
    const isTokenExpired = (session) => {
        if (!session || !session.expires_at) return true;
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        return session.expires_at < now;
    };

    // Function to handle logout when token is expired
    const handleTokenExpired = async () => {
        console.log("JWT token expired, logging out user");
        toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
        });
        try {
            await supabase.auth.signOut();
            setUser(null);
            setUserSession(null);
            setProfiledata(null);
            
            // Clear all stored data
            localStorage.clear();
            secureLocalStorage.clear();
            
            // Force dark mode for homepage after logout
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add("dark");
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error("Error during token expiration logout:", error);
        }
    };

    // Function to check token expiration periodically
    const checkTokenExpiration = () => {
        if (userSession && isTokenExpired(userSession)) {
            handleTokenExpired();
        }
    };

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
                    setUserSession(session);
                    setUser(session?.user ?? null);
                    // If there is an existing session on initial load, fetch profile data
                    if (session?.user) {
                        updateUserData(session.user);
                    }
      });
  
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`Supabase auth event: ${event}`);
        
        // Handle token expiration events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (event === 'SIGNED_OUT' && userSession && !session) {
                // User was signed out, possibly due to expired token
                console.log("User signed out, clearing session data");
                setUser(null);
                setUserSession(null);
                setProfiledata(null);
                return;
            }
        }
        
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

    // Set up periodic token expiration check
    useEffect(() => {
        if (userSession) {
            // Check token expiration every 5 minutes
            const tokenCheckInterval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
            
            // Also check immediately and after 1 minute to catch recently expired tokens
            const initialCheck = setTimeout(checkTokenExpiration, 1000);
            const oneMinuteCheck = setTimeout(checkTokenExpiration, 60 * 1000);
            
            return () => {
                clearInterval(tokenCheckInterval);
                clearTimeout(initialCheck);
                clearTimeout(oneMinuteCheck);
            };
        }
    }, [userSession]);

    return (
        <AuthContext.Provider value={{
            user,
            userSession,
            profiledata,
            profileLoading,
            setProfiledata,
            setAuth
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);