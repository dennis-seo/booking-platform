import type { HairService } from '../types';
import { HAIR_SERVICE_CATEGORIES } from '../types/service';
import { formatDuration } from '@core/utils/timeSlotUtils';

interface ServiceSelectorProps {
  services: HairService[];
  selectedService: HairService | null;
  onSelect: (service: HairService) => void;
}

export function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: ServiceSelectorProps) {
  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, HairService[]>);

  const categories = Object.keys(groupedServices);

  if (services.length === 0) {
    return (
      <div className="service-selector empty">
        <p>등록된 서비스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="service-selector">
      {categories.map(category => (
        <div key={category} className="service-category">
          <h4 className="category-title">
            {HAIR_SERVICE_CATEGORIES[category as keyof typeof HAIR_SERVICE_CATEGORIES] || category}
          </h4>
          <div className="service-items">
            {groupedServices[category].map(service => (
              <button
                key={service.id}
                className={`service-item ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => onSelect(service)}
              >
                <div className="service-info">
                  <span className="service-name">{service.name}</span>
                  {service.description && (
                    <span className="service-description">{service.description}</span>
                  )}
                </div>
                <div className="service-meta">
                  <span className="service-duration">{formatDuration(service.durationMinutes)}</span>
                  <span className="service-price">{service.price.toLocaleString()}원</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
