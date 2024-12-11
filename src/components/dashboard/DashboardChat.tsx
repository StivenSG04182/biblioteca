import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Youtube, Music, Video, Image } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { validateYouTubeUrl } from '../../utils/youtube';

interface Question {
  id: number;
  question: string;
  answer: string;
  content: string | null;
  content_type: string | null;
}

function DashboardChat() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      toast.error('Error al cargar las preguntas');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw new Error('Error al subir archivo');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      let contentUrl = editingQuestion.content;

      if (editingQuestion.content_type === 'youtube') {
        if (!validateYouTubeUrl(editingQuestion.content || '')) {
          toast.error('URL de YouTube inválida');
          return;
        }
        contentUrl = editingQuestion.content;
      } else if (selectedFile) {
        contentUrl = await handleFileUpload(selectedFile);
      }

      const questionData = {
        ...editingQuestion,
        content: contentUrl,
      };

      if (isEditing) {
        await axios.put(`/api/questions/${editingQuestion.id}`, questionData);
        toast.success('Pregunta actualizada exitosamente');
      } else {
        await axios.post('/api/questions', questionData);
        toast.success('Pregunta agregada exitosamente');
      }
      
      await fetchQuestions();
      setIsEditing(false);
      setEditingQuestion(null);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Error al guardar pregunta:', error);
      toast.error(error.message || 'Error al guardar pregunta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta pregunta?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/questions/${id}`);
        await fetchQuestions();
        toast.success('Pregunta eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar pregunta:', error);
        toast.error('Error al eliminar pregunta');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getContentTypeIcon = (type: string | null) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'image':
        return <Image className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión del Chat</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditingQuestion({
              id: 0,
              question: '',
              answer: '',
              content: null,
              content_type: null
            });
          }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Agregar Pregunta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getContentTypeIcon(question.content_type)}
                  <h3 className="text-lg font-semibold">{question.question}</h3>
                </div>
                <p className="text-gray-400 text-sm">{question.answer}</p>
                {question.content && (
                  <p className="text-cyan-500 text-xs mt-2">{question.content}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingQuestion(question);
                  }}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? 'Editar Pregunta' : 'Agregar Pregunta'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Pregunta
                </label>
                <input
                  type="text"
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Respuesta
                </label>
                <textarea
                  value={editingQuestion.answer}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      answer: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white h-32"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tipo de Contenido (Opcional)
                </label>
                <select
                  value={editingQuestion.content_type || ''}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      content_type: e.target.value || null,
                      content: null,
                    })
                  }
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white"
                  disabled={isLoading}
                >
                  <option value="">Sin contenido</option>
                  <option value="pdf">Documento PDF</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="youtube">Video de YouTube</option>
                  <option value="image">Imagen</option>
                </select>
              </div>

              {editingQuestion.content_type === 'youtube' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    URL de YouTube
                  </label>
                  <input
                    type="url"
                    value={editingQuestion.content || ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        content: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isLoading}
                  />
                </div>
              ) : editingQuestion.content_type ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subir Archivo (Opcional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white"
                    accept={`.pdf,video/*,audio/*,image/*`}
                    disabled={isLoading}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Subiendo: {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingQuestion(null);
                    setSelectedFile(null);
                    setUploadProgress(0);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardChat;