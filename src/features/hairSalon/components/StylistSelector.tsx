import type { Stylist } from '../types';

interface StylistSelectorProps {
  stylists: Stylist[];
  selectedStylist: Stylist | null;
  onSelect: (stylist: Stylist | null) => void;
  allowNoPreference?: boolean;
}

export function StylistSelector({
  stylists,
  selectedStylist,
  onSelect,
  allowNoPreference = true,
}: StylistSelectorProps) {
  if (stylists.length === 0) {
    return (
      <div className="stylist-selector empty">
        <p>등록된 스타일리스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="stylist-selector">
      {allowNoPreference && (
        <button
          className={`stylist-item no-preference ${selectedStylist === null ? 'selected' : ''}`}
          onClick={() => onSelect(null)}
        >
          <div className="stylist-avatar">
            <span>?</span>
          </div>
          <div className="stylist-info">
            <span className="stylist-name">지정 안함</span>
            <span className="stylist-title">아무나 가능</span>
          </div>
        </button>
      )}

      {stylists.map(stylist => (
        <button
          key={stylist.id}
          className={`stylist-item ${selectedStylist?.id === stylist.id ? 'selected' : ''}`}
          onClick={() => onSelect(stylist)}
        >
          <div className="stylist-avatar">
            {stylist.profileImage ? (
              <img src={stylist.profileImage} alt={stylist.name} />
            ) : (
              <span>{stylist.name.charAt(0)}</span>
            )}
          </div>
          <div className="stylist-info">
            <span className="stylist-name">{stylist.name}</span>
            <span className="stylist-title">{stylist.title}</span>
            {stylist.introduction && (
              <span className="stylist-intro">{stylist.introduction}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
