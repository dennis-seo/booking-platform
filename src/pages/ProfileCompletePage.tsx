import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { Button } from '../core/components/Button';

export function ProfileCompletePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({ name, phone });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-complete-page">
      <div className="profile-complete-container">
        <h1>프로필 완성</h1>
        <p className="subtitle">예약 서비스 이용을 위해 추가 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="disabled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">이름 *</label>
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
            <label htmlFor="phone">전화번호 *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="010-0000-0000"
            />
            <p className="hint">예약 확인 및 안내에 사용됩니다.</p>
          </div>

          {error && <p className="error-message">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="submit-btn">
            저장하고 시작하기
          </Button>
        </form>
      </div>
    </div>
  );
}
