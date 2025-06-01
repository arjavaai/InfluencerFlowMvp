import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { NotificationBell } from "@/components/ui/notification-bell";
import { CreatorOverview } from "@/components/creator/creator-overview";
import { IncomingOffers } from "@/components/creator/incoming-offers";
import { CreatorContracts } from "@/components/creator/creator-contracts";
import { CreatorEarnings } from "@/components/creator/creator-earnings";
import { CreatorPerformance } from "@/components/creator/creator-performance";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, LogOut } from "lucide-react";

const creatorNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "tachometer-alt" },
  { id: "offers", label: "Offers", icon: "inbox", badge: 2 },
  { id: "contracts", label: "Contracts", icon: "file-signature" },
  { id: "earnings", label: "Earnings", icon: "wallet" },
  { id: "performance", label: "Performance", icon: "chart-bar" },
];

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <CreatorOverview />;
      case "offers":
        return <IncomingOffers />;
      case "contracts":
        return <CreatorContracts />;
      case "earnings":
        return <CreatorEarnings />;
      case "performance":
        return <CreatorPerformance />;
      default:
        return <CreatorOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">InfluencerFlow AI</h1>
              <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-accent text-white">
                Creator
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile?.profileImageUrl} />
                  <AvatarFallback>
                    <Star className="h-4 w-4 text-accent" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.profile?.displayName || `${user?.firstName} ${user?.lastName}`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <SidebarNav
          items={creatorNavItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
