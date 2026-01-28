import { useState, useEffect, useCallback } from 'react';
import type { HairBooking, CreateHairBookingData } from '../types';
import { hairBookingService } from '../services';
import { useAuth } from '@core/hooks/useAuth';
import { logger } from '@core/utils/logger';

export function useMyHairBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<HairBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await hairBookingService.getBookingsByCustomer(user.id);
      // Sort by date descending
      data.sort((a, b) => {
        const dateA = new Date(`${a.bookingDate}T${a.startTime}`);
        const dateB = new Date(`${b.bookingDate}T${b.startTime}`);
        return dateB.getTime() - dateA.getTime();
      });
      setBookings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 목록을 불러오는데 실패했습니다.';
      setError(message);
      logger.error('Failed to fetch bookings', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await hairBookingService.cancelBooking(bookingId);
      await fetchBookings();
      return true;
    } catch (err) {
      logger.error('Failed to cancel booking', err);
      return false;
    }
  }, [fetchBookings]);

  const upcomingBookings = bookings.filter(b =>
    b.status !== 'cancelled' && b.status !== 'completed' &&
    new Date(`${b.bookingDate}T${b.startTime}`) >= new Date()
  );

  const pastBookings = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' ||
    new Date(`${b.bookingDate}T${b.startTime}`) < new Date()
  );

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    isLoading,
    error,
    refetch: fetchBookings,
    cancelBooking,
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
