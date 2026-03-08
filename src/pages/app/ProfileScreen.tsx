import { User, Heart, Calendar, FileText, Settings, LogOut, ChevronRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Heart, label: "Wishlist", path: "/app/wishlist" },
  { icon: Calendar, label: "My Bookings", path: "/app/bookings" },
  { icon: FileText, label: "My Documents", path: "/app/documents" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const ProfileScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Profile</h2>
      </div>

      {/* Profile Card */}
      <div className="px-4 pt-6">
        <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-blue flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Guest User</h3>
            <p className="text-xs text-muted-foreground">Sign in to access all features</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" /> Client
            </span>
          </div>
        </div>
      </div>

      {/* Sign In CTA */}
      <div className="px-4 mt-4">
        <Button className="w-full gradient-blue text-primary-foreground border-0 font-semibold">
          Sign In / Register
        </Button>
      </div>

      {/* Menu */}
      <div className="px-4 mt-6">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm font-medium text-foreground text-left">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-card px-4 py-3.5 hover:bg-destructive/5 transition-colors">
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
