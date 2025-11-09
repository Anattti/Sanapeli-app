'use client';

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
    }));

    return [
      {
        id: 'all',
        name: language === 'fi' ? 'Kaikki sanat' : 'All words',
        emoji: '📚',
        count: getWordsByCategory('all').length,
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

  const focusAndRevealItem = useCallback((index: number) => {
    const node = itemRefs.current[index];
    if (node) {
      node.focus({ preventScroll: true });
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      handleSelect(items[nextIndex].id);
      focusAndRevealItem(nextIndex);
    },
    [focusAndRevealItem, handleSelect, items],
  );

  const updateScrollIndicators = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = node;
    const maxScrollLeft = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScrollLeft - 8);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    updateScrollIndicators();

    const handleScroll = () => updateScrollIndicators();
    node.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateScrollIndicators());
      resizeObserver.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateScrollIndicators]);

  useEffect(() => {
    updateScrollIndicators();
  }, [items, updateScrollIndicators]);

  const ArrowIndicator = ({
    direction,
    visible,
  }: {
    direction: 'left' | 'right';
    visible: boolean;
  }) => {
    const isLeft = direction === 'left';
    const gradientClass = isLeft
      ? 'left-0 bg-gradient-to-r'
      : 'right-0 bg-gradient-to-l';
    const wobble = isLeft ? [-2, 2, -2] : [2, -2, 2];

    return (
      <motion.div
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          x: visible ? 0 : isLeft ? -12 : 12,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`pointer-events-none absolute inset-y-2 ${gradientClass} w-12 sm:w-16 rounded-3xl from-white via-white/70 to-transparent`}
      >
        <motion.span
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/80 shadow-soft ring-1 ring-white/60 text-indigo-400"
          animate={visible ? { x: wobble } : { x: 0 }}
          transition={{
            duration: 1.2,
            repeat: visible ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            {isLeft ? (
              <path d="M15 18l-6-6 6-6" />
            ) : (
              <path d="M9 6l6 6-6 6" />
            )}
          </svg>
        </motion.span>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-8">
      <ArrowIndicator direction="left" visible={canScrollLeft} />
      <ArrowIndicator direction="right" visible={canScrollRight} />

      <motion.div
        layout
        ref={scrollRef}
        role="listbox"
        aria-label={language === 'fi' ? 'Kategoria' : 'Category'}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {items.map((item, index) => {
          const isSelected = selectedCategory === item.id;

          const palette = isSelected
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white shadow-xl shadow-indigo-500/20'
            : 'bg-white/80 text-gray-700 ring-1 ring-white/40 hover:bg-white hover:ring-indigo-200/60';

          return (
            <motion.button
              key={item.id}
              type="button"
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              whileHover={!isSelected ? { translateY: -2 } : undefined}
              whileTap={{ scale: 0.98 }}
              className={`snap-center shrink-0 min-w-[160px] sm:min-w-[190px] px-5 py-4 rounded-3xl text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200/80 ${palette}`}
              data-testid="category-selector-item"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-base sm:text-lg tracking-tight">
                    {item.name}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {language === 'fi' ? `${item.count} sanaa` : `${item.count} words`}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
