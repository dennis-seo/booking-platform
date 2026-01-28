import { useHairShops } from '../hooks';
import { ShopList } from '../components';
import { LoadingSpinner } from '@core/components/LoadingSpinner';

export function HairShopListPage() {
  const { shops, isLoading, error } = useHairShops();

  return (
    <div className="hair-shop-list-page">
      <div className="page-header">
        <h1>헤어샵 예약</h1>
        <p>원하는 헤어샵을 선택하고 예약하세요</p>
      </div>

      {isLoading && <LoadingSpinner text="헤어샵을 불러오는 중..." />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && <ShopList shops={shops} />}
    </div>
  );
}
