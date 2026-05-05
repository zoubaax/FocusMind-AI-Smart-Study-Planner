import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, User } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your FocusMind AI assistant. How can I help you with your studies today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That's a great goal! I'm analyzing your current schedule and tasks to help you optimize your time. Should we create a new study session for this?" 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">FocusMind AI</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-white/10' : 'bg-indigo-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-gray-400" /> : <Sparkles className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your study plan..."
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
