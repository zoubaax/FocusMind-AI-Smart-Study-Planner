import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlipCard = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const playFlipSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==');
    audio.volume = 0.2;
    audio.play().catch(() => {}); // Ignore if browser blocks autoplay
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playFlipSound();
  };

  return (
    <div 
      className="relative w-full max-w-[90vw] sm:max-w-md aspect-[4/3] cursor-pointer perspective-1000 group"
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group-hover:border-indigo-200 transition-colors">
            <div className="absolute top-4 left-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Question
            </div>
            <div className="absolute top-4 right-4 text-[10px] text-slate-300">
              Click to reveal answer
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed">
              {question}
            </h3>
            <div className="mt-8 text-slate-400 group-hover:text-indigo-500 transition-colors">
              <motion.div 
                animate={{ y: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🖱️
              </motion.div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-indigo-600 rounded-2xl border border-indigo-500 shadow-xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 text-xs font-semibold text-indigo-200 uppercase tracking-wider">
              Answer
            </div>
            <p className="text-lg sm:text-xl text-white font-light leading-relaxed">
              {answer}
            </p>
            {/* Background decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
