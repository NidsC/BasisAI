import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Settings, Key, Loader2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { setApiKey, clearApiKey, hasApiKey } from '../../services/aiService';

export default function ChatWidget({ plantData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyConfigured, setKeyConfigured] = useState(hasApiKey());
  const { messages, isLoading, error, sendMessage, clearHistory } = useChat(plantData);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowSettings(false);
      setKeyConfigured(true);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setShowSettings(false);
    setKeyConfigured(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 z-50"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-emerald-400" />
          <span className="font-semibold text-white">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-slate-700 rounded">
            <Settings size={18} className="text-slate-400" />
          </button>
          <button onClick={clearHistory} className="p-1 hover:bg-slate-700 rounded">
            <Trash2 size={18} className="text-slate-400" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-emerald-400" />
            <span className="text-sm text-white">Gemini API Key</span>
          </div>
          {keyConfigured ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Key configured</span>
              <button onClick={handleClearApiKey} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter API key..."
                className="flex-1 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
              />
              <button onClick={handleSaveApiKey} className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 rounded text-white">Save</button>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-8">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ask me about your plant design</p>
            <p className="text-xs mt-1">I can review calculations, explain decisions, and suggest improvements</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 px-3 py-2 rounded-lg">
              <Loader2 size={16} className="animate-spin text-emerald-400" />
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-700 px-3 py-2 rounded-lg text-sm text-red-200">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={keyConfigured ? "Ask about your design..." : "Configure API key first..."}
            disabled={!keyConfigured || isLoading}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!keyConfigured || isLoading || !input.trim()}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-lg text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
