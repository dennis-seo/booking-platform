import { useFetch } from '@core/hooks/useFetch';
import type { Stylist } from '../types';
import { hairShopService } from '../services';

export function useStylists(shopId: string | undefined) {
  const { data: stylists, ...rest } = useFetch(
    () => hairShopService.getStylistsByShop(shopId!),
    {
      initialData: [] as Stylist[],
      enabled: !!shopId,
      errorMessage: '스타일리스트 목록을 불러오는데 실패했습니다.',
    }
  );

  return { stylists, ...rest };
}
