'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategories, getWordsByCategory } from '@/data/words';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  const { language } = useLanguage();
  const categories = getCategories();
  
  const allOption = {
    id: 'all',
    name: language === 'fi' ? 'Kaikki sanat' : 'All words',
    emoji: '📚',
    count: getWordsByCategory('all').length,
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Kaikki sanat -vaihtoehto */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl font-semibold shadow-soft transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white scale-105'
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          {allOption.emoji} {allOption.name}
          <span className="ml-2 text-xs opacity-80">
            ({allOption.count})
          </span>
        </motion.button>
        
        {/* Kategoriat */}
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-xl font-semibold shadow-soft transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white scale-105'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            {category.emoji} {language === 'fi' ? category.nameFi : category.nameEn}
            <span className="ml-2 text-xs opacity-80">
              ({category.count})
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
