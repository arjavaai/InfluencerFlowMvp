import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, FileSignature, Download, CheckCircle, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import jsPDF from 'jspdf';

export function CreatorContracts() {
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
        description: "Contract signed successfully! Awaiting brand signature.",
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

  const handleDownloadPDF = (contract: any) => {
    const doc = new jsPDF();
    
    // Set up the document
    doc.setFontSize(20);
    doc.text('INFLUENCER MARKETING CONTRACT', 20, 30);
    
    doc.setFontSize(12);
    let yPosition = 50;
    
    // Contract details
    doc.text(`Contract ID: ${contract.id}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date(contract.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;
    
    // Parties section
    doc.setFontSize(14);
    doc.text('PARTIES:', 20, yPosition);
    yPosition += 15;
    doc.setFontSize(12);
    doc.text(`Brand: ${contract.offer.campaign.brand.companyName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Creator: ${contract.offer.creator.displayName} (@${contract.offer.creator.username})`, 20, yPosition);
    yPosition += 20;
    
    // Campaign details
    doc.setFontSize(14);
    doc.text('CAMPAIGN DETAILS:', 20, yPosition);
    yPosition += 15;
    doc.setFontSize(12);
    doc.text(`Campaign: ${contract.offer.campaign.name}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Contract Value: $${contract.finalAmount}`, 20, yPosition);
    yPosition += 20;
    
    // Terms section
    doc.setFontSize(14);
    doc.text('TERMS AND CONDITIONS:', 20, yPosition);
    yPosition += 15;
    doc.setFontSize(12);
    
    // Split terms text if it's too long
    const splitTerms = doc.splitTextToSize(contract.terms, 170);
    doc.text(splitTerms, 20, yPosition);
    yPosition += splitTerms.length * 5 + 15;
    
    // Signatures section
    doc.setFontSize(14);
    doc.text('SIGNATURES:', 20, yPosition);
    yPosition += 15;
    doc.setFontSize(12);
    
    const creatorSignature = contract.creatorSigned 
      ? `✓ Creator signed on ${new Date(contract.creatorSignedAt).toLocaleDateString()}`
      : '☐ Creator signature pending';
    doc.text(creatorSignature, 20, yPosition);
    yPosition += 10;
    
    const brandSignature = contract.brandSigned 
      ? `✓ Brand signed on ${new Date(contract.brandSignedAt).toLocaleDateString()}`
      : '☐ Brand signature pending';
    doc.text(brandSignature, 20, yPosition);
    yPosition += 15;
    
    // Contract status
    const status = contract.brandSigned && contract.creatorSigned ? 'FULLY EXECUTED' : 'PENDING SIGNATURES';
    doc.setFontSize(14);
    doc.text(`This contract is ${status}.`, 20, yPosition);
    
    // Download the PDF
    doc.save(`contract-${contract.id}.pdf`);

    toast({
      title: "Contract Downloaded",
      description: "PDF contract has been downloaded successfully.",
    });
  };

  const getContractStatus = (contract: any) => {
    if (contract.brandSigned && contract.creatorSigned) {
      return { 
        label: "Completed", 
        color: "bg-green-100 text-green-800",
        description: "Both parties have signed"
      };
    } else if (contract.creatorSigned && !contract.brandSigned) {
      return { 
        label: "Awaiting Brand", 
        color: "bg-yellow-100 text-yellow-800",
        description: "Waiting for brand signature"
      };
    } else if (!contract.creatorSigned) {
      return { 
        label: "Signature Required", 
        color: "bg-blue-100 text-blue-800",
        description: "Your signature is required"
      };
    } else {
      return { 
        label: "Pending", 
        color: "bg-gray-100 text-gray-800",
        description: "Contract processing"
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Contracts</h2>
          <p className="text-gray-600">Review and sign collaboration agreements</p>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
            <p className="text-gray-600">
              Contracts will appear here after you accept collaboration offers
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Contracts</h2>
        <p className="text-gray-600">Review and sign collaboration agreements</p>
      </div>

      <div className="space-y-6">
        {contracts.map((contract: any) => {
          const status = getContractStatus(contract);
          const isFullyExecuted = contract.brandSigned && contract.creatorSigned;
          const needsCreatorSignature = !contract.creatorSigned;

          return (
            <Card key={contract.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {contract.offer.campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contract.offer.campaign.brand.companyName} • ₹{parseFloat(contract.finalAmount).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contract Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        contract.creatorSigned ? "bg-green-500" : "bg-gray-200"
                      }`}>
                        {contract.creatorSigned ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">Your signature</span>
                      {contract.creatorSignedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(contract.creatorSignedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        contract.brandSigned ? "bg-green-500" : "bg-gray-200"
                      }`}>
                        {contract.brandSigned ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">Brand signature</span>
                      {contract.brandSignedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(contract.brandSignedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contract Summary</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Campaign:</span>
                      <span className="font-medium">{contract.offer.campaign.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compensation:</span>
                      <span className="font-medium">${parseFloat(contract.finalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Objective:</span>
                      <span className="font-medium">{contract.offer.campaign.objective}</span>
                    </div>
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
                    Review Contract
                  </Button>
                  
                  {isFullyExecuted ? (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownloadPDF(contract)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  ) : needsCreatorSignature ? (
                    <Button 
                      onClick={() => signContractMutation.mutate(contract.id)}
                      disabled={signContractMutation.isPending}
                      className="flex-1 bg-primary hover:bg-blue-700 text-white"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      {signContractMutation.isPending ? "Signing..." : "Sign Contract"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 opacity-50" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Awaiting Brand
                    </Button>
                  )}
                </div>

                {isFullyExecuted && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Contract fully executed! You can now begin work on this campaign.
                      </span>
                    </div>
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <p className="text-gray-900">{selectedContract.offer.campaign.brand.companyName}</p>
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
                {!selectedContract.creatorSigned && (
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
