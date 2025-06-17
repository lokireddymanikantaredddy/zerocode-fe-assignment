
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { isSpeechRecognitionSupported, startListening } from '@/lib/speech';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { sendMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    
    const handlePromptTemplate = (event: any) => {
      setInput(event.detail);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    
    const handleSuggestion = (event: any) => {
      setInput(event.detail);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener('setPromptTemplate', handlePromptTemplate);
    window.addEventListener('selectSuggestion', handleSuggestion);
    
    return () => {
      window.removeEventListener('setPromptTemplate', handlePromptTemplate);
      window.removeEventListener('selectSuggestion', handleSuggestion);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognition = startListening(
        (transcript) => {
          setInput(prev => prev + transcript + ' ');
          toast.success('Speech recognized!');
        },
        (error) => {
          setIsListening(false);
          toast.error('Speech recognition error: ' + error);
        },
        () => {
          setIsListening(false);
          toast.info('Voice input stopped due to silence');
        }
      );
      
      if (recognition) {
        recognitionRef.current = recognition;
        setIsListening(true);
        toast.info('Listening... Will stop after 3 seconds of silence');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-background p-3"
    >
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[50px] max-h-32 resize-none pr-12"
            disabled={isLoading}
          />
          
          {isSpeechRecognitionSupported() && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={toggleListening}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="h-3 w-3 text-red-500" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-[50px] px-4"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3 w-3 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default ChatInput;
