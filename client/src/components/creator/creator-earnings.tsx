import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Clock, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";

export function CreatorEarnings() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (payment: any) => {
    if (payment.status === "paid") return "Paid";
    if (payment.status === "pending") {
      const dueDate = new Date(payment.dueDate);
      const today = new Date();
      if (dueDate < today) return "Overdue";
      return "Pending";
    }
    return payment.status;
  };

  // Calculate summary metrics
  const paidPayments = payments?.filter((p: any) => p.status === "paid") || [];
  const pendingPayments = payments?.filter((p: any) => p.status === "pending") || [];
  
  const thisMonthEarnings = paidPayments
    .filter((p: any) => {
      const paidDate = new Date(p.paidAt);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    
  const pendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const totalEarned = paidPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Earnings & Payments</h2>
        <p className="text-gray-600">Track your payment status and earnings history</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{thisMonthEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalEarned.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h4>
              <p className="text-gray-600">
                Your payment history will appear here once contracts are signed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.contract.offer.campaign.name}
                      </TableCell>
                      <TableCell>
                        {payment.contract.offer.campaign.brand?.companyName || "Brand"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{parseFloat(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusLabel(payment)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {payment.status === "paid" && payment.paidAt ? (
                          format(new Date(payment.paidAt), "MMM dd, yyyy")
                        ) : payment.status === "pending" ? (
                          `Due ${format(new Date(payment.dueDate), "MMM dd, yyyy")}`
                        ) : (
                          format(new Date(payment.createdAt), "MMM dd, yyyy")
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings Insights */}
      {totalEarned > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Average Payment</h4>
                <p className="text-xl font-bold text-gray-900">
                  ₹{Math.round(totalEarned / paidPayments.length).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Completed Campaigns</h4>
                <p className="text-xl font-bold text-gray-900">
                  {paidPayments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
