import {
  X,
  MapPin,
  Phone,
  Mail,
  Flag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Calendar,
  ExternalLink,
  User,
  Heart,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useState } from "react";

const CDNURL = 'https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images';

export function UserProfileDialog({ user, userData, onClose }) {
  // Filter out null/empty images and ensure we have valid images
  const source = userData ?? user;
  const validImages = source?.images?.filter(img => img && typeof img === 'string' && img.trim() !== '') || [];
  const hasImages = validImages.length > 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (!validImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    if (!validImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Helper function to check if a value is available and not empty
  const hasValue = (value) => value != null && typeof value === 'string' && value.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto dark:border-3">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {hasValue(user?.firstname) ? user.firstname : 'User Profile'}
              </h2>
              {hasValue(user?.userhandle) && (
                <p className="text-sm text-muted-foreground">@{user.userhandle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`/user/${user?.userid || user?.id}`, '_blank')}
              className="p-2 hover:bg-muted rounded-md transition-colors group"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-foreground group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Close profile"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Images Section - Only show if images are available */}
          {hasImages && (
            <div className="lg:w-1/3 p-6">
              <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-linear-to-br from-muted to-muted/50 shadow-lg group">
                {/* Carousel Images */}
                <div className="relative w-full h-full">
                  {validImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentImageIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={
                          image.startsWith('http')
                            ? image
                            : `${CDNURL}/${source?.shortid || source?.userid || source?.id || ''}/${image}`
                        }
                        alt={`${source?.firstname || user?.firstname || 'User'} - Photo ${index + 1}`}
                        className="w-full h-full object-contain lg:object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-card w-6"
                            : "bg-card/50 hover:bg-card/75"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {validImages.length > 1 && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {validImages.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Details */}
          <div className={`${hasImages ? 'lg:w-1/2' : 'w-full'} p-6 space-y-6 `}>
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">
                    {hasValue(user?.firstname) && hasValue(user?.age) ? `${user.firstname}, ${user.age}` : 'Profile'}
                  </h3>
                  {hasValue(user?.name) && user.name !== user?.firstname && (
                    <p className="text-lg text-muted-foreground">{user.name}</p>
                  )}
                </div>
                <button className="p-2 hover:bg-destructive/10 rounded-md transition-colors lg:order-last">
                  <Flag className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Visibility Preference */}
              {hasValue(user?.visibilityPreference) && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-center gap-2 text-sm bg-muted/50 rounded-lg py-2">
                    {user.visibilityPreference === 'events-only' && (
                      <>
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground font-medium">Events Only</span>
                      </>
                    )}
                    {user.visibilityPreference === 'online-only' && (
                      <>
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground font-medium">Online Only</span>
                      </>
                    )}
                    {user.visibilityPreference === 'both' && (
                      <>
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground font-medium">Visible Everywhere</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Contact Information
              </h4>

              <div className="space-y-2">
                {/* Location */}
                {(hasValue(user?.city) || hasValue(user?.state)) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {[user.city, user.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {hasValue(user?.phonenumber) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{user.phonenumber}</span>
                  </div>
                )}

                {/* Email */}
                {hasValue(user?.email) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium break-all">{user.email}</span>
                  </div>
                )}

                {/* Social Media */}
                {hasValue(user?.facebook) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <FaFacebook className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">{user.facebook}</span>
                  </div>
                )}

                {hasValue(user?.instagram) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                      <FaInstagram className="w-5 h-5 text-pink-500" />
                    </div>
                    <span className="text-sm font-medium">{user.instagram}</span>
                  </div>
                )}

                {hasValue(user?.linkedin) && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                      <FaLinkedin className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{user.linkedin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {hasValue(user?.bio) && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  About
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                  {user.bio}
                </p>
              </div>
            )}

            {/* No data message */}
            {!hasValue(user?.city) && !hasValue(user?.state) && !hasValue(user?.phonenumber) &&
             !hasValue(user?.email) && !hasValue(user?.facebook) && !hasValue(user?.instagram) &&
             !hasValue(user?.linkedin) && !hasValue(user?.bio) && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No additional information available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
