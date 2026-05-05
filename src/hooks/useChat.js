import { useState, useCallback } from 'react';
import { sendChatMessage, hasApiKey } from '../services/aiService';

export function useChat(plantData) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(newMessages, plantData);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, plantData]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearHistory, hasApiKey: hasApiKey() };
}
