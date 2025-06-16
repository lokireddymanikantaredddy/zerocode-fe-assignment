
import React from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MessageSquare, Clock, TrendingUp, Zap } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const { chatHistories, messages } = useChat();

  // Calculate analytics
  const totalMessages = chatHistories.reduce((sum, chat) => sum + chat.messages.length, 0);
  const totalChats = chatHistories.length;
  const averageMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;
  
  // Messages per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const messagesPerDay = last7Days.map(date => {
    const count = chatHistories.reduce((sum, chat) => {
      return sum + chat.messages.filter(msg => 
        msg.timestamp.toISOString().split('T')[0] === date
      ).length;
    }, 0);
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count
    };
  });

  // Response time simulation (mock data)
  const responseTimeData = messagesPerDay.map(day => ({
    ...day,
    responseTime: Math.random() * 2000 + 500 // 500-2500ms
  }));

  const stats = [
    {
      title: "Total Messages",
      value: totalMessages,
      icon: MessageSquare,
      description: "Messages sent and received"
    },
    {
      title: "Total Chats",
      value: totalChats,
      icon: TrendingUp,
      description: "Conversation sessions"
    },
    {
      title: "Avg. Messages/Chat",
      value: averageMessagesPerChat,
      icon: Zap,
      description: "Messages per conversation"
    },
    {
      title: "Avg. Response Time",
      value: "1.2s",
      icon: Clock,
      description: "AI response latency"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Messages Per Day</CardTitle>
              <CardDescription>Your chat activity over the last week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messagesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>AI response latency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Math.round(value as number)}ms`, 'Response Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
