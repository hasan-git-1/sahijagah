import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Deep linking handler for shared property URLs.
 * Handles URLs like /property/:id and redirects to /app/property/:id
 * Also handles UTM parameters for tracking shared links.
 */
const useDeepLink = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle shared property links with ?property=ID
    const propertyId = params.get("property");
    if (propertyId && !location.pathname.includes("/app/property/")) {
      navigate(`/app/property/${propertyId}`, { replace: true });
      return;
    }

    // Handle UTM tracking for shared links
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    if (utmSource) {
      // Store referral info for analytics
      sessionStorage.setItem("referral", JSON.stringify({
        source: utmSource,
        medium: utmMedium || "unknown",
        timestamp: new Date().toISOString(),
      }));
    }
  }, [location, navigate]);
};

/**
 * Generate a deep link URL for a property
 */
export const generateDeepLink = (propertyId: string, source: string = "share") => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/app/property/${propertyId}?utm_source=${source}&utm_medium=deep_link`;
};

/**
 * Generate a short share text with deep link
 */
export const generateShareText = (title: string, price: string, city: string, propertyId: string) => {
  const link = generateDeepLink(propertyId);
  return `🏠 ${title}\n💰 ${price} · 📍 ${city}\n\n👉 ${link}`;
};

export default useDeepLink;
