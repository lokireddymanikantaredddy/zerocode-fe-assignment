
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, BarChart3, MessageSquare } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle suggestion clicks
  useEffect(() => {
    const handleSuggestion = (event: any) => {
      // Dispatch to ChatInput
      window.dispatchEvent(new CustomEvent('selectSuggestion', { detail: event.detail }));
    };

    window.addEventListener('selectSuggestion', handleSuggestion);
    return () => {
      window.removeEventListener('selectSuggestion', handleSuggestion);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Sidebar */}
      <div className="hidden lg:block relative z-10">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <h1 className="text-xl font-semibold">ZeroCode AI Chat</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="chat" className="h-full m-0 flex flex-col">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">Welcome to ZeroCode AI</h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start a conversation with our AI assistant. Ask questions, get help with code, 
                        or explore any topic that interests you.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What can you help me with?",
                          "Explain React hooks",
                          "Help me debug my code",
                          "Write a creative story"
                        ].map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('selectSuggestion', { detail: suggestion }));
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-4 p-4 rounded-lg bg-muted/50 mr-12"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold">AI Assistant</span>
                              <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                  }}
                                  className="w-2 h-2 bg-primary rounded-full"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <ChatInput />
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
                  <p className="text-muted-foreground">
                    Track your chat activity and AI interaction statistics
                  </p>
                </div>
                <AnalyticsDashboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
