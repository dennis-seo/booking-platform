import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { Button } from '@core/components/Button';
import type { OperatingHours } from '@core/types';
import type { CreateHairShopData } from '../types';
import { hairShopService } from '../services';
import { useOwnerShops } from '../hooks';
import { DAY_NAMES } from '@core/utils/dateUtils';

const DEFAULT_HOURS: OperatingHours[] = [
  { dayOfWeek: 0, openTime: '', closeTime: '', isClosed: true },
  { dayOfWeek: 1, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 2, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 3, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 4, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 5, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false },
];

export function ShopRegisterPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { shops: existingShops, refetch } = useOwnerShops(user?.id);

  const [formData, setFormData] = useState<CreateHairShopData>({
    name: '',
    address: '',
    phone: '',
    description: '',
    slotIntervalMinutes: 30,
    operatingHours: DEFAULT_HOURS,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!isAuthenticated || user?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: keyof CreateHairShopData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (dayOfWeek: number, field: 'openTime' | 'closeTime' | 'isClosed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: prev.operatingHours.map(oh =>
        oh.dayOfWeek === dayOfWeek
          ? { ...oh, [field]: value }
          : oh
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const newShop = await hairShopService.createShop(user!.id, formData);
      await refetch();
      navigate(`/hair/admin/${newShop.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '샵 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shop-register-page">
      <div className="page-header">
        <h1>헤어샵 등록</h1>
        <p>새로운 헤어샵을 등록하세요</p>
      </div>

      {existingShops.length > 0 && (
        <div className="existing-shops">
          <h3>내 샵 목록</h3>
          <ul>
            {existingShops.map(shop => (
              <li key={shop.id}>
                <Link to={`/hair/admin/${shop.id}`}>
                  {shop.name} {shop.isActive ? '' : '(비활성)'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shop-form">
        <div className="form-section">
          <h3>기본 정보</h3>

          <div className="form-group">
            <label htmlFor="name">샵 이름 *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              required
              placeholder="예: 스타일리쉬 헤어"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">주소 *</label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              required
              placeholder="예: 서울시 강남구 역삼동 123-45"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호 *</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              required
              placeholder="예: 02-1234-5678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">소개</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="샵 소개를 입력하세요"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>영업시간</h3>

          <div className="operating-hours">
            {formData.operatingHours.map(oh => (
              <div key={oh.dayOfWeek} className="hours-row">
                <span className="day-name">{DAY_NAMES[oh.dayOfWeek]}</span>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={oh.isClosed}
                    onChange={e => handleHoursChange(oh.dayOfWeek, 'isClosed', e.target.checked)}
                  />
                  휴무
                </label>

                {!oh.isClosed && (
                  <>
                    <input
                      type="time"
                      value={oh.openTime}
                      onChange={e => handleHoursChange(oh.dayOfWeek, 'openTime', e.target.value)}
                    />
                    <span>~</span>
                    <input
                      type="time"
                      value={oh.closeTime}
                      onChange={e => handleHoursChange(oh.dayOfWeek, 'closeTime', e.target.value)}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <Link to="/hair">
            <Button type="button" variant="outline">취소</Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            샵 등록하기
          </Button>
        </div>
      </form>
    </div>
  );
}
