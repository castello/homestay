import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useReservations(status?: string) {
  return useQuery({
    queryKey: ['reservations', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const res = await fetch(`/api/reservations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reservations');
      return res.json();
    },
  });
}

export function useReservation(id: string | number) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const res = await fetch(`/api/reservations/${id}`);
      if (!res.ok) throw new Error('Failed to fetch reservation');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      accommodationId: number;
      checkInDate: string;
      checkOutDate: string;
      guests: number;
      couponCode?: string;
      specialRequests?: string;
      paymentMethod: string;
    }) => {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create reservation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason: reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel reservation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
