import { ReactNode, useRef, useEffect, useState } from "react";
import { BarChart, Bot, Target, Brain, Sparkles, FileText } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart },
    { id: "predictions", label: "ML Predictions", icon: Brain },
    { id: "insights", label: "AI Insights", icon: Sparkles },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "copilot", label: "AI Copilot", icon: Bot },
    { id: "whatif", label: "What-If", icon: Target },
  ];

  useEffect(() => {
    const activeButton = buttonRefs.current[activeTab];
    if (activeButton && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setHighlightStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating Navigation Header */}
      <header className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
        <nav className="flex items-center justify-center p-4 pb-6">
          <div 
            ref={navRef}
            className="relative flex items-center space-x-2 overflow-x-auto scrollbar-hide"
          >
            {/* Sliding Highlight Background */}
            <div
              className="absolute top-2 bottom-2 bg-gradient-to-r from-primary to-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all duration-500 ease-in-out"
              style={{
                left: highlightStyle.left,
                width: highlightStyle.width,
              }}
            />
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => (buttonRefs.current[item.id] = el)}
                  onClick={() => onTabChange(item.id)}
                  className={`group relative z-10 flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-500 ease-in-out rounded-xl whitespace-nowrap ${
                    isActive
                      ? "text-primary-foreground scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-all duration-500 ease-in-out ${
                    isActive 
                      ? "scale-110 text-primary-foreground drop-shadow-sm" 
                      : "group-hover:scale-110 group-hover:drop-shadow-sm"
                  }`} />
                  <span className="hidden sm:inline transition-all duration-500 ease-in-out font-medium">
                    {item.label}
                  </span>
                  <span className="sm:hidden transition-all duration-500 ease-in-out font-medium">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;