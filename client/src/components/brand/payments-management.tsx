import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

export function PaymentsManagement() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markPaidMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      await apiRequest("PATCH", `/api/payments/${paymentId}/mark-paid`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success",
        description: "Payment marked as paid! Performance report generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark payment as paid. Please try again.",
        variant: "destructive",
      });
    },
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
      if (dueDate.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000) return "Due Soon";
      return "Pending";
    }
    return payment.status;
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payments</h2>
        <p className="text-gray-600">Track payment status and manage invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment: any) => {
                  const statusLabel = getStatusLabel(payment);
                  const canMarkPaid = payment.status === "pending";

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={payment.contract.offer.creator.profileImageUrl} />
                            <AvatarFallback>
                              {payment.contract.offer.creator.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {payment.contract.offer.creator.displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{payment.contract.offer.creator.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.contract.offer.campaign.name}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${payment.amount}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canMarkPaid ? (
                          <Button
                            size="sm"
                            onClick={() => markPaidMutation.mutate(payment.id)}
                            disabled={markPaidMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {markPaidMutation.isPending ? "Processing..." : "Mark as Paid"}
                          </Button>
                        ) : payment.status === "paid" ? (
                          <span className="text-green-600 text-sm font-medium">
                            Paid {payment.paidAt && format(new Date(payment.paidAt), "MMM dd")}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Processing</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
