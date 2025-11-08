'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Word } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import CategorySelector from '@/components/CategorySelector';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import { getWordsByCategory } from '@/data/words';
import {
  generateChoices,
  selectWeightedWords,
  updateWeight,
} from '@/utils/gameLogic';
import { getStreakStats, saveStreakStats } from '@/utils/storage';

type ChoiceVisualState = 'default' | 'correct' | 'incorrect' | 'disabled';

interface StreakHUDProps {
  current: number;
  best: number;
  isNewBest: boolean;
  currentLabel: string;
  bestLabel: string;
  newBestLabel: string;
}

function StreakHUD({
  current,
  best,
  isNewBest,
  currentLabel,
  bestLabel,
  newBestLabel,
}: StreakHUDProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{currentLabel}</p>
          <p className="text-3xl font-bold text-gray-800">{current}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 font-medium">{bestLabel}</p>
          <p className="text-2xl font-semibold text-gray-800">{best}</p>
        </div>
      </div>
      <AnimatePresence>
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-sm font-semibold text-emerald-600 flex items-center gap-2"
          >
            <span>🌟</span>
            <span>{newBestLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DropZoneProps {
  answerState: 'default' | 'correct' | 'incorrect';
  prompt: string;
  successText: string;
  failureText: string;
  showAnswerLabel: string;
  correctAnswer: string | null;
  disabled: boolean;
}

function DropZone({
  answerState,
  prompt,
  successText,
  failureText,
  showAnswerLabel,
  correctAnswer,
  disabled,
}: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'answer-zone',
    disabled,
  });

  const baseStyles =
    'w-full max-w-2xl h-32 md:h-40 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-200 px-6 text-center';

  const stateStyles = {
    default: 'border-indigo-300 text-indigo-600 bg-indigo-50/40',
    correct: 'border-emerald-400 text-emerald-600 bg-emerald-50/70',
    incorrect: 'border-rose-400 text-rose-600 bg-rose-50/70',
  } as const;

  const dropText =
    answerState === 'correct'
      ? successText
      : answerState === 'incorrect'
      ? failureText
      : prompt;

  return (
    <motion.div
      ref={setNodeRef}
      className={`${baseStyles} ${stateStyles[answerState]} ${
        isOver && answerState === 'default' ? 'scale-[1.02] shadow-soft' : ''
      }`}
      animate={{ scale: isOver && answerState === 'default' ? 1.02 : 1 }}
      data-testid="streak-dropzone"
    >
      <p className="text-lg md:text-xl font-semibold">{dropText}</p>
      {answerState === 'incorrect' && correctAnswer && (
        <p className="mt-2 text-sm md:text-base text-gray-700">
          {showAnswerLabel}{' '}
          <span className="font-semibold text-gray-900">{correctAnswer}</span>
        </p>
      )}
    </motion.div>
  );
}

interface DraggableChoiceProps {
  id: string;
  text: string;
  state: ChoiceVisualState;
  disabled: boolean;
  index: number;
}

function DraggableChoice({ id, text, state, disabled, index }: DraggableChoiceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { choice: text },
    disabled,
  });

  const dragStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'none' : undefined,
        touchAction: 'none' as const,
      }
    : {
        touchAction: 'none' as const,
        transition: isDragging ? 'none' : undefined,
      };

  const baseStyles =
    'w-full px-6 py-5 rounded-3xl font-semibold text-lg md:text-xl select-none text-center transition-all duration-200 border-2';

  const paletteClasses = [
    'bg-gradient-to-br from-[#DBEAFE] via-[#BFDBFE] to-[#EFF6FF] border-[#93C5FD] text-[#1D4ED8] shadow-[0_18px_38px_-24px_rgba(59,130,246,0.45)]',
    'bg-gradient-to-br from-[#EDE9FE] via-[#DDD6FE] to-[#F5F3FF] border-[#C4B5FD] text-[#5B21B6] shadow-[0_18px_38px_-24px_rgba(129,140,248,0.45)]',
    'bg-gradient-to-br from-[#FCE7F3] via-[#FBCFE8] to-[#FFF1F2] border-[#F9A8D4] text-[#BE185D] shadow-[0_18px_38px_-24px_rgba(236,72,153,0.45)]',
    'bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#ECFDF5] border-[#86EFAC] text-[#166534] shadow-[0_18px_38px_-24px_rgba(16,185,129,0.45)]',
  ];

  const paletteClass = paletteClasses[index % paletteClasses.length];

  const stateStyles: Record<ChoiceVisualState, string> = {
    default:
      paletteClass,
    correct:
      'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-emerald-500 shadow-lg shadow-emerald-300/60',
    incorrect:
      'bg-gradient-to-r from-rose-400 to-red-500 text-white border-rose-500 shadow-lg shadow-rose-300/60',
    disabled:
      'bg-gray-100 text-gray-400 border-gray-200 shadow-[0_10px_20px_-18px_rgba(75,85,99,0.6)]',
  };

  const getAnimation = () => {
    if (state === 'correct') {
      return {
        scale: [1, 1.05, 1.02],
        transition: { duration: 0.35 },
      };
    }
    if (state === 'incorrect') {
      return {
        x: [0, -10, 10, -6, 6, 0],
        transition: { duration: 0.35 },
      };
    }
    return {};
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`w-full ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${
        isDragging ? 'z-50' : ''
      }`}
      {...listeners}
      {...attributes}
      data-testid="streak-choice"
    >
      <motion.div
        className={`${baseStyles} ${stateStyles[state]} ${
          isDragging ? 'shadow-xl scale-[1.02]' : ''
        }`}
        whileHover={!disabled && state === 'default' ? { scale: 1.03, y: -4 } : undefined}
        whileTap={!disabled && state === 'default' ? { scale: 0.97 } : undefined}
        animate={getAnimation()}
        layout
      >
        {text}
      </motion.div>
    </div>
  );
}

function StreakPageContent() {
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'default' | 'correct' | 'incorrect'>(
    'default',
  );
  const [showReset, setShowReset] = useState(false);
  const [lastStreak, setLastStreak] = useState(0);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const stats = getStreakStats();
    setStreak(stats.current);
    setBestStreak(stats.best);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const correctAnswer = useMemo(() => {
    if (!currentWord) return null;
    return currentWord.article ? `${currentWord.article} ${currentWord.en}` : currentWord.en;
  }, [currentWord]);

  const loadNextWord = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const categoryWords = getWordsByCategory(selectedCategory);
    if (categoryWords.length === 0) {
      setCurrentWord(null);
      setChoices([]);
      setAnswerState('default');
      setSelectedChoice(null);
      setShowReset(false);
      return;
    }

    const selected = selectWeightedWords(categoryWords, 1);
    const nextWord =
      selected.length > 0
        ? selected[0]
        : categoryWords[Math.floor(Math.random() * categoryWords.length)];

    setCurrentWord(nextWord);
    setChoices(generateChoices(nextWord, categoryWords));
    setAnswerState('default');
    setSelectedChoice(null);
    setShowReset(false);
    setIsNewBest(false);
  }, [selectedCategory]);

  const handleChoiceResolution = useCallback(
    (choice: string) => {
      if (!currentWord) return;

      setSelectedChoice(choice);

      const correct = currentWord.article
        ? `${currentWord.article} ${currentWord.en}`
        : currentWord.en;
      const categoryWords = getWordsByCategory(selectedCategory);
      const isCorrect = choice === correct;

      if (isCorrect) {
        setAnswerState('correct');
        setLastStreak(0);
        setStreak(prev => {
          const nextStreak = prev + 1;
          const reachedNewBest = nextStreak > bestStreak;
          if (reachedNewBest) {
            setBestStreak(nextStreak);
            setIsNewBest(true);
          } else {
            setIsNewBest(false);
          }
          saveStreakStats({
            current: nextStreak,
            best: reachedNewBest ? nextStreak : bestStreak,
          });
          return nextStreak;
        });
        updateWeight(currentWord, true, categoryWords);

        timeoutRef.current = window.setTimeout(() => {
          loadNextWord();
        }, 1200);
      } else {
        setAnswerState('incorrect');
        setLastStreak(streak);
        setStreak(0);
        setIsNewBest(false);
        setShowReset(true);
        saveStreakStats({
          current: 0,
          best: bestStreak,
        });
        updateWeight(currentWord, false, categoryWords);
      }
    },
    [currentWord, selectedCategory, bestStreak, loadNextWord, streak],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || over.id !== 'answer-zone') return;
      if (answerState !== 'default' || showReset) return;

      const choice = active.data.current?.choice;
      if (typeof choice === 'string') {
        handleChoiceResolution(choice);
      }
    },
    [answerState, handleChoiceResolution, showReset],
  );

  const startGame = () => {
    setGameStarted(true);
    setShowReset(false);
    setAnswerState('default');
    setSelectedChoice(null);
    loadNextWord();
  };

  const handleRestart = () => {
    setShowReset(false);
    setAnswerState('default');
    setSelectedChoice(null);
    setLastStreak(0);
    loadNextWord();
  };

  // Aloitusnäkymä
  if (!gameStarted) {
    return (
      <PageTransition>
        <div className="min-h-screen p-4 md:p-8 flex flex-col">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
            <LanguageToggle variant="header" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8 max-w-3xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                {t.streak.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                {t.streak.description}
              </p>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm md:text-base text-gray-700">
                <span>
                  {t.streak.current}: <strong>{streak}</strong>
                </span>
                <span>
                  {t.streak.best}: <strong>{bestStreak}</strong>
                </span>
              </div>
            </motion.div>

            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Button
                onClick={startGame}
                variant="success"
                size="large"
                className="px-12"
              >
                🔥 {t.streak.start}
              </Button>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!currentWord) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Ladataan peliä...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isDragDisabled = answerState !== 'default' || showReset;

  const getChoiceState = (choice: string): ChoiceVisualState => {
    if (answerState === 'default') return 'default';
    if (choice === selectedChoice) {
      return answerState === 'correct' ? 'correct' : 'incorrect';
    }
    if (answerState === 'incorrect' && choice === correctAnswer) {
      return 'correct';
    }
    return 'disabled';
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 flex flex-col">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <LanguageToggle variant="header" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <StreakHUD
            current={streak}
            best={bestStreak}
            isNewBest={isNewBest}
            bestLabel={t.streak.best}
            currentLabel={t.streak.current}
            newBestLabel={t.streak.newBest}
          />

          <motion.div
            key={currentWord.en}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="flex flex-col items-center mb-10 select-none"
          >
            {currentWord.emoji ? (
              <>
                <span className="text-8xl md:text-9xl mb-4">{currentWord.emoji}</span>
                <span className="text-2xl md:text-3xl font-semibold text-gray-700">
                  {currentWord.fi}
                </span>
              </>
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-gray-800">
                {currentWord.fi}
              </span>
            )}
          </motion.div>

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <DropZone
              answerState={answerState}
              prompt={t.streak.dragPrompt}
              successText={t.play.correct}
              failureText={t.play.incorrect}
              showAnswerLabel={t.challenge.showAnswer}
              correctAnswer={correctAnswer}
              disabled={isDragDisabled}
            />

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {choices.map((choice, index) => (
                <DraggableChoice
                  key={choice}
                  id={choice}
                  text={choice}
                  state={getChoiceState(choice)}
                  disabled={isDragDisabled}
                  index={index}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </div>

      <AnimatePresence>
        {showReset && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-soft p-6 md:p-8 max-w-md w-full text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {t.streak.streakLost}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.streak.current}: <strong>{lastStreak}</strong> • {t.streak.best}:{' '}
                <strong>{bestStreak}</strong>
              </p>
              <Button onClick={handleRestart} variant="secondary" size="large">
                🔁 {t.streak.retry}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default function StreakPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Ladataan...</p>
          </div>
        </div>
      }
    >
      <StreakPageContent />
    </Suspense>
  );
}

export { StreakPageContent };

