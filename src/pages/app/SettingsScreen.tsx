import { ArrowLeft, Moon, Sun, Monitor, Bell, Globe, Shield, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const menuItems = [
    { icon: Bell, label: "Notifications", path: "#" },
    { icon: Globe, label: "Language", subtitle: "English", path: "#" },
    { icon: Shield, label: "Privacy Policy", path: "#" },
    { icon: FileText, label: "Terms of Service", path: "#" },
    { icon: HelpCircle, label: "Help & Support", path: "#" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Theme */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <p className="text-sm font-semibold text-foreground mb-3">Appearance</p>
          <div className="flex gap-2">
            {mounted && themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {item.subtitle && <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Sahi Jagah v1.0.0</p>
          <p className="mt-0.5">Made with ❤️ in India</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
