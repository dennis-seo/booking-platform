import { Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { Button } from '@core/components/Button';
import { LoadingSpinner } from '@core/components/LoadingSpinner';
import { ApprovalStatusBadge } from '@core/components/StatusBadge';
import { useOwnerShops } from '../hooks';
import type { HairShop, ShopApprovalStatus } from '../types';

interface ShopItemProps {
  shop: HairShop;
  isAdmin: boolean;
  variant: ShopApprovalStatus;
}

function ShopItem({ shop, isAdmin, variant }: ShopItemProps) {
  return (
    <div className={`shop-item ${variant === 'rejected' ? 'rejected' : ''}`}>
      <div className="shop-item-info">
        <h3>{shop.name}</h3>
        <p className="shop-address">{shop.address}</p>
        {variant === 'pending' && (
          <p className="shop-date">신청일: {new Date(shop.createdAt).toLocaleDateString('ko-KR')}</p>
        )}
        {variant === 'approved' && <p className="shop-phone">{shop.phone}</p>}
        {variant === 'rejected' && shop.rejectionReason && (
          <p className="rejection-reason">
            <strong>거절 사유:</strong> {shop.rejectionReason}
          </p>
        )}
      </div>
      <div className="shop-item-status">
        <ApprovalStatusBadge status={shop.approvalStatus} />
        {variant === 'approved' && !shop.isActive && (
          <span className="inactive-badge">비활성</span>
        )}
      </div>
      <div className="shop-item-actions">
        {variant === 'pending' && isAdmin && (
          <>
            <Button variant="primary" size="sm">승인</Button>
            <Button variant="danger" size="sm">거절</Button>
          </>
        )}
        {variant === 'approved' && (
          <>
            <Link to={`/hair/admin/${shop.id}`}>
              <Button variant="outline" size="sm">관리</Button>
            </Link>
            <Link to={`/hair/admin/${shop.id}/schedule`}>
              <Button variant="outline" size="sm">스케줄</Button>
            </Link>
          </>
        )}
        {variant === 'rejected' && (
          <Button variant="outline" size="sm">재신청</Button>
        )}
      </div>
    </div>
  );
}

interface ShopSectionProps {
  title: string;
  shops: HairShop[];
  isAdmin: boolean;
  variant: ShopApprovalStatus;
}

function ShopSection({ title, shops, isAdmin, variant }: ShopSectionProps) {
  if (shops.length === 0) return null;

  return (
    <section className="shops-section">
      <h2>{title} ({shops.length})</h2>
      <div className="shops-list">
        {shops.map(shop => (
          <ShopItem key={shop.id} shop={shop} isAdmin={isAdmin} variant={variant} />
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { shops, isLoading } = useOwnerShops(user?.id, isAdmin);

  const pendingShops = shops.filter(s => s.approvalStatus === 'pending');
  const approvedShops = shops.filter(s => s.approvalStatus === 'approved');
  const rejectedShops = shops.filter(s => s.approvalStatus === 'rejected');

  if (isLoading) {
    return <LoadingSpinner text="업체 정보를 불러오는 중..." />;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div className="header-left">
          <h1>업체 관리</h1>
          <p>{isAdmin ? '전체 업체 신청 현황' : '내 업체 신청 현황'}</p>
        </div>
        <div className="header-actions">
          <Link to="/hair/admin/register">
            <Button variant="primary">새 업체 등록</Button>
          </Link>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card pending">
          <div className="stat-number">{pendingShops.length}</div>
          <div className="stat-label">승인 대기</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{approvedShops.length}</div>
          <div className="stat-label">승인됨</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{rejectedShops.length}</div>
          <div className="stat-label">거절됨</div>
        </div>
        <div className="stat-card total">
          <div className="stat-number">{shops.length}</div>
          <div className="stat-label">전체</div>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="empty-state">
          <p>등록된 업체가 없습니다.</p>
          <Link to="/hair/admin/register">
            <Button variant="primary">첫 업체 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="shops-sections">
          <ShopSection title="승인 대기" shops={pendingShops} isAdmin={isAdmin} variant="pending" />
          <ShopSection title="운영 중인 업체" shops={approvedShops} isAdmin={isAdmin} variant="approved" />
          <ShopSection title="거절된 신청" shops={rejectedShops} isAdmin={isAdmin} variant="rejected" />
        </div>
      )}
    </div>
  );
}
