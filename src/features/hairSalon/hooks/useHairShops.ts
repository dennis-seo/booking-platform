import { useState, useEffect, useCallback } from 'react';
import type { HairShop } from '../types';
import { hairShopService } from '../services';
import { logger } from '@core/utils/logger';

export function useHairShops() {
  const [shops, setShops] = useState<HairShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hairShopService.getShops();
      setShops(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '샵 목록을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch shops', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return {
    shops,
    isLoading,
    error,
    refetch: fetchShops,
  };
}

export function useHairShop(shopId: string | undefined) {
  const [shop, setShop] = useState<HairShop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = useCallback(async () => {
    if (!shopId) {
      setShop(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await hairShopService.getShopById(shopId);
      setShop(data);
      if (!data) {
        setError('샵을 찾을 수 없습니다.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '샵 정보를 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch shop', err);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return {
    shop,
    isLoading,
    error,
    refetch: fetchShop,
  };
}

export function useOwnerShops(ownerId: string | undefined) {
  const [shops, setShops] = useState<HairShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    if (!ownerId) {
      setShops([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await hairShopService.getShopsByOwner(ownerId);
      setShops(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '내 샵 목록을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch owner shops', err);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return {
    shops,
    isLoading,
    error,
    refetch: fetchShops,
  };
}
