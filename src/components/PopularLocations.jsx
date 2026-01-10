export function PopularLocations() {
  const locations = [
    { name: "Home Depot", logo: "/locations/home-depot.png" },
    { name: "Target", logo: "/locations/target.png" },
    { name: "H-E-B", logo: "/locations/heb.png" },
    { name: "Walmart", logo: "/locations/walmart.png" },
    { name: "Costco", logo: "/locations/costco.png" },
    { name: "Trader Joes", logo: "/locations/trader-joes.png" },
    { name: "Whole Foods", logo: "/locations/whole-foods.png" },
    { name: "Ross", logo: "/locations/ross.png" },
    { name: "Kohls", logo: "/locations/kohls.png" },
    { name: "Starbucks", logo: "/generic-coffee-logo.png" },
    { name: "Winco", logo: "/locations/winco-foods.png" },
    { name: "Lowes", logo: "/locations/lowes.png" },
    { name: "Kroger", logo: "/locations/Kroger.png" },
    { name: "Aldi", logo: "/locations/aldi.png" },
    { name: "IKEA", logo: "/locations/Ikea.png" },
  ];

  return (
    <section className="container mx-auto px-6 py-16 md:px-8 lg:px-12">
      <div className="text-center space-y-6 mb-16">
        <h2
          className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Popular Locations
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Meet at the places you already visit every day
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
        {locations.map((location) => (
          <div
            key={location.name}
            className="group flex items-center justify-center p-8 bg-card/80 border border-border/60 rounded-2xl hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm hover:bg-card"
          >
            <img
              src={location.logo || "/placeholder.svg"}
              alt={location.name}
              className="max-w-full h-16 object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
