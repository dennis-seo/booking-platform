import { Link } from 'react-router-dom';
import type { HairShop } from '../types';
import { isShopOpenOnDay } from '@core/utils/timeSlotUtils';
import { DAY_NAMES } from '@core/utils/dateUtils';

interface ShopCardProps {
  shop: HairShop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const today = new Date().getDay();
  const isOpenToday = isShopOpenOnDay(shop.operatingHours, today);
  const todayHours = shop.operatingHours.find(oh => oh.dayOfWeek === today);

  // Find closed days
  const closedDays = shop.operatingHours
    .filter(oh => oh.isClosed)
    .map(oh => DAY_NAMES[oh.dayOfWeek]);

  return (
    <Link to={`/hair/${shop.id}`} className="shop-card">
      <div className="shop-card-image">
        {shop.imageUrl ? (
          <img src={shop.imageUrl} alt={shop.name} />
        ) : (
          <div className="shop-card-placeholder">
            <span>💇</span>
          </div>
        )}
      </div>

      <div className="shop-card-content">
        <h3 className="shop-card-name">{shop.name}</h3>
        <p className="shop-card-address">{shop.address}</p>

        <div className="shop-card-info">
          <span className={`shop-status ${isOpenToday ? 'open' : 'closed'}`}>
            {isOpenToday ? '영업중' : '휴무'}
          </span>
          {isOpenToday && todayHours && (
            <span className="shop-hours">
              {todayHours.openTime} - {todayHours.closeTime}
            </span>
          )}
        </div>

        {closedDays.length > 0 && (
          <p className="shop-card-closed-days">
            휴무일: {closedDays.join(', ')}
          </p>
        )}

        {shop.description && (
          <p className="shop-card-description">{shop.description}</p>
        )}
      </div>
    </Link>
  );
}
