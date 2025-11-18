'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo, useEffect } from 'react';
import EmojiCard from '@/components/EmojiCard';
import CategorySelector from '@/components/CategorySelector';
import PageTransition from '@/components/PageTransition';
import ScreenHeader from '@/components/ScreenHeader';
import { getCategories, getWordsByCategory } from '@/data/words';

export default function PracticePage() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = useMemo(() => getCategories(), []);
  const displayedWords = useMemo(() => getWordsByCategory(selectedCategory), [selectedCategory]);

  // Disable staggering on mobile for faster load
  const staggerDelay = isMobile || shouldReduceMotion ? 0 : 0.05;

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
        {/* Animated Background Elements - Strictly Desktop Only */}
        {!isMobile && !shouldReduceMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 right-10 text-6xl opacity-20"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              🧠
            </motion.div>
            <motion.div
              className="absolute bottom-40 left-10 text-8xl opacity-10"
              animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              💡
            </motion.div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
          </div>
        )}

        <ScreenHeader className="mb-8 relative z-10" />

        <motion.main
          className="relative z-10 max-w-7xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Otsikko */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: shouldReduceMotion ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-block mb-2"
            >
              <span className={`text-6xl md:text-7xl filter drop-shadow-lg ${!shouldReduceMotion && !isMobile ? 'animate-bounce-in' : ''}`}>
                🧠
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-3 text-outline">
              {t.practice.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full inline-block shadow-sm">
              {t.practice.clickToReveal}
            </p>
          </div>

          {/* Kategoriavalinta */}
          <div className="w-full mb-8">
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Sanojen määrä */}
          <motion.p
            className="text-center text-sm font-medium text-gray-500 mb-6 bg-white/50 px-4 py-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={displayedWords.length}
          >
            {displayedWords.length} {displayedWords.length === 1 ? (t.common?.word || 'sana') : (t.common?.words || 'sanaa')}
          </motion.p>

          {/* Emoji-kortti grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full"
            key={selectedCategory}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: staggerDelay
                }
              }
            }}
          >
            {displayedWords.map((word, index) => (
              <motion.div
                key={`${word.en}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 200, damping: 15 }
                  }
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <EmojiCard
                  emoji={word.emoji}
                  englishWord={word.en}
                  finnishWord={word.fi}
                  article={word.article}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.main>
      </div>
    </PageTransition>
  );
}
