import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { Button } from '../core/components/Button';
import type { UserRole } from '../core/types';

type AuthMode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, phone, role });
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1>{mode === 'login' ? '로그인' : '회원가입'}</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            로그인
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">전화번호</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="form-group">
                <label>회원 유형</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={role === 'customer'}
                      onChange={() => setRole('customer')}
                    />
                    일반 고객
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="business_owner"
                      checked={role === 'business_owner'}
                      onChange={() => setRole('business_owner')}
                    />
                    사업자 (업체 등록)
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="auth-submit">
            {mode === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>

        {mode === 'login' && (
          <div className="test-accounts">
            <p>테스트 계정:</p>
            <ul>
              <li>고객: customer@test.com / password</li>
              <li>사업자: owner@test.com / password</li>
            </ul>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/">홈으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
