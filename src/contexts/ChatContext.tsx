import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Message, ChatHistory, ChatContextType } from '@/types';
import { toast } from '@/components/ui/sonner';
import jsPDF from 'jspdf';
import { nanoid } from 'nanoid';
import { generateChatResponse } from '@/services/ai';
import type { ChatMessage, ChatState } from '@/types/chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);


const STORAGE_KEYS = {
  MESSAGES: 'chat_messages',
  HISTORIES: 'chat_histories',
  CURRENT_CHAT: 'current_chat_id'
};


const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const [chatHistories, setChatHistories] = useState<ChatHistory[]>(() =>
    loadFromStorage(STORAGE_KEYS.HISTORIES, []).map(chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }))
  );
  
  const [currentChatId, setCurrentChatId] = useState<string | null>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_CHAT, null)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
  }, [state.messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORIES, JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, currentChatId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
    }
  }, [currentChatId]);

  useEffect(() => {
    console.log('ChatContext initialized');
    console.log('Initial messages:', state.messages);
    console.log('Initial chat histories:', chatHistories);
  }, []);

  useEffect(() => {
    console.log('Messages updated:', state.messages);
  }, [state.messages]);

  useEffect(() => {
    console.log('Chat histories updated:', chatHistories);
  }, [chatHistories]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      content: content.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await generateChatResponse([...state.messages, userMessage]);
      
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

    
      const updatedMessages = [userMessage, assistantMessage];
      if (currentChatId) {
        setChatHistories(prev => 
          prev.map(chat => 
            chat.id === currentChatId 
              ? { ...chat, messages: [...chat.messages, ...updatedMessages], updatedAt: new Date() }
              : chat
          )
        );
      } else {
        const newChatId = Date.now().toString();
        const newChat: ChatHistory = {
          id: newChatId,
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          messages: [...state.messages, ...updatedMessages],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setChatHistories(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
      }
      
    } catch (error) {
      console.error('Error in chat:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate response. Please try again.',
      }));
      toast.error('Failed to generate response. Please try again.');
    }
  }, [state.messages]);

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  const startNewChat = () => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    setCurrentChatId(null);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setState({
        messages: chat.messages,
        isLoading: false,
        error: null,
      });
      setCurrentChatId(chatId);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(chat.messages));
      localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, chatId);
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistories(prev => {
      const newHistories = prev.filter(chat => chat.id !== chatId);
      localStorage.setItem(STORAGE_KEYS.HISTORIES, JSON.stringify(newHistories));
      return newHistories;
    });
    
    if (currentChatId === chatId) {
      startNewChat();
    }
    toast.success('Chat deleted');
  };

  const exportChat = (format: 'txt' | 'pdf') => {
    if (state.messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    const chatContent = state.messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    if (format === 'txt') {
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const pdf = new jsPDF();
      const lines = pdf.splitTextToSize(chatContent, 180);
      pdf.text(lines, 10, 10);
      pdf.save(`chat-export-${Date.now()}.pdf`);
    }
    
    toast.success('Chat exported successfully');
  };

  return (
    <ChatContext.Provider value={{
      messages: state.messages,
      chatHistories,
      currentChatId,
      sendMessage,
      isLoading: state.isLoading,
      error: state.error,
      startNewChat,
      loadChat,
      deleteChat,
      exportChat,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};
