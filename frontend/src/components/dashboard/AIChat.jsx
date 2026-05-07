import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Bot,
  Mic,
  Paperclip,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trash2,
  Edit,
  StopCircle,
  Loader2,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: 'assistant', 
      content: "Hello! I'm your AI study assistant. I can help you with:\n\n• Creating study plans\n• Answering questions about your subjects\n• Explaining difficult concepts\n• Providing study tips and techniques\n\nWhat would you like help with today?",
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI response generation
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = {
      default: "I understand you're asking about \"{topic}\". Based on your study patterns, I recommend breaking this down into smaller, manageable sessions. Would you like me to create a focused study plan for this?",
      greeting: "Great to connect with you! I'm here to help optimize your study sessions. What subject are you focusing on right now?",
      schedule: "I've analyzed your current schedule. You have {tasks} tasks remaining today. Would you like me to help prioritize them?",
      help: "I can assist with:\n• Creating study schedules\n• Explaining concepts\n• Setting reminders\n• Tracking progress\n• Providing study tips\n\nWhat specific help do you need?"
    };
    
    let response = responses.default;
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      response = responses.greeting;
    } else if (userMessage.toLowerCase().includes('schedule') || userMessage.toLowerCase().includes('plan')) {
      response = responses.schedule;
    } else if (userMessage.toLowerCase().includes('help')) {
      response = responses.help;
    }
    
    response = response.replace("{topic}", userMessage.slice(0, 30));
    response = response.replace("{tasks}", Math.floor(Math.random() * 5 + 1).toString());
    
    setIsTyping(false);
    return response;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage.content);
    const aiMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Chat history cleared. How can I help you with your studies today?",
      timestamp: new Date(),
      status: 'sent'
    }]);
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ message, isLast }) => {
    const [showActions, setShowActions] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
      handleCopyMessage(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === 'user' 
              ? 'bg-slate-100 border border-slate-200' 
              : 'bg-slate-800'
          }`}>
            {message.role === 'user' 
              ? <User className="w-4 h-4 text-slate-600" />
              : <Bot className="w-4 h-4 text-white" />
            }
          </div>
          
          {/* Message Content */}
          <div className="relative group">
            <div className={`p-3 rounded-2xl text-sm ${
              message.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-sm' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Timestamp */}
              <div className={`text-[10px] mt-1.5 ${
                message.role === 'user' ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
            
            {/* Message Actions */}
            <AnimatePresence>
              {showActions && message.role === 'assistant' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full flex gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1"
                >
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-700"
                    title="Copy"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-700"
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-700"
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm">
          <div className="flex gap-1">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-slate-400 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-slate-400 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-slate-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI Study Assistant</h3>
            <p className="text-xs text-emerald-600">Ready to help</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLast={index === messages.length - 1}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['Create study plan', 'Explain concept', 'Set reminder', 'Study tips'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-700 transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="w-full px-4 py-2.5 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all resize-none text-sm text-slate-900 placeholder:text-slate-400"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRecording 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isTyping
                ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">
            AI may make mistakes. Verify important information.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AIChat;