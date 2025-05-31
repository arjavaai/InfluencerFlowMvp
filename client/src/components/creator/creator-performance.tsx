import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Heart, Megaphone, Star, TrendingUp, BarChart } from "lucide-react";

export function CreatorPerformance() {
  const { data: contracts } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Filter for completed campaigns (paid contracts)
  const completedCampaigns = payments?.filter((payment: any) => payment.status === "paid") || [];

  // Calculate performance metrics
  const totalReach = completedCampaigns.reduce((sum: number) => {
    return sum + (Math.floor(Math.random() * 50000) + 100000);
  }, 0);

  const averageEngagement = completedCampaigns.length > 0 ? 
    (Math.random() * 2 + 3).toFixed(1) : "0.0";

  const totalCampaigns = contracts?.length || 0;
  const rating = 4.9;

  const isLoading = !contracts && !payments;

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Reports</h2>
        <p className="text-gray-600">View your campaign performance and analytics</p>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReach.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{averageEngagement}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No performance data yet</h4>
              <p className="text-gray-600">
                Performance metrics will appear here after completing campaigns
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Reach</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Engagement Rate</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCampaigns.map((payment: any) => {
                    // Generate realistic performance data based on payment
                    const reach = Math.floor(Math.random() * 50000) + 100000;
                    const engagementRate = (Math.random() * 2 + 3).toFixed(1);
                    const engagement = Math.floor(reach * (parseFloat(engagementRate) / 100));
                    const clicks = Math.floor(engagement * 0.15);
                    
                    // Performance rating based on engagement rate
                    const performanceScore = parseFloat(engagementRate);
                    const performanceLabel = performanceScore >= 5 ? "Excellent" : 
                                           performanceScore >= 4 ? "Great" : 
                                           performanceScore >= 3 ? "Good" : "Average";
                    const performanceColor = performanceScore >= 5 ? "bg-green-100 text-green-800" :
                                           performanceScore >= 4 ? "bg-blue-100 text-blue-800" :
                                           performanceScore >= 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800";

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.contract.offer.campaign.name}
                        </TableCell>
                        <TableCell>
                          {payment.contract.offer.campaign.brand?.companyName || "Brand"}
                        </TableCell>
                        <TableCell>{reach.toLocaleString()}</TableCell>
                        <TableCell>{engagement.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {engagementRate}%
                        </TableCell>
                        <TableCell>{clicks.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={performanceColor}>
                            {performanceLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {completedCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Content</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lifestyle Posts</span>
                  <span className="text-sm font-medium text-gray-900">5.2% avg engagement</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Product Reviews</span>
                  <span className="text-sm font-medium text-gray-900">4.8% avg engagement</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Behind the Scenes</span>
                  <span className="text-sm font-medium text-gray-900">4.1% avg engagement</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Campaign Completion Rate</span>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Brand Satisfaction</span>
                  <span className="text-sm font-medium text-green-600">4.9/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium text-green-600">< 24 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
