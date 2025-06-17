import { AI_CONFIG } from '@/config/ai';
import type { ChatMessage } from '@/types/chat';

export const generateChatResponse = async (messages: ChatMessage[]): Promise<string> => {
  try {
    if (!AI_CONFIG.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    formattedMessages.unshift({
      role: 'system',
      content: AI_CONFIG.systemPrompt
    });

    console.log('Sending request to OpenRouter with model:', AI_CONFIG.model);

    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Fluent AI Chat Hub'
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: formattedMessages,
        temperature: 0.8, 
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        model: AI_CONFIG.model
      });

      if (response.status === 400 && errorData.error?.message?.includes('not a valid model ID')) {
        console.log('Attempting fallback to GPT-3.5...');
        AI_CONFIG.model = 'openai/gpt-3.5-turbo';
        return generateChatResponse(messages);
      }

      throw new Error(
        `API request failed with status ${response.status}: ${
          errorData.error?.message || errorData.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I am unable to generate a response at the moment.';

  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

export const switchModel = (modelName: 'gpt-3.5' | 'claude-3' | 'claude-3-sonnet') => {
  const modelMap = {
    'gpt-3.5': 'openai/gpt-3.5-turbo',
    'claude-3': 'anthropic/claude-3-opus',
    'claude-3-sonnet': 'anthropic/claude-3-sonnet'
  };
  AI_CONFIG.model = modelMap[modelName];
  console.log('Switched to model:', AI_CONFIG.model);
};

const generateLocalResponse = (message: string): string => {
  const responses = [
    "I understand your question about " + message.slice(0, 30) + "... Let me help you with that.",
    "That's an interesting point about " + message.slice(0, 30) + "... Here's what I think...",
    "I'll do my best to assist you with your question about " + message.slice(0, 30) + "...",
    "Let me break down your question about " + message.slice(0, 30) + "...",
    "Here's my perspective on your question about " + message.slice(0, 30) + "..."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}; 