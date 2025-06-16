export const AI_CONFIG = {
    // Available models from OpenRouter (https://openrouter.ai/docs#models)
    // - 'openai/gpt-3.5-turbo' (fast and cost-effective)
    // - 'anthropic/claude-3-sonnet' (very capable)
    // - 'anthropic/claude-3-opus' (most capable)
    model: 'openai/gpt-3.5-turbo',
    maxLength: 2000,
    temperature: 0.7,
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    systemPrompt: `You are a highly capable AI assistant. You excel at:
  - Providing accurate and detailed responses
  - Writing and explaining code with proper formatting and comments
  - Solving complex problems step by step
  - Maintaining technical accuracy while being easy to understand
  Please provide direct, accurate, and helpful responses.`
  };