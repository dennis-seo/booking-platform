import { useState, useCallback, useMemo } from 'react';
import { useFetch } from '@core/hooks/useFetch';
import type { HairBooking, CreateHairBookingData } from '../types';
import { hairBookingService } from '../services';
import { useAuth } from '@core/hooks/useAuth';
import { logger } from '@core/utils/logger';

export function useMyHairBookings() {
  const { user } = useAuth();

  const { data: bookings, refetch, ...rest } = useFetch(
    async () => {
      const data = await hairBookingService.getBookingsByCustomer(user!.id);
      // Sort by date descending
      return data.sort((a, b) => {
        const dateA = new Date(`${a.bookingDate}T${a.startTime}`);
        const dateB = new Date(`${b.bookingDate}T${b.startTime}`);
        return dateB.getTime() - dateA.getTime();
      });
    },
    {
      initialData: [] as HairBooking[],
      enabled: !!user,
      errorMessage: '예약 목록을 불러오는데 실패했습니다.',
    }
  );

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await hairBookingService.cancelBooking(bookingId);
      await refetch();
      return true;
    } catch (err) {
      logger.error('Failed to cancel booking', err);
      return false;
    }
  }, [refetch]);

  const upcomingBookings = useMemo(() =>
    bookings.filter(b =>
      b.status !== 'cancelled' && b.status !== 'completed' &&
      new Date(`${b.bookingDate}T${b.startTime}`) >= new Date()
    ),
    [bookings]
  );

  const pastBookings = useMemo(() =>
    bookings.filter(b =>
      b.status === 'completed' || b.status === 'cancelled' ||
      new Date(`${b.bookingDate}T${b.startTime}`) < new Date()
    ),
    [bookings]
  );

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    refetch,
    cancelBooking,
    ...rest,
  };
}

export function useCreateHairBooking() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (data: CreateHairBookingData): Promise<HairBooking | null> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const booking = await hairBookingService.createBooking(
        user.id,
        user.name,
        user.phone || '',
        data
      );
      return booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약에 실패했습니다.';
      setError(message);
      logger.error('Failed to create booking', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    createBooking,
    isLoading,
    error,
  };
}
