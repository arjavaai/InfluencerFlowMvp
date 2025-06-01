import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Stripe Payment Form Component
function StripePaymentForm({ paymentId, amount, onSuccess }: { paymentId: number; amount: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'IN'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate required fields
    if (!billingDetails.name || !billingDetails.email || !billingDetails.address.line1 || 
        !billingDetails.address.city || !billingDetails.address.state || !billingDetails.address.postal_code) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required billing details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Mark payment as paid in the backend
        await apiRequest("PATCH", `/api/payments/${paymentId}/mark-paid`);
        toast({
          title: "Payment Successful",
          description: "Payment processed successfully!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "An error occurred processing the payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">Payment Amount:</span>
          <span className="text-lg font-semibold">${amount}</span>
        </div>
      </div>

      {/* Billing Details Form */}
      <div className="space-y-4 border p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Billing Information</h4>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={billingDetails.name}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={billingDetails.email}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address1">Address Line 1 *</Label>
          <Input
            id="address1"
            value={billingDetails.address.line1}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value }
            }))}
            placeholder="Street address"
            required
          />
        </div>

        <div>
          <Label htmlFor="address2">Address Line 2</Label>
          <Input
            id="address2"
            value={billingDetails.address.line2}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, line2: e.target.value }
            }))}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={billingDetails.address.city}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              placeholder="City"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={billingDetails.address.state}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              placeholder="State"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="postal">Postal Code *</Label>
            <Input
              id="postal"
              value={billingDetails.address.postal_code}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, postal_code: e.target.value }
              }))}
              placeholder="Postal code"
              required
            />
          </div>
        </div>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Pay $${amount}`}
      </Button>
    </form>
  );
}

export function PaymentsManagement() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentIntents, setPaymentIntents] = useState<Record<number, string>>({});

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (payment: any) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        paymentId: payment.id,
        amount: parseFloat(payment.amount),
      });
      return response.json();
    },
    onSuccess: (data, payment) => {
      setPaymentIntents(prev => ({
        ...prev,
        [payment.id]: data.clientSecret
      }));
    },
  });

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
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => createPaymentIntentMutation.mutate(payment)}
                                  disabled={createPaymentIntentMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  {createPaymentIntentMutation.isPending ? "Setting up..." : "Pay with Stripe"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Process Payment</DialogTitle>
                                </DialogHeader>
                                {paymentIntents[payment.id] ? (
                                  <Elements 
                                    stripe={stripePromise} 
                                    options={{ 
                                      clientSecret: paymentIntents[payment.id],
                                      appearance: { theme: 'stripe' }
                                    }}
                                  >
                                    <StripePaymentForm 
                                      paymentId={payment.id}
                                      amount={payment.amount}
                                      onSuccess={() => {
                                        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
                                        setPaymentIntents(prev => {
                                          const newState = { ...prev };
                                          delete newState[payment.id];
                                          return newState;
                                        });
                                      }}
                                    />
                                  </Elements>
                                ) : (
                                  <div className="text-center p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-600">Setting up payment...</p>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markPaidMutation.mutate(payment.id)}
                              disabled={markPaidMutation.isPending}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {markPaidMutation.isPending ? "Processing..." : "Mark as Paid"}
                            </Button>
                          </div>
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
