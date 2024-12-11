import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import SettingsModal from '../components/SettingsModal';
import { useThemeStore } from '../stores/themeStore';

interface Chat {
  id: string;
  title: string;
}

function Chat() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const handleNewChat = () => {
    try {
      const newChat = {
        id: crypto.randomUUID(),
        title: 'Nuevo Chat'
      };
      setCurrentChat(newChat);
      setIsNewChat(true);
    } catch (error) {
      toast.error('Error al crear nuevo chat');
      console.error('Error al crear nuevo chat:', error);
    }
  };

  const handleSelectQuestion = (question: string) => {
    if (currentChat) {
      setCurrentChat({
        ...currentChat,
        title: question
      });
    }
  };

  const handleCloseChat = () => {
    setCurrentChat(null);
    setIsNewChat(false);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-80 ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } border-r flex flex-col`}>
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <User className={`w-8 h-8 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <Link
              to="/login"
              className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChatList
            currentChat={currentChat}
            onSelectChat={setCurrentChat}
            onDeleteChat={handleCloseChat}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className={`p-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-cyan-500 hover:bg-cyan-600'
            } text-white rounded-lg py-2 px-4 transition-colors`}
          >
            <Plus className="w-5 h-5" />
            Nuevo Chat
          </button>
        </div>

        <div className={`p-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center justify-center gap-2 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <ChatWindow
          currentChat={currentChat}
          isNewChat={isNewChat}
          onSelectQuestion={handleSelectQuestion}
        />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default Chat;