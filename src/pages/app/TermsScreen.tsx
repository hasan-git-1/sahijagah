import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "These Terms of Service govern your use of urbanStay, a platform that connects property owners directly with tenants and buyers in India's tier-2 and tier-3 cities. By creating an account, publishing a listing or browsing the app, you agree to these terms.",
    ],
  },
  {
    title: "2. Who Can Use urbanStay",
    body: [
      "You must be at least 18 years old and legally able to enter into a rental or sale agreement in India.",
      "You must provide accurate account details and keep your login credentials confidential. You are responsible for all activity under your account.",
    ],
  },
  {
    title: "3. Our Role",
    body: [
      "urbanStay is a listing and communication platform. We are not a broker, agent, landlord, tenant or party to any agreement you form with another user.",
      "We do not collect rent, deposits, brokerage or any transaction payment. All financial arrangements happen directly between the owner and the tenant or buyer, outside the app.",
      "We do not guarantee the accuracy, availability, legality or condition of any property listed by a user. Always inspect a property and verify documents before paying anyone.",
    ],
  },
  {
    title: "4. Listing Rules for Owners",
    body: [
      "You may only list a property you own or are legally authorised to advertise.",
      "Photos must be genuine photographs of the actual property. Stock imagery, AI-generated images, misleading edits and photos of a different property are prohibited.",
      "Prices, area, availability and amenities must be accurate and kept up to date.",
      "Listings pass through an automated authenticity review. Listings that fail the review may be rejected or removed, and repeat violations may lead to account suspension.",
    ],
  },
  {
    title: "5. Conduct Rules for All Users",
    body: [
      "Do not post unlawful, discriminatory, abusive, obscene or harassing content, including in chat messages.",
      "Do not spam, scrape, reverse-engineer, overload or attempt to gain unauthorised access to the platform.",
      "Do not impersonate another person or misrepresent your relationship to a property.",
      "Do not use urbanStay to advertise brokerage services or to collect brokerage fees.",
    ],
  },
  {
    title: "6. Content and Licence",
    body: [
      "You retain ownership of the photos, videos and text you upload. By uploading, you grant urbanStay a non-exclusive licence to host, display, resize and distribute that content within the app for the purpose of promoting your listing.",
      "You confirm you have the rights to any content you upload and that it does not infringe anyone else's rights.",
    ],
  },
  {
    title: "7. Messaging",
    body: [
      "Conversations happen inside the app and your history is retained until you delete a message or conversation. Deleting a conversation removes it from your view.",
      "Never share bank details, OTPs or passwords in chat. Treat requests for advance payment before an in-person visit as a red flag.",
    ],
  },
  {
    title: "8. Moderation and Termination",
    body: [
      "We may remove content, restrict features or suspend accounts that violate these terms or harm other users.",
      "You may stop using urbanStay at any time and request account deletion.",
    ],
  },
  {
    title: "9. Disclaimers and Limitation of Liability",
    body: [
      "The platform is provided on an \"as is\" and \"as available\" basis, without warranties of any kind.",
      "To the maximum extent permitted by law, urbanStay is not liable for indirect or consequential losses, nor for disputes, damages or losses arising from any agreement, payment or interaction between users.",
    ],
  },
  {
    title: "10. Governing Law",
    body: [
      "These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the competent courts in India.",
    ],
  },
  {
    title: "11. Changes to These Terms",
    body: [
      "We may update these terms as the product evolves. Material changes will be announced in the app, and continued use means you accept the revised terms.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "Questions about these terms can be sent through Help & Support or the feedback form in the app.",
    ],
  },
];

const TermsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <SEOHead
        title="Terms of Service | urbanStay"
        description="The rules for using urbanStay, the direct owner-to-tenant property platform for India."
      />
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Terms of Service</h1>
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

export default TermsScreen;
