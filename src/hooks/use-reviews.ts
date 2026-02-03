import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

export function useReviews(accommodationId: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', accommodationId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        accommodationId: String(accommodationId),
        page: String(pageParam),
        limit: '10',
      });
      const res = await fetch(`/api/reviews?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!accommodationId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      reservationId: number;
      overallRating: number;
      cleanlinessRating?: number;
      accuracyRating?: number;
      communicationRating?: number;
      locationRating?: number;
      checkinRating?: number;
      valueRating?: number;
      content: string;
      privateFeedback?: string;
    }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create review');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
