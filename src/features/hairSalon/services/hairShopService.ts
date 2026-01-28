import type { HairShop, Stylist, HairService, CreateHairShopData, UpdateHairShopData, CreateStylistData, UpdateStylistData, CreateHairServiceData, UpdateHairServiceData } from '../types';
import { mockHairShops } from '../mocks/shops';
import { mockStylists } from '../mocks/stylists';
import { mockHairServices } from '../mocks/services';
import { logger } from '@core/utils/logger';

// In-memory storage that can be modified
let shops = [...mockHairShops];
let stylists = [...mockStylists];
let services = [...mockHairServices];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const hairShopService = {
  // Shop operations
  async getShops(): Promise<HairShop[]> {
    await delay(300);
    logger.debug('Fetching all shops');
    return shops.filter(s => s.isActive);
  },

  async getShopById(id: string): Promise<HairShop | null> {
    await delay(200);
    logger.debug('Fetching shop by id', { id });
    return shops.find(s => s.id === id && s.isActive) || null;
  },

  async getShopsByOwner(ownerId: string): Promise<HairShop[]> {
    await delay(300);
    logger.debug('Fetching shops by owner', { ownerId });
    return shops.filter(s => s.ownerId === ownerId);
  },

  async createShop(ownerId: string, data: CreateHairShopData): Promise<HairShop> {
    await delay(500);
    const newShop: HairShop = {
      id: `shop-${Date.now()}`,
      ownerId,
      name: data.name,
      address: data.address,
      phone: data.phone,
      description: data.description,
      slotIntervalMinutes: data.slotIntervalMinutes || 30,
      operatingHours: data.operatingHours,
      imageUrl: data.imageUrl || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    shops.push(newShop);
    logger.info('Shop created', { shopId: newShop.id });
    return newShop;
  },

  async updateShop(id: string, data: UpdateHairShopData): Promise<HairShop | null> {
    await delay(400);
    const index = shops.findIndex(s => s.id === id);
    if (index === -1) return null;

    shops[index] = {
      ...shops[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    logger.info('Shop updated', { shopId: id });
    return shops[index];
  },

  async deleteShop(id: string): Promise<boolean> {
    await delay(300);
    const index = shops.findIndex(s => s.id === id);
    if (index === -1) return false;

    shops[index].isActive = false;
    logger.info('Shop deleted', { shopId: id });
    return true;
  },

  // Stylist operations
  async getStylistsByShop(shopId: string): Promise<Stylist[]> {
    await delay(200);
    logger.debug('Fetching stylists by shop', { shopId });
    return stylists.filter(s => s.shopId === shopId && s.isActive);
  },

  async getStylistById(id: string): Promise<Stylist | null> {
    await delay(150);
    return stylists.find(s => s.id === id && s.isActive) || null;
  },

  async createStylist(data: CreateStylistData): Promise<Stylist> {
    await delay(400);
    const newStylist: Stylist = {
      id: `stylist-${Date.now()}`,
      shopId: data.shopId,
      name: data.name,
      title: data.title,
      profileImage: data.profileImage || null,
      introduction: data.introduction,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    stylists.push(newStylist);
    logger.info('Stylist created', { stylistId: newStylist.id });
    return newStylist;
  },

  async updateStylist(id: string, data: UpdateStylistData): Promise<Stylist | null> {
    await delay(300);
    const index = stylists.findIndex(s => s.id === id);
    if (index === -1) return null;

    stylists[index] = { ...stylists[index], ...data };
    logger.info('Stylist updated', { stylistId: id });
    return stylists[index];
  },

  async deleteStylist(id: string): Promise<boolean> {
    await delay(200);
    const index = stylists.findIndex(s => s.id === id);
    if (index === -1) return false;

    stylists[index].isActive = false;
    logger.info('Stylist deleted', { stylistId: id });
    return true;
  },

  // Service operations
  async getServicesByShop(shopId: string): Promise<HairService[]> {
    await delay(200);
    logger.debug('Fetching services by shop', { shopId });
    return services.filter(s => s.shopId === shopId && s.isActive);
  },

  async getServiceById(id: string): Promise<HairService | null> {
    await delay(150);
    return services.find(s => s.id === id && s.isActive) || null;
  },

  async createService(data: CreateHairServiceData): Promise<HairService> {
    await delay(400);
    const newService: HairService = {
      id: `svc-${Date.now()}`,
      shopId: data.shopId,
      name: data.name,
      description: data.description,
      durationMinutes: data.durationMinutes,
      price: data.price,
      category: data.category,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    services.push(newService);
    logger.info('Service created', { serviceId: newService.id });
    return newService;
  },

  async updateService(id: string, data: UpdateHairServiceData): Promise<HairService | null> {
    await delay(300);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;

    services[index] = { ...services[index], ...data };
    logger.info('Service updated', { serviceId: id });
    return services[index];
  },

  async deleteService(id: string): Promise<boolean> {
    await delay(200);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return false;

    services[index].isActive = false;
    logger.info('Service deleted', { serviceId: id });
    return true;
  },
};
