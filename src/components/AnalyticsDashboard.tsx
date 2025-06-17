import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Clock, TrendingUp, Zap } from 'lucide-react';
import { calculateAnalytics } from '@/lib/analytics';

const AnalyticsDashboard: React.FC = () => {
  const { chatHistories, messages } = useChat();

  
  useEffect(() => {
    console.log('AnalyticsDashboard mounted');
    console.log('Raw messages:', messages);
    console.log('Raw chat histories:', chatHistories);
    
    
    const validMessages = messages?.every(msg => 
      msg.id && msg.content && msg.role && typeof msg.timestamp === 'number'
    );
    
    const validHistories = chatHistories?.every(chat => 
      chat.id && chat.messages?.every(msg => 
        msg.id && msg.content && msg.role && typeof msg.timestamp === 'number'
      )
    );
    
    console.log('Messages valid?', validMessages);
    console.log('Histories valid?', validHistories);
    
    
    if (!validMessages) {
      console.warn('Invalid messages found:', 
        messages?.filter(msg => 
          !msg.id || !msg.content || !msg.role || typeof msg.timestamp !== 'number'
        )
      );
    }
    
    if (!validHistories) {
      console.warn('Invalid histories found:', 
        chatHistories?.filter(chat => 
          !chat.id || !chat.messages?.every(msg => 
            msg.id && msg.content && msg.role && typeof msg.timestamp === 'number'
          )
        )
      );
    }
  }, [messages, chatHistories]);

  
  const analytics = useMemo(() => {
    console.log('Calculating analytics...');
    
    if (!messages?.length && !chatHistories?.length) {
      console.log('No data available for analytics');
      return null;
    }
    
    try {
      const calculatedAnalytics = calculateAnalytics(chatHistories || [], messages || []);
      console.log('Successfully calculated analytics:', calculatedAnalytics);
      return {
        totalMessages: calculatedAnalytics.totalMessages || 0,
        totalChats: calculatedAnalytics.totalChats || 0,
        averageMessagesPerChat: calculatedAnalytics.averageMessagesPerChat || 0,
        averageResponseTime: calculatedAnalytics.averageResponseTime || 0,
        messagesPerDay: calculatedAnalytics.messagesPerDay || [],
        messageTypeData: calculatedAnalytics.messageTypeData || [],
        responseTimeData: calculatedAnalytics.responseTimeData || []
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return null;
    }
  }, [chatHistories, messages]);


  if (!messages?.length && !chatHistories?.length) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No chat data available yet. Start a conversation to see analytics.</p>
      </div>
    );
  }

  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Unable to load analytics. Please try again later.</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Messages",
      value: analytics.totalMessages || 0,
      icon: MessageSquare,
      description: "Messages exchanged"
    },
    {
      title: "Active Chats",
      value: analytics.totalChats || 0,
      icon: TrendingUp,
      description: "Conversation sessions"
    },
    {
      title: "Avg. Messages/Chat",
      value: analytics.averageMessagesPerChat || 0,
      icon: Zap,
      description: "Messages per conversation"
    },
    {
      title: "Avg. Response Time",
      value: `${((analytics.averageResponseTime || 0) / 1000).toFixed(1)}s`,
      icon: Clock,
      description: "AI response latency"
    }
  ];

  return (
    <div className="space-y-8 w-full">
      
      <div className="p-4 bg-muted/10 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">Debug: Total Messages: {analytics.totalMessages}</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
          >
            <Card className="w-full">
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

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Messages sent over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.messagesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Message Distribution</CardTitle>
            <CardDescription>User vs AI message breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.messageTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.messageTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {analytics.messageTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      
        <Card className="w-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>AI response performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [
                      `${(Number(value) / 1000).toFixed(1)}s`,
                      'Response Time'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
