'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useRef, FormEvent, useMemo, Suspense } from 'react';
import Button from '@/components/Button';
import CategorySelector from '@/components/CategorySelector';
import PageTransition from '@/components/PageTransition';
import ScreenHeader from '@/components/ScreenHeader';
import { getCategories, getWordsByCategory } from '@/data/words';
import { Word } from '@/types';
import {
  selectWeightedWords,
  updateWeight,
  shuffleArray,
} from '@/utils/gameLogic';
import { saveProgress } from '@/utils/storage';

interface ChallengeHUDProps {
  correct: number;
  incorrect: number;
  total: number;
  combo: number;
  scoreLabel: string;
  progressLabel: string;
}

function ChallengeHUD({
  correct,
  incorrect,
  total,
  combo,
  scoreLabel,
  progressLabel,
}: ChallengeHUDProps) {
  const progress = ((correct + incorrect) / total) * 100;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border-b-4 border-blue-200 p-4 mb-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{scoreLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-800">{correct}</span>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        {combo > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={combo}
            className="flex flex-col items-center"
          >
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">COMBO</span>
            <span className="text-3xl font-black text-orange-600 italic">{combo}x</span>
          </motion.div>
        )}

        <div className="flex flex-col items-end">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{progressLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-600">{correct + incorrect}/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-100">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

function ChallengePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);

  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'default' | 'correct' | 'incorrect'>('default');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [combo, setCombo] = useState(0);

  // Käynnistä peli kun kategoria on valittu
  const startGame = () => {
    const retryParam = searchParams.get('retry');
    const categoryWords = getWordsByCategory(selectedCategory);

    let selectedWords: Word[];

    if (retryParam) {
      // Harjoittelu väärinmenneillä sanoilla
      const wrongWordsList = retryParam.split(',');
      const filteredWords = categoryWords.filter(word => wrongWordsList.includes(word.en));
      selectedWords = shuffleArray(filteredWords);
    } else {
      // Normaali peli: valitse painotetusti
      selectedWords = selectWeightedWords(categoryWords, Math.min(15, categoryWords.length));
    }

    setGameWords(selectedWords);

    if (selectedWords.length > 0) {
      setGameStarted(true);
    }
  };

  // Aloita peli automaattisesti jos retry-parametri on olemassa
  useEffect(() => {
    const retryParam = searchParams.get('retry');
    if (retryParam) {
      startGame();
    }
  }, [searchParams]);

  // Fokusoi input kun sana vaihtuu
  useEffect(() => {
    if (answerState === 'default' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, answerState]);

  const currentWord = gameWords[currentIndex];

  const normalizeAnswer = (text: string): string => {
    return text.toLowerCase().trim();
  };

  const checkAnswer = () => {
    if (!currentWord || userAnswer.trim() === '') return;

    const normalized = normalizeAnswer(userAnswer);

    // Muodosta oikeat vastausvaihtoehdot
    const validAnswers = [
      normalizeAnswer(currentWord.en),
    ];

    // Hyväksy myös artikkelin kanssa
    if (currentWord.article) {
      validAnswers.push(normalizeAnswer(`${currentWord.article} ${currentWord.en}`));
    }

    const isCorrect = validAnswers.includes(normalized);
    const categoryWords = getWordsByCategory(selectedCategory);

    if (isCorrect) {
      setAnswerState('correct');
      setCorrectAnswers(prev => prev + 1);
      setCombo(prev => prev + 1);
      updateWeight(currentWord, true, categoryWords);
    } else {
      setAnswerState('incorrect');
      setIncorrectAnswers(prev => prev + 1);
      setIncorrectWords(prev => [...prev, currentWord.en]);
      setCombo(0);
      updateWeight(currentWord, false, categoryWords);
      setShowCorrectAnswer(true);
    }

    // Siirry seuraavaan sanaan 2 sekunnin kuluttua
    setTimeout(() => {
      if (currentIndex + 1 < gameWords.length) {
        setCurrentIndex(prev => prev + 1);
        setUserAnswer('');
        setAnswerState('default');
        setShowCorrectAnswer(false);
      } else {
        // Peli päättyi - tallenna edistyminen ja siirry tuloksiin
        const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
        const finalIncorrect = isCorrect ? incorrectAnswers : incorrectAnswers + 1;
        const finalIncorrectWords = isCorrect ? incorrectWords : [...incorrectWords, currentWord.en];

        const progress = {
          correctAnswers: finalCorrect,
          incorrectAnswers: finalIncorrect,
          incorrectWords: finalIncorrectWords,
        };
        saveProgress(progress);
        router.push('/results?mode=challenge');
      }
    }, 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (answerState === 'default') {
      checkAnswer();
    }
  };

  // Näytä kategoriavalinta ennen pelin alkua
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
                  animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🏆
                </motion.div>
                <motion.div
                  className="absolute bottom-20 right-10 text-8xl opacity-10"
                  animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  🌟
                </motion.div>
              </>
            )}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
          </div>

          <ScreenHeader className="mb-8 relative z-10" />

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block mb-4"
              >
                <span className="text-7xl md:text-8xl filter drop-shadow-xl">🏆</span>
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3 text-outline">
                {t.challenge.title}
              </h1>
              <p className="text-base md:text-lg text-gray-600 font-medium">
                {t.challenge.selectCategory}
              </p>
            </motion.div>

            <div className="w-full mb-8">
              <CategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Button
                onClick={startGame}
                variant="success"
                size="large"
                className="px-12 text-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:-translate-y-1 transition-all"
              >
                🏆 {t.challenge.startGame}
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
            <div className="text-6xl mb-4 animate-bounce">🎮</div>
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
                className="absolute top-1/4 left-20 text-6xl opacity-10"
                animate={{ y: [0, -40, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                🥇
              </motion.div>
              <motion.div
                className="absolute bottom-1/3 right-20 text-7xl opacity-10"
                animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                ✨
              </motion.div>
            </>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        </div>

        <ScreenHeader className="mb-6 relative z-10" />

        {/* Pelin sisältö */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10">
          {/* HUD */}
          <ChallengeHUD
            correct={correctAnswers}
            incorrect={incorrectAnswers}
            total={gameWords.length}
            combo={combo}
            scoreLabel={t.challenge.score}
            progressLabel={t.challenge.progress}
          />

          {/* Emoji + suomenkielinen sana */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            className="flex flex-col items-center mb-10 select-none"
          >
            {currentWord.emoji ? (
              <>
                <span className="text-8xl md:text-9xl mb-6 filter drop-shadow-2xl">
                  {currentWord.emoji}
                </span>
                <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                  {currentWord.fi}
                </span>
              </>
            ) : (
              <span className="text-4xl md:text-5xl font-black text-gray-800">
                {currentWord.fi}
              </span>
            )}
          </motion.div>

          {/* Palaute */}
          {answerState !== 'default' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              {answerState === 'correct' ? (
                <div className="relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-4 border-green-200">
                  <span className="text-5xl md:text-7xl font-black text-green-500 drop-shadow-sm">
                    {t.challenge.correct}!
                  </span>
                  {/* Confetti Effect (Simplified) */}
                  {!shouldReduceMotion && (
                    <>
                      <motion.div initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: -100, y: -100, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute top-1/2 left-1/2 text-4xl">🎉</motion.div>
                      <motion.div initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: 100, y: -100, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute top-1/2 left-1/2 text-4xl">✨</motion.div>
                      <motion.div initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: -50, y: 100, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute top-1/2 left-1/2 text-4xl">🎊</motion.div>
                      <motion.div initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: 50, y: 100, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute top-1/2 left-1/2 text-4xl">⭐</motion.div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-4 border-red-100">
                  <span className="text-3xl md:text-4xl font-black text-red-500 block mb-2">
                    {t.challenge.incorrect}
                  </span>
                  {showCorrectAnswer && (
                    <div className="text-xl md:text-2xl text-gray-700">
                      <span className="font-semibold text-gray-400 uppercase text-sm block mb-1">{t.challenge.showAnswer}</span>
                      <span className="text-green-600 font-black text-3xl">
                        {currentWord.article ? `${currentWord.article} ${currentWord.en}` : currentWord.en}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Vastauskenttä */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t.challenge.placeholder}
                disabled={answerState !== 'default'}
                className={`w-full px-8 py-6 text-2xl md:text-3xl text-center rounded-full border-4 shadow-xl
                  focus:outline-none focus:ring-4 transition-all duration-300 font-bold
                  ${answerState === 'default'
                    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-300'
                    : answerState === 'correct'
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {/* Magic Scroll Ends */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-12 bg-blue-200 rounded-l-full border-l-4 border-blue-300 -z-10 hidden md:block"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-12 bg-blue-200 rounded-r-full border-r-4 border-blue-300 -z-10 hidden md:block"></div>
            </motion.div>

            {answerState === 'default' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={checkAnswer}
                  variant="primary"
                  size="large"
                  disabled={userAnswer.trim() === ''}
                  className="w-full shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-1 transition-all"
                >
                  ✅ {t.challenge.submit}
                </Button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600 font-medium">Ladataan...</p>
        </div>
      </div>
    }>
      <ChallengePageContent />
    </Suspense>
  );
}
