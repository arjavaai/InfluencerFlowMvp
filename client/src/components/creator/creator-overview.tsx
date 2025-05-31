import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Inbox, Handshake, Wallet, Star, Mail, CheckCircle } from "lucide-react";

export function CreatorOverview() {
  const { user } = useAuth();
  
  const { data: offers } = useQuery({
    queryKey: ["/api/offers"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const pendingOffers = offers?.filter((offer: any) => offer.status === "pending").length || 0;
  const activeDeals = offers?.filter((offer: any) => offer.status === "accepted").length || 0;
  const monthlyEarnings = payments?.filter((payment: any) => payment.status === "paid")
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Dashboard</h2>
        <p className="text-gray-600">
          Welcome back, {user?.profile?.displayName || user?.firstName}! Here's your overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Inbox className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Offers</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Handshake className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{activeDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${monthlyEarnings.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">4.9</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {pendingOffers > 0 && (
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    New offer from brand collaboration
                  </p>
                  <p className="text-xs text-gray-600">
                    Review and respond to incoming offers
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-gray-500">Recently</span>
                </div>
              </div>
            )}
            
            {monthlyEarnings > 0 && (
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-600">
                    Campaign payment processed successfully
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-gray-500">This month</span>
                </div>
              </div>
            )}

            {offers?.length === 0 && (
              <div className="text-center py-8">
                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
                <p className="text-gray-600">
                  Your collaboration offers and updates will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
