import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RentVsBuyCalculator from "@/components/RentVsBuyCalculator";
import AreaConverter from "@/components/AreaConverter";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import RentalYieldCalculator from "@/components/RentalYieldCalculator";
import HomeValueEstimator from "@/components/HomeValueEstimator";
import VastuTips from "@/components/VastuTips";
import RegionalAgreementTemplates from "@/components/RegionalAgreementTemplates";

const ToolsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Property Tools</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        <RentVsBuyCalculator />
        <HomeValueEstimator />
        <StampDutyCalculator />
        <RentalYieldCalculator />
        <AreaConverter />
        <RegionalAgreementTemplates />
        <VastuTips />
      </div>
    </div>
  );
};

export default ToolsScreen;
