import { Heart, MapPin, BedDouble, Bath } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistProperties } from "@/hooks/useWishlist";
import { useToggleWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const WishlistScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: properties, isLoading } = useWishlistProperties();
  const toggleWishlist = useToggleWishlist();

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-2">Sign in to view wishlist</h3>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0 px-8">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <Heart className="h-5 w-5 text-primary" />
        </button>
        <h2 className="text-lg font-bold text-foreground">My Wishlist</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-bold text-foreground mb-1">No saved properties</h3>
          <p className="text-sm text-muted-foreground">Tap the heart on any property to save it here.</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {properties.map((prop: any) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/app/property/${prop.id}`)}
              className="w-full bg-card rounded-xl overflow-hidden shadow-card text-left"
            >
              <div className="relative">
                <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} alt={prop.title} className="w-full h-36 object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist.mutate(prop.id); }}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
                >
                  <Heart className="h-4 w-4 text-destructive fill-destructive" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-bold text-primary text-lg">{formatPrice(prop.price, prop.type)}</p>
                <p className="font-semibold text-sm text-foreground mt-0.5">{prop.title}</p>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /><span className="text-xs">{prop.address || prop.city}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;
