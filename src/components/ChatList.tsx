import React from 'react';
import { MessageSquare, Trash } from 'lucide-react';
import clsx from 'clsx';

interface ChatListProps {
  currentChat: { id: string; title: string; } | null;
  onSelectChat: (chat: { id: string; title: string; } | null) => void;
  onDeleteChat: () => void;
  isDarkMode: boolean;
}

function ChatList({ currentChat, onSelectChat, onDeleteChat, isDarkMode }: ChatListProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este chat?')) {
      onDeleteChat();
    }
  };

  if (!currentChat) {
    return null;
  }

  return (
    <div className="space-y-2 p-4">
      <div
        className={clsx(
          'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
          isDarkMode
            ? 'bg-cyan-600 text-white'
            : 'bg-cyan-500 text-white'
        )}
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">{currentChat.title}</span>
        </div>
        <button
          onClick={handleDelete}
          className="text-white hover:text-red-300 transition-colors"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ChatList;