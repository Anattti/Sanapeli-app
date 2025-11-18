'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Word } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
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
import ScreenHeader from '@/components/ScreenHeader';

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
      className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border-2 border-orange-100 p-4 mb-6 relative overflow-hidden"
    >
      {/* Background decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">{currentLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-800">{current}</span>
            <span className="text-2xl">🔥</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{bestLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-600">{best}</span>
            <span className="text-xl grayscale opacity-50">🏆</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 flex items-center gap-2"
            >
              <span>🎉</span>
              <span>{newBestLabel}</span>
              <span>🎉</span>
            </motion.div>
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
  emoji: string | null;
  word: string;
}

const DropZone = memo(function DropZone({
  answerState,
  prompt,
  successText,
  failureText,
  showAnswerLabel,
  correctAnswer,
  disabled,
  emoji,
  word,
}: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'answer-zone',
    disabled,
  });

  const stateStyles = {
    default: 'border-orange-300 bg-gradient-to-b from-orange-50 to-white',
    correct: 'border-emerald-400 bg-emerald-50',
    incorrect: 'border-rose-400 bg-rose-50',
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
      className={`
        w-full max-w-2xl rounded-[2rem] flex flex-col items-center justify-center 
        transition-all duration-300 px-6 py-8 md:py-10 text-center space-y-4
        border-4 border-dashed relative overflow-hidden
        ${stateStyles[answerState]}
        ${isOver && answerState === 'default' ? 'scale-[1.02] shadow-xl border-orange-400 bg-orange-100' : 'shadow-sm'}
      `}
      animate={{ scale: isOver && answerState === 'default' ? 1.02 : 1 }}
      data-testid="streak-dropzone"
      style={{ touchAction: 'none' }}
    >
      {/* Energy Core Animation */}
      {answerState === 'default' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className={`w-48 h-48 rounded-full bg-orange-400 blur-3xl ${isOver ? 'animate-pulse' : ''}`} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4">
        {emoji ? (
          <div className="flex flex-col items-center">
            <span className="text-7xl md:text-8xl mb-2 filter drop-shadow-lg">{emoji}</span>
            <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
              {word}
            </span>
          </div>
        ) : (
          <span className="text-4xl md:text-5xl font-black text-gray-800">{word}</span>
        )}

        <div className={`
          px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
          ${answerState === 'default' ? 'bg-orange-100 text-orange-700' : ''}
          ${answerState === 'correct' ? 'bg-emerald-100 text-emerald-700' : ''}
          ${answerState === 'incorrect' ? 'bg-rose-100 text-rose-700' : ''}
        `}>
          {dropText}
        </div>

        {answerState === 'incorrect' && correctAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base md:text-lg text-gray-700 bg-white/80 px-4 py-2 rounded-xl"
          >
            {showAnswerLabel}{' '}
            <span className="font-bold text-gray-900">{correctAnswer}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

interface DraggableChoiceProps {
  id: string;
  text: string;
  state: ChoiceVisualState;
  disabled: boolean;
  index: number;
}

const DraggableChoice = memo(function DraggableChoice({
  id,
  text,
  state,
  disabled,
  index,
}: DraggableChoiceProps) {
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

  // Power Card Styles
  const baseStyles =
    'w-full px-4 py-6 rounded-2xl font-bold text-lg md:text-xl select-none text-center transition-all duration-200 relative overflow-hidden';

  const stateStyles: Record<ChoiceVisualState, string> = {
    default:
      'bg-white text-gray-800 shadow-md border-b-4 border-gray-200 hover:-translate-y-1 hover:shadow-lg active:border-b-0 active:translate-y-1',
    correct:
      'bg-emerald-500 text-white shadow-lg border-b-4 border-emerald-700',
    incorrect:
      'bg-rose-500 text-white shadow-lg border-b-4 border-rose-700',
    disabled:
      'bg-gray-100 text-gray-400 border-gray-200 shadow-none cursor-not-allowed',
  };

  const getAnimation = () => {
    if (state === 'correct') {
      return {
        scale: [1, 1.1, 1],
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
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`w-full ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'z-50' : ''
        }`}
      {...listeners}
      {...attributes}
      data-testid="streak-choice"
    >
      <motion.div
        className={`${baseStyles} ${stateStyles[state]} ${isDragging ? 'shadow-2xl scale-110 rotate-2 ring-4 ring-orange-400 ring-opacity-50' : ''
          }`}
        animate={getAnimation()}
        layout
      >
        {/* Card Shine Effect */}
        {!disabled && state === 'default' && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />
        )}
        <span className="relative z-10">{text}</span>
      </motion.div>
    </div>
  );
},
  function areEqual(prev, next) {
    return (
      prev.text === next.text &&
      prev.state === next.state &&
      prev.disabled === next.disabled &&
      prev.index === next.index
    );
  });

function StreakPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

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
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const lastOverRef = useRef<string | null>(null);

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

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const correctAnswer = useMemo(() => {
    if (!currentWord) return null;
    return currentWord.article ? `${currentWord.article} ${currentWord.en}` : currentWord.en;
  }, [currentWord]);

  const isDragDisabled = answerState !== 'default' || showReset;

  const getChoiceState = useCallback(
    (choice: string): ChoiceVisualState => {
      if (answerState === 'default') return 'default';
      if (choice === selectedChoice) {
        return answerState === 'correct' ? 'correct' : 'incorrect';
      }
      if (answerState === 'incorrect' && choice === correctAnswer) {
        return 'correct';
      }
      return 'disabled';
    },
    [answerState, correctAnswer, selectedChoice],
  );

  const choiceElements = useMemo(
    () =>
      choices.map((choice, index) => (
        <DraggableChoice
          key={choice}
          id={choice}
          text={choice}
          state={getChoiceState(choice)}
          disabled={isDragDisabled}
          index={index}
        />
      )),
    [choices, getChoiceState, isDragDisabled],
  );

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
    setLastCorrectAnswer(null);
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
        setLastCorrectAnswer(null);
        setStreak(prev => {
          const nextStreak = prev + 1;
          const reachedNewBest = nextStreak > bestStreak;
          if (reachedNewBest) {
            setBestStreak(nextStreak);
            setIsNewBest(true);
            triggerHaptic([0, 35, 90]);
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
        setLastCorrectAnswer(correct);
        triggerHaptic([0, 50, 120, 200]);
        saveStreakStats({
          current: 0,
          best: bestStreak,
        });
        updateWeight(currentWord, false, categoryWords);
      }
    },
    [currentWord, selectedCategory, bestStreak, loadNextWord, streak, triggerHaptic],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (answerState !== 'default' || showReset) {
        lastOverRef.current = null;
        return;
      }

      if (!over || over.id !== 'answer-zone') {
        lastOverRef.current = null;
        return;
      }

      const choice = active.data.current?.choice;
      if (typeof choice === 'string') {
        triggerHaptic([0, 40]);
        handleChoiceResolution(choice);
      }

      lastOverRef.current = null;
    },
    [answerState, handleChoiceResolution, showReset, triggerHaptic],
  );

  const handleDragStart = useCallback(
    (_event: DragStartEvent) => {
      triggerHaptic(15);
    },
    [triggerHaptic],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overId = event.over?.id ? String(event.over.id) : null;

      if (overId === 'answer-zone' && lastOverRef.current !== 'answer-zone') {
        triggerHaptic([0, 20]);
        lastOverRef.current = 'answer-zone';
      } else if (overId !== 'answer-zone' && lastOverRef.current !== null) {
        lastOverRef.current = null;
      }
    },
    [triggerHaptic],
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
    setLastCorrectAnswer(null);
    loadNextWord();
  };

  // Aloitusnäkymä
  if (!gameStarted) {
    return (
      <PageTransition>
        <div className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden">
          {/* Animated Background Elements - Hidden on mobile */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
            {!shouldReduceMotion && (
              <>
                <motion.div
                  className="absolute top-20 left-10 text-6xl opacity-20"
                  animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🔥
                </motion.div>
                <motion.div
                  className="absolute bottom-20 right-10 text-8xl opacity-10"
                  animate={{ y: [0, -50, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  ⚡
                </motion.div>
              </>
            )}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
          </div>

          <ScreenHeader className="mb-8 relative z-10" />

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10">
            <motion.div
              initial={{ y: shouldReduceMotion ? 0 : -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8 max-w-3xl"
            >
              <motion.div
                initial={{ scale: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block mb-4"
              >
                <span className={`text-7xl md:text-8xl filter drop-shadow-xl ${!shouldReduceMotion ? 'animate-pulse' : ''}`}>
                  🔥
                </span>
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-4 text-outline">
                {t.streak.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium">
                {t.streak.description}
              </p>
              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase">{t.streak.current}</span>
                  <span className="text-3xl font-black text-orange-500">{streak}</span>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase">{t.streak.best}</span>
                  <span className="text-3xl font-black text-gray-600">{bestStreak}</span>
                </div>
              </div>
            </motion.div>

            <div className="w-full mb-8">
              <CategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <motion.div
              initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
              className="mt-4"
            >
              <Button
                onClick={startGame}
                variant="success"
                size="large"
                className="px-12 text-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:-translate-y-1 transition-all"
              >
                🚀 {t.streak.start}
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
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
          <ScreenHeader className="mb-8" />
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-xl text-gray-600 font-medium">Ladataan peliä...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden">
        {/* Animated Background Elements - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          {!shouldReduceMotion && (
            <>
              <motion.div
                className="absolute top-1/4 left-10 text-6xl opacity-10"
                animate={{ y: [0, -40, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                🔥
              </motion.div>
              <motion.div
                className="absolute bottom-1/3 right-20 text-7xl opacity-10"
                animate={{ y: [0, 30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                ⚡
              </motion.div>
            </>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        </div>

        <ScreenHeader className="mb-6 relative z-10" />

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-6 relative z-10">
          <StreakHUD
            current={streak}
            best={bestStreak}
            isNewBest={isNewBest}
            bestLabel={t.streak.best}
            currentLabel={t.streak.current}
            newBestLabel={t.streak.newBest}
          />

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <DropZone
              answerState={answerState}
              prompt={t.streak.dragPrompt}
              successText={t.play.correct}
              failureText={t.play.incorrect}
              showAnswerLabel={t.challenge.showAnswer}
              correctAnswer={correctAnswer}
              disabled={isDragDisabled}
              emoji={currentWord.emoji ?? null}
              word={currentWord.fi}
            />

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
              {choiceElements}
            </div>
          </DndContext>
        </div>
      </div>

      <AnimatePresence>
        {showReset && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full text-center border-4 border-white"
            >
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                {t.streak.streakLost}
              </h2>
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-center gap-8 text-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.streak.current}</span>
                    <span className="text-2xl font-black text-gray-800">{lastStreak}</span>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.streak.best}</span>
                    <span className="text-2xl font-black text-orange-500">{bestStreak}</span>
                  </div>
                </div>
              </div>

              {lastCorrectAnswer && (
                <div className="mb-8">
                  <p className="text-gray-500 text-sm mb-1">{t.challenge.showAnswer}</p>
                  <p className="text-xl font-bold text-emerald-600">{lastCorrectAnswer}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRestart}
                  variant="primary"
                  size="large"
                  className="w-full shadow-lg shadow-blue-200"
                >
                  🔁 {t.streak.retry}
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  size="large"
                  className="w-full"
                >
                  🏠 {t.common.backToMenu}
                </Button>
              </div>
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-xl text-gray-600 font-medium">Ladataan...</p>
          </div>
        </div>
      }
    >
      <StreakPageContent />
    </Suspense>
  );
}

