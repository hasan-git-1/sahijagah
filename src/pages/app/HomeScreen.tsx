import { Search, User, Heart, MapPin, BedDouble, Bath, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import heroBanner from "@/assets/hero-banner.jpg";
import cityHyd from "@/assets/city-hyderabad.jpg";
import cityBlr from "@/assets/city-bengaluru.jpg";
import cityPune from "@/assets/city-pune.jpg";
import cityMum from "@/assets/city-mumbai.jpg";
import cityChn from "@/assets/city-chennai.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const categories = [
  { label: "Rent", emoji: "🏠" },
  { label: "Buy", emoji: "🏗️" },
  { label: "PG", emoji: "🛏️" },
  { label: "Commercial", emoji: "🏢" },
];

const cities = [
  { name: "Hyderabad", count: "1,190", img: cityHyd },
  { name: "Bengaluru", count: "1,160", img: cityBlr },
  { name: "Pune", count: "890", img: cityPune },
  { name: "Mumbai", count: "2,100", img: cityMum },
  { name: "Chennai", count: "760", img: cityChn },
];

const popularAreas = [
  { name: "Gachibowli", img: cityHyd },
  { name: "Whitefield", img: cityBlr },
  { name: "Hinjewadi", img: cityPune },
  { name: "Andheri", img: cityMum },
  { name: "OMR", img: cityChn },
];

const featuredProperties = [
  {
    id: "1", title: "Modern 2BHK in Gachibowli", price: "₹18,000/mo",
    location: "Gachibowli, Hyderabad", beds: 2, baths: 2, area: "1,100 sqft",
    img: prop1, type: "Rent",
  },
  {
    id: "2", title: "Luxury Villa with Garden", price: "₹1.2 Cr",
    location: "Whitefield, Bengaluru", beds: 4, baths: 3, area: "2,800 sqft",
    img: prop2, type: "Buy",
  },
  {
    id: "3", title: "Co-working Office Space", price: "₹25,000/mo",
    location: "Hinjewadi, Pune", beds: 0, baths: 1, area: "800 sqft",
    img: prop3, type: "Commercial",
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 pt-3 pb-2 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/search")}
            className="flex-1 flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search city or locality</span>
          </button>
          <button
            onClick={() => navigate("/app/profile")}
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <User className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative">
        <img src={heroBanner} alt="" className="w-full h-36 object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <h2 className="text-lg font-extrabold text-primary-foreground leading-tight">
            Easy Home Rentals<br />& Sales!
          </h2>
          <p className="text-[10px] text-primary-foreground/80 mt-1">
            Verified Listings | No Brokerages | 0 Brokerage
          </p>
          <p className="text-[10px] text-primary-foreground/60 mt-0.5">
            <span className="font-semibold text-primary-foreground">2 4,007</span> properties listed
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-around px-4 py-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate("/app/search")}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-card">
              <span className="text-xl">{cat.emoji}</span>
            </div>
            <span className="text-xs font-medium text-foreground">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Properties Near You */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Properties Near You</h3>
          <button onClick={() => navigate("/app/search")} className="text-xs text-primary font-medium flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => navigate("/app/search")}
              className="flex-shrink-0 w-36 rounded-xl overflow-hidden shadow-card bg-card"
            >
              <img src={city.img} alt={city.name} className="w-full h-20 object-cover" />
              <div className="p-2.5">
                <p className="text-sm font-semibold text-foreground">{city.name}</p>
                <p className="text-[10px] text-muted-foreground">{city.count} properties</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Areas */}
      <div className="px-4 mb-5">
        <h3 className="font-bold text-foreground mb-3">Popular Areas</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          {popularAreas.map((area) => (
            <button key={area.name} onClick={() => navigate("/app/search")} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden shadow-card border-2 border-primary/20">
                <img src={area.img} alt={area.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-medium text-foreground">{area.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3">Featured Properties</h3>
        <div className="space-y-3">
          {featuredProperties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/app/property/${prop.id}`)}
              className="w-full bg-card rounded-xl overflow-hidden shadow-card text-left"
            >
              <div className="relative">
                <img src={prop.img} alt={prop.title} className="w-full h-40 object-cover" />
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {prop.type}
                </span>
                <button
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-bold text-primary text-lg">{prop.price}</p>
                <p className="font-semibold text-sm text-foreground mt-0.5">{prop.title}</p>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{prop.location}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {prop.beds > 0 && (
                    <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {prop.beds} Beds</span>
                  )}
                  <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {prop.baths} Bath</span>
                  <span>{prop.area}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
