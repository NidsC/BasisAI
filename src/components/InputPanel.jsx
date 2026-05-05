import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Loader2,
  Send,
  Settings,
  Key,
  X,
  RotateCcw,
} from 'lucide-react';
import { analyzeDesignPrompt, hasApiKey, setApiKey, clearApiKey, getApiKey } from '../services/aiService';

export default function InputPanel({
  onGenerate,
  isGenerating,
  computingLog,
  currentLogIndex,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to BasisAI! Describe the biomethane plant you want to design. For example:\n\n"I want to build a 100 ton per day plant processing food waste in California"\n\nI\'ll help you specify the details and then generate the design.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyConfigured, setKeyConfigured] = useState(hasApiKey());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isAnalyzing || isGenerating) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeDesignPrompt(newMessages);

      if (result.type === 'complete') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Perfect! I have all the details:\n\n• **Capacity:** ${result.parameters.capacity} tons/day\n• **Feedstock:** ${result.parameters.feedstock.replace('_', ' ')}\n• **Location:** ${result.parameters.location}\n\nGenerating your plant design now...`
        }]);

        setTimeout(() => {
          onGenerate({
            capacity: result.parameters.capacity,
            feedstock: result.parameters.feedstock,
            location: result.parameters.location
          });
        }, 500);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.message
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setIsAnalyzing(false);
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
    setKeyConfigured(false);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to BasisAI! Describe the biomethane plant you want to design. For example:\n\n"I want to build a 100 ton per day plant processing food waste in California"\n\nI\'ll help you specify the details and then generate the design.'
      }
    ]);
  };

  return (
    <div className="w-96 h-full glass-panel border-r border-[#2a2a38] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a38]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">BasisAI</h1>
              <p className="text-xs text-[#6b7280]">Generative Design Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-[#2a2a38] rounded-lg transition-colors"
              title="New conversation"
            >
              <RotateCcw size={16} className="text-[#6b7280]" />
            </button>
            <button
              onClick={() => setShowSettings(prev => !prev)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'hover:bg-[#2a2a38] text-[#6b7280]'}`}
              title="API Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-3 bg-[#0a0a0f] rounded-xl border border-[#2a2a38]">
            <div className="flex items-center gap-2 mb-2">
              <Key size={14} className="text-[#00d4ff]" />
              <span className="text-xs font-medium text-white">Gemini API Key</span>
            </div>
            {keyConfigured ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#00ff88]">Key configured</span>
                <button
                  onClick={handleClearApiKey}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter API key..."
                  className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a24] border border-[#2a2a38] rounded-lg text-white"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 text-xs bg-[#00d4ff] hover:bg-[#00b8e0] rounded-lg text-black font-medium"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#00d4ff] text-black'
                  : 'bg-[#1a1a24] text-[#e5e7eb] border border-[#2a2a38]'
              }`}
            >
              {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a24] border border-[#2a2a38] px-3 py-2 rounded-xl">
              <Loader2 size={16} className="animate-spin text-[#00d4ff]" />
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-xs font-medium text-[#00ff88]">Generating Design</span>
            </div>
            <div className="h-32 overflow-hidden font-mono text-xs">
              {computingLog.slice(0, currentLogIndex + 1).map((log, i) => (
                <div
                  key={i}
                  className={`py-0.5 transition-opacity duration-300 ${
                    i === currentLogIndex ? 'text-[#00d4ff]' : 'text-[#4b5563]'
                  }`}
                >
                  <span className="text-[#6b7280] mr-2">[{String(i + 1).padStart(2, '0')}]</span>
                  {log}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all duration-300"
                style={{ width: `${((currentLogIndex + 1) / computingLog.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2a2a38]">
        {!keyConfigured ? (
          <div className="text-center py-2">
            <p className="text-xs text-[#6b7280] mb-2">Configure your Gemini API key to start</p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-xs bg-[#00d4ff] hover:bg-[#00b8e0] rounded-lg text-black font-medium"
            >
              Add API Key
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your plant design..."
              disabled={isAnalyzing || isGenerating}
              rows={2}
              className="flex-1 px-3 py-2 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-white placeholder-[#4b5563] resize-none focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isAnalyzing || isGenerating || !input.trim()}
              className="px-3 self-end py-2 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] hover:opacity-90 disabled:opacity-50 rounded-xl text-white transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#2a2a38]">
        <div className="flex items-center justify-between text-xs text-[#4b5563]">
          <span>v2.5.0</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${keyConfigured ? 'bg-[#00ff88]' : 'bg-[#6b7280]'}`} />
            {keyConfigured ? 'AI Ready' : 'API Key Required'}
          </span>
        </div>
      </div>
    </div>
  );
}
