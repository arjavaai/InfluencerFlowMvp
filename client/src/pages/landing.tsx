import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Star, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            InfluencerFlow AI Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete influencer marketing platform demonstrating the full campaign lifecycle 
            from creator discovery to payment and reporting
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-blue-700 text-white px-8 py-3 text-lg"
            asChild
          >
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Creator Discovery</h3>
              <p className="text-sm text-gray-600">
                Search and filter from our curated database of verified creators
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Campaign Management</h3>
              <p className="text-sm text-gray-600">
                Create and manage influencer marketing campaigns from start to finish
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Contract & Payments</h3>
              <p className="text-sm text-gray-600">
                Automated contract generation and secure payment processing
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Performance Analytics</h3>
              <p className="text-sm text-gray-600">
                Comprehensive reporting and ROI tracking for all campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Info */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Experience the Complete Workflow
              </h3>
              <p className="text-gray-600 mb-6">
                This demo platform showcases the entire influencer marketing campaign lifecycle:
                Search → Outreach → Deal → Contract → Payment → Report
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Brands:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create and manage campaigns</li>
                    <li>• Search and filter creators</li>
                    <li>• Send offers and negotiate deals</li>
                    <li>• Generate and sign contracts</li>
                    <li>• Process payments and view reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Creators:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View incoming offers</li>
                    <li>• Accept, reject, or counter offers</li>
                    <li>• Sign collaboration agreements</li>
                    <li>• Track payment status</li>
                    <li>• Monitor performance metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
