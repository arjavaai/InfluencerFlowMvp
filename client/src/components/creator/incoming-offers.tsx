import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, DollarSign, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function IncomingOffers() {
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [counterData, setCounterData] = useState({
    amount: "",
    message: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/offers"],
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ offerId, updates }: { offerId: number; updates: any }) => {
      await apiRequest("PATCH", `/api/offers/${offerId}`, updates);
    },
    onSuccess: (_, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      
      if (updates.status === "accepted") {
        // Auto-generate contract for accepted offers
        setTimeout(async () => {
          try {
            await apiRequest("POST", "/api/contracts", {
              offerId: selectedOffer?.id || updates.offerId,
              finalAmount: selectedOffer?.amount || updates.amount,
              terms: "Standard collaboration agreement terms and conditions apply.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
          } catch (error) {
            console.error("Failed to generate contract:", error);
          }
        }, 500);
        
        toast({
          title: "Success",
          description: "Offer accepted! Contract will be generated shortly.",
        });
      } else if (updates.status === "rejected") {
        toast({
          title: "Offer Declined",
          description: "The offer has been declined.",
        });
      } else if (updates.status === "countered") {
        toast({
          title: "Counter Offer Sent",
          description: "Your counter offer has been sent to the brand.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = (offer: any) => {
    setSelectedOffer(offer);
    updateOfferMutation.mutate({
      offerId: offer.id,
      updates: { status: "accepted" },
    });
  };

  const handleReject = (offer: any) => {
    updateOfferMutation.mutate({
      offerId: offer.id,
      updates: { status: "rejected" },
    });
  };

  const handleCounter = (offer: any) => {
    setSelectedOffer(offer);
    setCounterData({
      amount: offer.amount.toString(),
      message: "",
    });
    setIsCounterModalOpen(true);
  };

  const submitCounter = () => {
    if (!counterData.amount || parseFloat(counterData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid counter amount.",
        variant: "destructive",
      });
      return;
    }

    updateOfferMutation.mutate({
      offerId: selectedOffer.id,
      updates: {
        status: "countered",
        counterAmount: parseFloat(counterData.amount),
        counterMessage: counterData.message,
      },
    });

    setIsCounterModalOpen(false);
    setCounterData({ amount: "", message: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "countered":
        return "bg-yellow-100 text-yellow-800";
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

  const pendingOffers = offers?.filter((offer: any) => offer.status === "pending") || [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Incoming Offers</h2>
        <p className="text-gray-600">Review and respond to brand collaboration requests</p>
      </div>

      {pendingOffers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending offers</h3>
            <p className="text-gray-600">
              New collaboration offers from brands will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingOffers.map((offer: any) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {offer.campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      from {offer.campaign.brand.companyName}
                    </p>
                  </div>
                  <Badge className={getStatusColor(offer.status)}>
                    {offer.status === "pending" ? "New" : offer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Campaign Details</p>
                    <p className="text-sm text-gray-600">
                      {offer.campaign.description || "Exciting brand collaboration opportunity."}
                    </p>
                    {offer.message && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message from Brand:</p>
                        <p className="text-sm text-gray-600 italic">"{offer.message}"</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Sent {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Offer Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      ${parseFloat(offer.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Per deliverable + usage rights</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(offer)}
                    disabled={updateOfferMutation.isPending}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCounter(offer)}
                    disabled={updateOfferMutation.isPending}
                    className="flex-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Counter Offer
                  </Button>
                  <Button
                    onClick={() => handleAccept(offer)}
                    disabled={updateOfferMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updateOfferMutation.isPending ? "Processing..." : `Accept $${parseFloat(offer.amount).toLocaleString()}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Offers Section */}
      {offers && offers.length > pendingOffers.length && (
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">All Offers</h3>
          <div className="space-y-4">
            {offers
              .filter((offer: any) => offer.status !== "pending")
              .map((offer: any) => (
                <Card key={offer.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {offer.campaign.name} - {offer.campaign.brand.companyName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ${parseFloat(offer.amount).toLocaleString()} • {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      <Dialog open={isCounterModalOpen} onOpenChange={setIsCounterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rate
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="number"
                  placeholder="750"
                  value={counterData.amount}
                  onChange={(e) => setCounterData({ ...counterData, amount: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Add a note about your counter offer..."
                value={counterData.message}
                onChange={(e) => setCounterData({ ...counterData, message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCounterModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitCounter}
                disabled={updateOfferMutation.isPending}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {updateOfferMutation.isPending ? "Sending..." : "Send Counter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
