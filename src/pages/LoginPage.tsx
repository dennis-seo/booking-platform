import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { Button } from '../core/components/Button';
import { isSupabaseConfigured } from '../core/lib/supabase';
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

  const { login, loginWithGoogle, register } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.');
    }
  };

  const supabaseEnabled = isSupabaseConfigured();

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

        {/* Social Login */}
        {supabaseEnabled && (
          <div className="social-login">
            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 {mode === 'login' ? '로그인' : '가입하기'}
            </button>

            <div className="divider">
              <span>또는</span>
            </div>
          </div>
        )}

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

        {!supabaseEnabled && mode === 'login' && (
          <div className="test-accounts">
            <p>테스트 계정 (Mock 모드):</p>
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
