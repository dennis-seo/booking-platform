import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useHairShop, useStylists } from '../hooks';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { Button } from '@core/components/Button';
import { Modal } from '@core/components/Modal';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { hairBookingService } from '../services';
import type { HairBooking } from '../types';
import { MONTH_NAMES, formatDate, formatTime } from '@core/utils/dateUtils';
import { formatDuration } from '@core/utils/timeSlotUtils';

export function ScheduleManagePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { shop, isLoading: shopLoading } = useHairShop(shopId);
  const { stylists, isLoading: stylistsLoading } = useStylists(shopId);

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [bookings, setBookings] = useState<HairBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<HairBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bookings for the current month
  const fetchBookings = useCallback(async () => {
    if (!shopId) return;

    setIsLoadingBookings(true);
    try {
      // Get all bookings for this shop (in real app, filter by date range)
      const allBookings = await hairBookingService.getBookingsByShop(shopId);

      // Filter by current month
      const monthStart = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`;
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const monthEnd = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-01`;

      const filteredBookings = allBookings.filter(b =>
        b.bookingDate >= monthStart && b.bookingDate < monthEnd
      );

      // Populate service and stylist info
      const populatedBookings = await Promise.all(
        filteredBookings.map(async b => {
          const booking = await hairBookingService.getBookingById(b.id);
          return booking || b;
        })
      );

      setBookings(populatedBookings);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [shopId, currentYear, currentMonth]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleBookingClick = (booking: HairBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleSlotClick = (date: string, time: string, stylistId: string) => {
    // Could open a modal to create a new booking at this slot
    console.log('Slot clicked:', { date, time, stylistId });
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    try {
      await hairBookingService.confirmBooking(selectedBooking.id);
      await fetchBookings();
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error('Failed to confirm booking', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm('이 예약을 취소하시겠습니까?')) return;

    setIsProcessing(true);
    try {
      await hairBookingService.cancelBooking(selectedBooking.id);
      await fetchBookings();
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error('Failed to cancel booking', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    try {
      await hairBookingService.completeBooking(selectedBooking.id);
      await fetchBookings();
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error('Failed to complete booking', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || shopLoading || stylistsLoading) {
    return <LoadingSpinner text="로딩 중..." />;
  }

  if (!isAuthenticated || user?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  if (!shop || shop.ownerId !== user.id) {
    return <Navigate to="/" replace />;
  }

  // Calculate stats
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="schedule-manage-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/hair/admin/${shopId}`} className="back-link">← {shop.name}</Link>
          <h1>예약 스케줄</h1>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="schedule-controls">
        <div className="month-nav">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            ◀ 이전달
          </Button>
          <span className="current-month">
            {currentYear}년 {MONTH_NAMES[currentMonth]}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            다음달 ▶
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            오늘
          </Button>
        </div>

        <div className="schedule-stats">
          <span className="stat confirmed">확정 {confirmedCount}</span>
          <span className="stat pending">대기 {pendingCount}</span>
          <span className="stat completed">완료 {completedCount}</span>
          <span className="stat cancelled">취소 {cancelledCount}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="schedule-legend">
        <span className="legend-item available">예약 가능</span>
        <span className="legend-item confirmed">확정</span>
        <span className="legend-item pending">대기중</span>
        <span className="legend-item completed">완료</span>
        <span className="legend-item non-working">영업외</span>
      </div>

      {/* Schedule Grid */}
      {isLoadingBookings ? (
        <LoadingSpinner text="예약 정보를 불러오는 중..." />
      ) : stylists.length === 0 ? (
        <div className="empty-state">
          <p>스타일리스트를 먼저 등록해주세요.</p>
          <Link to={`/hair/admin/${shopId}/stylists`}>
            <Button variant="primary">스타일리스트 등록</Button>
          </Link>
        </div>
      ) : (
        <ScheduleGrid
          shop={shop}
          stylists={stylists}
          bookings={bookings}
          year={currentYear}
          month={currentMonth}
          onSlotClick={handleSlotClick}
          onBookingClick={handleBookingClick}
        />
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="예약 상세"
        footer={
          selectedBooking && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' ? (
            <>
              <Button variant="danger" onClick={handleCancelBooking} disabled={isProcessing}>
                취소
              </Button>
              {selectedBooking.status === 'pending' && (
                <Button variant="primary" onClick={handleConfirmBooking} disabled={isProcessing}>
                  확정
                </Button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button variant="primary" onClick={handleCompleteBooking} disabled={isProcessing}>
                  완료
                </Button>
              )}
            </>
          ) : null
        }
      >
        {selectedBooking && (
          <div className="booking-detail">
            <div className="detail-row">
              <span className="label">상태</span>
              <span className={`value status-${selectedBooking.status}`}>
                {selectedBooking.status === 'pending' && '대기중'}
                {selectedBooking.status === 'confirmed' && '확정'}
                {selectedBooking.status === 'completed' && '완료'}
                {selectedBooking.status === 'cancelled' && '취소됨'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">고객</span>
              <span className="value">{selectedBooking.customerName || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">연락처</span>
              <span className="value">{selectedBooking.customerPhone || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">서비스</span>
              <span className="value">
                {selectedBooking.service?.name || '-'}
                {selectedBooking.service && ` (${formatDuration(selectedBooking.service.durationMinutes)})`}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">날짜</span>
              <span className="value">{formatDate(selectedBooking.bookingDate)}</span>
            </div>
            <div className="detail-row">
              <span className="label">시간</span>
              <span className="value">
                {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">스타일리스트</span>
              <span className="value">
                {selectedBooking.stylist ? `${selectedBooking.stylist.name} ${selectedBooking.stylist.title}` : '지정 안함'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">금액</span>
              <span className="value price">
                {selectedBooking.service?.price.toLocaleString() || 0}원
              </span>
            </div>
            {selectedBooking.notes && (
              <div className="detail-row notes">
                <span className="label">요청사항</span>
                <span className="value">{selectedBooking.notes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
