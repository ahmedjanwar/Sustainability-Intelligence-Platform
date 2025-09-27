import { ReactNode } from "react";
import { BarChart, Bot, Target } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "copilot", label: "AI Copilot", icon: Bot },
    { id: "whatif", label: "What-If", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6">
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-success"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-success" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;