# ZeroCode AI Chat Hub - API Documentation

## OpenRouter AI Integration

### Base Configuration
```typescript
const API_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  version: 'v1',
  models: {
    default: 'openai/gpt-3.5-turbo',
    advanced: 'anthropic/claude-3-opus',
    balanced: 'anthropic/claude-3-sonnet'
  }
};
```

### Authentication
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'HTTP-Referer': window.location.origin,
  'X-Title': 'Fluent AI Chat Hub'
};
```

## API Endpoints

### 1. Chat Completions

#### Request
```typescript
POST /chat/completions

{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a friendly AI assistant..."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.8,
  "max_tokens": 2000,
  "stream": false
}
```

#### Response
```typescript
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today? 😊"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

### 2. Model Information

#### Request
```typescript
GET /models

Headers:
{
  "Authorization": "Bearer ${API_KEY}"
}
```

#### Response
```typescript
{
  "data": [
    {
      "id": "openai/gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "maxTokens": 4096,
      "tokenCost": 0.002
    },
    {
      "id": "anthropic/claude-3-opus",
      "name": "Claude-3 Opus",
      "maxTokens": 8192,
      "tokenCost": 0.015
    }
  ]
}
```

## Error Handling

### Error Response Format
```typescript
{
  "error": {
    "message": "Error message here",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

### Common Error Codes
```typescript
const ERROR_CODES = {
  INVALID_API_KEY: 'invalid_api_key',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  MODEL_NOT_FOUND: 'model_not_found',
  CONTEXT_LENGTH_EXCEEDED: 'context_length_exceeded',
  CONTENT_POLICY_VIOLATION: 'content_policy_violation'
};
```

## Rate Limiting

### Limits
- Requests per minute: 60
- Tokens per minute: 40,000
- Concurrent requests: 5

### Headers
```typescript
{
  'X-RateLimit-Limit': '60',
  'X-RateLimit-Remaining': '59',
  'X-RateLimit-Reset': '1623456789'
}
```

## Streaming Responses

### Stream Configuration
```typescript
const streamConfig = {
  stream: true,
  onMessage: (message: string) => {
  
  },
  onError: (error: Error) => {
  
  },
  onComplete: () => {
   
  }
};
```

### Example Usage
```typescript
const streamResponse = async (messages: Message[]) => {
  const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: API_CONFIG.models.default,
      messages,
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = decoder.decode(value);
   
  }
};
```

## WebSocket Integration

### Connection Setup
```typescript
const wsConfig = {
  url: `wss://api.openrouter.ai/ws/v1`,
  protocols: ['chat'],
  reconnect: true,
  maxRetries: 3
};
```

### Message Format
```typescript
interface WSMessage {
  type: 'message' | 'error' | 'status';
  payload: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  };
}
```

## Security Considerations

### API Key Management
```typescript
const securityConfig = {
  keyStorage: 'env',  
  tokenExpiry: 3600,  
  refreshBuffer: 300 
};
```

### Request Validation
```typescript
const validateRequest = (req: APIRequest) => {
  
  if (!isValidContent(req.content)) {
    throw new Error('Invalid content');
  }

  
  if (exceedsTokenLimit(req.content)) {
    throw new Error('Token limit exceeded');
  }

  
  if (!isModelAvailable(req.model)) {
    throw new Error('Model not available');
  }
};
```

## Testing

### API Test Suite
```typescript
describe('OpenRouter API', () => {
  it('should handle chat completion', async () => {
    const response = await chatCompletion({
      messages: [{ role: 'user', content: 'Hello' }]
    });
    expect(response.choices[0].message).toBeDefined();
  });

  it('should handle streaming', async () => {
    const messages = [];
    await streamCompletion({
      messages: [{ role: 'user', content: 'Hello' }],
      onMessage: (msg) => messages.push(msg)
    });
    expect(messages.length).toBeGreaterThan(0);
  });
});
```

## Appendix

### A. Response Types
Complete type definitions for all API responses

### B. Request Types
Complete type definitions for all API requests

### C. Error Types
Complete type definitions for all error scenarios 