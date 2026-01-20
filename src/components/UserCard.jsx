import { Card } from "@/components/ui/card";
import { MapPin, Heart, Coffee, Music, Camera, BookOpen, Gamepad2, Plane, Utensils } from "lucide-react";

export function UserCard({ setSelectedUser, profile }) {
  // Generate a more detailed dummy avatar based on user data
  const generateDummyAvatar = () => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600'
    ];

    const patterns = [
      'bg-gradient-to-br',
      'bg-gradient-to-tr',
      'bg-gradient-to-bl',
      'bg-gradient-to-tl'
    ];

    // Use user data to create consistent colors
    const colorIndex = (profile?.firstname?.charCodeAt(0) || 0) % colors.length;
    const patternIndex = (profile?.age || 0) % patterns.length;

    return `${patterns[patternIndex]} ${colors[colorIndex]}`;
  };

  // Sample interests based on user data (in a real app, this would come from profile)
  const getSampleInterests = () => {
    const interests = [
      { icon: Coffee, label: 'Coffee' },
      { icon: Music, label: 'Music' },
      { icon: Camera, label: 'Photography' },
      { icon: BookOpen, label: 'Reading' },
      { icon: Gamepad2, label: 'Gaming' },
      { icon: Plane, label: 'Travel' },
      { icon: Utensils, label: 'Cooking' },
      { icon: Heart, label: 'Romance' }
    ];

    // Return 2-3 interests based on user data
    const seed = (profile?.firstname?.length || 0) + (profile?.age || 0);
    return interests.slice(seed % 3, (seed % 3) + 3);
  };

  const interests = getSampleInterests();
  const avatarClass = generateDummyAvatar();

  return (
    <Card
      key={profile?.id}
      onClick={() => setSelectedUser(profile)}
      className={`group overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] border
        border-border/60 hover:border-primary/40 cursor-pointer bg-linear-to-br from-card to-card/90 dark:border-blue-900/60 p-4 sm:p-6`}
    >
      <div className="p-0">
        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${avatarClass}`}>
              {profile?.image ? (
                <img
                  src={profile?.image || "/placeholder.svg"}
                  alt={profile?.firstname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Enhanced dummy avatar with more detail */}
                  <div className="text-white text-lg sm:text-2xl font-bold">
                    {profile?.firstname?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 rounded-full"></div>
                  </div>
                  <div className="absolute top-1 right-1 w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full"></div>
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
                </div>
              )}
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 sm:border-3 border-card rounded-full shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <h4 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                {profile?.firstname} {profile?.lastname?.charAt(0)}.
              </h4>
              <div className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold ml-2 flex-shrink-0">
                {profile?.age}
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground mb-2 sm:mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">
                {profile?.city}, {profile?.state}
              </span>
            </div>

            {/* Interests */}
            <div className="flex items-center gap-1 mb-2 sm:mb-3 flex-wrap">
              {interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted/50 rounded-full">
                  <interest.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{interest.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio/Description */}
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
            {profile?.bio || `Hi! I'm ${profile?.firstname}, ${profile?.age} years old from ${profile?.city}. Looking to meet amazing people and create meaningful connections!`}
          </p>
        </div>

        {/* Footer with last login and action hint */}
        <div className="pt-3 sm:pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-muted-foreground">
                Active {profile?.timeoflogin || 'recently'}
              </p>
            </div>
            <div className="text-xs text-primary font-medium group-hover:underline">
              View Profile →
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
