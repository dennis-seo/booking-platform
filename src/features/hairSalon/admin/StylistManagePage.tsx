import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useHairShop, useStylists } from '../hooks';
import { Button } from '@core/components/Button';
import { Modal } from '@core/components/Modal';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { hairShopService } from '../services';
import type { Stylist, CreateStylistData } from '../types';

const EMPTY_STYLIST: CreateStylistData = {
  shopId: '',
  name: '',
  title: '디자이너',
  introduction: '',
};

const TITLE_OPTIONS = ['원장', '실장', '수석 디자이너', '디자이너', '인턴'];

export function StylistManagePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { shop, isLoading: shopLoading } = useHairShop(shopId);
  const { stylists, isLoading: stylistsLoading, refetch } = useStylists(shopId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [formData, setFormData] = useState<CreateStylistData>(EMPTY_STYLIST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || shopLoading || stylistsLoading) {
    return <LoadingSpinner text="로딩 중..." />;
  }

  if (!isAuthenticated || user?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  if (!shop || shop.ownerId !== user.id) {
    return <Navigate to="/" replace />;
  }

  const handleAdd = () => {
    setEditingStylist(null);
    setFormData({ ...EMPTY_STYLIST, shopId: shopId! });
    setIsModalOpen(true);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setFormData({
      shopId: stylist.shopId,
      name: stylist.name,
      title: stylist.title,
      introduction: stylist.introduction,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (stylistId: string) => {
    if (!confirm('이 스타일리스트를 삭제하시겠습니까?')) return;

    try {
      await hairShopService.deleteStylist(stylistId);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingStylist) {
        await hairShopService.updateStylist(editingStylist.id, formData);
      } else {
        await hairShopService.createStylist(formData);
      }
      await refetch();
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stylist-manage-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/hair/admin/${shopId}`} className="back-link">← {shop.name}</Link>
          <h1>스타일리스트 관리</h1>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          스타일리스트 추가
        </Button>
      </div>

      {stylists.length === 0 ? (
        <div className="empty-state">
          <p>등록된 스타일리스트가 없습니다.</p>
          <Button variant="primary" onClick={handleAdd}>
            첫 스타일리스트 등록하기
          </Button>
        </div>
      ) : (
        <div className="stylists-grid">
          {stylists.map(stylist => (
            <div key={stylist.id} className="stylist-card">
              <div className="stylist-avatar">
                {stylist.profileImage ? (
                  <img src={stylist.profileImage} alt={stylist.name} />
                ) : (
                  <span>{stylist.name.charAt(0)}</span>
                )}
              </div>
              <div className="stylist-info">
                <h4>{stylist.name}</h4>
                <span className="stylist-title">{stylist.title}</span>
                {stylist.introduction && (
                  <p className="stylist-intro">{stylist.introduction}</p>
                )}
              </div>
              <div className="stylist-actions">
                <Button variant="outline" size="sm" onClick={() => handleEdit(stylist)}>
                  수정
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(stylist.id)}>
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStylist ? '스타일리스트 수정' : '스타일리스트 추가'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingStylist ? '수정' : '추가'}
            </Button>
          </>
        }
      >
        <div className="stylist-form">
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>직책 *</label>
            <select
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            >
              {TITLE_OPTIONS.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>소개</label>
            <textarea
              value={formData.introduction || ''}
              onChange={e => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
              placeholder="간단한 소개를 입력하세요"
              rows={3}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
