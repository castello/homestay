import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/messages/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: number; content: string; messageType?: string }) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { hostId: number; accommodationId: number; reservationId?: number; message?: string }) => {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create conversation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
