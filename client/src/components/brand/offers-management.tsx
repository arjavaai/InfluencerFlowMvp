import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { File } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function OffersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/offers"],
  });

  const generateContractMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const offer = offers?.find((o: any) => o.id === offerId);
      return await apiRequest("POST", "/api/contracts", {
        offerId,
        finalAmount: offer?.amount,
        terms: "Standard influencer partnership terms and conditions apply."
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contract generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "countered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offers & Deals</h2>
        <p className="text-gray-600">Track the status of your outreach and negotiations</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Offers</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm" className="bg-yellow-50 text-yellow-700">Pending</Button>
              <Button variant="outline" size="sm" className="bg-green-50 text-green-700">Accepted</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Offer Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers?.map((offer: any) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={offer.creator.profileImageUrl} />
                          <AvatarFallback>
                            {offer.creator.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {offer.creator.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{offer.creator.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {offer.campaign.name}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${offer.amount}</div>
                      {offer.counterAmount && (
                        <div className="text-sm text-blue-600">
                          Counter: ${offer.counterAmount}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {offer.status === "accepted" ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateContractMutation.mutate(offer.id)}
                          disabled={generateContractMutation.isPending}
                        >
                          <File className="h-4 w-4 mr-2" />
                          {generateContractMutation.isPending ? "Generating..." : "Generate Contract"}
                        </Button>
                      ) : offer.status === "countered" ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Accept Counter
                          </Button>
                          <Button size="sm" variant="outline">
                            Negotiate
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Waiting for response</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
