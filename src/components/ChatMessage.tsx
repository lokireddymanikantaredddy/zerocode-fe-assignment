import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState(message.content);
  const [isTyping, setIsTyping] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only animate if it's a bot message and was created in the last 2 seconds
    const isNewMessage = Date.now() - message.timestamp < 2000;
    
    if (!isUser && isNewMessage) {
      setDisplayedContent('');
      setIsTyping(true);
      let index = 0;
      const text = message.content;
      
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          // Process 3 characters at a time for faster typing
          const nextChunk = text.slice(index, index + 3);
          setDisplayedContent(prev => prev + nextChunk);
          index += 3;
          
          // Scroll into view with each content update
          if (messageRef.current) {
            messageRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end'
            });
          }
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 10);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedContent(message.content);
      setIsTyping(false);
    }
  }, [message.content, message.timestamp, isUser]);

  // Scroll when typing starts
  useEffect(() => {
    if (isTyping && messageRef.current) {
      messageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
    }
  }, [isTyping]);

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 px-4 py-3 rounded-lg max-w-[85%] w-fit ${
        isUser ? 'bg-primary/5 ml-auto' : 'bg-muted/30 mr-auto'
      }`}
    >
      {!isUser && (
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="bg-muted text-xs">
            <Bot className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && isTyping && (
            <span className="text-xs text-muted-foreground">typing...</span>
          )}
        </div>
        
        <div className="text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 last:mb-0 list-disc pl-4">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 last:mb-0 list-decimal pl-4">{children}</ol>,
              li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
              code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children: React.ReactNode }) => (
                <code
                  className={`${className} ${inline ? 'bg-muted px-1 py-0.5 rounded text-sm' : ''}`}
                  {...props}
                >
                  {children}
                </code>
              ),
            }}
          >
            {displayedContent}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
