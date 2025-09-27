import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import FileUpload from "@/components/FileUpload";
import DataPreview from "@/components/DataPreview";
import AICopilot from "@/components/AICopilot";
import WhatIfScenarios from "@/components/WhatIfScenarios";
import { MLPredictions } from "@/components/MLPredictions";
import { Reports } from "@/components/Reports";
import AIInsights from "@/components/AIInsights";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview"); // Set overview as default
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Dashboard />;
      case "predictions":
        return <MLPredictions />;
      case "insights":
        return <AIInsights />;
      case "reports":
        return <Reports />;
      case "copilot":
        return <AICopilot />;
      case "whatif":
        return <WhatIfScenarios />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div key={activeTab} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default Index;
