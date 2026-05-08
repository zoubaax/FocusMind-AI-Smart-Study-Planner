import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, RotateCcw, CheckCircle2 } from 'lucide-react';
import FlipCard from './FlipCard';
import { motion, AnimatePresence } from 'framer-motion';

const StudySession = ({ material, cards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto mb-8">
        <div>
          <h2 className="text-white text-xl font-semibold">{material.title}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Card {currentIndex + 1} of {cards.length} ({Math.round(progress)}%)
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto h-1.5 bg-white/10 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              enter: (d) => ({ x: d > 0 ? 500 : -500, opacity: 0, scale: 0.9 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d) => ({ x: d > 0 ? -500 : 500, opacity: 0, scale: 0.9 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex justify-center"
          >
            {cards.length > 0 ? (
              <FlipCard 
                question={cards[currentIndex].question} 
                answer={cards[currentIndex].answer} 
              />
            ) : (
              <div className="text-center text-white">
                <CheckCircle2 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Session Complete!</h3>
                <p className="text-slate-400 mt-2">You've reviewed all cards in this set.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="max-w-4xl w-full mx-auto mt-12 flex items-center justify-between pb-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        
        <div className="flex gap-4">
           <button
            onClick={() => setCurrentIndex(0)}
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Restart Session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StudySession;
