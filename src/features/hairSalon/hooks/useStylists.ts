import { useState, useEffect, useCallback } from 'react';
import type { Stylist } from '../types';
import { hairShopService } from '../services';
import { logger } from '@core/utils/logger';

export function useStylists(shopId: string | undefined) {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStylists = useCallback(async () => {
    if (!shopId) {
      setStylists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await hairShopService.getStylistsByShop(shopId);
      setStylists(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '스타일리스트 목록을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch stylists', err);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchStylists();
  }, [fetchStylists]);

  return {
    stylists,
    isLoading,
    error,
    refetch: fetchStylists,
  };
}
