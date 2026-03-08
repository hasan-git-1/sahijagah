import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EngagementEvent {
  type: "page_view" | "click" | "search" | "wishlist" | "booking" | "share";
  target?: string;
  metadata?: Record<string, string>;
}

const useEngagementTracking = (pageName: string) => {
  const { user } = useAuth();
  const startTime = useRef(Date.now());
  const eventsRef = useRef<EngagementEvent[]>([]);

  // Track page view duration
  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      if (!user) return;
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      // Store engagement data in localStorage for aggregation
      const key = `engagement_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({
        page: pageName,
        duration,
        events: eventsRef.current,
        timestamp: new Date().toISOString(),
      });
      // Keep last 100 entries
      const trimmed = existing.slice(-100);
      localStorage.setItem(key, JSON.stringify(trimmed));
      eventsRef.current = [];
    };
  }, [pageName, user]);

  const trackEvent = (event: EngagementEvent) => {
    eventsRef.current.push(event);
  };

  const getEngagementSummary = () => {
    if (!user) return null;
    const key = `engagement_${user.id}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    const totalTime = data.reduce((s: number, d: any) => s + (d.duration || 0), 0);
    const pageViews = data.length;
    const topPages = data.reduce((acc: Record<string, number>, d: any) => {
      acc[d.page] = (acc[d.page] || 0) + 1;
      return acc;
    }, {});
    return { totalTime, pageViews, topPages };
  };

  return { trackEvent, getEngagementSummary };
};

export default useEngagementTracking;
