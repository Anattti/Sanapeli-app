'use client';

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categories = useMemo(() => getCategories(), []);

  const items = useMemo(() => {
    const translatedCategories = categories.map((category) => ({
      id: category.id,
      name: language === 'fi' ? category.nameFi : category.nameEn,
      emoji: category.emoji,
      count: category.count,
      color: 'from-indigo-400 to-blue-500', // Default color
    }));

    // Assign distinct colors for visual variety
    const colors = [
      'from-orange-400 to-red-500',
      'from-green-400 to-emerald-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-yellow-400 to-amber-500',
      'from-pink-400 to-rose-500',
    ];

    translatedCategories.forEach((cat, index) => {
      cat.color = colors[index % colors.length];
    });

    return [
      {
        id: 'all',
        name: language === 'fi' ? 'Kaikki' : 'All',
        emoji: '🌟',
        count: getWordsByCategory('all').length,
        color: 'from-slate-700 to-slate-900',
      },
      ...translatedCategories,
    ];
  }, [categories, language]);

  const handleSelect = useCallback(
    (nextId: string) => {
      if (nextId !== selectedCategory) {
        onSelectCategory(nextId);
      }
    },
    [onSelectCategory, selectedCategory],
  );

  const scrollToItem = useCallback((index: number) => {
    const node = itemRefs.current[index];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  // Center selected item on mount and change
  useEffect(() => {
    const index = items.findIndex((item) => item.id === selectedCategory);
    if (index !== -1) {
      scrollToItem(index);
    }
  }, [selectedCategory, items, scrollToItem]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      handleSelect(items[nextIndex].id);
      // Scrolling is handled by the useEffect above when selectedCategory changes
    },
    [handleSelect, items],
  );

  const updateScrollIndicators = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = node;
    // Add a small buffer (1px) to handle sub-pixel scrolling issues
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    updateScrollIndicators();

    const handleScroll = () => updateScrollIndicators();
    node.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

  const scroll = (direction: 'left' | 'right') => {
    const node = scrollRef.current;
    if (node) {
      const scrollAmount = node.clientWidth * 0.8;
      node.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Scroll Buttons (Desktop) */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-4 md:-ml-12 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:scale-110 transition-all hidden md:flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-4 md:-mr-12 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:scale-110 transition-all hidden md:flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradient Masks for Scroll Indication */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'} rounded-l-3xl`} />
      <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'} rounded-r-3xl`} />

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 pt-2 px-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
        role="listbox"
        aria-label={language === 'fi' ? 'Kategoria' : 'Category'}
      >
        {items.map((item, index) => {
          const isSelected = selectedCategory === item.id;

          return (
            <motion.button
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              onClick={() => handleSelect(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              role="option"
              aria-selected={isSelected}
              layout
              initial={false}
              animate={{
                scale: isSelected ? 1.05 : 1,
                opacity: isSelected ? 1 : 0.7,
              }}
              whileHover={{ scale: isSelected ? 1.05 : 1.02, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative shrink-0 snap-center
                w-40 h-48 md:w-48 md:h-56
                rounded-3xl overflow-hidden
                flex flex-col items-center justify-center
                transition-all duration-300
                focus:outline-none focus:ring-4 focus:ring-blue-400
                ${isSelected ? 'shadow-xl ring-4 ring-white/50' : 'shadow-md hover:shadow-lg'}
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center p-4">
                <span className="text-5xl md:text-6xl mb-4 filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-110">
                  {item.emoji}
                </span>
                <span className="text-white font-bold text-lg md:text-xl leading-tight mb-1 drop-shadow-sm">
                  {item.name}
                </span>
                <span className="text-white/80 text-xs md:text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {item.count} {language === 'fi' ? 'sanaa' : 'words'}
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selection-ring"
                  className="absolute inset-0 border-4 border-white rounded-3xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
