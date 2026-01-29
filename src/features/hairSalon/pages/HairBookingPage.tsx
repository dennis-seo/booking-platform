import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHairShop, useHairServices, useStylists } from '../hooks';
import { HairBookingProvider, useHairBookingContext } from '../contexts';
import { ServiceSelector, StylistSelector, BookingConfirm, BookingTimelineSelector } from '../components';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { Button } from '@core/components/Button';
import { useAuth } from '@core/hooks/useAuth';

function BookingFlow() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { shop, isLoading: shopLoading, error: shopError } = useHairShop(shopId);
  const { services } = useHairServices(shopId);
  const { stylists } = useStylists(shopId);

  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    selectedStylist,
    notes,
    setShopId,
    selectService,
    selectDate,
    selectTime,
    selectStylist,
    setNotes,
    nextStep,
    prevStep,
    submitBooking,
    createdBooking,
    isLoading,
    error,
  } = useHairBookingContext();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Set shop ID on mount
  useEffect(() => {
    if (shopId) {
      setShopId(shopId);
    }
  }, [shopId, setShopId]);

  if (shopLoading) {
    return <LoadingSpinner text="샵 정보를 불러오는 중..." />;
  }

  if (shopError || !shop) {
    return (
      <div className="error-page">
        <h2>샵을 찾을 수 없습니다</h2>
        <Link to="/hair">
          <Button variant="primary">샵 목록으로</Button>
        </Link>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="booking-step">
            <h2>서비스 선택</h2>
            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onSelect={service => {
                selectService(service);
              }}
            />
            <div className="step-actions">
              <Link to={`/hair/${shopId}`}>
                <Button variant="outline">취소</Button>
              </Link>
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!selectedService}
              >
                다음
              </Button>
            </div>
          </div>
        );

      case 'stylist':
        return (
          <div className="booking-step">
            <h2>스타일리스트 선택</h2>
            {selectedService && (
              <p className="selected-service-info">
                선택된 서비스: {selectedService.name} ({selectedService.durationMinutes}분)
              </p>
            )}
            <StylistSelector
              stylists={stylists}
              selectedStylist={selectedStylist}
              onSelect={selectStylist}
              allowNoPreference={true}
            />
            <div className="step-actions">
              <Button variant="outline" onClick={prevStep}>
                이전
              </Button>
              <Button variant="primary" onClick={nextStep}>
                다음
              </Button>
            </div>
          </div>
        );

      case 'datetime':
        const handleDateTimeSelect = (date: Date, time: string) => {
          selectDate(date);
          selectTime(time);
        };

        return (
          <div className="booking-step datetime-step">
            <h2>날짜 및 시간 선택</h2>
            {selectedService && (
              <p className="selected-service-info">
                선택된 서비스: {selectedService.name} ({selectedService.durationMinutes}분)
                {selectedStylist && ` | 스타일리스트: ${selectedStylist.name}`}
              </p>
            )}

            <BookingTimelineSelector
              shopId={shopId!}
              operatingHours={shop.operatingHours}
              serviceDurationMinutes={selectedService?.durationMinutes || 30}
              stylist={selectedStylist}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelect={handleDateTimeSelect}
              daysToShow={14}
            />

            <div className="step-actions">
              <Button variant="outline" onClick={prevStep}>
                이전
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!selectedDate || !selectedTime}
              >
                다음
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        if (!selectedService || !selectedDate || !selectedTime) {
          return null;
        }
        return (
          <div className="booking-step">
            <BookingConfirm
              shop={shop}
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              stylist={selectedStylist}
              notes={notes}
              onNotesChange={setNotes}
              onConfirm={submitBooking}
              onBack={prevStep}
              isLoading={isLoading}
            />
            {error && <p className="error-message">{error}</p>}
          </div>
        );

      case 'complete':
        return (
          <div className="booking-step complete">
            <div className="success-icon">✓</div>
            <h2>예약이 완료되었습니다!</h2>
            <p>예약 확인은 '내 예약' 페이지에서 확인하실 수 있습니다.</p>
            {createdBooking && (
              <div className="booking-summary">
                <p>예약번호: {createdBooking.id}</p>
              </div>
            )}
            <div className="complete-actions">
              <Link to="/hair/my-bookings">
                <Button variant="primary">내 예약 보기</Button>
              </Link>
              <Link to="/hair">
                <Button variant="outline">샵 목록으로</Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = ['service', 'stylist', 'datetime', 'confirm'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="hair-booking-page">
      <div className="booking-header">
        <Link to={`/hair/${shopId}`} className="back-link">← {shop.name}</Link>
        <h1>예약하기</h1>
      </div>

      {currentStep !== 'complete' && (
        <div className="booking-progress">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`progress-step ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-label">
                {step === 'service' && '서비스'}
                {step === 'stylist' && '스타일리스트'}
                {step === 'datetime' && '날짜/시간'}
                {step === 'confirm' && '확인'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="booking-content">
        {renderStep()}
      </div>
    </div>
  );
}

export function HairBookingPage() {
  return (
    <HairBookingProvider>
      <BookingFlow />
    </HairBookingProvider>
  );
}
