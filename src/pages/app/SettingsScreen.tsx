import { ArrowLeft, Moon, Sun, Monitor, Bell, Globe, Shield, HelpCircle, FileText, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import TwoFactorSetup from "@/components/TwoFactorSetup";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t, languages } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [showLang, setShowLang] = useState(false);

  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: "light", icon: Sun, label: t("light") },
    { value: "dark", icon: Moon, label: t("dark") },
    { value: "system", icon: Monitor, label: t("system") },
  ];

  const currentLangName = languages.find((l) => l.code === lang)?.name || "English";

  const menuItems = [
    { icon: Bell, label: t("notifications"), path: "/app/notifications" },
    { icon: Shield, label: t("privacy_policy"), path: "#" },
    { icon: FileText, label: t("terms_of_service"), path: "#" },
    { icon: HelpCircle, label: t("help_support"), path: "#" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">{t("settings")}</h2>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Theme */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <p className="text-sm font-semibold text-foreground mb-3">{t("appearance")}</p>
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

        {/* Language */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <button onClick={() => setShowLang(!showLang)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{t("language")}</p>
                <p className="text-[10px] text-muted-foreground">{currentLangName}</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showLang ? "rotate-90" : ""}`} />
          </button>
          {showLang && (
            <div className="mt-3 space-y-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLang(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    lang === l.code ? "bg-primary/10" : "hover:bg-secondary/50"
                  }`}
                >
                  <span className={`text-sm font-medium ${lang === l.code ? "text-primary" : "text-foreground"}`}>{l.name}</span>
                  {lang === l.code && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <PushNotificationSetup />

        {/* Two-Factor Auth */}
        <TwoFactorSetup />

        {/* Menu Items */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path !== "#" && navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Sahi Jagah v1.0.0</p>
          <p className="mt-0.5">{t("made_with_love")}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
