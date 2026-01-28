import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMyHairBookings } from '../hooks';
import { BookingCard } from '../components';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { Button } from '@core/components/Button';
import { Modal } from '@core/components/Modal';
import { useAuth } from '@core/hooks/useAuth';

export function HairMyBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { upcomingBookings, pastBookings, isLoading, error, cancelBooking } = useMyHairBookings();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  if (authLoading) {
    return <LoadingSpinner text="로딩 중..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    const success = await cancelBooking(bookingToCancel);
    setIsCancelling(false);

    if (success) {
      setCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  return (
    <div className="hair-my-bookings-page">
      <div className="page-header">
        <h1>내 예약</h1>
        <Link to="/hair">
          <Button variant="primary">새 예약하기</Button>
        </Link>
      </div>

      {isLoading && <LoadingSpinner text="예약 목록을 불러오는 중..." />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bookings-container">
          <section className="bookings-section">
            <h2>예정된 예약 ({upcomingBookings.length})</h2>
            {upcomingBookings.length === 0 ? (
              <div className="empty-state">
                <p>예정된 예약이 없습니다.</p>
                <Link to="/hair">
                  <Button variant="outline">헤어샵 둘러보기</Button>
                </Link>
              </div>
            ) : (
              <div className="bookings-list">
                {upcomingBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelClick}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="bookings-section">
            <h2>지난 예약 ({pastBookings.length})</h2>
            {pastBookings.length === 0 ? (
              <div className="empty-state">
                <p>지난 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="bookings-list">
                {pastBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="예약 취소"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>
              돌아가기
            </Button>
            <Button variant="danger" onClick={handleCancelConfirm} isLoading={isCancelling}>
              취소하기
            </Button>
          </>
        }
      >
        <p>정말 이 예약을 취소하시겠습니까?</p>
        <p>취소된 예약은 복구할 수 없습니다.</p>
      </Modal>
    </div>
  );
}
