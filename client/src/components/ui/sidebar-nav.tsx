import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Users,
  Handshake,
  File,
  CreditCard,
  ChartLine,
  Gauge,
  Inbox,
  FileSignature,
  Wallet,
  BarChart,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarNavProps {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const iconMap = {
  megaphone: Megaphone,
  users: Users,
  handshake: Handshake,
  "file-contract": File,
  "credit-card": CreditCard,
  "chart-line": ChartLine,
  "tachometer-alt": Gauge,
  inbox: Inbox,
  "file-signature": FileSignature,
  wallet: Wallet,
  "chart-bar": BarChart,
};

export function SidebarNav({ items, activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "nav-item w-full",
                  isActive && "nav-item-active"
                )}
              >
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
