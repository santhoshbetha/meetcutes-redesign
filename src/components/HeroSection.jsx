import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import meetcutesimg from "@/assets/meetcutes-main.png";
import PrimaryGradient from "@/components/ui/PrimaryGradient";
import { useAuth } from "../context/AuthContext";

export default function HeroSection({ setOpenLogin }) {
  const { user } = useAuth()
  const navigate = useNavigate();

  async function onDashBoardClick() {
    if (user) {
        navigate('/dashboard');
    } else {
        setOpenLogin(true);
    }
  }

  return (
    <section className="container mx-auto px-6 py-12 md:py-24 md:px-16 lg:px-20">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
        <div className="space-y-8">
          <div
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[1.1] text-balance font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Singles exclusive meet "In Real Life" first platform
          </div>
          <div className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Not at bars or no forever swipes or messages. Go to your local
            stores, malls, coffee shops, parks and stumble upon other singles in
            an organic way.
          </div>
          <div className="text-xl font-semibold text-foreground/80 max-w-xl">
            This app brings approachable people together.
          </div>
          <div className="pt-6">
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size={"lg"}
              onClick={onDashBoardClick}
            >
              Get Started <LayoutDashboard size={24} className="ml-3" />
            </Button>
          </div>
        </div>

        <PrimaryGradient className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          <img
            src={meetcutesimg}
            alt="People meeting in real life"
            className="w-full h-full object-fit hover:scale-105 transition-transform duration-700"
          />
        </PrimaryGradient>
      </div>
    </section>
  );
}
