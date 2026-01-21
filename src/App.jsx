import { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
const Home = lazy(() => import("@/pages/Home").then(module => ({ default: module.Home })));
const About = lazy(() => import("@/pages/About").then(module => ({ default: module.About })));
const Contact = lazy(() => import("@/pages/Contact").then(module => ({ default: module.Contact })));
const Donate = lazy(() => import("@/pages/Donate").then(module => ({ default: module.Donate })));
const Search = lazy(() => import("@/pages/Search").then(module => ({ default: module.Search })));
const Photos = lazy(() => import("@/pages/Photos"));
const Questionaire = lazy(() => import("@/pages/Questionaire"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard").then(module => ({ default: module.Dashboard })));
const ChangePassword = lazy(() => import("@/pages/ChangePassword").then(module => ({ default: module.ChangePassword })));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const Settings = lazy(() => import("@/pages/Settings").then(module => ({ default: module.Settings })));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const UserProfile = lazy(() => import("@/pages/UserProfile").then(module => ({ default: module.UserProfile })));
const PageNotFound = lazy(() => import("@/pages/PageNotFound").then(module => ({ default: module.PageNotFound })));
const Terms = lazy(() => import("@/pages/Terms").then(module => ({ default: module.Terms })));
const Privacy = lazy(() => import("@/pages/Privacy").then(module => ({ default: module.Privacy })));
const TermsPopup = lazy(() => import("@/pages/TermsPopup").then(module => ({ default: module.TermsPopup })));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then(module => ({ default: module.LoginPage })));
const Notifications = lazy(() => import("@/pages/dashboard/Notifications").then(module => ({ default: module.Notifications })));
import NavBefore from "@/components/NavBefore";
import NavAfter from "@/components/Navafter";
import { useAuth } from "./context/AuthContext";
import { SearchAndUserEventsDataContextProvider } from './context/SearchAndUserEventsDataContext';
import { AutoCompleteDataContextProvider } from './context/AutoCompleteDataContext';
import { GlobalLoadingProvider } from './context/GlobalLoadingContext';
import { Toaster } from "react-hot-toast";
import GlobalLoadingSpinner from './components/GlobalLoadingSpinner';

function App() {
  const { user, profiledata } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState(false);

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

  // Show brief loading after login, but don't block the app
  useEffect(() => {
    if (user && !profiledata) {
      setShowInitialLoading(true);
      const timer = setTimeout(() => {
        setShowInitialLoading(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    } else {
      setShowInitialLoading(false);
    }
  }, [user, profiledata]);

  return (
    <>
      <GlobalLoadingProvider>
        <div className="App">
          <AutoCompleteDataContextProvider>
          <Toaster />
          <GlobalLoadingSpinner />
          <SearchAndUserEventsDataContextProvider>
          {showInitialLoading ? (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-background/90 rounded-2xl shadow-2xl border border-border/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-lg font-medium text-foreground animate-pulse">
                  Loading your profile...
                </p>
              </div>
            </div>
          ) : null}

          <>
            {user ?
              <NavAfter /> :
              <NavBefore
                openLogin={openLogin}
                setOpenLogin={setOpenLogin}
                openSignup={openSignup}
                setOpenSignup={setOpenSignup}
              />
            }

            <Suspense fallback={
              <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-background/90 rounded-2xl shadow-2xl border border-border/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-lg font-medium text-foreground animate-pulse">
                    Loading page...
                  </p>
                </div>
              </div>
            }>
            <Routes>
              <Route path="/" element={<Home setOpenLogin={setOpenLogin}/>} />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/search" element={<Search />} />
              <Route path="/questionaire" element={<Questionaire />} />

              <Route path="/photos" element={<Photos />} />

              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/user/:userid" element={<UserProfile />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            </Suspense>
            
            {/* Terms Popup - shows after login if terms not accepted */}
            {user && profiledata && profiledata.termsaccepted === false && (
              <TermsPopup />
            )}
          </>
          </SearchAndUserEventsDataContextProvider>
          </AutoCompleteDataContextProvider>
        </div>
      </GlobalLoadingProvider>
    </>
  );
}

export default App;
