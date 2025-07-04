import { ChatMessage } from '@/types/chat';
import { ChatHistory } from '@/types';

interface AnalyticsData {
  totalMessages: number;
  totalChats: number;
  averageMessagesPerChat: number;
  messagesPerDay: Array<{ date: string; count: number }>;
  messageTypeData: Array<{ name: string; value: number; color: string }>;
  responseTimeData: Array<{ date: string; responseTime: number }>;
  averageResponseTime: number;
}

export function calculateAnalytics(
  chatHistories: ChatHistory[],
  currentMessages: ChatMessage[]
): AnalyticsData {
  const processedHistories = chatHistories.map(chat => ({
    ...chat,
    messages: chat.messages.map(msg => ({
      ...msg,
      timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Number(msg.timestamp)
    }))
  }));

  const processedMessages = currentMessages.map(msg => ({
    ...msg,
    timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Number(msg.timestamp)
  }));

  
  const totalMessages = processedHistories.reduce(
    (sum, chat) => sum + chat.messages.length,
    0
  ) + processedMessages.length;

  
  const totalChats = processedHistories.length + (processedMessages.length > 0 ? 1 : 0);

  
  const averageMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;

  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  
  const messagesPerDay = last7Days.map(date => {
    const count = processedHistories.reduce((sum, chat) => {
      return (
        sum +
        chat.messages.filter(
          msg => new Date(msg.timestamp).toISOString().split('T')[0] === date
        ).length
      );
    }, 0);

    
    const currentCount = processedMessages.filter(
      msg => new Date(msg.timestamp).toISOString().split('T')[0] === date
    ).length;

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: count + currentCount
    };
  });

  
  const allMessages = [
    ...processedHistories.flatMap(chat => chat.messages),
    ...processedMessages
  ];
  
  const userMessages = allMessages.filter(msg => msg.role === 'user').length;
  const assistantMessages = allMessages.filter(msg => msg.role === 'assistant').length;

  const messageTypeData = [
    { name: 'User Messages', value: userMessages, color: 'hsl(var(--primary))' },
    { name: 'AI Responses', value: assistantMessages, color: 'hsl(var(--muted-foreground))' }
  ];

  
  const responseTimes = new Map<string, number[]>();
  
  allMessages.forEach((msg, index, array) => {
    if (msg.role === 'user' && index < array.length - 1) {
      const nextMsg = array[index + 1];
      if (nextMsg.role === 'assistant') {
        const responseTime = nextMsg.timestamp - msg.timestamp;
        const date = new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!responseTimes.has(date)) {
          responseTimes.set(date, []);
        }
        responseTimes.get(date)?.push(responseTime);
      }
    }
  });

  
  const responseTimeData = last7Days.map(date => {
    const shortDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const times = responseTimes.get(shortDate) || [];
    const avgTime = times.length > 0
      ? times.reduce((sum, time) => sum + time, 0) / times.length
      : 0;

    return {
      date: shortDate,
      responseTime: avgTime
    };
  });

  
  const allResponseTimes = Array.from(responseTimes.values()).flat();
  const averageResponseTime = allResponseTimes.length > 0
    ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
    : 0;

  return {
    totalMessages,
    totalChats,
    averageMessagesPerChat,
    messagesPerDay,
    messageTypeData,
    responseTimeData,
    averageResponseTime
  };
} 