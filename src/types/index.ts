
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
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
  messages: Message[];
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  startNewChat: () => void;
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  exportChat: (format: 'txt' | 'pdf') => void;
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
