import { useState } from "react";
import { ArrowLeft, MapPin, Users, Star, Phone, Mail, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const agents = [
  { id: "1", name: "Rajesh Kumar", photo: null, city: "Hyderabad", areas: ["Gachibowli", "Kondapur", "Madhapur"], rating: 4.8, deals: 120, phone: "+91 98765 43210", email: "rajesh@sahijagah.in", speciality: "Residential" },
  { id: "2", name: "Priya Sharma", photo: null, city: "Bengaluru", areas: ["Whitefield", "Marathahalli", "Sarjapur"], rating: 4.9, deals: 95, phone: "+91 98765 43211", email: "priya@sahijagah.in", speciality: "Luxury" },
  { id: "3", name: "Amit Patel", photo: null, city: "Pune", areas: ["Hinjewadi", "Baner", "Wakad"], rating: 4.7, deals: 80, phone: "+91 98765 43212", email: "amit@sahijagah.in", speciality: "Commercial" },
  { id: "4", name: "Sneha Reddy", photo: null, city: "Hyderabad", areas: ["Jubilee Hills", "Banjara Hills", "Film Nagar"], rating: 4.9, deals: 150, phone: "+91 98765 43213", email: "sneha@sahijagah.in", speciality: "Luxury" },
  { id: "5", name: "Vikram Singh", photo: null, city: "Mumbai", areas: ["Andheri", "Bandra", "Powai"], rating: 4.6, deals: 200, phone: "+91 98765 43214", email: "vikram@sahijagah.in", speciality: "Residential" },
  { id: "6", name: "Kavitha Nair", photo: null, city: "Chennai", areas: ["OMR", "Adyar", "Velachery"], rating: 4.8, deals: 70, phone: "+91 98765 43215", email: "kavitha@sahijagah.in", speciality: "PG/Co-Living" },
];

const cities = ["All", "Hyderabad", "Bengaluru", "Pune", "Mumbai", "Chennai"];

const AgentMatchingScreen = () => {
  const navigate = useNavigate();
  const [cityFilter, setCityFilter] = useState("All");
  const [contacted, setContacted] = useState<string[]>([]);

  const filtered = cityFilter === "All" ? agents : agents.filter((a) => a.city === cityFilter);

  const handleContact = (agent: typeof agents[0]) => {
    setContacted([...contacted, agent.id]);
    toast.success(`Request sent to ${agent.name}! They'll reach out soon.`);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Find an Agent</h2>
      </div>

      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                cityFilter === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {filtered.map((agent) => (
          <div key={agent.id} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">{agent.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">{agent.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {agent.city}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">
                    <Star className="h-3 w-3 fill-current" /> {agent.rating}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{agent.deals} deals</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.areas.map((a) => (
                    <span key={a} className="text-[9px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
                <span className="inline-block mt-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {agent.speciality}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <a href={`tel:${agent.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
              </a>
              <Button
                onClick={() => handleContact(agent)}
                disabled={contacted.includes(agent.id)}
                size="sm"
                className="flex-1 gradient-blue text-primary-foreground border-0 gap-1.5 text-xs"
              >
                <Mail className="h-3.5 w-3.5" />
                {contacted.includes(agent.id) ? "Requested" : "Contact"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentMatchingScreen;
