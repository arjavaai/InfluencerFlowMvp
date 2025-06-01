import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      return await apiRequest("POST", `/api/user/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Role Selected",
        description: `You're now set up as a ${selectedRole}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select role",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    selectRoleMutation.mutate(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to InfluencerFlow</h1>
          <p className="text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
            onClick={() => handleRoleSelect("brand")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">I'm a Brand</CardTitle>
              <CardDescription>
                I want to find influencers and manage marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Search and discover creators</li>
                <li>• Manage campaigns and offers</li>
                <li>• Track performance and ROI</li>
                <li>• Handle contracts and payments</li>
              </ul>
              <Button 
                className="w-full mt-4" 
                disabled={selectRoleMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("brand");
                }}
              >
                {selectRoleMutation.isPending && selectedRole === "brand" ? "Setting up..." : "Continue as Brand"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
            onClick={() => handleRoleSelect("creator")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">I'm a Creator</CardTitle>
              <CardDescription>
                I want to collaborate with brands and monetize my content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Receive collaboration offers</li>
                <li>• Manage contracts and deliverables</li>
                <li>• Track earnings and payments</li>
                <li>• Monitor performance metrics</li>
              </ul>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                disabled={selectRoleMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("creator");
                }}
              >
                {selectRoleMutation.isPending && selectedRole === "creator" ? "Setting up..." : "Continue as Creator"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}