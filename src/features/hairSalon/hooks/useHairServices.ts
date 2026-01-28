import { useState, useEffect, useCallback } from 'react';
import type { HairService } from '../types';
import { hairShopService } from '../services';
import { logger } from '@core/utils/logger';

export function useHairServices(shopId: string | undefined) {
  const [services, setServices] = useState<HairService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!shopId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await hairShopService.getServicesByShop(shopId);
      setServices(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '서비스 목록을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch services', err);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, HairService[]>);

  return {
    services,
    groupedServices,
    isLoading,
    error,
    refetch: fetchServices,
  };
}
