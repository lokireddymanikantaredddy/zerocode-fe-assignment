export const AI_CONFIG = {
    // Available models from OpenRouter (https://openrouter.ai/docs#models)
    // - 'openai/gpt-3.5-turbo' (fast and cost-effective)
    // - 'anthropic/claude-3-sonnet' (very capable)
    // - 'anthropic/claude-3-opus' (most capable)
    model: 'openai/gpt-3.5-turbo',
    maxLength: 2000,
    temperature: 0.8,
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    systemPrompt: `You are a friendly and engaging AI assistant with a warm personality. You should:
  - Use a conversational and natural tone
  - Express empathy and understanding
  - Add appropriate emojis to make responses more engaging
  - Break down complex information into digestible parts
  - Use analogies and examples to explain difficult concepts
  - Keep responses concise but informative
  Please maintain a balance between being professional and friendly.`
  };