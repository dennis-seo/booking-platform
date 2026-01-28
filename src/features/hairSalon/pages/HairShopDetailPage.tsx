import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHairShop, useHairServices, useStylists } from '../hooks';
import { ServiceSelector, StylistSelector } from '../components';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { Button } from '@core/components/Button';
import { useAuth } from '@core/hooks/useAuth';
import { DAY_NAMES } from '@core/utils/dateUtils';

export function HairShopDetailPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { shop, isLoading: shopLoading, error: shopError } = useHairShop(shopId);
  const { services, isLoading: servicesLoading } = useHairServices(shopId);
  const { stylists, isLoading: stylistsLoading } = useStylists(shopId);

  const isLoading = shopLoading || servicesLoading || stylistsLoading;

  if (isLoading) {
    return <LoadingSpinner text="샵 정보를 불러오는 중..." />;
  }

  if (shopError || !shop) {
    return (
      <div className="error-page">
        <h2>샵을 찾을 수 없습니다</h2>
        <p>{shopError || '요청하신 샵이 존재하지 않습니다.'}</p>
        <Link to="/hair">
          <Button variant="primary">샵 목록으로</Button>
        </Link>
      </div>
    );
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/hair/${shopId}/booking`);
  };

  const closedDays = shop.operatingHours
    .filter(oh => oh.isClosed)
    .map(oh => DAY_NAMES[oh.dayOfWeek]);

  const openDays = shop.operatingHours
    .filter(oh => !oh.isClosed)
    .map(oh => ({
      day: DAY_NAMES[oh.dayOfWeek],
      hours: `${oh.openTime} - ${oh.closeTime}`,
    }));

  return (
    <div className="hair-shop-detail-page">
      <div className="shop-detail-header">
        <Link to="/hair" className="back-link">← 목록으로</Link>

        <div className="shop-detail-info">
          <div className="shop-image">
            {shop.imageUrl ? (
              <img src={shop.imageUrl} alt={shop.name} />
            ) : (
              <div className="shop-image-placeholder">💇</div>
            )}
          </div>

          <div className="shop-info">
            <h1>{shop.name}</h1>
            <p className="shop-address">{shop.address}</p>
            <p className="shop-phone">{shop.phone}</p>
            {shop.description && <p className="shop-description">{shop.description}</p>}

            <div className="shop-hours">
              <h4>영업시간</h4>
              {openDays.map(({ day, hours }) => (
                <div key={day} className="hours-row">
                  <span className="day">{day}</span>
                  <span className="time">{hours}</span>
                </div>
              ))}
              {closedDays.length > 0 && (
                <p className="closed-days">휴무: {closedDays.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={handleBooking} className="book-button">
          예약하기
        </Button>
      </div>

      <div className="shop-detail-sections">
        <section className="services-section">
          <h2>서비스 메뉴</h2>
          <ServiceSelector
            services={services}
            selectedService={null}
            onSelect={() => handleBooking()}
          />
        </section>

        <section className="stylists-section">
          <h2>스타일리스트</h2>
          <StylistSelector
            stylists={stylists}
            selectedStylist={null}
            onSelect={() => handleBooking()}
            allowNoPreference={false}
          />
        </section>
      </div>
    </div>
  );
}
