import { User, Heart, Calendar, Edit, Settings, LogOut, ChevronRight, Shield, Download, Home, Bell, Clock, BarChart3, Search, Users, Lock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return !!data;
    },
    enabled: !!user,
  });

  const { data: isAgent } = useQuery({
    queryKey: ["isAgent", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "agent" });
      return !!data;
    },
    enabled: !!user,
  });

  const { data: hasListings } = useQuery({
    queryKey: ["hasListings", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("owner_id", user!.id);
      return (count || 0) > 0;
    },
    enabled: !!user,
  });

  const { data: notifCount } = useQuery({
    queryKey: ["notif-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
  });

  const menuItems = [
    { icon: Heart, label: "Wishlist", path: "/app/wishlist" },
    { icon: Calendar, label: "My Bookings", path: "/app/bookings" },
    { icon: Bell, label: "Notifications", path: "/app/notifications", badge: notifCount },
    { icon: Clock, label: "Recently Viewed", path: "/app/recently-viewed" },
    { icon: BarChart3, label: "Compare Properties", path: "/app/compare" },
    { icon: Search, label: "Saved Searches", path: "/app/saved-searches" },
    { icon: Lock, label: "Document Vault", path: "/app/documents" },
    { icon: Edit, label: "Edit Profile", path: "/app/edit-profile" },
    { icon: Download, label: "Install App", path: "/app/install" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Profile</h2>
      </div>

      <div className="px-4 pt-6">
        <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-primary/20">
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-blue flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  {user ? (profile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U") : "G"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{user ? (profile?.name || "User") : "Guest User"}</h3>
            <p className="text-xs text-muted-foreground">{user ? user.email : "Sign in to access all features"}</p>
            {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
              <Shield className="h-3 w-3" /> {profile?.role || "client"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {!user ? (
          <Button onClick={() => navigate("/auth")} className="w-full gradient-blue text-primary-foreground border-0 font-semibold">
            Sign In / Register
          </Button>
        ) : (
          <>
            {isAdmin && (
              <Button onClick={() => navigate("/app/admin")} variant="outline" className="w-full gap-2">
                <Shield className="h-4 w-4 text-primary" /> Admin Dashboard
              </Button>
            )}
            {hasListings && (
              <>
                <Button onClick={() => navigate("/app/owner")} variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4 text-primary" /> Owner Dashboard
                </Button>
                <Button onClick={() => navigate("/app/owner-analytics")} variant="outline" className="w-full gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Owner Analytics
                </Button>
              </>
            )}
            {isAgent && (
              <Button onClick={() => navigate("/app/agent")} variant="outline" className="w-full gap-2">
                <Users className="h-4 w-4 text-primary" /> Agent Dashboard
              </Button>
            )}
          </>
        )}
      </div>

      <div className="px-4 mt-6">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm font-medium text-foreground text-left">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {user && (
        <div className="px-4 mt-4 mb-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-card px-4 py-3.5 hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
