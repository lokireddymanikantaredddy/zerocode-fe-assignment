import { ChatMessage } from './chat';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Message extends ChatMessage {
  sender: 'user' | 'bot';  // For backward compatibility
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ChatContextType {
  messages: ChatMessage[];
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  exportChat: (format: 'txt' | 'pdf') => void;
  clearMessages: () => void;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface AnalyticsData {
  totalMessages: number;
  totalChats: number;
  averageResponseTime: number;
  messagesPerDay: { date: string; count: number }[];
  popularPrompts: { template: string; count: number }[];
}
