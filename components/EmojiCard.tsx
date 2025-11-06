'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmojiCardProps {
  emoji: string;
  englishWord: string;
  finnishWord: string;
  article?: 'a' | 'an';
  onClick?: () => void;
}

const cardColors = [
  'bg-gradient-to-br from-orange-200 to-orange-300', // Peach
  'bg-gradient-to-br from-pink-200 to-pink-300', // Pink
  'bg-gradient-to-br from-yellow-200 to-yellow-300', // Yellow
  'bg-gradient-to-br from-blue-200 to-blue-300', // Blue
  'bg-gradient-to-br from-purple-200 to-purple-300', // Purple
  'bg-gradient-to-br from-green-200 to-green-300', // Green
];

export default function EmojiCard({ 
  emoji, 
  englishWord, 
  finnishWord, 
  article,
  onClick 
}: EmojiCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onClick?.();
  };
  
  // Valitse väri hashin perusteella (konsistentti)
  const colorIndex = (emoji || finnishWord).charCodeAt(0) % cardColors.length;
  const bgColor = cardColors[colorIndex];
  
  // Jos ei ole emojia, näytä vain teksti etupuolella
  const hasEmoji = emoji && emoji.length > 0;
  
  // Muodosta englanninkielinen sana artikkelilla
  const englishWithArticle = article ? `${article} ${englishWord}` : englishWord;
  
  return (
    <div
      className="relative w-full aspect-square cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Etupuoli - Emoji + suomenkielinen sana TAI pelkkä suomenkielinen sana */}
        <div
          className={`absolute inset-0 ${bgColor} rounded-2xl shadow-soft flex flex-col items-center justify-center backface-hidden p-4`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {hasEmoji ? (
            <>
              <span className="text-5xl md:text-6xl lg:text-7xl select-none mb-3">
                {emoji}
              </span>
              <span className="text-lg md:text-xl font-semibold text-gray-700 select-none text-center">
                {finnishWord}
              </span>
            </>
          ) : (
            <span className="text-2xl md:text-3xl font-bold text-gray-800 select-none text-center px-2 break-words">
              {finnishWord}
            </span>
          )}
        </div>
        
        {/* Takapuoli - Englanninkielinen sana artikkelilla */}
        <div
          className={`absolute inset-0 ${bgColor} rounded-2xl shadow-soft flex items-center justify-center backface-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-2xl md:text-3xl font-bold text-gray-800 select-none px-4 text-center break-words">
            {englishWithArticle}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

