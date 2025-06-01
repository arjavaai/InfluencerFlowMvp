import {
  users,
  creators,
  brands,
  campaigns,
  offers,
  contracts,
  payments,
  performanceReports,
  type User,
  type Creator,
  type Brand,
  type Campaign,
  type Offer,
  type Contract,
  type Payment,
  type PerformanceReport,
  type UpsertUser,
  type InsertCreator,
  type InsertBrand,
  type InsertCampaign,
  type InsertOffer,
  type InsertContract,
  type InsertPayment,
  type InsertPerformanceReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { hashPassword } from "./auth";

// Interface for storage operations
export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  
  // Creator operations
  getCreators(filters?: { niche?: string; minFollowers?: number; maxFollowers?: number; location?: string }): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByUserId(userId: number): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  
  // Brand operations
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandByUserId(userId: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  
  // Campaign operations
  getCampaigns(brandId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Offer operations
  getOffers(filters?: { campaignId?: number; creatorId?: number; status?: string }): Promise<(Offer & { creator: Creator; campaign: Campaign & { brand: Brand } })[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<Offer>): Promise<Offer>;
  
  // Contract operations
  getContracts(filters?: { brandId?: number; creatorId?: number }): Promise<(Contract & { offer: Offer & { creator: Creator; campaign: Campaign & { brand: Brand } } })[]>;
  getContract(id: number): Promise<Contract | undefined>;
  getContractByOfferId(offerId: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, updates: Partial<Contract>): Promise<Contract>;
  
  // Payment operations
  getPayments(filters?: { brandId?: number; creatorId?: number; status?: string }): Promise<(Payment & { contract: Contract & { offer: Offer & { creator: Creator; campaign: Campaign } } })[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;
  
  // Performance report operations
  getPerformanceReports(contractId: number): Promise<PerformanceReport[]>;
  createPerformanceReport(report: InsertPerformanceReport): Promise<PerformanceReport>;
  
  // Seeding operation
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for email/password auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as "brand" | "creator", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Creator operations
  async getCreators(filters?: { niche?: string; minFollowers?: number; maxFollowers?: number; location?: string }): Promise<Creator[]> {
    let query = db.select().from(creators);
    
    if (filters?.niche) {
      query = query.where(eq(creators.niche, filters.niche));
    }
    
    return await query;
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, userId));
    return creator;
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const [newCreator] = await db.insert(creators).values(creator).returning();
    return newCreator;
  }

  // Brand operations
  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandByUserId(userId: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.userId, userId));
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  // Campaign operations
  async getCampaigns(brandId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.brandId, brandId));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  // Offer operations
  async getOffers(filters?: { campaignId?: number; creatorId?: number; status?: string; brandId?: number }): Promise<(Offer & { creator: Creator; campaign: Campaign & { brand: Brand } })[]> {
    const results = await db
      .select()
      .from(offers)
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .leftJoin(brands, eq(campaigns.brandId, brands.id))
      .where(
        filters?.brandId ? eq(campaigns.brandId, filters.brandId) :
        filters?.campaignId ? eq(offers.campaignId, filters.campaignId) :
        filters?.creatorId ? eq(offers.creatorId, filters.creatorId) :
        filters?.status ? eq(offers.status, filters.status) : 
        undefined
      );

    return results.map((row: any) => ({
      ...row.offers,
      creator: row.creators,
      campaign: {
        ...row.campaigns,
        brand: row.brands
      }
    }));
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async updateOffer(id: number, updates: Partial<Offer>): Promise<Offer> {
    const [offer] = await db
      .update(offers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    return offer;
  }

  // Contract operations
  async getContracts(filters?: { brandId?: number; creatorId?: number }): Promise<(Contract & { offer: Offer & { creator: Creator; campaign: Campaign & { brand: Brand } } })[]> {
    const results = await db
      .select()
      .from(contracts)
      .leftJoin(offers, eq(contracts.offerId, offers.id))
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .leftJoin(brands, eq(campaigns.brandId, brands.id))
      .where(
        filters?.brandId ? eq(campaigns.brandId, filters.brandId) :
        filters?.creatorId ? eq(offers.creatorId, filters.creatorId) :
        undefined
      );

    return results.map((row: any) => ({
      ...row.contracts,
      offer: {
        ...row.offers,
        creator: row.creators,
        campaign: {
          ...row.campaigns,
          brand: row.brands
        }
      }
    }));
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractByOfferId(offerId: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.offerId, offerId));
    return contract;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async updateContract(id: number, updates: Partial<Contract>): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set(updates)
      .where(eq(contracts.id, id))
      .returning();
    return contract;
  }

  // Payment operations
  async getPayments(filters?: { brandId?: number; creatorId?: number; status?: string }): Promise<(Payment & { contract: Contract & { offer: Offer & { creator: Creator; campaign: Campaign } } })[]> {
    let query = db
      .select()
      .from(payments)
      .leftJoin(contracts, eq(payments.contractId, contracts.id))
      .leftJoin(offers, eq(contracts.offerId, offers.id))
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .where(
        filters?.brandId ? eq(campaigns.brandId, filters.brandId) :
        filters?.creatorId ? eq(offers.creatorId, filters.creatorId) :
        filters?.status ? eq(payments.status, filters.status) :
        undefined
      );

    const results = await query;
    return results.map((row: any) => ({
      ...row.payments,
      contract: {
        ...row.contracts,
        offer: {
          ...row.offers,
          creator: row.creators,
          campaign: row.campaigns
        }
      }
    }));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Performance report operations
  async getPerformanceReports(contractId: number): Promise<PerformanceReport[]> {
    return await db.select().from(performanceReports).where(eq(performanceReports.contractId, contractId));
  }

  async createPerformanceReport(report: InsertPerformanceReport): Promise<PerformanceReport> {
    const [newReport] = await db.insert(performanceReports).values(report).returning();
    return newReport;
  }

  // Seeding operation
  async seedData(): Promise<void> {
    // Create users with proper email/password authentication
    const demoUsers = [
      {
        email: "sarah@example.com",
        password: await hashPassword("password123"),
        firstName: "Sarah",
        lastName: "Johnson",
        role: "creator" as const,
      },
      {
        email: "mike@example.com", 
        password: await hashPassword("password123"),
        firstName: "Mike",
        lastName: "Chen",
        role: "creator" as const,
      },
      {
        email: "emma@example.com",
        password: await hashPassword("password123"),
        firstName: "Emma",
        lastName: "Rodriguez",
        role: "creator" as const,
      },
      {
        email: "alex@example.com",
        password: await hashPassword("password123"),
        firstName: "Alex",
        lastName: "Thompson",
        role: "creator" as const,
      },
      {
        email: "maya@example.com",
        password: await hashPassword("password123"),
        firstName: "Maya",
        lastName: "Patel",
        role: "creator" as const,
      },
      {
        email: "brand@nike.com",
        password: await hashPassword("password123"),
        firstName: "Brand",
        lastName: "Manager",
        role: "brand" as const,
      }
    ];

    const createdUsers = await db.insert(users).values(demoUsers).returning();

    // Create creator profiles
    const creatorProfiles = [
      {
        userId: createdUsers[0].id,
        username: "@sarah_lifestyle",
        displayName: "Sarah Johnson",
        bio: "Lifestyle content creator sharing daily inspiration and wellness tips",
        niche: "Lifestyle",
        followersCount: 85000,
        engagementRate: 4.2,
        averageRate: 1200,
        location: "Los Angeles, CA",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
        tags: ["lifestyle", "wellness", "fashion", "travel"],
      },
      {
        userId: createdUsers[1].id,
        username: "@mike_fitness",
        displayName: "Mike Chen",
        bio: "Fitness coach helping people achieve their health goals",
        niche: "Fitness",
        followersCount: 120000,
        engagementRate: 5.8,
        averageRate: 2000,
        location: "New York, NY",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        tags: ["fitness", "health", "workout", "nutrition"],
      },
      {
        userId: createdUsers[2].id,
        username: "@emma_foodie",
        displayName: "Emma Rodriguez",
        bio: "Food blogger showcasing delicious recipes and restaurant reviews",
        niche: "Food",
        followersCount: 95000,
        engagementRate: 6.1,
        averageRate: 1500,
        location: "Miami, FL",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        tags: ["food", "recipes", "restaurants", "cooking"],
      },
      {
        userId: createdUsers[3].id,
        username: "@alex_tech",
        displayName: "Alex Thompson",
        bio: "Tech reviewer covering the latest gadgets and innovations",
        niche: "Technology",
        followersCount: 200000,
        engagementRate: 3.9,
        averageRate: 3500,
        location: "San Francisco, CA",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        tags: ["technology", "gadgets", "reviews", "innovation"],
      },
      {
        userId: createdUsers[4].id,
        username: "@maya_travel",
        displayName: "Maya Patel",
        bio: "Travel enthusiast sharing adventures from around the globe",
        niche: "Travel",
        followersCount: 150000,
        engagementRate: 4.7,
        averageRate: 2500,
        location: "Austin, TX",
        profileImageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
        tags: ["travel", "adventure", "culture", "photography"],
      }
    ];

    await db.insert(creators).values(creatorProfiles);

    // Create brand profile
    const brandProfile = {
      userId: createdUsers[5].id,
      companyName: "Nike",
      industry: "Sportswear",
      description: "Global leader in athletic footwear and apparel",
      website: "https://nike.com",
      logoUrl: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
    };

    await db.insert(brands).values(brandProfile);

    console.log("Demo data seeded successfully!");
  }

  async addRealInfluencers(): Promise<void> {
    // Add real influencers from CSV data
    const influencerUsers = [
      { email: "dimpi@sanghvi.com", firstName: "Dimpi", lastName: "Sanghvi", role: "creator" as const },
      { email: "shashank@travel.com", firstName: "Shashank", lastName: "Sanghvi", role: "creator" as const },
      { email: "shakir@mallu.com", firstName: "Shakir", lastName: "Subhan", role: "creator" as const },
      { email: "shenaz@treasury.com", firstName: "Shenaz", lastName: "Treasurywala", role: "creator" as const },
      { email: "brinda@sharma.com", firstName: "Brinda", lastName: "Sharma", role: "creator" as const },
      { email: "pooja@dhingra.com", firstName: "Pooja", lastName: "Dhingra", role: "creator" as const },
      { email: "shipra@khanna.com", firstName: "Shipra", lastName: "Khanna", role: "creator" as const },
      { email: "vikas@khanna.com", firstName: "Vikas", lastName: "Khanna", role: "creator" as const },
      { email: "ranveer@brar.com", firstName: "Ranveer", lastName: "Brar", role: "creator" as const },
      { email: "kunal@kapur.com", firstName: "Kunal", lastName: "Kapur", role: "creator" as const },
      { email: "shivesh@baking.com", firstName: "Shivesh", lastName: "Bhatia", role: "creator" as const },
      { email: "neeraj@chopra.com", firstName: "Neeraj", lastName: "Chopra", role: "creator" as const },
      { email: "gaurav@tech.com", firstName: "Gaurav", lastName: "Chaudhary", role: "creator" as const },
      { email: "shlok@tech.com", firstName: "Shlok", lastName: "Srivastava", role: "creator" as const },
      { email: "naman@tech.com", firstName: "Naman", lastName: "Deshmukh", role: "creator" as const },
      { email: "dhruv@rathee.com", firstName: "Dhruv", lastName: "Rathee", role: "creator" as const },
      { email: "alakh@physics.com", firstName: "Alakh", lastName: "Pandey", role: "creator" as const },
      { email: "vivek@bindra.com", firstName: "Vivek", lastName: "Bindra", role: "creator" as const }
    ];

    const createdInfluencers = [];
    for (const user of influencerUsers) {
      const [createdUser] = await db.insert(users).values({
        ...user,
        password: await hashPassword("password123")
      }).returning().onConflictDoNothing();
      if (createdUser) createdInfluencers.push(createdUser);
    }

    // Add creator profiles from CSV data
    const realCreators = [
      {
        userId: createdInfluencers[0]?.id,
        username: "dimpisanghvi_ws",
        displayName: "Dimpi Sanghvi",
        bio: "Luxury lifestyle & travel influencer (E4M award)",
        niche: "Travel",
        followersCount: 5000000,
        engagementRate: "3.10",
        averageRate: 150000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/women/20.jpg",
        tags: ["travel", "lifestyle"]
      },
      {
        userId: createdInfluencers[1]?.id,
        username: "iamshashh",
        displayName: "Shashank Sanghvi",
        bio: "Luxury travel influencer, connoisseur of cars & hotels",
        niche: "Travel",
        followersCount: 3400000,
        engagementRate: "2.80",
        averageRate: 120000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/25.jpg",
        tags: ["travel", "luxury"]
      },
      {
        userId: createdInfluencers[2]?.id,
        username: "mallu_traveler",
        displayName: "Shakir Subhan",
        bio: "Travel vlogger exploring 80+ countries",
        niche: "Travel",
        followersCount: 2300000,
        engagementRate: "4.00",
        averageRate: 80000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/30.jpg",
        tags: ["travel", "vlogging"]
      },
      {
        userId: createdInfluencers[3]?.id,
        username: "shenaztreasury",
        displayName: "Shenaz Treasurywala",
        bio: "Sustainable travel & wellness blogger, collects smiles",
        niche: "Travel",
        followersCount: 1400000,
        engagementRate: "4.50",
        averageRate: 90000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/women/25.jpg",
        tags: ["travel", "wellness"]
      },
      {
        userId: createdInfluencers[4]?.id,
        username: "brindasharma",
        displayName: "Brinda Sharma",
        bio: "Motorcycle travel influencer; founder of Waqa Coffee",
        niche: "Travel",
        followersCount: 1300000,
        engagementRate: "3.90",
        averageRate: 85000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/women/30.jpg",
        tags: ["travel", "motorcycle"]
      },
      {
        userId: createdInfluencers[5]?.id,
        username: "poojadhingra",
        displayName: "Pooja Dhingra",
        bio: "Pastry chef & entrepreneur (Le15 Patisserie founder)",
        niche: "Food",
        followersCount: 7000000,
        engagementRate: "4.00",
        averageRate: 200000,
        location: "Mumbai, India",
        profileImageUrl: "https://randomuser.me/api/portraits/women/35.jpg",
        tags: ["food", "pastry"]
      },
      {
        userId: createdInfluencers[6]?.id,
        username: "masterchefshiprakhanna",
        displayName: "Shipra Khanna",
        bio: "Celebrity chef (MasterChef India winner) & author",
        niche: "Food",
        followersCount: 6200000,
        engagementRate: "4.50",
        averageRate: 180000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/women/40.jpg",
        tags: ["food", "chef"]
      },
      {
        userId: createdInfluencers[7]?.id,
        username: "vikaskhannagroup",
        displayName: "Vikas Khanna",
        bio: "Michelin-star chef & restaurateur (global presence)",
        niche: "Food",
        followersCount: 5400000,
        engagementRate: "3.90",
        averageRate: 150000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/35.jpg",
        tags: ["food", "gourmet"]
      },
      {
        userId: createdInfluencers[8]?.id,
        username: "ranveer.brar",
        displayName: "Ranveer Brar",
        bio: "Chef, author & TV host known as \"The Food Sufi\"",
        niche: "Food",
        followersCount: 4400000,
        engagementRate: "4.20",
        averageRate: 160000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/40.jpg",
        tags: ["food", "television"]
      },
      {
        userId: createdInfluencers[9]?.id,
        username: "chefkunal",
        displayName: "Kunal Kapur",
        bio: "Celebrity chef & restaurateur from MasterChef India",
        niche: "Food",
        followersCount: 3800000,
        engagementRate: "4.10",
        averageRate: 150000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
        tags: ["food", "cooking"]
      },
      {
        userId: createdInfluencers[10]?.id,
        username: "shivesh17",
        displayName: "Shivesh Bhatia",
        bio: "Home baker & cookbook author (Forbes 30 Under 30 Asia)",
        niche: "Food",
        followersCount: 3400000,
        engagementRate: "3.80",
        averageRate: 140000,
        location: "New Delhi, India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/50.jpg",
        tags: ["food", "baking"]
      },
      {
        userId: createdInfluencers[11]?.id,
        username: "neeraj____chopra",
        displayName: "Neeraj Chopra",
        bio: "Olympic javelin champion & sports influencer",
        niche: "Sports",
        followersCount: 8400000,
        engagementRate: "6.60",
        averageRate: 200000,
        location: "Haryana, India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/55.jpg",
        tags: ["sports", "fitness"]
      },
      {
        userId: createdInfluencers[12]?.id,
        username: "technicalguruji",
        displayName: "Gaurav Chaudhary",
        bio: "YouTuber sharing tech gadget reviews; engineer by education",
        niche: "Tech",
        followersCount: 6100000,
        engagementRate: "4.00",
        averageRate: 180000,
        location: "Dubai, UAE",
        profileImageUrl: "https://randomuser.me/api/portraits/men/60.jpg",
        tags: ["tech", "gadgets"]
      },
      {
        userId: createdInfluencers[13]?.id,
        username: "techburner",
        displayName: "Shlok Srivastava",
        bio: "Tech content creator (smartphones & gadgets)",
        niche: "Tech",
        followersCount: 4600000,
        engagementRate: "4.20",
        averageRate: 150000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/65.jpg",
        tags: ["tech", "gadgets"]
      },
      {
        userId: createdInfluencers[14]?.id,
        username: "techplusgadgets",
        displayName: "Naman Deshmukh",
        bio: "Tech reviewer; Forbes100 creator focusing on gadgets",
        niche: "Tech",
        followersCount: 3600000,
        engagementRate: "4.50",
        averageRate: 130000,
        location: "India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/70.jpg",
        tags: ["tech", "reviews"]
      },
      {
        userId: createdInfluencers[15]?.id,
        username: "dhruv_rathee",
        displayName: "Dhruv Rathee",
        bio: "YouTube educator on social/political issues (25M subs)",
        niche: "Education",
        followersCount: 14000000,
        engagementRate: "6.00",
        averageRate: 200000,
        location: "Germany",
        profileImageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
        tags: ["education", "politics"]
      },
      {
        userId: createdInfluencers[16]?.id,
        username: "physicswallah",
        displayName: "Alakh Pandey",
        bio: "Founder of Physics Wallah; popular IIT/NEET educator",
        niche: "Education",
        followersCount: 4000000,
        engagementRate: "7.00",
        averageRate: 100000,
        location: "Prayagraj, India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/80.jpg",
        tags: ["education", "science"]
      },
      {
        userId: createdInfluencers[17]?.id,
        username: "vivek_bindra",
        displayName: "Dr. Vivek Bindra",
        bio: "Business coach & motivational speaker; founder of Bada Business",
        niche: "Education",
        followersCount: 3600000,
        engagementRate: "5.50",
        averageRate: 120000,
        location: "Noida, India",
        profileImageUrl: "https://randomuser.me/api/portraits/men/85.jpg",
        tags: ["education", "business"]
      }
    ];

    // Filter out creators with valid user IDs
    const validCreators = realCreators.filter(creator => creator.userId);
    
    if (validCreators.length > 0) {
      await db.insert(creators).values(validCreators).onConflictDoNothing();
      console.log(`Added ${validCreators.length} real influencers to the database!`);
    }
  }
}

export const storage = new DatabaseStorage();