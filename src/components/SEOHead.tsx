import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEOHead = ({ title, description, image, url }: SEOHeadProps) => {
  useEffect(() => {
    const suffix = " | Sahi Jagah";
    const fullTitle = title ? `${title}${suffix}` : "Sahi Jagah - Find Your Perfect Home";
    const desc = description || "Find verified rental, sale, PG & commercial properties across India.";
    const img = image || "https://lovable.dev/opengraph-image-p98pqg.png";
    const pageUrl = url || window.location.href;

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
  }, [title, description, image, url]);

  return null;
};

export default SEOHead;
