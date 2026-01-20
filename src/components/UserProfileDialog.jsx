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
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useState } from "react";

export function UserProfileDialog({ user, onClose }) {
  const images = user.images || [
    user.image || "/professional-portrait-in-urban-setting.jpg",
    "/professional-woman-smiling.png",
    "/young-woman-portrait.png",
    "/professional-headshot-of-a-young-man-with-brown-ha.jpg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto dark:border-3">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
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

        {/* Profile Image */}
        <div className="px-6 pt-2">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-linear-to-br from-muted to-muted/50 shadow-lg group">
            {/* Carousel Images */}
            <div className="relative w-full h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${user.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
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
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
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
            {images.length > 1 && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {/* Name and Handle */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {user.name}, {user.age} ({user.handle})
              </h3>
            </div>
            <button className="p-2 hover:bg-destructive/10 rounded-md transition-colors group">
              <Flag className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Visibility Preference */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-sm">
              {user?.visibilityPreference === 'events-only' && (
                <>
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Events Only</span>
                </>
              )}
              {user?.visibilityPreference === 'online-only' && (
                <>
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Online Only</span>
                </>
              )}
              {user?.visibilityPreference === 'both' && (
                <>
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Visible Everywhere</span>
                </>
              )}
              {(!user?.visibilityPreference || user?.visibilityPreference === '') && (
                <>
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Visible Everywhere</span>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-1">
            {/* Location */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{user.location}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{user.phone}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium break-all">
                {user.email}
              </span>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <FaFacebook className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium">{user.facebook}</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                <FaInstagram className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-sm font-medium">{user.instagram}</span>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-2 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                <FaLinkedin className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">{user.linkedin}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {user.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
