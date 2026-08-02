import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const sections = [
  {
    title: "1. Introduction",
    body: [
      "urbanStay is a direct owner-to-tenant and owner-to-buyer property platform for India's tier-2 and tier-3 cities. This Privacy Policy explains what information we collect when you use the urbanStay app or website, why we collect it, how it is stored, and the choices you have.",
      "By creating an account or browsing listings, you agree to the practices described here.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "Account information: your name, email address, phone number and optional profile photo, provided when you sign up or edit your profile.",
      "Listing information: property details, photos, videos, pricing, amenities and the map location you attach to a listing you publish.",
      "Usage information: properties you view, save to wishlists, compare or search for, used to improve recommendations.",
      "Location data: only when you explicitly grant permission, used to show nearby popular areas and properties. Location is never stored on our servers as a tracking history.",
      "Messages: conversations you exchange with owners or tenants inside the app, stored so your chat history is available across devices until you delete it.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    body: [
      "To operate core features: publishing listings, searching, saving favourites, booking visits and messaging.",
      "To connect you directly with property owners or interested tenants without middlemen.",
      "To run automated safety checks on listing photos and content, helping us detect fake, stock or AI-generated images.",
      "To send you notifications you have opted into, such as replies to your messages or updates on your listing status.",
      "To keep the platform secure, prevent fraud and enforce our Terms of Service.",
    ],
  },
  {
    title: "4. Sharing Your Information",
    body: [
      "We do not sell your personal data. Your phone number and email are shared only with the counterparty of a listing when you choose to reveal contact details or start a conversation.",
      "Publicly visible profile fields are limited to your display name, profile photo and verification status.",
      "We use trusted infrastructure providers for hosting, database storage and AI processing. They process data on our behalf under contractual confidentiality obligations.",
      "We may disclose information where required by applicable Indian law or a valid legal request.",
    ],
  },
  {
    title: "5. Data Storage and Security",
    body: [
      "Data is stored in a managed Postgres database protected by row-level security policies, so each account can only read the records it is entitled to.",
      "Profile photos are kept in a private storage bucket and served through short-lived signed URLs.",
      "Passwords are hashed and never visible to us. Leaked-password protection and optional two-factor authentication are available in Settings.",
    ],
  },
  {
    title: "6. Your Rights and Choices",
    body: [
      "You can view and edit your profile information at any time from Settings.",
      "You can delete individual messages or whole conversations from the Chat screen.",
      "You can remove a listing you published from your owner dashboard.",
      "You can revoke location and notification permissions from your device settings at any time.",
      "You can request deletion of your account and associated personal data by contacting us.",
    ],
  },
  {
    title: "7. Children's Privacy",
    body: [
      "urbanStay is not intended for anyone under 18. We do not knowingly collect information from children.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy as the product evolves. Material changes will be announced in the app. Continued use after an update means you accept the revised policy.",
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      "For any privacy question or data request, reach us through the Help & Support option in Settings, or via the feedback form in the app.",
    ],
  },
];

const PrivacyPolicyScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <SEOHead
        title="Privacy Policy | urbanStay"
        description="How urbanStay collects, uses, stores and protects your personal information."
      />
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
      </div>

      <main className="px-4 py-6 pb-24 max-w-3xl mx-auto space-y-6">
        <p className="text-xs text-muted-foreground">Last updated: 2 August 2026</p>
        {sections.map((s) => (
          <section key={s.title} className="bg-card rounded-2xl p-4 shadow-card space-y-2">
            <h2 className="text-sm font-bold text-foreground">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-[13px] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
};

export default PrivacyPolicyScreen;
