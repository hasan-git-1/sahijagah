import { Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const PostScreen = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Post Property</h2>
      </div>

      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl p-6 shadow-card text-center">
          <div className="h-16 w-16 rounded-full gradient-blue flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">List Your Property</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Post your property for free and connect with verified tenants and buyers directly.
          </p>

          <div className="space-y-3 text-left">
            <input
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Property Title"
            />
            <select className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground">
              <option>Select Type</option>
              <option>Rent</option>
              <option>Sale</option>
              <option>PG</option>
              <option>Commercial</option>
            </select>
            <select className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground">
              <option>Select Category</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Villa</option>
              <option>Plot</option>
              <option>Office</option>
            </select>
            <input
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Price (₹)"
              type="number"
            />
            <input
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="City"
            />
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Set location on map (coming soon)</span>
            </div>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Description"
              rows={3}
            />
            <Button className="w-full gradient-cta text-accent-foreground border-0 font-semibold text-base py-3">
              Post Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScreen;
