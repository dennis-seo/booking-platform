import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>간편한 예약 플랫폼</h1>
        <p>원하는 서비스를 선택하고 쉽게 예약하세요</p>
      </section>

      <section className="services">
        <h2>서비스 선택</h2>
        <div className="service-grid">
          <Link to="/hair" className="service-card">
            <div className="service-icon">💇</div>
            <h3>헤어샵</h3>
            <p>원하는 스타일리스트에게 커트, 펌, 염색 예약</p>
          </Link>

          <div className="service-card coming-soon">
            <div className="service-icon">🍽️</div>
            <h3>레스토랑</h3>
            <p>맛있는 식사를 위한 테이블 예약</p>
            <span className="badge">준비중</span>
          </div>

          <div className="service-card coming-soon">
            <div className="service-icon">🏥</div>
            <h3>병원</h3>
            <p>의료 상담 및 진료 예약</p>
            <span className="badge">준비중</span>
          </div>

          <div className="service-card coming-soon">
            <div className="service-icon">🏋️</div>
            <h3>피트니스</h3>
            <p>PT 및 그룹 수업 예약</p>
            <span className="badge">준비중</span>
          </div>
        </div>
      </section>
    </div>
  );
}
