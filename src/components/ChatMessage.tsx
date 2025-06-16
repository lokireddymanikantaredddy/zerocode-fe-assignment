import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
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
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="text-sm leading-relaxed break-words">
          {message.isStreaming ? (
            <div className="flex items-center gap-1">
              <span>{message.content}</span>
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-1 h-3 bg-primary rounded"
              />
            </div>
          ) : (
            message.content
          )}
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
