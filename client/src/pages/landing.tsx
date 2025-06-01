import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Star, Users, TrendingUp, ArrowRight, CheckCircle, Zap, Shield, Target } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">InfluencerFlow AI</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-purple-400/50 hover:bg-purple-400/20 hover:text-white hover:border-purple-300 transition-all duration-300 bg-[#e8499f] text-[#ffffff] text-sm px-3 py-2 sm:px-4 sm:py-2"
            asChild
          >
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl -z-10"></div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Transform Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
              Influencer Marketing
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            The complete AI-powered platform for managing influencer campaigns from discovery to performance tracking. 
            Streamline collaborations, automate contracts, and maximize ROI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              asChild
            >
              <Link href="/auth">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-purple-300 hover:bg-purple-300 hover:text-purple-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full bg-[#251946] text-[#f4ffff] w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:bg-white/20 transition-all duration-300 group">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-3">Creator Discovery</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                AI-powered search and filtering from our curated database of verified creators
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:bg-white/20 transition-all duration-300 group">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-3">Campaign Management</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Create and manage influencer marketing campaigns from start to finish
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:bg-white/20 transition-all duration-300 group">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-3">Smart Contracts</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Automated contract generation and secure payment processing with Stripe
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:bg-white/20 transition-all duration-300 group">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-3">Performance Analytics</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Real-time reporting and ROI tracking for all campaigns with detailed metrics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">10k+</div>
            <div className="text-gray-400">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-400">Brands Served</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">₹16Cr+</div>
            <div className="text-gray-400">Payments Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <div className="text-gray-400">Success Rate</div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-purple-300/20">
            <CardContent className="pt-12 pb-8">
              <h3 className="text-3xl font-bold text-white mb-6">
                Experience the Complete Workflow
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                This demo platform showcases the entire influencer marketing campaign lifecycle:
                <span className="block mt-2 text-purple-300 font-semibold">
                  Search → Outreach → Deal → Contract → Payment → Report
                </span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg">For Brands</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Create and manage campaigns</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">AI-powered creator discovery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Send offers and negotiate deals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Generate smart contracts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Process secure payments</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg">For Creators</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">View incoming offers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Accept, reject, or counter offers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Sign collaboration agreements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Track payment status</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Monitor performance metrics</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-purple-300/20">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/auth">
                    Try Demo Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
