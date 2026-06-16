import { Home, Search, PlusCircle, MessageCircle, User, Bell } from "lucide-react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PropertyAssistant from "@/components/PropertyAssistant";
import OfflineIndicator from "@/components/OfflineIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
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
import OwnerDashboard from "./app/OwnerDashboard";
import SettingsScreen from "./app/SettingsScreen";
import NotificationsScreen from "./app/NotificationsScreen";
import CompareScreen from "./app/CompareScreen";
import RecentlyViewedScreen from "./app/RecentlyViewedScreen";
import SavedSearchesScreen from "./app/SavedSearchesScreen";
import OwnerAnalyticsScreen from "./app/OwnerAnalyticsScreen";
import TenantVerificationScreen from "./app/TenantVerificationScreen";
import AdminUserManagement from "./app/AdminUserManagement";
import CityAnalyticsScreen from "./app/CityAnalyticsScreen";
import ToolsScreen from "./app/ToolsScreen";
import FeedbackScreen from "./app/FeedbackScreen";
import LandlordDashboard from "./app/LandlordDashboard";
const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const navItems = [
    { path: "/app", icon: Home, label: t("home") },
    { path: "/app/search", icon: Search, label: t("search") },
    { path: "/app/post", icon: PlusCircle, label: t("post") },
    { path: "/app/chat", icon: MessageCircle, label: t("chat") },
    { path: "/app/profile", icon: User, label: t("profile") },
  ];

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
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

  const { data: notifCount } = useQuery({
    queryKey: ["notif-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const hideNav = ["/app/property/", "/app/wishlist", "/app/bookings", "/app/admin",
    "/app/install", "/app/edit-profile", "/app/owner", "/app/settings",
    "/app/notifications", "/app/compare", "/app/recently-viewed", "/app/saved-searches",
    "/app/owner-analytics", "/app/verify",
    "/app/city-analytics", "/app/tools", "/app/feedback",
    "/app/landlord-dashboard"].some((p) => location.pathname.includes(p));

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <OfflineIndicator />
      <main className="flex-1 pb-20 overflow-y-auto">
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
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="notifications" element={<NotificationsScreen />} />
          <Route path="compare" element={<CompareScreen />} />
          <Route path="recently-viewed" element={<RecentlyViewedScreen />} />
          <Route path="saved-searches" element={<SavedSearchesScreen />} />
          <Route path="owner-analytics" element={<OwnerAnalyticsScreen />} />
          <Route path="verify" element={<TenantVerificationScreen />} />
          <Route path="admin/users" element={<AdminUserManagement />} />
          <Route path="city-analytics" element={<CityAnalyticsScreen />} />
          <Route path="tools" element={<ToolsScreen />} />
          <Route path="feedback" element={<FeedbackScreen />} />
          <Route path="landlord-dashboard" element={<LandlordDashboard />} />
        </Routes>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/90 backdrop-blur-xl shadow-nav border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-end justify-around px-2 pt-2 pb-1.5">
            {navItems.map((item) => {
              const isActive = item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              const isPost = item.label === t("post");
              const showChatBadge = item.path === "/app/chat" && unreadCount && unreadCount > 0;

              if (isPost) {
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="-mt-5 flex flex-col items-center gap-1 active:scale-95 transition"
                    aria-label={item.label}
                  >
                    <span className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-elevated">
                      <PlusCircle className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="text-[9px] font-semibold text-foreground">{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 px-3 py-1 transition relative"
                  aria-label={item.label}
                >
                  <span className={`relative h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? "bg-foreground text-background" : "text-muted-foreground"
                  }`}>
                    <Icon className="h-4.5 w-4.5" strokeWidth={isActive ? 2.2 : 1.8} />
                    {showChatBadge && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className={`text-[9.5px] font-semibold tracking-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* AI Property Assistant FAB */}
      <PropertyAssistant />
    </div>
  );
};

export default AppShell;
