import React, { useState } from 'react';
import { MessageSquare, Send, Stars, User } from 'lucide-react';

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
    <div className="flex flex-col h-[500px] bg-white/85 border border-slate-200/60 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl shadow-slate-300/50">
      <div className="p-6 border-b border-slate-200/60 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl shadow-slate-300">
            <Stars className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">AI Assistant</h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
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
                msg.role === 'user' ? 'bg-slate-100' : 'bg-slate-900'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Stars className="w-4 h-4 text-slate-100" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-lg' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200/60 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-50 border-t border-slate-200/60">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your study plan..."
            className="w-full bg-white border border-slate-200/60 rounded-2xl py-4 pl-6 pr-14 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
