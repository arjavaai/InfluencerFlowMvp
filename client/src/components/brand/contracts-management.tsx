import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, FileSignature, Download, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ContractsManagement() {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  const { data: contracts, isLoading } = useQuery({
    queryKey: ["/api/contracts"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      await apiRequest("PATCH", `/api/contracts/${contractId}/sign`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Success",
        description: "Contract signed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getContractStatus = (contract: any) => {
    if (contract.brandSigned && contract.creatorSigned) {
      return { label: "Fully Executed", color: "bg-green-100 text-green-800" };
    } else if (contract.creatorSigned && !contract.brandSigned) {
      return { label: "Pending Brand Signature", color: "bg-yellow-100 text-yellow-800" };
    } else if (contract.brandSigned && !contract.creatorSigned) {
      return { label: "Pending Creator Signature", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Pending Signatures", color: "bg-gray-100 text-gray-800" };
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contracts</h2>
        <p className="text-gray-600">Manage and track contract signatures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts?.map((contract: any) => {
          const status = getContractStatus(contract);
          const isFullyExecuted = contract.brandSigned && contract.creatorSigned;
          const needsBrandSignature = contract.creatorSigned && !contract.brandSigned;

          return (
            <Card key={contract.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {contract.offer.creator.displayName} - {contract.offer.campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Contract value: ${contract.finalAmount}
                    </p>
                  </div>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      contract.creatorSigned ? "bg-green-500" : "bg-gray-200"
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        contract.creatorSigned ? "text-white" : "text-gray-400"
                      }`} />
                    </div>
                    <span className="text-sm text-gray-700">Creator Signed</span>
                    {contract.creatorSignedAt && (
                      <span className="ml-auto text-xs text-gray-500">
                        {formatDistanceToNow(new Date(contract.creatorSignedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      contract.brandSigned ? "bg-green-500" : "bg-gray-200"
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        contract.brandSigned ? "text-white" : "text-gray-400"
                      }`} />
                    </div>
                    <span className="text-sm text-gray-700">Brand Signed</span>
                    {contract.brandSignedAt && (
                      <span className="ml-auto text-xs text-gray-500">
                        {formatDistanceToNow(new Date(contract.brandSignedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedContract(contract);
                      setIsReviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isFullyExecuted ? "Preview" : "Review"}
                  </Button>
                  {isFullyExecuted ? (
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  ) : needsBrandSignature ? (
                    <Button 
                      onClick={() => signContractMutation.mutate(contract.id)}
                      disabled={signContractMutation.isPending}
                      className="flex-1 bg-primary hover:bg-blue-700 text-white"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      {signContractMutation.isPending ? "Signing..." : "Sign Contract"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Awaiting Creator
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contract Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                  <p className="text-gray-900">{selectedContract.offer.creator.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                  <p className="text-gray-900">{selectedContract.offer.campaign.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <p className="text-gray-900 font-semibold">${selectedContract.finalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">{formatDistanceToNow(new Date(selectedContract.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedContract.terms}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Creator Signature</label>
                  <div className="flex items-center">
                    {selectedContract.creatorSigned ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Signed {formatDistanceToNow(new Date(selectedContract.creatorSignedAt), { addSuffix: true })}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Pending signature</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Signature</label>
                  <div className="flex items-center">
                    {selectedContract.brandSigned ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Signed {formatDistanceToNow(new Date(selectedContract.brandSignedAt), { addSuffix: true })}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Pending signature</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                  Close
                </Button>
                {!selectedContract.brandSigned && selectedContract.creatorSigned && (
                  <Button 
                    onClick={() => {
                      signContractMutation.mutate(selectedContract.id);
                      setIsReviewOpen(false);
                    }}
                    disabled={signContractMutation.isPending}
                    className="bg-primary hover:bg-blue-700 text-white"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    {signContractMutation.isPending ? "Signing..." : "Sign Contract"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
