import { Link } from 'react-router-dom';
import { Button } from '../core/components/Button';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
      <Link to="/">
        <Button variant="primary">홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
