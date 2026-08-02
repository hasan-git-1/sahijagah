import { Home, Search, Plus, MessageCircle, User, Bell, PlusCircle } from "lucide-react";
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
import PrivacyPolicyScreen from "./app/PrivacyPolicyScreen";
import TermsScreen from "./app/TermsScreen";
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
    "/app/privacy", "/app/terms",
    "/app/landlord-dashboard"].some((p) => location.pathname.includes(p));

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row max-w-md lg:max-w-none mx-auto relative">
      <OfflineIndicator />

      {/* Desktop sidebar navigation */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-card/60 backdrop-blur-xl z-40 px-3 py-6">
        <button
          onClick={() => navigate("/app")}
          className="px-3 mb-8 text-left text-xl font-bold tracking-tight text-foreground font-display"
        >
          urban<span className="text-accent">Stay</span>
        </button>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.path === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            const showChatBadge = item.path === "/app/chat" && unreadCount && unreadCount > 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                <span className="flex-1 text-left">{item.label}</span>
                {showChatBadge && (
                  <span className="h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <button
            onClick={() => navigate("/app/notifications")}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2} />
            <span className="flex-1 text-left">{t("notifications")}</span>
            {!!notifCount && notifCount > 0 && (
              <span className="h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 pb-20 lg:pb-10 lg:pl-60 overflow-y-auto">
        <div className="lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-4">
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
          <Route path="privacy" element={<PrivacyPolicyScreen />} />
          <Route path="terms" element={<TermsScreen />} />
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
        </div>
      </main>

      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/90 backdrop-blur-xl shadow-nav border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-end justify-around px-2 pt-2 pb-1.5">
            {navItems.map((item) => {
              const isActive = item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              const isPost = item.label === t("post");
              const showChatBadge = item.path === "/app/chat" && unreadCount && unreadCount > 0;

              if (isPost) {
                const postActive = location.pathname.startsWith("/app/post");
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="-mt-6 flex flex-col items-center gap-1 active:scale-95 transition"
                    aria-label={item.label}
                    aria-current={postActive ? "page" : undefined}
                  >
                    <span className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                      postActive
                        ? "bg-foreground text-background shadow-elevated ring-4 ring-foreground/10"
                        : "bg-background text-foreground border-2 border-foreground shadow-card hover:bg-foreground hover:text-background"
                    }`}>
                      <Plus className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <span className={`text-[9px] font-semibold tracking-tight ${postActive ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
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
