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
    default: 'bg-white hover:bg-blue-50 border-2 border-blue-200 text-gray-800',
    correct: 'bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-green-500 text-white scale-105',
    incorrect: 'bg-gradient-to-r from-red-400 to-rose-500 border-2 border-red-500 text-white',
    disabled: 'bg-gray-200 border-2 border-gray-300 text-gray-500 cursor-not-allowed',
  };
  
  const getAnimation = () => {
    if (state === 'correct') {
      return {
        scale: [1, 1.1, 1.05],
        transition: { duration: 0.4 },
      };
    }
    if (state === 'incorrect') {
      return {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      };
    }
    return {};
  };
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || state !== 'default'}
      className={`w-full px-6 py-4 rounded-2xl shadow-soft font-semibold text-lg md:text-xl transition-all duration-200 ${stateStyles[state]}`}
      whileHover={state === 'default' && !disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={state === 'default' && !disabled ? { scale: 0.98 } : {}}
      animate={getAnimation()}
    >
      {text}
    </motion.button>
  );
}

