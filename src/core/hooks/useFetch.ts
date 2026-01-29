import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@core/utils/logger';

interface UseFetchOptions<T> {
  /** 초기 데이터 */
  initialData?: T;
  /** 즉시 실행 여부 (기본: true) */
  immediate?: boolean;
  /** 에러 발생 시 기본 메시지 */
  errorMessage?: string;
  /** 실행 조건 - false면 fetch하지 않음 */
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 데이터 페칭을 위한 제네릭 훅
 *
 * @example
 * const { data: shops, isLoading, error, refetch } = useFetch(
 *   () => hairShopService.getShops(),
 *   { initialData: [], errorMessage: '샵 목록을 불러오는데 실패했습니다.' }
 * );
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> & { initialData: T }
): UseFetchResult<T>;

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options?: UseFetchOptions<T>
): UseFetchResult<T | undefined>;

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T | undefined> {
  const {
    initialData,
    immediate = true,
    errorMessage = '데이터를 불러오는데 실패했습니다.',
    enabled = true,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(immediate && enabled);
  const [error, setError] = useState<string | null>(null);

  // fetcher를 ref로 저장하여 dependency 변경 방지
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetch = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      logger.error('Fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, errorMessage]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [fetch, immediate]);

  return {
    data,
    isLoading,
    error,
    refetch: fetch,
  };
}

/**
 * 단일 리소스 페칭을 위한 훅 (ID 기반)
 * ID가 없으면 fetch하지 않음
 */
export function useFetchById<T, ID = string>(
  id: ID | undefined | null,
  fetcher: (id: ID) => Promise<T>,
  options: Omit<UseFetchOptions<T>, 'enabled'> = {}
): UseFetchResult<T | null> {
  const { initialData = null, ...restOptions } = options;

  return useFetch(
    () => fetcher(id as ID),
    {
      ...restOptions,
      initialData: initialData as T | null,
      enabled: id != null,
    }
  ) as UseFetchResult<T | null>;
}
