import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TenantFeedbackForm from "@/components/TenantFeedbackForm";

const FeedbackScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Share Feedback</h2>
      </div>
      <div className="px-4 py-4">
        <TenantFeedbackForm />
      </div>
    </div>
  );
};

export default FeedbackScreen;
