export default function AboutSection() {
  return (
    <>
      {/* Video and Content Section */}
      <section className="bg-gradient-to-b from-card to-background border-y border-border/60">
        <div className="container mx-auto px-6 py-8 md:py-12 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
            {/* Left - Video Section */}
            <div className="space-y-8">
              <div className="bg-background border border-border/60 rounded-3xl p-10 flex items-center justify-center aspect-video shadow-xl hover:shadow-2xl transition-shadow duration-500">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <svg
                        className="w-10 h-10 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-16 flex items-center justify-center shadow-inner">
                    <div className="text-muted-foreground">
                      <div className="p-6 bg-primary/10 rounded-full mb-4 inline-block">
                        <svg
                          className="w-20 h-20 text-primary"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-base font-medium">Watch Demo Video</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="p-6 bg-primary/10 border border-border/40 rounded-2xl backdrop-blur-sm">
                  <div className="text-lg text-foreground/90 leading-relaxed font-medium">
                    Turn your shopping events into happenstances to meet someone.
                    People who are willing to be approached may schedule and/or
                    attend events in your area to find someone. Grocery
                    shopping/cloths shopping or any other.
                  </div>
                </div>
                <div className="p-6 bg-primary/10 border border-border/40 rounded-2xl backdrop-blur-sm">
                  <div className="text-lg text-foreground/90 leading-relaxed font-medium">
                    Create events at local grocery stores/big box
                    stores/malls/coffee shops/parks. Others in the vicinity will be
                    notified. Make organic conversations and have your shot.
                  </div>
                </div>
                <div className="p-6 bg-primary/10 border border-border/40 rounded-2xl backdrop-blur-sm">
                  <div className="text-lg text-foreground/90 leading-relaxed font-medium">
                    This app is an attempt to bring approachable people to a common
                    place. Attempt to make regular guy to be able to meet regular
                    girl in old fashioned way.
                  </div>
                </div>
                <div className="p-6 bg-primary/10 border border-border/40 rounded-2xl backdrop-blur-sm">
                  <div className="text-lg text-foreground leading-relaxed font-semibold">
                    This app is made for working class population in USA who have
                    little time to waste in the current dating scenarios.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
