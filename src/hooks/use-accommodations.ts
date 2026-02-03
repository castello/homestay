import { useInfiniteQuery } from '@tanstack/react-query';

interface SearchParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

async function fetchAccommodations({ pageParam = 1, queryKey }: { pageParam: number; queryKey: [string, SearchParams] }) {
  const [, params] = queryKey;
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false) return;
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });
  searchParams.set('page', String(pageParam));

  const res = await fetch('/api/accommodations?' + searchParams.toString());
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function useAccommodations(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ['accommodations', params] as [string, SearchParams],
    queryFn: fetchAccommodations,
    getNextPageParam: (lastPage: any) => lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
}
