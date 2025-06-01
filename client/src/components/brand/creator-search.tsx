import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Send } from "lucide-react";

export function CreatorSearch() {
  const [selectedCreators, setSelectedCreators] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    niche: "",
    followers: "",
    engagement: "",
    location: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creators, isLoading } = useQuery({
    queryKey: ["/api/creators", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.niche) params.append("niche", filters.niche);
      if (filters.location) params.append("location", filters.location);
      
      return fetch(`/api/creators?${params.toString()}`, {
        credentials: "include",
      }).then((res) => res.json());
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const sendOffersMutation = useMutation({
    mutationFn: async (data: { creatorIds: number[]; campaignId: number; amount: number; message: string }) => {
      for (const creatorId of data.creatorIds) {
        await apiRequest("POST", "/api/offers", {
          campaignId: data.campaignId,
          creatorId,
          amount: data.amount,
          message: data.message,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setSelectedCreators([]);
      toast({
        title: "Success",
        description: `Offers sent to ${selectedCreators.length} creator(s)!`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send offers. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatorSelect = (creatorId: number, checked: boolean) => {
    if (checked) {
      setSelectedCreators([...selectedCreators, creatorId]);
    } else {
      setSelectedCreators(selectedCreators.filter(id => id !== creatorId));
    }
  };

  const handleSendOffers = () => {
    if (selectedCreators.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one creator.",
        variant: "destructive",
      });
      return;
    }

    if (!campaigns || campaigns.length === 0) {
      toast({
        title: "Error",
        description: "Please create a campaign first.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, use the first active campaign
    const activeCampaign = campaigns.find((c: any) => c.status === "active") || campaigns[0];
    
    sendOffersMutation.mutate({
      creatorIds: selectedCreators,
      campaignId: activeCampaign.id,
      amount: "500", // Default offer amount as string
      message: "We'd love to collaborate with you on our latest campaign!",
    });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Creators</h2>
        <p className="text-gray-600">Search and filter from our curated database of verified creators</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
              <Select value={filters.niche} onValueChange={(value) => setFilters({ ...filters, niche: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
              <Select value={filters.followers} onValueChange={(value) => setFilters({ ...filters, followers: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Size</SelectItem>
                  <SelectItem value="1K-10K">1K - 10K</SelectItem>
                  <SelectItem value="10K-100K">10K - 100K</SelectItem>
                  <SelectItem value="100K-1M">100K - 1M</SelectItem>
                  <SelectItem value="1M+">1M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate</label>
              <Select value={filters.engagement} onValueChange={(value) => setFilters({ ...filters, engagement: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rate</SelectItem>
                  <SelectItem value="1-3%">1-3%</SelectItem>
                  <SelectItem value="3-6%">3-6%</SelectItem>
                  <SelectItem value="6%+">6%+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Creators */}
      {selectedCreators.length > 0 && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-primary mb-1">Selected Creators</h4>
                <p className="text-sm text-primary/80">
                  {selectedCreators.length} creator(s) selected for outreach
                </p>
              </div>
              <Button
                onClick={handleSendOffers}
                disabled={sendOffersMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendOffersMutation.isPending ? "Sending..." : "Send Offers"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators?.map((creator: any) => (
          <Card
            key={creator.id}
            className={`creator-card ${
              selectedCreators.includes(creator.id) ? "creator-card-selected" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={creator.profileImageUrl} />
                  <AvatarFallback>{creator.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{creator.displayName}</h3>
                  <p className="text-sm text-gray-600">@{creator.username}</p>
                </div>
                <Checkbox
                  checked={selectedCreators.includes(creator.id)}
                  onCheckedChange={(checked) => handleCreatorSelect(creator.id, checked as boolean)}
                />
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Followers:</span>
                  <span className="font-medium">{creator.followersCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Engagement:</span>
                  <span className="font-medium text-green-600">{creator.engagementRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Niche:</span>
                  <span className="font-medium">{creator.niche}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rate:</span>
                  <span className="font-medium">₹{creator.averageRate}/post</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {creator.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Load More Creators
        </Button>
      </div>
    </div>
  );
}
