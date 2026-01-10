import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Donate } from "@/pages/Donate";
import { Search } from "@/pages/Search";
import { Photos } from "@/pages/Photos";
import Questionaire from "@/pages/Questionaire";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { ChangePassword } from "@/pages/ChangePassword";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { Settings } from "@/pages/Settings";
import NavBefore from "@/components/NavBefore";
import NavAfter from "@/components/Navafter";
import { useAuth } from "./context/AuthContext";
import { SearchAndUserEventsDataContextProvider } from './context/SearchAndUserEventsDataContext';
import { AutoCompleteDataContextProvider } from './context/AutoCompleteDataContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { user, profiledata } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  const [theme, _setTheme] = useState("dark");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <>
      <div className="App">
        <AutoCompleteDataContextProvider>
        <ToastContainer/>
        <SearchAndUserEventsDataContextProvider>
        {user ?
          <NavAfter /> :
          <NavBefore
            openLogin={openLogin}
            setOpenLogin={setOpenLogin}
            openSignup={openSignup}
            setOpenSignup={setOpenSignup}
          />
        }

        <Routes>
          <Route path="/" element={<Home setOpenLogin={setOpenLogin}/>} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/questionaire" element={<Questionaire />} />

          <Route path="/photos" element={<Photos />} />

          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          <Route path="/settings" element={<Settings />} />
        </Routes>
        </SearchAndUserEventsDataContextProvider>
        </AutoCompleteDataContextProvider>
      </div>
    </>
  );
}

export default App;
