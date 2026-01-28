import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { HairService, Stylist, CreateHairBookingData, HairBooking } from '../types';
import { hairBookingService } from '../services';
import { useAuth } from '@core/hooks/useAuth';

type BookingStep = 'service' | 'datetime' | 'stylist' | 'confirm' | 'complete';

interface BookingState {
  shopId: string | null;
  selectedService: HairService | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedStylist: Stylist | null;
  notes: string;
  currentStep: BookingStep;
}

interface HairBookingContextValue extends BookingState {
  setShopId: (shopId: string) => void;
  selectService: (service: HairService) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  selectStylist: (stylist: Stylist | null) => void;
  setNotes: (notes: string) => void;
  goToStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitBooking: () => Promise<HairBooking | null>;
  resetBooking: () => void;
  isLoading: boolean;
  error: string | null;
  createdBooking: HairBooking | null;
}

const STEPS: BookingStep[] = ['service', 'datetime', 'stylist', 'confirm', 'complete'];

const initialState: BookingState = {
  shopId: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  selectedStylist: null,
  notes: '',
  currentStep: 'service',
};

const HairBookingContext = createContext<HairBookingContextValue | null>(null);

export function HairBookingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<BookingState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<HairBooking | null>(null);

  const setShopId = useCallback((shopId: string) => {
    setState(prev => ({ ...prev, shopId }));
  }, []);

  const selectService = useCallback((service: HairService) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      // Reset downstream selections when service changes
      selectedDate: null,
      selectedTime: null,
    }));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: null, // Reset time when date changes
    }));
  }, []);

  const selectTime = useCallback((time: string) => {
    setState(prev => ({ ...prev, selectedTime: time }));
  }, []);

  const selectStylist = useCallback((stylist: Stylist | null) => {
    setState(prev => ({ ...prev, selectedStylist: stylist }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, notes }));
  }, []);

  const goToStep = useCallback((step: BookingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEPS.indexOf(prev.currentStep);
      if (currentIndex < STEPS.length - 1) {
        return { ...prev, currentStep: STEPS[currentIndex + 1] };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEPS.indexOf(prev.currentStep);
      if (currentIndex > 0) {
        return { ...prev, currentStep: STEPS[currentIndex - 1] };
      }
      return prev;
    });
  }, []);

  const submitBooking = useCallback(async (): Promise<HairBooking | null> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return null;
    }

    if (!state.shopId || !state.selectedService || !state.selectedDate || !state.selectedTime) {
      setError('필수 정보를 모두 입력해주세요.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingData: CreateHairBookingData = {
        shopId: state.shopId,
        serviceId: state.selectedService.id,
        stylistId: state.selectedStylist?.id || null,
        bookingDate: state.selectedDate.toISOString().split('T')[0],
        startTime: state.selectedTime,
        notes: state.notes || undefined,
      };

      const booking = await hairBookingService.createBooking(
        user.id,
        user.name,
        user.phone || '',
        bookingData
      );

      setCreatedBooking(booking);
      setState(prev => ({ ...prev, currentStep: 'complete' }));
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, state]);

  const resetBooking = useCallback(() => {
    setState(initialState);
    setCreatedBooking(null);
    setError(null);
  }, []);

  return (
    <HairBookingContext.Provider
      value={{
        ...state,
        setShopId,
        selectService,
        selectDate,
        selectTime,
        selectStylist,
        setNotes,
        goToStep,
        nextStep,
        prevStep,
        submitBooking,
        resetBooking,
        isLoading,
        error,
        createdBooking,
      }}
    >
      {children}
    </HairBookingContext.Provider>
  );
}

export function useHairBookingContext(): HairBookingContextValue {
  const context = useContext(HairBookingContext);
  if (!context) {
    throw new Error('useHairBookingContext must be used within a HairBookingProvider');
  }
  return context;
}
