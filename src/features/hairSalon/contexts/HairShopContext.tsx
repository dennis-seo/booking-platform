import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { HairShop, HairService, Stylist } from '../types';
import { hairShopService } from '../services';

interface HairShopContextValue {
  currentShop: HairShop | null;
  services: HairService[];
  stylists: Stylist[];
  isLoading: boolean;
  error: string | null;
  loadShop: (shopId: string) => Promise<void>;
  clearShop: () => void;
}

const HairShopContext = createContext<HairShopContextValue | null>(null);

export function HairShopProvider({ children }: { children: ReactNode }) {
  const [currentShop, setCurrentShop] = useState<HairShop | null>(null);
  const [services, setServices] = useState<HairService[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShop = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [shop, shopServices, shopStylists] = await Promise.all([
        hairShopService.getShopById(shopId),
        hairShopService.getServicesByShop(shopId),
        hairShopService.getStylistsByShop(shopId),
      ]);

      if (!shop) {
        setError('샵을 찾을 수 없습니다.');
        return;
      }

      setCurrentShop(shop);
      setServices(shopServices);
      setStylists(shopStylists);
    } catch (err) {
      setError(err instanceof Error ? err.message : '샵 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearShop = useCallback(() => {
    setCurrentShop(null);
    setServices([]);
    setStylists([]);
    setError(null);
  }, []);

  return (
    <HairShopContext.Provider
      value={{
        currentShop,
        services,
        stylists,
        isLoading,
        error,
        loadShop,
        clearShop,
      }}
    >
      {children}
    </HairShopContext.Provider>
  );
}

export function useHairShopContext(): HairShopContextValue {
  const context = useContext(HairShopContext);
  if (!context) {
    throw new Error('useHairShopContext must be used within a HairShopProvider');
  }
  return context;
}
