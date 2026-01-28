import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useHairShop, useHairServices, useStylists } from '../hooks';
import { Button } from '@core/components/Button';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { hairShopService } from '../services';
import type { UpdateHairShopData } from '../types';
import { DAY_NAMES } from '@core/utils/dateUtils';

export function ShopManagePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { shop, isLoading: shopLoading, error: shopError, refetch: refetchShop } = useHairShop(shopId);
  const { services } = useHairServices(shopId);
  const { stylists } = useStylists(shopId);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateHairShopData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        description: shop.description,
        operatingHours: shop.operatingHours,
        isActive: shop.isActive,
      });
    }
  }, [shop]);

  if (authLoading || shopLoading) {
    return <LoadingSpinner text="로딩 중..." />;
  }

  if (!isAuthenticated || user?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  if (shopError || !shop) {
    return (
      <div className="error-page">
        <h2>샵을 찾을 수 없습니다</h2>
        <Link to="/hair/admin/register">
          <Button variant="primary">샵 등록하기</Button>
        </Link>
      </div>
    );
  }

  // Check ownership
  if (shop.ownerId !== user.id) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: keyof UpdateHairShopData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (dayOfWeek: number, field: 'openTime' | 'closeTime' | 'isClosed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: prev.operatingHours?.map(oh =>
        oh.dayOfWeek === dayOfWeek
          ? { ...oh, [field]: value }
          : oh
      ),
    }));
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await hairShopService.updateShop(shop.id, formData);
      await refetchShop();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsSubmitting(true);
    try {
      await hairShopService.updateShop(shop.id, { isActive: !shop.isActive });
      await refetchShop();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shop-manage-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/hair/admin/register" className="back-link">← 내 샵 목록</Link>
          <h1>{shop.name}</h1>
          <span className={`status-badge ${shop.isActive ? 'active' : 'inactive'}`}>
            {shop.isActive ? '운영중' : '비활성'}
          </span>
        </div>
        <div className="header-actions">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                취소
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>
                저장
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleToggleActive} disabled={isSubmitting}>
                {shop.isActive ? '비활성화' : '활성화'}
              </Button>
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="manage-sections">
        {/* Quick Links */}
        <section className="quick-links">
          <Link to={`/hair/admin/${shopId}/schedule`} className="quick-link-card highlight">
            <h3>예약 스케줄</h3>
            <p>예약 현황 보기</p>
          </Link>
          <Link to={`/hair/admin/${shopId}/services`} className="quick-link-card">
            <h3>서비스 관리</h3>
            <p>{services.length}개 서비스</p>
          </Link>
          <Link to={`/hair/admin/${shopId}/stylists`} className="quick-link-card">
            <h3>스타일리스트 관리</h3>
            <p>{stylists.length}명</p>
          </Link>
          <Link to={`/hair/${shopId}`} className="quick-link-card">
            <h3>샵 페이지 보기</h3>
            <p>고객 화면 확인</p>
          </Link>
        </section>

        {/* Basic Info */}
        <section className="info-section">
          <h2>기본 정보</h2>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>샵 이름</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>주소</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>소개</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="info-display">
              <div className="info-row">
                <span className="label">주소</span>
                <span className="value">{shop.address}</span>
              </div>
              <div className="info-row">
                <span className="label">전화번호</span>
                <span className="value">{shop.phone}</span>
              </div>
              <div className="info-row">
                <span className="label">소개</span>
                <span className="value">{shop.description || '-'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Operating Hours */}
        <section className="info-section">
          <h2>영업시간</h2>

          {isEditing ? (
            <div className="operating-hours">
              {formData.operatingHours?.map(oh => (
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
          ) : (
            <div className="hours-display">
              {shop.operatingHours.map(oh => (
                <div key={oh.dayOfWeek} className="hours-row">
                  <span className="day-name">{DAY_NAMES[oh.dayOfWeek]}</span>
                  <span className="hours">
                    {oh.isClosed ? '휴무' : `${oh.openTime} - ${oh.closeTime}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
