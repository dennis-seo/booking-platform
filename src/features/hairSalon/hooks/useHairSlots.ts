import { useState, useEffect, useCallback } from 'react';
import type { HairBookingSlot } from '../types';
import { hairBookingService } from '../services';
import { toDateString } from '@core/utils/dateUtils';
import { logger } from '@core/utils/logger';

interface UseHairSlotsParams {
  shopId: string | undefined;
  date: Date | null;
  serviceDurationMinutes: number;
  stylistId?: string | null;
}

export function useHairSlots({
  shopId,
  date,
  serviceDurationMinutes,
  stylistId,
}: UseHairSlotsParams) {
  const [slots, setSlots] = useState<HairBookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!shopId || !date || !serviceDurationMinutes) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dateString = toDateString(date);
      const data = await hairBookingService.getAvailableSlots(
        shopId,
        dateString,
        serviceDurationMinutes,
        stylistId || undefined
      );
      setSlots(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 가능 시간을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch slots', err);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, date, serviceDurationMinutes, stylistId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const availableSlots = slots.filter(s => s.isAvailable);

  return {
    slots,
    availableSlots,
    isLoading,
    error,
    refetch: fetchSlots,
  };
}
