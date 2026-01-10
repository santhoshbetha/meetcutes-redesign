import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { Menu, X } from "lucide-react";

const NavBefore = ({ openLogin, setOpenLogin, openSignup, setOpenSignup }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <img src="/mc-48-orange2.png" alt="Logo" className="h-10 w-10" />
            <span className="text-4xl pacifico-regular text-dark dark:text-white">
              MeetCutes.us
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/about"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/donate"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Donate
          </Link>
        </nav>

        <div className="items-center gap-3 hidden lg:flex">
          <Dialog open={openLogin} onOpenChange={setOpenLogin}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setOpenLogin(true)}
                variant="ghost"
              >
                Login
              </Button>
            </DialogTrigger>
            <Login setOpenLogin={setOpenLogin} setOpenSignup={setOpenSignup} />
          </Dialog>
          <Dialog open={openSignup} onOpenChange={setOpenSignup}>
            <DialogTrigger asChild>
              <Button>Signup</Button>
            </DialogTrigger>
            <Signup setOpenSignup={setOpenSignup} setOpenLogin={setOpenLogin} />
          </Dialog>
        </div>

        {/* Mobile menu icon */}
        <div className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>

      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="#about" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="#how-it-works" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link to="#locations" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
              Donate
            </Link>
            <div className="flex space-x-2 px-3 pt-2">
              <Button variant="ghost" size="sm" className="flex-1"
                onClick={() => setOpenLogin(true)}
              >
                Login
              </Button>

              <Dialog open={openSignup} onOpenChange={setOpenSignup}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1"
                  onClick={() => setOpenSignup(true)}
                >
                  Signup
                </Button>
              </DialogTrigger>
              <Signup setOpenSignup={setOpenSignup} setOpenLogin={setOpenLogin} />
            </Dialog>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBefore;
