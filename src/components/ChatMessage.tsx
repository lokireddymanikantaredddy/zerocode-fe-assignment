
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
      className={`flex gap-2 px-3 py-2 ${
        isUser ? 'bg-primary/5 ml-8' : 'bg-muted/30 mr-8'
      }`}
    >
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarFallback className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} text-xs`}>
          {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="text-sm leading-relaxed">
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
    </motion.div>
  );
};

export default ChatMessage;
