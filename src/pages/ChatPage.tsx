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
import { Menu, BarChart3, MessageSquare, Bot } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleSuggestion = (event: CustomEvent) => {
      if (event.type === 'selectSuggestion') {
        const chatInput = document.querySelector<HTMLTextAreaElement>('#chat-input');
        if (chatInput) {
          chatInput.value = event.detail;
          chatInput.focus();
        }
      }
    };

    window.addEventListener('selectSuggestion', handleSuggestion as EventListener);
    return () => {
      window.removeEventListener('selectSuggestion', handleSuggestion as EventListener);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="hidden lg:block relative z-10">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {window.innerWidth < 1024 && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-0">
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
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

        <div className="flex-1 overflow-hidden relative">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="h-full flex flex-col"
            defaultValue="chat"
          >
            <TabsContent 
              value="chat" 
              className="flex-1 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden h-[calc(100vh-8rem)]"
            >
              <ScrollArea className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4 pb-4">
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
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 p-4 rounded-lg bg-muted/50 mr-12"
                        >
                          <div className="relative h-8 w-8">
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20"
                              animate={{
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-primary/80"
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.2
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary animate-pulse" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <motion.div 
                              className="text-sm font-medium text-primary/80"
                              animate={{
                                opacity: [1, 0.5, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              AI is thinking...
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
                
              <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ChatInput />
              </div>
            </TabsContent>

            <TabsContent 
              value="analytics" 
              className="absolute inset-0 bg-background flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
            >
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto w-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">
                      Track your chat activity and AI interaction statistics
                    </p>
                  </div>
                  <AnalyticsDashboard />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
