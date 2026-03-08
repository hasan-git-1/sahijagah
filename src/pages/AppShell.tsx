import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HomeScreen from "./app/HomeScreen";
import SearchScreen from "./app/SearchScreen";
import PostScreen from "./app/PostScreen";
import ChatScreen from "./app/ChatScreen";
import ProfileScreen from "./app/ProfileScreen";
import PropertyDetail from "./app/PropertyDetail";
import WishlistScreen from "./app/WishlistScreen";
import BookingsScreen from "./app/BookingsScreen";
import AdminDashboard from "./app/AdminDashboard";
import InstallScreen from "./app/InstallScreen";
import EditProfileScreen from "./app/EditProfileScreen";

const navItems = [
  { path: "/app", icon: Home, label: "Home" },
  { path: "/app/search", icon: Search, label: "Search" },
  { path: "/app/post", icon: PlusCircle, label: "Post" },
  { path: "/app/chat", icon: MessageCircle, label: "Chat" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Unread message count
  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
      // Get conversation IDs for user
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`);
      if (!convos?.length) return 0;

      const convoIds = convos.map((c) => c.id);
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convoIds)
        .neq("sender_id", user!.id)
        .eq("read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const hideNav = location.pathname.includes("/app/property/") ||
    location.pathname.includes("/app/wishlist") ||
    location.pathname.includes("/app/bookings") ||
    location.pathname.includes("/app/admin") ||
    location.pathname.includes("/app/install") ||
    location.pathname.includes("/app/edit-profile");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 pb-20 overflow-y-auto">
        <Routes>
          <Route index element={<HomeScreen />} />
          <Route path="search" element={<SearchScreen />} />
          <Route path="post" element={<PostScreen />} />
          <Route path="chat" element={<ChatScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="wishlist" element={<WishlistScreen />} />
          <Route path="bookings" element={<BookingsScreen />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="install" element={<InstallScreen />} />
          <Route path="edit-profile" element={<EditProfileScreen />} />
        </Routes>
      </div>

      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card shadow-nav border-t border-border z-50">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              const showBadge = item.label === "Chat" && unreadCount && unreadCount > 0;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${item.label === "Post" ? "h-6 w-6" : ""}`} />
                  {showBadge && (
                    <span className="absolute -top-0.5 right-1 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppShell;
