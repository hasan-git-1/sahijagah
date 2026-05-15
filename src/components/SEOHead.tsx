import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  /** When true, the title is used as-is without the " | urbanStay" suffix. */
  rawTitle?: boolean;
}

const DEFAULT_TITLE = "urbanStay - Find Your Perfect Home";
const DEFAULT_DESC =
  "Find verified rental, sale, PG & commercial properties across India. No brokerage, direct owner contact.";
const BRAND_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/71083390-ef64-47e3-a998-cde60afc015c/id-preview-444fe048--d0e94ad2-7f31-4268-b996-d1930a441899.lovable.app-1773007606194.png";

const SEOHead = ({ title, description, image, url, rawTitle }: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title
      ? rawTitle
        ? title
        : `${title} | urbanStay`
      : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const img = image || BRAND_OG_IMAGE;
    const pageUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", img);
    setMeta("property", "og:url", pageUrl);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);
  }, [title, description, image, url, rawTitle]);

  return null;
};

export default SEOHead;
