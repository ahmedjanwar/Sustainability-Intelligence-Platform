import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import FileUpload from "@/components/FileUpload";
import DataPreview from "@/components/DataPreview";
import AICopilot from "@/components/AICopilot";
import WhatIfScenarios from "@/components/WhatIfScenarios";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Set dashboard as default
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "preview":
        return selectedDatasetId ? (
          <DataPreview datasetId={selectedDatasetId} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Upload data first to preview datasets
          </div>
        );
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
      {renderContent()}
    </Layout>
  );
};

export default Index;
