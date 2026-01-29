import { useMemo } from 'react';
import { useFetch } from '@core/hooks/useFetch';
import type { HairService } from '../types';
import { hairShopService } from '../services';

export function useHairServices(shopId: string | undefined) {
  const { data: services, ...rest } = useFetch(
    () => hairShopService.getServicesByShop(shopId!),
    {
      initialData: [] as HairService[],
      enabled: !!shopId,
      errorMessage: '서비스 목록을 불러오는데 실패했습니다.',
    }
  );

  const groupedServices = useMemo(() => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, HairService[]>);
  }, [services]);

  return { services, groupedServices, ...rest };
}
