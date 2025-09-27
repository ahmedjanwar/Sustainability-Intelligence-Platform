import { ReactNode, useRef, useEffect, useState } from "react";
import { BarChart, Bot, Target, Brain, Sparkles, FileText, Menu, X } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleMobileMenuClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating Navigation Header */}
      <header className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
        <nav className="flex items-center justify-between p-4 pb-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-background/90 backdrop-blur-xl border border-border/50 shadow-lg hover:bg-muted/50 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div 
            ref={navRef}
            className="hidden lg:flex relative items-center space-x-2 overflow-x-auto scrollbar-hide"
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

      {/* Mobile Menu Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold">Navigation</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      isActive 
                        ? "text-primary-foreground" 
                        : "text-muted-foreground group-hover:text-foreground"
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

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