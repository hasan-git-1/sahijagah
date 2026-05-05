import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi" | "te";

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    home: "Home", search: "Search", post: "Post", chat: "Chat", profile: "Profile",
    // Home
    search_placeholder: "Search city or locality",
    easy_home: "Easy Home Rentals & Sales!",
    verified_listings: "Verified Listings | No Brokerage | Direct Contact",
    rent: "Rent", buy: "Buy", pg: "PG", commercial: "Commercial",
    properties_near: "Popular Areas Near You", view_all: "View All",
    popular_areas: "Popular Areas", featured: "Featured Properties",
    properties: "properties",
    // Profile menu
    wishlist: "Wishlist", my_bookings: "My Bookings", notifications: "Notifications",
    recently_viewed: "Recently Viewed", compare_properties: "Compare Properties",
    saved_searches: "Saved Searches", verify_identity: "Verify Identity",
    city_analytics: "City Analytics", property_tools: "Property Tools",
    landlord_dashboard: "Landlord Dashboard", share_feedback: "Share Feedback",
    edit_profile: "Edit Profile", install_app: "Install App", settings: "Settings",
    sign_out: "Sign Out", sign_in: "Sign In", sign_in_register: "Sign In / Register",
    sign_in_access: "Sign in to access all features",
    admin_dashboard: "Admin Dashboard", owner_dashboard: "Owner Dashboard",
    owner_analytics: "Owner Analytics", log_out: "Log Out",
    // Settings
    appearance: "Appearance", language: "Language",
    light: "Light", dark: "Dark", system: "System",
    privacy_policy: "Privacy Policy", terms_of_service: "Terms of Service",
    help_support: "Help & Support", push_notifications: "Push Notifications",
    two_factor_auth: "Two-Factor Authentication",
    made_with_love: "Made with ❤️ in India",
    // Search
    properties_found: "properties found", no_results: "Search for properties",
    try_searching: "Try searching \"Hyderabad\", \"Bengaluru\", or \"Pune\"",
    save: "Save", map: "Map", heatmap: "Heatmap",
    filters: "Filters", apply: "Apply",
    price_range: "Price Range", min_price: "Min Price", max_price: "Max Price",
    bedrooms: "Bedrooms", bathrooms: "Bathrooms", sort_by: "Sort By",
    save_search: "Save Search",
    // Property Detail
    beds: "Beds", bath: "Bath", description: "Description", amenities: "Amenities",
    location: "Location & Nearby", reviews: "Reviews", write_review: "Write Review",
    compare_cta: "Compare", call: "Call", message: "Message", book_visit: "Visit",
    views: "views", share_card: "Share Card",
    quick_contact: "Quick Contact", listing_timeline: "Listing Timeline",
    safety_score: "Safety Score", nearby_transport: "Nearby Transport",
    commute_estimator: "Commute Estimator", neighborhood_reviews: "Neighborhood Reviews",
    similar_properties: "Similar Properties", report: "Report",
    // Tools
    emi_calculator: "EMI Calculator", monthly_emi: "Monthly EMI",
    total_interest: "Total Interest", total_payment: "Total Payment",
    loan_amount: "Loan Amount", tenure: "Tenure", interest_rate: "Interest Rate",
    years: "years", submit: "Submit",
    rent_vs_buy: "Rent vs Buy Calculator", area_converter: "Area Converter",
    stamp_duty: "Stamp Duty Calculator", rental_yield: "Rental Yield Calculator",
    home_value: "Home Value Estimator", vastu_tips: "Vastu Tips",
    rent_agreement: "Rent Agreement", rent_receipt: "Rent Receipt",
    // General
    cancel: "Cancel", close: "Close", confirm: "Confirm", delete: "Delete",
    loading: "Loading...", error: "Error", success: "Success",
    guest_user: "Guest User", user: "User",
  },
  hi: {
    // Nav
    home: "होम", search: "खोजें", post: "पोस्ट", chat: "चैट", profile: "प्रोफ़ाइल",
    // Home
    search_placeholder: "शहर या इलाका खोजें",
    easy_home: "आसान किराया और बिक्री!",
    verified_listings: "सत्यापित लिस्टिंग | कोई ब्रोकरेज नहीं | सीधा संपर्क",
    rent: "किराया", buy: "खरीदें", pg: "PG", commercial: "कमर्शियल",
    properties_near: "आसपास के लोकप्रिय इलाके", view_all: "सब देखें",
    popular_areas: "लोकप्रिय इलाके", featured: "विशेष प्रॉपर्टी",
    properties: "प्रॉपर्टी",
    // Profile menu
    wishlist: "पसंदीदा", my_bookings: "मेरी बुकिंग", notifications: "सूचनाएं",
    recently_viewed: "हाल में देखा", compare_properties: "प्रॉपर्टी तुलना",
    saved_searches: "सेव्ड सर्च", verify_identity: "पहचान सत्यापित करें",
    city_analytics: "शहर विश्लेषण", property_tools: "प्रॉपर्टी उपकरण",
    landlord_dashboard: "मकान मालिक डैशबोर्ड", share_feedback: "प्रतिक्रिया दें",
    edit_profile: "प्रोफ़ाइल संपादित करें", install_app: "ऐप इंस्टॉल करें", settings: "सेटिंग्स",
    sign_out: "साइन आउट", sign_in: "साइन इन", sign_in_register: "साइन इन / रजिस्टर",
    sign_in_access: "सभी सुविधाओं के लिए साइन इन करें",
    admin_dashboard: "एडमिन डैशबोर्ड", owner_dashboard: "मालिक डैशबोर्ड",
    owner_analytics: "मालिक विश्लेषण", log_out: "लॉग आउट",
    // Settings
    appearance: "दिखावट", language: "भाषा",
    light: "लाइट", dark: "डार्क", system: "सिस्टम",
    privacy_policy: "गोपनीयता नीति", terms_of_service: "सेवा की शर्तें",
    help_support: "सहायता और समर्थन", push_notifications: "पुश सूचनाएं",
    two_factor_auth: "दो-कारक प्रमाणीकरण",
    made_with_love: "❤️ से भारत में बनाया गया",
    // Search
    properties_found: "प्रॉपर्टी मिलीं", no_results: "प्रॉपर्टी खोजें",
    try_searching: "\"हैदराबाद\", \"बेंगलुरू\", या \"पुणे\" खोजें",
    save: "सहेजें", map: "नक्शा", heatmap: "हीटमैप",
    filters: "फ़िल्टर", apply: "लागू करें",
    price_range: "मूल्य सीमा", min_price: "न्यूनतम मूल्य", max_price: "अधिकतम मूल्य",
    bedrooms: "शयनकक्ष", bathrooms: "बाथरूम", sort_by: "क्रमबद्ध करें",
    save_search: "खोज सहेजें",
    // Property Detail
    beds: "कमरे", bath: "बाथ", description: "विवरण", amenities: "सुविधाएं",
    location: "स्थान और आसपास", reviews: "समीक्षाएं", write_review: "समीक्षा लिखें",
    compare_cta: "तुलना करें", call: "कॉल", message: "संदेश", book_visit: "विज़िट",
    views: "व्यूज़", share_card: "शेयर कार्ड",
    quick_contact: "त्वरित संपर्क", listing_timeline: "लिस्टिंग टाइमलाइन",
    safety_score: "सुरक्षा स्कोर", nearby_transport: "नज़दीकी परिवहन",
    commute_estimator: "यात्रा अनुमान", neighborhood_reviews: "इलाके की समीक्षाएं",
    similar_properties: "समान प्रॉपर्टी", report: "रिपोर्ट",
    // Tools
    emi_calculator: "EMI कैलकुलेटर", monthly_emi: "मासिक EMI",
    total_interest: "कुल ब्याज", total_payment: "कुल भुगतान",
    loan_amount: "ऋण राशि", tenure: "अवधि", interest_rate: "ब्याज दर",
    years: "साल", submit: "भेजें",
    rent_vs_buy: "किराया बनाम खरीद कैलकुलेटर", area_converter: "क्षेत्र कनवर्टर",
    stamp_duty: "स्टाम्प ड्यूटी कैलकुलेटर", rental_yield: "किराया उपज कैलकुलेटर",
    home_value: "घर मूल्य अनुमानक", vastu_tips: "वास्तु टिप्स",
    rent_agreement: "किराया अनुबंध", rent_receipt: "किराया रसीद",
    // General
    cancel: "रद्द करें", close: "बंद करें", confirm: "पुष्टि करें", delete: "हटाएं",
    loading: "लोड हो रहा है...", error: "त्रुटि", success: "सफल",
    guest_user: "अतिथि उपयोगकर्ता", user: "उपयोगकर्ता",
  },
  te: {
    // Nav
    home: "హోమ్", search: "వెతుకు", post: "పోస్ట్", chat: "చాట్", profile: "ప్రొఫైల్",
    // Home
    search_placeholder: "నగరం లేదా ప్రాంతం వెతకండి",
    easy_home: "సులభ అద్దె & అమ్మకాలు!",
    verified_listings: "ధృవీకరించిన జాబితాలు | బ్రోకరేజ్ లేదు | ప్రత్యక్ష సంప్రదింపు",
    rent: "అద్దె", buy: "కొనుగోలు", pg: "PG", commercial: "వాణిజ్య",
    properties_near: "సమీపంలోని ప్రసిద్ధ ప్రాంతాలు", view_all: "అన్నీ చూడండి",
    popular_areas: "ప్రసిద్ధ ప్రాంతాలు", featured: "ప్రత్యేక ఆస్తులు",
    properties: "ఆస్తులు",
    // Profile menu
    wishlist: "ఇష్టాలు", my_bookings: "నా బుకింగ్‌లు", notifications: "నోటిఫికేషన్‌లు",
    recently_viewed: "ఇటీవల చూసినవి", compare_properties: "ఆస్తుల పోలిక",
    saved_searches: "సేవ్ చేసిన శోధనలు", verify_identity: "గుర్తింపు ధృవీకరించండి",
    city_analytics: "నగర విశ్లేషణ", property_tools: "ఆస్తి సాధనాలు",
    landlord_dashboard: "యజమాని డాష్‌బోర్డ్", share_feedback: "అభిప్రాయం తెలపండి",
    edit_profile: "ప్రొఫైల్ సవరించు", install_app: "యాప్ ఇన్‌స్టాల్", settings: "సెట్టింగ్‌లు",
    sign_out: "సైన్ అవుట్", sign_in: "సైన్ ఇన్", sign_in_register: "సైన్ ఇన్ / రిజిస్టర్",
    sign_in_access: "అన్ని ఫీచర్లకు సైన్ ఇన్ చేయండి",
    admin_dashboard: "అడ్మిన్ డాష్‌బోర్డ్", owner_dashboard: "యజమాని డాష్‌బోర్డ్",
    owner_analytics: "యజమాని విశ్లేషణ", log_out: "లాగ్ అవుట్",
    // Settings
    appearance: "రూపం", language: "భాష",
    light: "లైట్", dark: "డార్క్", system: "సిస్టమ్",
    privacy_policy: "గోప్యతా విధానం", terms_of_service: "సేవా నిబంధనలు",
    help_support: "సహాయం & మద్దతు", push_notifications: "పుష్ నోటిఫికేషన్‌లు",
    two_factor_auth: "రెండు-అంచెల ధృవీకరణ",
    made_with_love: "❤️ తో భారతదేశంలో తయారు చేయబడింది",
    // Search
    properties_found: "ఆస్తులు దొరికాయి", no_results: "ఆస్తులు వెతకండి",
    try_searching: "\"హైదరాబాద్\", \"బెంగళూరు\", లేదా \"పుణె\" వెతకండి",
    save: "సేవ్", map: "మ్యాప్", heatmap: "హీట్‌మ్యాప్",
    filters: "ఫిల్టర్‌లు", apply: "వర్తింపజేయి",
    price_range: "ధర పరిధి", min_price: "కనిష్ట ధర", max_price: "గరిష్ట ధర",
    bedrooms: "పడకగదులు", bathrooms: "బాత్‌రూమ్‌లు", sort_by: "క్రమపరచు",
    save_search: "శోధన సేవ్ చేయి",
    // Property Detail
    beds: "పడకలు", bath: "బాత్", description: "వివరణ", amenities: "సౌకర్యాలు",
    location: "స్థానం & సమీపంలో", reviews: "సమీక్షలు", write_review: "సమీక్ష రాయండి",
    compare_cta: "పోల్చండి", call: "కాల్", message: "సందేశం", book_visit: "సందర్శన",
    views: "వీక్షణలు", share_card: "షేర్ కార్డ్",
    quick_contact: "త్వరిత సంప్రదింపు", listing_timeline: "జాబితా టైమ్‌లైన్",
    safety_score: "భద్రతా స్కోరు", nearby_transport: "సమీప రవాణా",
    commute_estimator: "ప్రయాణ అంచనా", neighborhood_reviews: "పరిసర సమీక్షలు",
    similar_properties: "సారూప్య ఆస్తులు", report: "నివేదిక",
    // Tools
    emi_calculator: "EMI కాలిక్యులేటర్", monthly_emi: "నెలవారీ EMI",
    total_interest: "మొత్తం వడ్డీ", total_payment: "మొత్తం చెల్లింపు",
    loan_amount: "రుణ మొత్తం", tenure: "కాలం", interest_rate: "వడ్డీ రేటు",
    years: "సంవత్సరాలు", submit: "సమర్పించు",
    rent_vs_buy: "అద్దె vs కొనుగోలు కాలిక్యులేటర్", area_converter: "విస్తీర్ణ కన్వర్టర్",
    stamp_duty: "స్టాంప్ డ్యూటీ కాలిక్యులేటర్", rental_yield: "అద్దె దిగుబడి కాలిక్యులేటర్",
    home_value: "ఇంటి విలువ అంచనా", vastu_tips: "వాస్తు చిట్కాలు",
    rent_agreement: "అద్దె ఒప్పందం", rent_receipt: "అద్దె రసీదు",
    // General
    cancel: "రద్దు", close: "మూసివేయి", confirm: "నిర్ధారించు", delete: "తొలగించు",
    loading: "లోడ్ అవుతోంది...", error: "లోపం", success: "విజయం",
    guest_user: "అతిథి వినియోగదారు", user: "వినియోగదారు",
  },
};

const languageNames: Record<Language, string> = {
  en: "English", hi: "हिन्दी", te: "తెలుగు",
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
    const saved = localStorage.getItem("urbanstay-lang") as Language;
    return saved && ["en", "hi", "te"].includes(saved) ? saved : "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("urbanstay-lang", l);
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
