'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConversationUser {
  id: number;
  display_name: string;
  profile_photo_url: string | null;
}

interface Conversation {
  id: number;
  guest_id: number;
  host_id: number;
  last_message_preview: string | null;
  last_message_at: string | null;
  unreadCount: number;
  users_conversation_rooms_guest_idTousers: ConversationUser;
  users_conversation_rooms_host_idTousers: ConversationUser;
  accommodations: { id: number; name: string } | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  userId: number;
  onSelect: (conv: Conversation) => void;
}

export function ConversationList({ conversations, selectedId, userId, onSelect }: ConversationListProps) {
  const getOtherUser = (conv: Conversation) => {
    return conv.guest_id === userId
      ? conv.users_conversation_rooms_host_idTousers
      : conv.users_conversation_rooms_guest_idTousers;
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">대화가 없습니다</div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const other = getOtherUser(conv);
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'w-full p-3 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b',
              selectedId === conv.id && 'bg-gray-50'
            )}
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {other?.profile_photo_url ? (
                <Image src={other.profile_photo_url} alt="" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  {other?.display_name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">{other?.display_name}</p>
                <span className="text-xs text-gray-400">
                  {conv.last_message_at ? format(new Date(conv.last_message_at), 'M/d') : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.last_message_preview}</p>
              {conv.accommodations && (
                <p className="text-xs text-gray-400 truncate">{conv.accommodations.name}</p>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <Badge className="bg-rose-500 text-white h-5 min-w-[20px] text-xs">{conv.unreadCount}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
