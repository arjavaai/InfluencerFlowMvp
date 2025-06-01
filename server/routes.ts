import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}
import { 
  insertCampaignSchema, 
  insertOfferSchema, 
  insertContractSchema,
  insertPaymentSchema,
  insertPerformanceReportSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Quick role setup route for troubleshooting
  app.post('/api/setup-brand', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.updateUserRole(userId, 'brand');
      
      // Create brand profile
      const existingBrand = await storage.getBrandByUserId(userId);
      if (!existingBrand) {
        await storage.createBrand({
          userId: userId,
          companyName: updatedUser.firstName || 'My Company',
          industry: 'Technology',
          website: '',
          description: 'A growing company looking for influencer partnerships',
        });
      }
      
      res.json({ message: 'Brand role set successfully', user: updatedUser });
    } catch (error) {
      console.error("Error setting up brand:", error);
      res.status(500).json({ message: "Failed to set up brand role" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get creator or brand profile
      let profile = null;
      if (user.role === 'creator') {
        profile = await storage.getCreatorByUserId(userId);
      } else if (user.role === 'brand') {
        profile = await storage.getBrandByUserId(userId);
      }

      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body;
      
      if (!role || !['brand', 'creator'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      
      // Create corresponding profile
      if (role === 'brand') {
        const existingBrand = await storage.getBrandByUserId(userId);
        if (!existingBrand) {
          await storage.createBrand({
            userId: userId,
            companyName: updatedUser.firstName || 'My Company',
            industry: 'Technology',
            website: '',
            description: 'A growing company looking for influencer partnerships',
          });
        }
      } else if (role === 'creator') {
        const existingCreator = await storage.getCreatorByUserId(userId);
        if (!existingCreator) {
          await storage.createCreator({
            userId: userId,
            username: updatedUser.firstName || 'creator',
            displayName: `${updatedUser.firstName || 'Creator'} ${updatedUser.lastName || ''}`.trim(),
            bio: 'Content creator passionate about engaging with audiences',
            niche: 'Lifestyle',
            followersCount: 10000,
            engagementRate: "3.5",
            averageRate: "500",
            location: 'United States',
            isActive: true,
          });
        }
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Seed data endpoint
  app.post('/api/seed', async (req, res) => {
    try {
      await storage.seedData();
      res.json({ message: "Data seeded successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  // Creator routes
  app.get('/api/creators', async (req, res) => {
    try {
      const filters = {
        niche: req.query.niche as string,
        minFollowers: req.query.minFollowers ? parseInt(req.query.minFollowers as string) : undefined,
        maxFollowers: req.query.maxFollowers ? parseInt(req.query.maxFollowers as string) : undefined,
        location: req.query.location as string,
      };
      
      const creators = await storage.getCreators(filters);
      res.json(creators);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });

  // Campaign routes
  app.get('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const brand = await storage.getBrandByUserId(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can access campaigns" });
      }

      const campaigns = await storage.getCampaigns(brand.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const brand = await storage.getBrandByUserId(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can create campaigns" });
      }

      const validatedData = insertCampaignSchema.parse({
        ...req.body,
        brandId: brand.id,
      });

      const campaign = await storage.createCampaign(validatedData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Offer routes
  app.get('/api/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let filters: any = {};

      if (user.role === 'creator') {
        const creator = await storage.getCreatorByUserId(userId);
        if (creator) {
          filters.creatorId = creator.id;
        }
      } else if (user.role === 'brand') {
        const brand = await storage.getBrandByUserId(userId);
        if (brand) {
          filters.brandId = brand.id;
        }
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const offers = await storage.getOffers(filters);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  app.post('/api/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const brand = await storage.getBrandByUserId(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can create offers" });
      }

      const validatedData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(validatedData);
      res.json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.patch('/api/offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedOffer = await storage.updateOffer(id, req.body);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "Failed to update offer" });
    }
  });

  app.patch('/api/offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const updates = req.body;

      const offer = await storage.updateOffer(offerId, updates);
      res.json(offer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "Failed to update offer" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let filters: any = {};

      if (user.role === 'creator') {
        const creator = await storage.getCreatorByUserId(userId);
        if (creator) {
          filters.creatorId = creator.id;
        }
      } else if (user.role === 'brand') {
        const brand = await storage.getBrandByUserId(userId);
        if (brand) {
          filters.brandId = brand.id;
        }
      }

      const contracts = await storage.getContracts(filters);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      
      // Create payment record with due date 7 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      await storage.createPayment({
        contractId: contract.id,
        amount: contract.finalAmount,
        dueDate,
      });

      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.patch('/api/contracts/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates: any = {};
      const now = new Date();

      if (user.role === 'creator') {
        updates.creatorSigned = true;
        updates.creatorSignedAt = now;
      } else if (user.role === 'brand') {
        updates.brandSigned = true;
        updates.brandSignedAt = now;
      }

      const contract = await storage.updateContract(contractId, updates);
      res.json(contract);
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ message: "Failed to sign contract" });
    }
  });

  // Payment routes
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let filters: any = {};

      if (user.role === 'creator') {
        const creator = await storage.getCreatorByUserId(userId);
        if (creator) {
          filters.creatorId = creator.id;
        }
      } else if (user.role === 'brand') {
        const brand = await storage.getBrandByUserId(userId);
        if (brand) {
          filters.brandId = brand.id;
        }
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const payments = await storage.getPayments(filters);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.patch('/api/payments/:id/mark-paid', isAuthenticated, async (req: any, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const userId = req.user.id;
      const brand = await storage.getBrandByUserId(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can mark payments as paid" });
      }

      const payment = await storage.updatePayment(paymentId, {
        status: 'paid',
        paidAt: new Date(),
      });

      // Generate performance report
      await storage.createPerformanceReport({
        contractId: payment.contractId,
        reach: Math.floor(Math.random() * 50000) + 100000,
        impressions: Math.floor(Math.random() * 75000) + 150000,
        engagement: Math.floor(Math.random() * 5000) + 5000,
        clicks: Math.floor(Math.random() * 1000) + 500,
        engagementRate: (Math.random() * 3 + 3).toFixed(2),
        roi: (Math.random() * 3 + 2).toFixed(2),
      });

      res.json(payment);
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      res.status(500).json({ message: "Failed to mark payment as paid" });
    }
  });

  // Stripe payment intent creation
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentId, amount } = req.body;
      const userId = req.user.id;
      const brand = await storage.getBrandByUserId(userId);
      
      if (!brand) {
        return res.status(403).json({ message: "Only brands can create payment intents" });
      }

      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          paymentId: paymentId.toString(),
          brandId: brand.id.toString(),
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Performance report routes
  app.get('/api/reports/:contractId', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const reports = await storage.getPerformanceReports(contractId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
