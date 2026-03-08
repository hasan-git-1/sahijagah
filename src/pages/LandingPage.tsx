import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, Download, Globe, Phone, MapPin, Shield, Users, Building, Search, Map, CalendarCheck, MessageSquare, FileText, Briefcase, ChevronRight, Share, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpeg";
import heroBanner from "@/assets/hero-banner.jpg";

const testimonials = [
  { name: "Rajesh Kumar", city: "Hyderabad", rating: 5, message: "Found my dream 2BHK in Gachibowli within a week. No brokerage saved me ₹30,000!" },
  { name: "Priya Sharma", city: "Bengaluru", rating: 4, message: "As an NRI, I could search and book property visits remotely. Amazing platform!" },
  { name: "Amit Patel", city: "Pune", rating: 5, message: "Listed my property and got 10 enquiries in 2 days. Direct owner-tenant connect is brilliant." },
];

const features = [
  { icon: Search, title: "Search by City", desc: "Find properties across 50+ Indian cities" },
  { icon: Map, title: "Map View", desc: "See properties on an interactive map" },
  { icon: CalendarCheck, title: "Book Visits", desc: "Schedule property visits instantly" },
  { icon: MessageSquare, title: "Real-time Chat", desc: "Message owners and agents directly" },
  { icon: FileText, title: "Document Upload", desc: "Securely upload and verify documents" },
  { icon: Briefcase, title: "Lease Management", desc: "Digital agreements with e-signatures" },
];

const categories = [
  { label: "Rent", emoji: "🏠" },
  { label: "Buy", emoji: "🏗️" },
  { label: "PG", emoji: "🛏️" },
  { label: "Commercial", emoji: "🏢" },
];

const useCases = [
  { title: "Property Owners", desc: "List your property for free and connect directly with tenants/buyers", icon: Building },
  { title: "Home Seekers", desc: "Browse verified listings with zero brokerage fees", icon: Users },
  { title: "Agents", desc: "Manage your portfolio and clients efficiently", icon: Briefcase },
  { title: "NRIs", desc: "Search and manage properties remotely from anywhere", icon: Globe },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Capture the beforeinstallprompt event (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for app installed event
    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      navigate("/app");
      return;
    }

    if (isIOS) {
      // iOS: show manual instructions modal
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      // Android Chrome: trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    } else {
      // Desktop / unsupported: go to install instructions page
      navigate("/install");
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("feedback").insert({
        name: feedbackName,
        rating: feedbackRating,
        message: feedbackMessage,
      });
      if (error) throw error;
      setFeedbackSubmitted(true);
    } catch {
      // silently fail
    }
    setFeedbackName("");
    setFeedbackMessage("");
    setFeedbackRating(0);
  };

  // Install button label based on state
  const installLabel = isInstalled
    ? "Already Installed ✓"
    : installSuccess
    ? "Installed! Open App"
    : isIOS
    ? "Add to Home Screen"
    : deferredPrompt
    ? "Install App"
    : "Download / Install App";

  return (
    <div className="min-h-screen bg-background font-display">
      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/60 backdrop-blur-sm px-4 pb-4">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-secondary rounded-xl p-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground text-xs font-bold">1</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Tap the Share button</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Share className="h-3.5 w-3.5" />
                    <span>at the bottom of Safari browser</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-secondary rounded-xl p-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground text-xs font-bold">2</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Scroll down &amp; tap</p>
                  <p className="text-xs text-muted-foreground mt-0.5">"<strong>Add to Home Screen</strong>"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-secondary rounded-xl p-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground text-xs font-bold">3</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Tap "Add"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sahi Jagah will appear on your home screen</p>
                </div>
              </div>
            </div>
            <Button className="w-full mt-5 gradient-blue text-primary-foreground border-0" onClick={() => setShowIOSModal(false)}>
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* Install Success Banner */}
      {installSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-elevated px-5 py-3 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-foreground">App installed successfully!</span>
          <button onClick={() => navigate("/app")} className="text-xs text-primary font-semibold underline">Open</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Sahi Jagah" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-bold text-foreground">Sahi Jagah</span>
          </div>
          <Button size="sm" onClick={() => navigate("/app")} className="gradient-blue text-primary-foreground border-0">
            Open App
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
        </div>
        <div className="relative container py-16 md:py-24 text-center">
          <img src={logo} alt="Sahi Jagah" className="h-20 w-20 rounded-2xl mx-auto mb-5 shadow-elevated object-cover" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-3 leading-tight">
            India's Smartest Property<br />Rental &amp; Sales Platform
          </h1>
          <p className="text-sky-300 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Find, Rent, Buy verified properties in your city — No Brokerage, No Fraud
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleInstall}
              className="gradient-blue text-primary-foreground border-0 text-base font-semibold px-8 gap-2"
            >
              <Download className="h-5 w-5" /> {installLabel}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/app")} className="bg-card/20 backdrop-blur border-primary-foreground/30 text-primary-foreground hover:bg-card/40 text-base font-semibold px-8 gap-2">
              <Globe className="h-5 w-5" /> Open Web App
            </Button>
          </div>
        </div>
      </section>

      {/* What is Sahi Jagah */}
      <section className="container py-14">
        <h2 className="text-2xl font-bold text-center mb-3">What is Sahi Jagah?</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
          Sahi Jagah connects property owners directly with tenants and buyers across India's tier-2 and tier-3 cities — eliminating middlemen, brokerage fees, and fraud.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Verified Listings", desc: "Every property is reviewed and verified by our team" },
            { icon: "₹", title: "Zero Brokerage", desc: "Save thousands — deal directly with owners" },
            { icon: Phone, title: "Direct Owner Contact", desc: "Message or call property owners instantly" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-card text-center animate-fade-in">
              <div className="h-12 w-12 rounded-full gradient-blue flex items-center justify-center mx-auto mb-3">
                {typeof item.icon === "string" ? (
                  <span className="text-primary-foreground text-xl font-bold">{item.icon}</span>
                ) : (
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-secondary py-14">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Who It's For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-card rounded-xl p-5 shadow-card text-center">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <uc.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{uc.title}</h3>
                <p className="text-xs text-muted-foreground">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container py-14">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-xl p-5 shadow-card">
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary py-10">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-6">Property Categories</h2>
          <div className="flex justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate("/app/search")}
                className="bg-card rounded-xl px-6 py-4 shadow-card flex flex-col items-center gap-2 hover:shadow-elevated transition-shadow"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-14">
        <h2 className="text-2xl font-bold text-center mb-8">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`h-4 w-4 ${j < t.rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                ))}
              </div>
              <p className="text-sm text-foreground mb-3">"{t.message}"</p>
              <p className="text-xs font-semibold text-muted-foreground">{t.name}, {t.city}</p>
            </div>
          ))}
        </div>

        {/* Feedback Form */}
        <div className="max-w-md mx-auto bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="font-bold text-lg mb-4 text-center">Share Your Feedback</h3>
          {feedbackSubmitted ? (
            <p className="text-center text-accent font-semibold py-4">Thank you for your feedback! 🎉</p>
          ) : (
            <form onSubmit={handleFeedback} className="space-y-3">
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your Name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                required
              />
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setFeedbackRating(s)}>
                    <Star className={`h-7 w-7 ${s <= feedbackRating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Your message..."
                rows={3}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                required
              />
              <Button type="submit" className="w-full gradient-cta text-accent-foreground border-0 font-semibold">
                Submit Feedback
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Download CTA */}
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-3">
            Download Sahi Jagah App
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Install directly on your Android phone. No Play Store needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleInstall}
              className="gradient-blue text-primary-foreground border-0 text-base font-semibold gap-2"
            >
              <Download className="h-5 w-5" /> {isInstalled ? "Already Installed ✓" : "Download APK / Install"}
            </Button>
            <Button
              size="lg"
              onClick={handleInstall}
              className="gradient-blue text-primary-foreground border-0 text-base font-semibold gap-2"
            >
              ➕ Add to Home Screen
            </Button>
          </div>
          <p className="text-primary-foreground/60 text-xs mt-4">Available on Android 8.0+</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card py-10 border-y border-border">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: "10,000+", label: "Listings" },
            { num: "5,000+", label: "Happy Users" },
            { num: "50+", label: "Cities" },
            { num: "₹0", label: "Brokerage" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-extrabold text-primary">{s.num}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-10">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logo} alt="Sahi Jagah" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-lg font-bold text-background">Sahi Jagah</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted mb-3">
            <Phone className="h-4 w-4" />
            <a href="tel:7093187420" className="text-sm hover:text-background transition-colors">7093187420</a>
          </div>
          <div className="flex justify-center gap-4 text-sm text-muted mb-4">
            <button className="hover:text-background transition-colors">Privacy Policy</button>
            <button className="hover:text-background transition-colors">Terms of Service</button>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Sahi Jagah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
