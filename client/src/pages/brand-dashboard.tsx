import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { NotificationBell } from "@/components/ui/notification-bell";
import { CampaignManagement } from "@/components/brand/campaign-management";
import { CreatorSearch } from "@/components/brand/creator-search";
import { OffersManagement } from "@/components/brand/offers-management";
import { ContractsManagement } from "@/components/brand/contracts-management";
import { PaymentsManagement } from "@/components/brand/payments-management";
import { ReportsDashboard } from "@/components/brand/reports-dashboard";
import { Button } from "@/components/ui/button";
import { Building, LogOut } from "lucide-react";

const brandNavItems = [
  { id: "campaigns", label: "Campaigns", icon: "megaphone" },
  { id: "creators", label: "Find Creators", icon: "users" },
  { id: "offers", label: "Offers & Deals", icon: "handshake" },
  { id: "contracts", label: "Contracts", icon: "file-contract" },
  { id: "payments", label: "Payments", icon: "credit-card" },
  { id: "reports", label: "Reports", icon: "chart-line" },
];

export default function BrandDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("campaigns");

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "campaigns":
        return <CampaignManagement />;
      case "creators":
        return <CreatorSearch />;
      case "offers":
        return <OffersManagement />;
      case "contracts":
        return <ContractsManagement />;
      case "payments":
        return <PaymentsManagement />;
      case "reports":
        return <ReportsDashboard />;
      default:
        return <CampaignManagement onSectionChange={setActiveSection} />;
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
              <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                Brand
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.profile?.companyName || "Brand User"}
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
          items={brandNavItems}
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
