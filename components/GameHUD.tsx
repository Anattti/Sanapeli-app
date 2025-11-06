'use client';

import { motion } from 'framer-motion';

interface GameHUDProps {
  correct: number;
  incorrect: number;
  total: number;
  scoreLabel: string;
  progressLabel: string;
}

export default function GameHUD({
  correct,
  incorrect,
  total,
  scoreLabel,
  progressLabel,
}: GameHUDProps) {
  const answered = correct + incorrect;
  const progressPercentage = total > 0 ? (answered / total) * 100 : 0;
  
  // Valitse emoji tilanteen mukaan
  const getStatusEmoji = () => {
    if (answered === 0) return '🎮';
    const accuracy = correct / answered;
    if (accuracy >= 0.9) return '🌟';
    if (accuracy >= 0.7) return '😊';
    if (accuracy >= 0.5) return '💪';
    return '🤔';
  };
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusEmoji()}</span>
          <div>
            <p className="text-sm text-gray-600 font-medium">{scoreLabel}</p>
            <p className="text-2xl font-bold text-gray-800">
              {correct} / {total}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600 font-medium">{progressLabel}</p>
          <p className="text-2xl font-bold text-gray-800">
            {answered} / {total}
          </p>
        </div>
      </div>
      
      {/* Edistymispalkki */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Oikeat ja väärät vastaukset */}
      <div className="flex items-center justify-center gap-4 mt-3 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-green-600 font-bold">✓</span>
          <span className="text-gray-600">{correct}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-600 font-bold">✗</span>
          <span className="text-gray-600">{incorrect}</span>
        </div>
      </div>
    </motion.div>
  );
}

