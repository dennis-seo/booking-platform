import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useHairShop, useHairServices } from '../hooks';
import { Button } from '@core/components/Button';
import { Modal } from '@core/components/Modal';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { hairShopService } from '../services';
import type { HairService, CreateHairServiceData, HairServiceCategory } from '../types';
import { HAIR_SERVICE_CATEGORIES } from '../types/service';
import { formatDuration } from '@core/utils/timeSlotUtils';

const EMPTY_SERVICE: CreateHairServiceData = {
  shopId: '',
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
  category: 'cut',
};

export function ServiceManagePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { shop, isLoading: shopLoading } = useHairShop(shopId);
  const { services, isLoading: servicesLoading, refetch } = useHairServices(shopId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<HairService | null>(null);
  const [formData, setFormData] = useState<CreateHairServiceData>(EMPTY_SERVICE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || shopLoading || servicesLoading) {
    return <LoadingSpinner text="로딩 중..." />;
  }

  if (!isAuthenticated || user?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  if (!shop || shop.ownerId !== user.id) {
    return <Navigate to="/" replace />;
  }

  const handleAdd = () => {
    setEditingService(null);
    setFormData({ ...EMPTY_SERVICE, shopId: shopId! });
    setIsModalOpen(true);
  };

  const handleEdit = (service: HairService) => {
    setEditingService(service);
    setFormData({
      shopId: service.shopId,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      category: service.category,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('이 서비스를 삭제하시겠습니까?')) return;

    try {
      await hairShopService.deleteService(serviceId);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingService) {
        await hairShopService.updateService(editingService.id, formData);
      } else {
        await hairShopService.createService(formData);
      }
      await refetch();
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, HairService[]>);

  return (
    <div className="service-manage-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/hair/admin/${shopId}`} className="back-link">← {shop.name}</Link>
          <h1>서비스 관리</h1>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          서비스 추가
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <p>등록된 서비스가 없습니다.</p>
          <Button variant="primary" onClick={handleAdd}>
            첫 서비스 등록하기
          </Button>
        </div>
      ) : (
        <div className="services-list">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category} className="category-section">
              <h3>{HAIR_SERVICE_CATEGORIES[category as HairServiceCategory]}</h3>
              <div className="service-items">
                {categoryServices.map(service => (
                  <div key={service.id} className="service-item-card">
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      {service.description && <p>{service.description}</p>}
                      <div className="service-meta">
                        <span>{formatDuration(service.durationMinutes)}</span>
                        <span>{service.price.toLocaleString()}원</span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                        수정
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? '서비스 수정' : '서비스 추가'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingService ? '수정' : '추가'}
            </Button>
          </>
        }
      >
        <div className="service-form">
          <div className="form-group">
            <label>서비스 이름 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="예: 남성 커트"
            />
          </div>

          <div className="form-group">
            <label>카테고리 *</label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as HairServiceCategory }))}
            >
              {Object.entries(HAIR_SERVICE_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>소요시간 (분) *</label>
              <select
                value={formData.durationMinutes}
                onChange={e => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
              >
                <option value={30}>30분</option>
                <option value={60}>1시간</option>
                <option value={90}>1시간 30분</option>
                <option value={120}>2시간</option>
                <option value={150}>2시간 30분</option>
                <option value={180}>3시간</option>
              </select>
            </div>

            <div className="form-group">
              <label>가격 (원) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                min={0}
                step={1000}
              />
            </div>
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="서비스에 대한 설명"
              rows={2}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
