import { ArrowLeft, Heart, Share2, MapPin, BedDouble, Bath, Phone, MessageSquare, Calendar, Wifi, Car, Dumbbell, Wind } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const properties: Record<string, {
  title: string; price: string; location: string; beds: number; baths: number;
  area: string; img: string; type: string; desc: string; amenities: string[];
  owner: string; phone: string;
}> = {
  "1": {
    title: "Modern 2BHK in Gachibowli", price: "₹18,000/mo",
    location: "Gachibowli, Hyderabad", beds: 2, baths: 2, area: "1,100 sqft",
    img: prop1, type: "Rent",
    desc: "Beautiful 2BHK apartment with modern amenities, well-ventilated rooms, and a spacious balcony. Located near IT hubs and shopping malls.",
    amenities: ["WiFi", "Parking", "Gym", "AC"],
    owner: "Rajesh Kumar", phone: "7093187420",
  },
  "2": {
    title: "Luxury Villa with Garden", price: "₹1.2 Cr",
    location: "Whitefield, Bengaluru", beds: 4, baths: 3, area: "2,800 sqft",
    img: prop2, type: "Buy",
    desc: "Stunning 4BHK villa with lush garden, modern interiors, and premium fittings. Gated community with 24/7 security.",
    amenities: ["Parking", "Gym", "Pool", "AC"],
    owner: "Priya Sharma", phone: "7093187420",
  },
  "3": {
    title: "Co-working Office Space", price: "₹25,000/mo",
    location: "Hinjewadi, Pune", beds: 0, baths: 1, area: "800 sqft",
    img: prop3, type: "Commercial",
    desc: "Professional co-working space with high-speed internet, meeting rooms, and all utilities included.",
    amenities: ["WiFi", "AC", "Parking"],
    owner: "Amit Patel", phone: "7093187420",
  },
};

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi, Parking: Car, Gym: Dumbbell, AC: Wind, Pool: Dumbbell,
};

const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const property = properties[id || "1"];

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/app/property/${id}`;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Image */}
      <div className="relative">
        <img src={property.img} alt={property.title} className="w-full h-64 object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Heart className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={handleShare}
            className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {property.type}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <p className="text-2xl font-extrabold text-primary">{property.price}</p>
        <h1 className="text-lg font-bold text-foreground mt-1">{property.title}</h1>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 py-3 border-y border-border">
          {property.beds > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <BedDouble className="h-4 w-4 text-primary" />
              <span>{property.beds} Beds</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Bath className="h-4 w-4 text-primary" />
            <span>{property.baths} Bath</span>
          </div>
          <div className="text-sm text-foreground">{property.area}</div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h3 className="font-bold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{property.desc}</p>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <h3 className="font-bold text-foreground mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a) => {
              const Icon = amenityIcons[a] || Wifi;
              return (
                <span key={a} className="flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                  <Icon className="h-3.5 w-3.5 text-primary" /> {a}
                </span>
              );
            })}
          </div>
        </div>

        {/* Owner Card */}
        <div className="mt-5 bg-card rounded-xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-2">Property Owner</h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {property.owner.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{property.owner}</p>
              <p className="text-xs text-muted-foreground">Verified Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-3 flex gap-3 z-50">
        <Button variant="outline" className="flex-1 gap-2">
          <Phone className="h-4 w-4" /> Call
        </Button>
        <Button className="flex-1 gradient-blue text-primary-foreground border-0 gap-2">
          <MessageSquare className="h-4 w-4" /> Message
        </Button>
        <Button className="flex-1 gradient-cta text-accent-foreground border-0 gap-2">
          <Calendar className="h-4 w-4" /> Book Visit
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetail;
