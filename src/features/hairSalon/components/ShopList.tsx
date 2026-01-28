import type { HairShop } from '../types';
import { ShopCard } from './ShopCard';

interface ShopListProps {
  shops: HairShop[];
}

export function ShopList({ shops }: ShopListProps) {
  if (shops.length === 0) {
    return (
      <div className="shop-list-empty">
        <p>등록된 헤어샵이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="shop-list">
      {shops.map(shop => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}
