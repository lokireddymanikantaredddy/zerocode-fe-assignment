import { Message, ChatHistory } from '@/types';

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
  currentMessages: Message[]
): AnalyticsData {
  // Ensure dates are properly converted
  const processedHistories = chatHistories.map(chat => ({
    ...chat,
    messages: chat.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
    }))
  }));

  const processedMessages = currentMessages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
  }));

  // Calculate total messages including current chat
  const totalMessages = processedHistories.reduce(
    (sum, chat) => sum + chat.messages.length,
    0
  ) + processedMessages.length;

  // Calculate total chats
  const totalChats = processedHistories.length + (processedMessages.length > 0 ? 1 : 0);

  // Calculate average messages per chat
  const averageMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Calculate messages per day
  const messagesPerDay = last7Days.map(date => {
    const count = processedHistories.reduce((sum, chat) => {
      return (
        sum +
        chat.messages.filter(
          msg => msg.timestamp.toISOString().split('T')[0] === date
        ).length
      );
    }, 0);

    // Add current chat messages if they're from today
    const currentCount = processedMessages.filter(
      msg => msg.timestamp.toISOString().split('T')[0] === date
    ).length;

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: count + currentCount
    };
  });

  // Calculate message type distribution
  const allMessages = [
    ...processedHistories.flatMap(chat => chat.messages),
    ...processedMessages
  ];
  
  const userMessages = allMessages.filter(msg => msg.sender === 'user').length;
  const botMessages = allMessages.filter(msg => msg.sender === 'bot').length;

  const messageTypeData = [
    { name: 'User Messages', value: userMessages, color: 'hsl(var(--primary))' },
    { name: 'AI Responses', value: botMessages, color: 'hsl(var(--muted-foreground))' }
  ];

  // Calculate response times
  const responseTimes = new Map<string, number[]>();
  
  allMessages.forEach((msg, index, array) => {
    if (msg.sender === 'user' && index < array.length - 1) {
      const nextMsg = array[index + 1];
      if (nextMsg.sender === 'bot') {
        const responseTime = nextMsg.timestamp.getTime() - msg.timestamp.getTime();
        const date = msg.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!responseTimes.has(date)) {
          responseTimes.set(date, []);
        }
        responseTimes.get(date)?.push(responseTime);
      }
    }
  });

  // Calculate average response time per day
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

  // Calculate overall average response time
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