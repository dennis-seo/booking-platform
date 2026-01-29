import { useFetch, useFetchById } from '@core/hooks/useFetch';
import type { HairShop } from '../types';
import { hairShopService } from '../services';

export function useHairShops() {
  const { data: shops, ...rest } = useFetch(
    () => hairShopService.getShops(),
    { initialData: [] as HairShop[], errorMessage: '샵 목록을 불러오는데 실패했습니다.' }
  );

  return { shops, ...rest };
}

export function useHairShop(shopId: string | undefined) {
  const { data: shop, ...rest } = useFetchById(
    shopId,
    (id) => hairShopService.getShopById(id),
    { errorMessage: '샵 정보를 불러오는데 실패했습니다.' }
  );

  return { shop, ...rest };
}

export function useOwnerShops(ownerId: string | undefined, isAdmin: boolean = false) {
  const { data: shops, ...rest } = useFetch(
    () => isAdmin
      ? hairShopService.getAllShops()
      : hairShopService.getShopsByOwner(ownerId!),
    {
      initialData: [] as HairShop[],
      enabled: !!ownerId || isAdmin,
      errorMessage: '샵 목록을 불러오는데 실패했습니다.',
    }
  );

  return { shops, ...rest };
}
