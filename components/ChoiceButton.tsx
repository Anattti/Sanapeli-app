'use client';

import { motion } from 'framer-motion';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  state: 'default' | 'correct' | 'incorrect' | 'disabled';
  disabled?: boolean;
}

export default function ChoiceButton({
  text,
  onClick,
  state,
  disabled = false,
}: ChoiceButtonProps) {
  const stateStyles = {
    default: 'bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-indigo-900 shadow-sm hover:shadow-md hover:border-indigo-300',
    correct: 'bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-green-500 text-white scale-105 shadow-lg shadow-green-200',
    incorrect: 'bg-gradient-to-r from-red-400 to-rose-500 border-2 border-red-500 text-white shadow-lg shadow-red-200',
    disabled: 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed',
  };

  const getAnimation = () => {
    if (state === 'correct') {
      return {
        scale: [1, 1.05, 1],
        transition: { duration: 0.4 },
      };
    }
    if (state === 'incorrect') {
      return {
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4 },
      };
    }
    return {};
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || state !== 'default'}
      className={`w-full px-6 py-5 rounded-2xl font-bold text-lg md:text-xl transition-all duration-200 relative overflow-hidden ${stateStyles[state]}`}
      whileHover={state === 'default' && !disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={state === 'default' && !disabled ? { scale: 0.98 } : {}}
      animate={getAnimation()}
    >
      <span className="relative z-10">{text}</span>
      {state === 'default' && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.button>
  );
}

