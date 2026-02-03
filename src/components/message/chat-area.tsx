'use client';

import { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface ChatAreaProps {
  messages: Message[];
  userId: number;
  otherUserName: string;
  accommodationName?: string;
  reservationNumber?: string;
  onSend: (content: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatArea({
  messages,
  userId,
  otherUserName,
  accommodationName,
  reservationNumber,
  onSend,
  onBack,
  showBackButton = false,
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSend(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
        )}
        <div>
          <p className="font-medium">{otherUserName}</p>
          {accommodationName && (
            <p className="text-xs text-gray-500">{accommodationName}</p>
          )}
        </div>
        {reservationNumber && (
          <Badge variant="outline" className="ml-auto text-xs">
            {reservationNumber}
          </Badge>
        )}
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button type="button" variant="ghost" size="icon">
            <ImageIcon size={18} />
          </Button>
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
    </div>
  );
}
