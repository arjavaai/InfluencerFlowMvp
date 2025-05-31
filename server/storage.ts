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
  type UpsertUser,
  type Creator,
  type Brand,
  type Campaign,
  type Offer,
  type Contract,
  type Payment,
  type PerformanceReport,
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

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Creator operations
  getCreators(filters?: { niche?: string; minFollowers?: number; maxFollowers?: number; location?: string }): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByUserId(userId: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  
  // Brand operations
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandByUserId(userId: string): Promise<Brand | undefined>;
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
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Creator operations
  async getCreators(filters?: { niche?: string; minFollowers?: number; maxFollowers?: number; location?: string }): Promise<Creator[]> {
    const conditions = [eq(creators.isActive, true)];

    if (filters?.niche) {
      conditions.push(eq(creators.niche, filters.niche));
    }
    if (filters?.minFollowers) {
      conditions.push(sql`${creators.followersCount} >= ${filters.minFollowers}`);
    }
    if (filters?.maxFollowers) {
      conditions.push(sql`${creators.followersCount} <= ${filters.maxFollowers}`);
    }
    if (filters?.location) {
      conditions.push(ilike(creators.location, `%${filters.location}%`));
    }

    return await db.select().from(creators).where(and(...conditions)).orderBy(desc(creators.followersCount));
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async getCreatorByUserId(userId: string): Promise<Creator | undefined> {
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

  async getBrandByUserId(userId: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.userId, userId));
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  // Campaign operations
  async getCampaigns(brandId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.brandId, brandId)).orderBy(desc(campaigns.createdAt));
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
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  // Offer operations
  async getOffers(filters?: { campaignId?: number; creatorId?: number; status?: string }): Promise<(Offer & { creator: Creator; campaign: Campaign & { brand: Brand } })[]> {
    const conditions = [];

    if (filters?.campaignId) {
      conditions.push(eq(offers.campaignId, filters.campaignId));
    }
    if (filters?.creatorId) {
      conditions.push(eq(offers.creatorId, filters.creatorId));
    }
    if (filters?.status) {
      conditions.push(eq(offers.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(offers)
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .leftJoin(brands, eq(campaigns.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(offers.createdAt));
    
    return results.map(result => ({
      ...result.offers,
      creator: result.creators!,
      campaign: {
        ...result.campaigns!,
        brand: result.brands!,
      },
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
    const [updatedOffer] = await db
      .update(offers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    return updatedOffer;
  }

  // Contract operations
  async getContracts(filters?: { brandId?: number; creatorId?: number }): Promise<(Contract & { offer: Offer & { creator: Creator; campaign: Campaign & { brand: Brand } } })[]> {
    const conditions = [];

    if (filters?.brandId) {
      conditions.push(eq(brands.id, filters.brandId));
    }
    if (filters?.creatorId) {
      conditions.push(eq(creators.id, filters.creatorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(contracts)
      .leftJoin(offers, eq(contracts.offerId, offers.id))
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .leftJoin(brands, eq(campaigns.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(contracts.createdAt));
    
    return results.map(result => ({
      ...result.contracts,
      offer: {
        ...result.offers!,
        creator: result.creators!,
        campaign: {
          ...result.campaigns!,
          brand: result.brands!,
        },
      },
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
    const [updatedContract] = await db
      .update(contracts)
      .set(updates)
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }

  // Payment operations
  async getPayments(filters?: { brandId?: number; creatorId?: number; status?: string }): Promise<(Payment & { contract: Contract & { offer: Offer & { creator: Creator; campaign: Campaign } } })[]> {
    const conditions = [];

    if (filters?.brandId) {
      conditions.push(eq(brands.id, filters.brandId));
    }
    if (filters?.creatorId) {
      conditions.push(eq(creators.id, filters.creatorId));
    }
    if (filters?.status) {
      conditions.push(eq(payments.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(payments)
      .leftJoin(contracts, eq(payments.contractId, contracts.id))
      .leftJoin(offers, eq(contracts.offerId, offers.id))
      .leftJoin(creators, eq(offers.creatorId, creators.id))
      .leftJoin(campaigns, eq(offers.campaignId, campaigns.id))
      .leftJoin(brands, eq(campaigns.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt));
    
    return results.map(result => ({
      ...result.payments,
      contract: {
        ...result.contracts!,
        offer: {
          ...result.offers!,
          creator: result.creators!,
          campaign: result.campaigns!,
        },
      },
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
    const [updatedPayment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Performance report operations
  async getPerformanceReports(contractId: number): Promise<PerformanceReport[]> {
    return await db.select().from(performanceReports).where(eq(performanceReports.contractId, contractId));
  }

  async createPerformanceReport(report: InsertPerformanceReport): Promise<PerformanceReport> {
    const [newReport] = await db.insert(performanceReports).values(report).returning();
    return newReport;
  }

  // Seed data for demo
  async seedData(): Promise<void> {
    // Clear existing data
    await db.delete(performanceReports);
    await db.delete(payments);
    await db.delete(contracts);
    await db.delete(offers);
    await db.delete(campaigns);
    await db.delete(creators);
    await db.delete(brands);

    // Seed creators
    const creatorsData = [
      {
        userId: "creator1",
        username: "maya_lifestyle",
        displayName: "Maya Johnson",
        bio: "Lifestyle content creator sharing fashion, travel, and daily inspiration",
        niche: "Lifestyle",
        followersCount: 125000,
        engagementRate: "4.2",
        averageRate: "500",
        location: "Los Angeles, CA",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b6e9?w=400&h=400&fit=crop&crop=face",
        tags: ["Fashion", "Lifestyle", "Travel"],
      },
      {
        userId: "creator2",
        username: "alex_tech",
        displayName: "Alex Chen",
        bio: "Tech reviewer and gadget enthusiast",
        niche: "Tech",
        followersCount: 89000,
        engagementRate: "3.8",
        averageRate: "750",
        location: "San Francisco, CA",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        tags: ["Tech", "Reviews", "Gadgets"],
      },
      {
        userId: "creator3",
        username: "sarah_fit",
        displayName: "Sarah Williams",
        bio: "Fitness trainer and wellness advocate",
        niche: "Fitness",
        followersCount: 200000,
        engagementRate: "5.1",
        averageRate: "650",
        location: "Miami, FL",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        tags: ["Fitness", "Wellness", "Health"],
      }
    ];

    await db.insert(creators).values(creatorsData);
  }
}

export const storage = new DatabaseStorage();
