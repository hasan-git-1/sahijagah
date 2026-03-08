import { ArrowLeft, Users, MapPin, Briefcase, Moon, Music, Dumbbell, Coffee, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface CoLivingProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  city: string;
  budget: number;
  preferences: string[];
  matchScore: number;
  photo?: string;
}

const preferenceTags = ["Early Riser", "Night Owl", "Non-Smoker", "Vegetarian", "Pet Friendly", "Gym Goer", "WFH", "Music Lover", "Clean Freak", "Introvert", "Social"];

const prefIcons: Record<string, React.ElementType> = {
  "Night Owl": Moon, "Music Lover": Music, "Gym Goer": Dumbbell, "WFH": Briefcase, "Social": Coffee,
};

const mockProfiles: CoLivingProfile[] = [
  { id: "1", name: "Arjun K", age: 26, occupation: "Software Engineer", city: "Bengaluru", budget: 12000, preferences: ["Early Riser", "Non-Smoker", "Gym Goer", "Clean Freak"], matchScore: 92 },
  { id: "2", name: "Sneha M", age: 24, occupation: "Designer", city: "Bengaluru", budget: 10000, preferences: ["Night Owl", "Vegetarian", "Music Lover", "WFH"], matchScore: 85 },
  { id: "3", name: "Ravi P", age: 28, occupation: "Data Analyst", city: "Hyderabad", budget: 8000, preferences: ["Non-Smoker", "WFH", "Introvert", "Clean Freak"], matchScore: 78 },
  { id: "4", name: "Meera S", age: 25, occupation: "Marketing Executive", city: "Pune", budget: 11000, preferences: ["Early Riser", "Social", "Gym Goer", "Pet Friendly"], matchScore: 71 },
];

const CoLivingMatcherScreen = () => {
  const navigate = useNavigate();
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [city, setCity] = useState("All");
  const [showSetup, setShowSetup] = useState(true);

  const cities = ["All", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Chennai"];

  const togglePref = (p: string) => {
    setSelectedPrefs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const filtered = mockProfiles
    .filter((p) => city === "All" || p.city === city)
    .sort((a, b) => b.matchScore - a.matchScore);

  const handleConnect = (name: string) => {
    toast.success(`Connection request sent to ${name}!`);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Co-Living Matcher</h2>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Preferences Setup */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <button onClick={() => setShowSetup(!showSetup)} className="w-full flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">Your Preferences</h3>
            <span className="text-[10px] text-primary font-semibold">{selectedPrefs.length} selected</span>
          </button>
          {showSetup && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {preferenceTags.map((p) => (
                  <button key={p} onClick={() => togglePref(p)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedPrefs.includes(p) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {cities.map((c) => (
                  <button key={c} onClick={() => setCity(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${city === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Matches */}
        <h3 className="font-bold text-foreground text-sm">{filtered.length} Potential Roommates</h3>
        {filtered.map((profile) => (
          <div key={profile.id} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">{profile.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground text-sm">{profile.name}, {profile.age}</p>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-extrabold text-primary">{profile.matchScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {profile.occupation}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.city} · Budget: ₹{profile.budget.toLocaleString("en-IN")}/mo
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.preferences.map((pref) => {
                const Icon = prefIcons[pref];
                return (
                  <span key={pref} className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${selectedPrefs.includes(pref) ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {Icon && <Icon className="h-3 w-3" />} {pref}
                  </span>
                );
              })}
            </div>

            <Button onClick={() => handleConnect(profile.name)} size="sm" className="w-full mt-3 gradient-blue text-primary-foreground border-0 gap-2 text-xs">
              <Users className="h-3.5 w-3.5" /> Connect
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoLivingMatcherScreen;
