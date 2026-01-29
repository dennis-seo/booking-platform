import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          예약 플랫폼
        </Link>

        <nav className="header-nav">
          <Link to="/hair" className="nav-link">
            헤어샵
          </Link>
          {isAuthenticated && (
            <Link to="/hair/my-bookings" className="nav-link">
              내 예약
            </Link>
          )}
        </nav>

        <div className="header-auth">
          {isAuthenticated ? (
            <>
              <span className="user-info">
                {user?.name} ({user?.role === 'admin' ? '관리자' : user?.role === 'business_owner' ? '사업자' : '고객'})
              </span>
              {(user?.role === 'admin' || user?.role === 'business_owner') && (
                <Link to="/hair/admin" className="nav-link">
                  업체 관리
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
