import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { MessageSquare, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { getYouTubeVideoId } from '../utils/youtube';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  currentChat: { id: string; title: string; } | null;
  isNewChat: boolean;
  onSelectQuestion: (question: string) => void;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  content: string | null;
  content_type: string | null;
  file_path: string | null;
  mime_type: string | null;
}

function ChatWindow({ currentChat, isNewChat, onSelectQuestion }: ChatWindowProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [content, setContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentError, setContentError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const isVoiceEnabled = useSettingsStore((state) => state.isVoiceEnabled);
  const selectRef = useRef<HTMLSelectElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/questions');
        setQuestions(response.data);
      } catch (error) {
        toast.error('Error al cargar las preguntas');
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!currentChat) {
      setSelectedQuestion('');
      setAnswer('');
      setContent(null);
      setContentType(null);
      setMimeType(null);
      setContentError('');
      stopSpeaking();
      hasSpokenRef.current = false;
    }
  }, [currentChat]);

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [answer]);

  useEffect(() => {
    // Auto-play video content after 1 second
    if (videoRef.current && contentType === 'video') {
      setTimeout(() => {
        videoRef.current?.play().catch(error => {
          console.error('Error al reproducir video:', error);
        });
      }, 1000);
    }
  }, [content, contentType]);

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakAnswer = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis || hasSpokenRef.current) return;
    if (contentType === 'audio' || contentType === 'video' || contentType === 'youtube') return;

    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const glinda = voices.find(voice => voice.name === 'Glinda (Legacy)');
      if (glinda) {
        utterance.voice = glinda;
      }
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      hasSpokenRef.current = true;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  };

  const handleQuestionSelect = async (questionId: string) => {
    const selectedQ = questions.find(q => q.id.toString() === questionId);
    if (selectedQ) {
      setAnswer(selectedQ.answer);
      setContent(selectedQ.content);
      setContentType(selectedQ.content_type);
      setMimeType(selectedQ.mime_type);
      setContentError('');
      onSelectQuestion(selectedQ.question);
      setSelectedQuestion(questionId);
      hasSpokenRef.current = false;

      try {
        await axios.post(`/api/questions/${questionId}/usage`);
      } catch (error) {
        console.error('Error al actualizar el uso de la pregunta');
      }

      // Reproducir respuesta automáticamente si no hay contenido multimedia
      if (!selectedQ.content_type || (selectedQ.content_type !== 'audio' && selectedQ.content_type !== 'video' && selectedQ.content_type !== 'youtube')) {
        speakAnswer(selectedQ.answer);
      }
    }
  };

  const getFullContentUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    return `${window.location.origin}${url}`;
  };

  const renderContent = () => {
    if (!content) return null;

    const fullUrl = getFullContentUrl(content);
    if (!fullUrl) return null;

    try {
      switch (contentType?.toLowerCase()) {
        case 'video':
          return (
            <div className="w-full max-w-3xl mx-auto mb-6">
              <video
                ref={videoRef}
                controls
                className="w-full rounded-lg shadow-lg"
                onError={() => setContentError('Error al cargar el video')}
              >
                <source src={fullUrl} type={mimeType || 'video/mp4'} />
                Tu navegador no soporta la etiqueta de video.
              </video>
            </div>
          );
        case 'youtube':
          const videoId = getYouTubeVideoId(content);
          if (!videoId) {
            setContentError('URL de YouTube inválida');
            return null;
          }
          return (
            <div className="w-full max-w-3xl mx-auto mb-6 aspect-w-16 aspect-h-9">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-[315px] rounded-lg shadow-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        case 'audio':
          return (
            <div className="w-full max-w-3xl mx-auto mb-6">
              <audio
                controls
                autoPlay
                className="w-full"
                onError={() => setContentError('Error al cargar el audio')}
              >
                <source src={fullUrl} type={mimeType || 'audio/mpeg'} />
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          );
        case 'pdf':
          return (
            <div className="w-full max-w-3xl mx-auto mb-6 h-[500px]">
              <iframe
                src={fullUrl}
                className="w-full h-full rounded-lg shadow-lg"
                onError={() => setContentError('Error al cargar el PDF')}
              />
            </div>
          );
        case 'image':
          return (
            <div className="w-full max-w-3xl mx-auto mb-6">
              <img
                src={fullUrl}
                alt="Contenido de la pregunta"
                className="w-full rounded-lg shadow-lg"
                onError={() => setContentError('Error al cargar la imagen')}
              />
            </div>
          );
        default:
          return null;
      }
    } catch (error) {
      console.error('Error al renderizar el contenido:', error);
      setContentError('Error al cargar el contenido');
      return null;
    }
  };

  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            ODILA
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Crea un nuevo chat para iniciar la conversación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="p-4 border-b border-gray-700">
        <select
          ref={selectRef}
          value={selectedQuestion}
          onChange={(e) => handleQuestionSelect(e.target.value)}
          disabled={!isNewChat || isLoading}
          className={`w-full p-3 rounded-lg ${
            isDarkMode
              ? 'bg-gray-800 text-white border-gray-700'
              : 'bg-white text-gray-900 border-gray-300'
          } border focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
            (!isNewChat || isLoading) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          <option value="">Selecciona una pregunta...</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id.toString()}>
              {q.question}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          {contentError ? (
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{contentError}</span>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {answer && (
        <div ref={answerRef} className="h-[300px] overflow-y-auto border-t border-gray-700">
          <div className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {answer}
                </p>
                {(!contentType || (contentType !== 'audio' && contentType !== 'video' && contentType !== 'youtube')) && (
                  <button
                    onClick={isSpeaking ? stopSpeaking : () => speakAnswer(answer)}
                    className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    title={isSpeaking ? 'Detener lectura' : 'Leer respuesta'}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-5 h-5 text-cyan-500" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-cyan-500" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;