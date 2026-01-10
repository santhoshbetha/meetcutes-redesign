import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function UserCard({ setSelectedUser, profile }) {
  return (
    <Card
      key={profile?.id}
      onClick={() => setSelectedUser(profile)}
      className={`group overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] border 
        border-border/60 hover:border-primary/40 cursor-pointer bg-gradient-to-br from-card to-card/90 dark:border-blue-900/60`}
    >
      <div className="p-8">
        <div className="flex gap-6 mb-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              {profile?.image ? (
                <img
                  src={profile?.image || "/placeholder.svg"}
                  alt={profile?.firstname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-16 h-16 text-primary/60">
                    <circle cx="50" cy="35" r="15" fill="currentColor" opacity="0.7" />
                    <ellipse cx="50" cy="75" rx="25" ry="20" fill="currentColor" opacity="0.5" />
                  </svg>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-card rounded-full shadow-sm"></div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
              {profile?.firstname}
            </h4>
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
              {profile?.age} years old
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-base font-medium break-words">
                {profile?.city}, {profile?.state}
              </span>
            </div>
          </div>
        </div>

        {/* Last Login */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Last Login
            </p>
            <p className="text-sm text-foreground font-semibold">
              {profile?.timeoflogin}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
