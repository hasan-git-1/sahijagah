import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

interface TranslatedDescriptionProps {
  description: string;
}

const TRANSLATIONS: Record<string, { label: string; translate: (text: string) => string }> = {
  en: { label: "English", translate: (t) => t },
  hi: {
    label: "हिंदी",
    translate: (text) => {
      // Simple keyword-based translation for demo
      const map: Record<string, string> = {
        "bedroom": "बेडरूम", "bathroom": "बाथरूम", "kitchen": "रसोई",
        "spacious": "विशाल", "beautiful": "सुंदर", "modern": "आधुनिक",
        "apartment": "अपार्टमेंट", "house": "मकान", "flat": "फ्लैट",
        "furnished": "सुसज्जित", "semi-furnished": "अर्ध-सुसज्जित",
        "parking": "पार्किंग", "balcony": "बालकनी", "garden": "बगीचा",
        "floor": "मंजिल", "rent": "किराया", "sale": "बिक्री",
        "near": "निकट", "close to": "के पास", "available": "उपलब्ध",
        "well maintained": "अच्छी तरह रखा गया", "gated community": "गेटेड कम्युनिटी",
        "property": "संपत्ति", "located": "स्थित", "area": "क्षेत्र",
      };
      let result = text;
      Object.entries(map).forEach(([en, hi]) => {
        result = result.replace(new RegExp(en, "gi"), hi);
      });
      return result;
    },
  },
  te: {
    label: "తెలుగు",
    translate: (text) => {
      const map: Record<string, string> = {
        "bedroom": "బెడ్‌రూమ్", "bathroom": "బాత్‌రూమ్", "kitchen": "వంటగది",
        "spacious": "విశాలమైన", "beautiful": "అందమైన", "modern": "ఆధునిక",
        "apartment": "అపార్ట్‌మెంట్", "house": "ఇల్లు", "flat": "ఫ్లాట్",
        "furnished": "ఫర్నిష్డ్", "parking": "పార్కింగ్", "balcony": "బాల్కనీ",
        "floor": "అంతస్తు", "rent": "అద్దె", "sale": "అమ్మకం",
        "near": "సమీపంలో", "available": "అందుబాటులో",
        "property": "ఆస్తి", "located": "ఉన్న", "area": "ప్రాంతం",
      };
      let result = text;
      Object.entries(map).forEach(([en, te]) => {
        result = result.replace(new RegExp(en, "gi"), te);
      });
      return result;
    },
  },
  ta: {
    label: "தமிழ்",
    translate: (text) => {
      const map: Record<string, string> = {
        "bedroom": "படுக்கையறை", "bathroom": "குளியலறை", "kitchen": "சமையலறை",
        "spacious": "விசாலமான", "beautiful": "அழகான", "modern": "நவீன",
        "apartment": "அடுக்குமாடி", "house": "வீடு", "flat": "பிளாட்",
        "furnished": "அலங்கரிக்கப்பட்ட", "parking": "நிறுத்துமிடம்",
        "floor": "தளம்", "rent": "வாடகை", "sale": "விற்பனை",
        "near": "அருகில்", "available": "கிடைக்கும்",
        "property": "சொத்து", "area": "பகுதி",
      };
      let result = text;
      Object.entries(map).forEach(([en, ta]) => {
        result = result.replace(new RegExp(en, "gi"), ta);
      });
      return result;
    },
  },
};

const TranslatedDescription = ({ description }: TranslatedDescriptionProps) => {
  const [lang, setLang] = useState("en");
  const [showLangs, setShowLangs] = useState(false);

  if (!description) return null;

  const translated = TRANSLATIONS[lang]?.translate(description) || description;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-foreground">Description</h3>
        <button
          onClick={() => setShowLangs(!showLangs)}
          className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full"
        >
          <Globe className="h-3 w-3" />
          {TRANSLATIONS[lang]?.label}
          <ChevronDown className={`h-3 w-3 transition-transform ${showLangs ? "rotate-180" : ""}`} />
        </button>
      </div>
      {showLangs && (
        <div className="flex gap-1.5 mb-2">
          {Object.entries(TRANSLATIONS).map(([code, { label }]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setShowLangs(false); }}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                lang === code ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed">{translated}</p>
    </div>
  );
};

export default TranslatedDescription;
