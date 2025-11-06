'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';
import Button from '@/components/Button';
import LanguageToggle from '@/components/LanguageToggle';
import EmojiCard from '@/components/EmojiCard';
import CategorySelector from '@/components/CategorySelector';
import PageTransition from '@/components/PageTransition';
import { getCategories, getWordsByCategory } from '@/data/words';

export default function PracticePage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = useMemo(() => getCategories(), []);
  const displayedWords = useMemo(() => getWordsByCategory(selectedCategory), [selectedCategory]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 relative">
        {/* Ylätunniste */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="secondary"
            size="small"
          >
            ← {t.practice.backToMenu}
          </Button>
          
          <LanguageToggle variant="header" />
        </div>
        
        {/* Otsikko */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
            {t.practice.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            {t.practice.clickToReveal}
          </p>
        </motion.div>
        
        {/* Kategoriavalinta */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        {/* Sanojen määrä */}
        <p className="text-center text-sm text-gray-600 mb-4">
          {displayedWords.length} {displayedWords.length === 1 ? 'sana' : 'sanaa'}
        </p>
        
        {/* Emoji-kortti grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={selectedCategory}
        >
          {displayedWords.map((word, index) => (
            <motion.div key={`${word.en}-${index}`} variants={itemVariants}>
              <EmojiCard 
                emoji={word.emoji} 
                englishWord={word.en}
                finnishWord={word.fi}
                article={word.article}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}

