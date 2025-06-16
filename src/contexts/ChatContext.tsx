import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message, ChatHistory, ChatContextType } from '@/types';
import { toast } from '@/components/ui/sonner';
import jsPDF from 'jspdf';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Local Storage Keys
const STORAGE_KEYS = {
  MESSAGES: 'chat_messages',
  HISTORIES: 'chat_histories',
  CURRENT_CHAT: 'current_chat_id'
};

// Load data from localStorage
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
  // Initialize state from localStorage
  const [messages, setMessages] = useState<Message[]>(() => 
    loadFromStorage(STORAGE_KEYS.MESSAGES, []).map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp) // Convert timestamp string back to Date
    }))
  );
  
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
  
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

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

  // Debug logging
  useEffect(() => {
    console.log('ChatContext initialized');
    console.log('Initial messages:', messages);
    console.log('Initial chat histories:', chatHistories);
  }, []);

  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  useEffect(() => {
    console.log('Chat histories updated:', chatHistories);
  }, [chatHistories]);

  const simulateOpenAIResponse = async (userMessage: string): Promise<string> => {
    // Mock OpenAI API response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      "I understand your question about " + userMessage.slice(0, 20) + "... Let me help you with that.",
      "That's an interesting point. Here's what I think about it...",
      "Based on your input, I'd suggest considering the following approach...",
      "Great question! Let me break this down for you step by step.",
      "I see what you're asking. Here's a comprehensive response to help you..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const botResponse = await simulateOpenAIResponse(content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update or create chat history
      const updatedMessages = [userMessage, botMessage];
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
          messages: [...messages, ...updatedMessages],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setChatHistories(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
      }
      
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
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
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    const chatContent = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.content}`
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
      messages,
      chatHistories,
      currentChatId,
      sendMessage,
      isLoading,
      startNewChat,
      loadChat,
      deleteChat,
      exportChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
