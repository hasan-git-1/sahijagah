import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Clock, Building2, Users, LogOut, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthed, setAdminAuthed } from "./AdminAuth";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const navigate = useNavigate();

  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace />;
  }

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
    refetchInterval: 10000,
  });

  const handleLogout = () => {
    setAdminAuthed(false);
    navigate("/admin/login", { replace: true });
  };

  const linkBase =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">urbanStay</p>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/admin/pending" className={linkClass}>
            <Clock className="h-4 w-4" /> Pending
            {pendingCount > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/properties" className={linkClass}>
            <Building2 className="h-4 w-4" /> Properties
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <Users className="h-4 w-4" /> Users
          </NavLink>
        </nav>
        <div className="p-3 border-t border-border">
          <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
