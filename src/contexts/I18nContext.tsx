import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi" | "te" | "ta" | "kn";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "home": "Home", "search": "Search", "post": "Post", "chat": "Chat", "profile": "Profile",
    "search_placeholder": "Search city or locality", "easy_home": "Easy Home Rentals & Sales!",
    "verified_listings": "Verified Listings | No Brokerage | Direct Contact",
    "rent": "Rent", "buy": "Buy", "pg": "PG", "commercial": "Commercial",
    "properties_near": "Properties Near You", "view_all": "View All",
    "popular_areas": "Popular Areas", "featured": "Featured Properties",
    "wishlist": "Wishlist", "bookings": "My Bookings", "notifications": "Notifications",
    "recently_viewed": "Recently Viewed", "compare": "Compare Properties",
    "saved_searches": "Saved Searches", "edit_profile": "Edit Profile",
    "install_app": "Install App", "settings": "Settings", "sign_out": "Sign Out",
    "sign_in": "Sign In", "appearance": "Appearance", "language": "Language",
    "light": "Light", "dark": "Dark", "system": "System",
    "beds": "Beds", "bath": "Bath", "description": "Description", "amenities": "Amenities",
    "location": "Location & Nearby", "reviews": "Reviews", "write_review": "Write Review",
    "compare_cta": "Compare with other properties", "call": "Call", "message": "Message",
    "book_visit": "Book Visit", "emi_calculator": "EMI Calculator",
    "monthly_emi": "Monthly EMI", "total_interest": "Total Interest", "total_payment": "Total Payment",
    "loan_amount": "Loan Amount", "tenure": "Tenure", "interest_rate": "Interest Rate",
    "no_results": "Search for properties", "properties_found": "properties found",
    "save_search": "Save Search", "filters": "Filters", "apply": "Apply",
    "price_range": "Price Range", "min_price": "Min Price", "max_price": "Max Price",
    "bedrooms": "Bedrooms", "bathrooms": "Bathrooms", "sort_by": "Sort By",
    "owner_dashboard": "Owner Dashboard", "admin_dashboard": "Admin Dashboard",
    "years": "years", "submit": "Submit",
  },
  hi: {
    "home": "होम", "search": "खोजें", "post": "पोस्ट", "chat": "चैट", "profile": "प्रोफ़ाइल",
    "search_placeholder": "शहर या इलाका खोजें", "easy_home": "आसान किराया और बिक्री!",
    "verified_listings": "सत्यापित लिस्टिंग | कोई ब्रोकरेज नहीं | सीधा संपर्क",
    "rent": "किराया", "buy": "खरीदें", "pg": "PG", "commercial": "कमर्शियल",
    "properties_near": "आसपास की प्रॉपर्टी", "view_all": "सब देखें",
    "popular_areas": "लोकप्रिय इलाके", "featured": "विशेष प्रॉपर्टी",
    "wishlist": "पसंदीदा", "bookings": "मेरी बुकिंग", "notifications": "सूचनाएं",
    "recently_viewed": "हाल में देखा", "compare": "प्रॉपर्टी तुलना",
    "saved_searches": "सेव्ड सर्च", "edit_profile": "प्रोफ़ाइल संपादित करें",
    "install_app": "ऐप इंस्टॉल", "settings": "सेटिंग्स", "sign_out": "साइन आउट",
    "sign_in": "साइन इन", "appearance": "दिखावट", "language": "भाषा",
    "light": "लाइट", "dark": "डार्क", "system": "सिस्टम",
    "beds": "कमरे", "bath": "बाथरूम", "description": "विवरण", "amenities": "सुविधाएं",
    "location": "स्थान और आसपास", "reviews": "समीक्षाएं", "write_review": "समीक्षा लिखें",
    "compare_cta": "अन्य प्रॉपर्टी से तुलना करें", "call": "कॉल", "message": "संदेश",
    "book_visit": "विज़िट बुक करें", "emi_calculator": "EMI कैलकुलेटर",
    "monthly_emi": "मासिक EMI", "total_interest": "कुल ब्याज", "total_payment": "कुल भुगतान",
    "loan_amount": "ऋण राशि", "tenure": "अवधि", "interest_rate": "ब्याज दर",
    "no_results": "प्रॉपर्टी खोजें", "properties_found": "प्रॉपर्टी मिलीं",
    "save_search": "खोज सहेजें", "filters": "फ़िल्टर", "apply": "लागू करें",
    "price_range": "मूल्य सीमा", "min_price": "न्यूनतम मूल्य", "max_price": "अधिकतम मूल्य",
    "bedrooms": "शयनकक्ष", "bathrooms": "बाथरूम", "sort_by": "क्रमबद्ध करें",
    "owner_dashboard": "मालिक डैशबोर्ड", "admin_dashboard": "एडमिन डैशबोर्ड",
    "years": "साल", "submit": "भेजें",
  },
  te: {
    "home": "హోమ్", "search": "వెతుకు", "post": "పోస్ట్", "chat": "చాట్", "profile": "ప్రొఫైల్",
    "search_placeholder": "నగరం లేదా ప్రాంతం వెతకండి", "easy_home": "సులభ అద్దె & అమ్మకాలు!",
    "verified_listings": "ధృవీకరించిన జాబితాలు | బ్రోకరేజ్ లేదు | ప్రత్యక్ష సంప్రదింపు",
    "rent": "అద్దె", "buy": "కొనుగోలు", "pg": "PG", "commercial": "వాణిజ్య",
    "properties_near": "సమీపంలోని ఆస్తులు", "view_all": "అన్నీ చూడండి",
    "popular_areas": "ప్రసిద్ధ ప్రాంతాలు", "featured": "ప్రత్యేక ఆస్తులు",
    "wishlist": "ఇష్టాలు", "bookings": "నా బుకింగ్‌లు", "notifications": "నోటిఫికేషన్‌లు",
    "settings": "సెట్టింగ్‌లు", "sign_in": "సైన్ ఇన్", "sign_out": "సైన్ అవుట్",
    "appearance": "రూపం", "language": "భాష", "light": "లైట్", "dark": "డార్క్", "system": "సిస్టమ్",
    "beds": "పడకలు", "bath": "బాత్", "reviews": "సమీక్షలు", "call": "కాల్", "message": "సందేశం",
    "book_visit": "సందర్శన బుక్", "filters": "ఫిల్టర్‌లు", "apply": "వర్తించు", "submit": "సమర్పించు",
    "years": "సంవత్సరాలు", "emi_calculator": "EMI కాలిక్యులేటర్",
  },
  ta: {
    "home": "முகப்பு", "search": "தேடு", "post": "பதிவு", "chat": "அரட்டை", "profile": "சுயவிவரம்",
    "search_placeholder": "நகரம் அல்லது பகுதி தேடுங்கள்", "easy_home": "எளிய வாடகை & விற்பனை!",
    "verified_listings": "சரிபார்க்கப்பட்ட பட்டியல்கள் | தரகு இல்லை | நேரடி தொடர்பு",
    "rent": "வாடகை", "buy": "வாங்கு", "pg": "PG", "commercial": "வணிக",
    "properties_near": "அருகிலுள்ள சொத்துக்கள்", "view_all": "அனைத்தையும் காண",
    "popular_areas": "பிரபலமான பகுதிகள்", "featured": "சிறப்பு சொத்துக்கள்",
    "wishlist": "விருப்பப்பட்டியல்", "bookings": "என் முன்பதிவுகள்", "notifications": "அறிவிப்புகள்",
    "settings": "அமைப்புகள்", "sign_in": "உள்நுழைய", "sign_out": "வெளியேறு",
    "appearance": "தோற்றம்", "language": "மொழி", "light": "லைட்", "dark": "டார்க்", "system": "சிஸ்டம்",
    "beds": "படுக்கைகள்", "bath": "குளியல்", "reviews": "விமர்சனங்கள்", "call": "அழைப்பு", "message": "செய்தி",
    "book_visit": "வருகை முன்பதிவு", "filters": "வடிகட்டிகள்", "apply": "பொருத்து", "submit": "சமர்ப்பி",
    "years": "ஆண்டுகள்", "emi_calculator": "EMI கால்குலேட்டர்",
  },
  kn: {
    "home": "ಮುಖಪುಟ", "search": "ಹುಡುಕು", "post": "ಪೋಸ್ಟ್", "chat": "ಚಾಟ್", "profile": "ಪ್ರೊಫೈಲ್",
    "search_placeholder": "ನಗರ ಅಥವಾ ಪ್ರದೇಶ ಹುಡುಕಿ", "easy_home": "ಸುಲಭ ಬಾಡಿಗೆ ಮತ್ತು ಮಾರಾಟ!",
    "verified_listings": "ಪರಿಶೀಲಿಸಿದ ಪಟ್ಟಿಗಳು | ಬ್ರೋಕರೇಜ್ ಇಲ್ಲ | ನೇರ ಸಂಪರ್ಕ",
    "rent": "ಬಾಡಿಗೆ", "buy": "ಖರೀದಿ", "pg": "PG", "commercial": "ವಾಣಿಜ್ಯ",
    "properties_near": "ಹತ್ತಿರದ ಆಸ್ತಿಗಳು", "view_all": "ಎಲ್ಲಾ ನೋಡಿ",
    "popular_areas": "ಜನಪ್ರಿಯ ಪ್ರದೇಶಗಳು", "featured": "ವಿಶೇಷ ಆಸ್ತಿಗಳು",
    "wishlist": "ಇಷ್ಟಪಟ್ಟಿ", "bookings": "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "notifications": "ಅಧಿಸೂಚನೆಗಳು",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "sign_in": "ಸೈನ್ ಇನ್", "sign_out": "ಸೈನ್ ಔಟ್",
    "appearance": "ನೋಟ", "language": "ಭಾಷೆ", "light": "ಲೈಟ್", "dark": "ಡಾರ್ಕ್", "system": "ಸಿಸ್ಟಮ್",
    "beds": "ಹಾಸಿಗೆ", "bath": "ಬಾತ್", "reviews": "ವಿಮರ್ಶೆಗಳು", "call": "ಕಾಲ್", "message": "ಸಂದೇಶ",
    "book_visit": "ಭೇಟಿ ಬುಕ್", "filters": "ಫಿಲ್ಟರ್‌ಗಳು", "apply": "ಅನ್ವಯಿಸಿ", "submit": "ಸಲ್ಲಿಸಿ",
    "years": "ವರ್ಷಗಳು", "emi_calculator": "EMI ಕ್ಯಾಲ್ಕುಲೇಟರ್",
  },
};

const languageNames: Record<Language, string> = {
  en: "English", hi: "हिन्दी", te: "తెలుగు", ta: "தமிழ்", kn: "ಕನ್ನಡ",
};

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string }[];
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  languages: [],
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("sahi-jagah-lang") as Language) || "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("sahi-jagah-lang", l);
  };

  const t = (key: string) => translations[lang]?.[key] || translations.en[key] || key;

  const languages = Object.entries(languageNames).map(([code, name]) => ({
    code: code as Language,
    name,
  }));

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </I18nContext.Provider>
  );
};
