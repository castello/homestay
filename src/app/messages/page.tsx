'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Send, ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Conversation {
  id: number;
  guest_id: number;
  host_id: number;
  last_message_preview: string | null;
  last_message_at: string | null;
  unreadCount: number;
  users_conversation_rooms_guest_idTousers: { id: number; display_name: string; profile_photo_url: string | null };
  users_conversation_rooms_host_idTousers: { id: number; display_name: string; profile_photo_url: string | null };
  accommodations: { id: number; name: string } | null;
  reservations: { id: number; reservation_number: string; checkin_date: string; checkout_date: string } | null;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  users: { id: number; display_name: string; profile_photo_url: string };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedConv) return;
    const interval = setInterval(() => fetchMessages(selectedConv.id), 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      toast.error('대화 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId: number) {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      console.error('Failed to fetch messages');
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv.id, content: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConv.id);
        fetchConversations();
      }
    } catch {
      toast.error('메시지 전송에 실패했습니다.');
    }
  }

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    setShowMobileChat(true);
    fetchMessages(conv.id);
  };

  const getOtherUser = (conv: Conversation) => {
    return conv.guest_id === userId
      ? conv.users_conversation_rooms_host_idTousers
      : conv.users_conversation_rooms_guest_idTousers;
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6"><p>로딩 중...</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex h-full border rounded-lg overflow-hidden bg-white">
        {/* 대화 목록 */}
        <div className={cn(
          'w-full md:w-80 border-r flex flex-col',
          showMobileChat && 'hidden md:flex'
        )}>
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">메시지</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">대화가 없습니다</div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={cn(
                      'w-full p-3 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b',
                      selectedConv?.id === conv.id && 'bg-gray-50'
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
              })
            )}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className={cn(
          'flex-1 flex flex-col',
          !showMobileChat && 'hidden md:flex'
        )}>
          {selectedConv ? (
            <>
              {/* 채팅 헤더 */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileChat(false)}>
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <p className="font-medium">{getOtherUser(selectedConv)?.display_name}</p>
                  {selectedConv.accommodations && (
                    <p className="text-xs text-gray-500">{selectedConv.accommodations.name}</p>
                  )}
                </div>
                {selectedConv.reservations && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {selectedConv.reservations.reservation_number}
                  </Badge>
                )}
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === userId;
                  return (
                    <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[70%] px-3 py-2 rounded-2xl text-sm',
                        isMine ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-900'
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMine ? 'text-rose-200' : 'text-gray-400')}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: ko })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 메시지 입력 */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex gap-2"
                >
                  <Button type="button" variant="ghost" size="icon"><ImageIcon size={18} /></Button>
                  <Input
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-rose-500 hover:bg-rose-600">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>대화를 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
