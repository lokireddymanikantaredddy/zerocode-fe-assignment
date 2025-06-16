
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatPage from '@/pages/ChatPage';

const Index = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default Index;
