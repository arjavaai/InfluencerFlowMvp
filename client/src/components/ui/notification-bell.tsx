import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
        <Bell className="h-5 w-5" />
      </Button>
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
      >
        3
      </Badge>
    </div>
  );
}
