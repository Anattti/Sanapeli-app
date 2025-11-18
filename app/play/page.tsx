'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useMemo, Suspense } from 'react';
import GameHUD from '@/components/GameHUD';
import ChoiceButton from '@/components/ChoiceButton';
import CategorySelector from '@/components/CategorySelector';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import ScreenHeader from '@/components/ScreenHeader';
import { getCategories, getWordsByCategory } from '@/data/words';
import { Word } from '@/types';
import {
  selectWeightedWords,
  generateChoices,
  updateWeight,
  shuffleArray,
} from '@/utils/gameLogic';
import { saveProgress } from '@/utils/storage';

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);
  const categories = useMemo(() => getCategories(), []);

  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'default' | 'correct' | 'incorrect'>('default');

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
      setChoices(generateChoices(selectedWords[0], categoryWords));
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

  const currentWord = gameWords[currentIndex];

  const handleChoice = (choice: string) => {
    if (answerState !== 'default' || !currentWord) return;

    setSelectedChoice(choice);

    // Muodosta oikea vastaus artikkelilla
    const correctAnswer = currentWord.article
      ? `${currentWord.article} ${currentWord.en}`
      : currentWord.en;

    const isCorrect = choice === correctAnswer;
    const categoryWords = getWordsByCategory(selectedCategory);

    if (isCorrect) {
      setAnswerState('correct');
      setCorrectAnswers(prev => prev + 1);
      updateWeight(currentWord, true, categoryWords);
    } else {
      setAnswerState('incorrect');
      setIncorrectAnswers(prev => prev + 1);
      setIncorrectWords(prev => [...prev, currentWord.en]);
      updateWeight(currentWord, false, categoryWords);
    }

    const delay = isCorrect ? 1500 : 3000;

    // Siirry seuraavaan sanaan: oikein 1.5 s, väärin 3 s
    setTimeout(() => {
      if (currentIndex + 1 < gameWords.length) {
        setCurrentIndex(prev => prev + 1);
        const categoryWords = getWordsByCategory(selectedCategory);
        setChoices(generateChoices(gameWords[currentIndex + 1], categoryWords));
        setSelectedChoice(null);
        setAnswerState('default');
      } else {
        // Peli päättyi - tallenna edistyminen ja siirry tuloksiin
        const progress = {
          correctAnswers: correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: incorrectAnswers + (isCorrect ? 0 : 1),
          incorrectWords: isCorrect ? incorrectWords : [...incorrectWords, currentWord.en],
        };
        saveProgress(progress);
        router.push('/results?mode=play');
      }
    }, delay);
  };

  const getChoiceState = (choice: string) => {
    if (answerState === 'default') return 'default';
    if (choice === selectedChoice) {
      return answerState;
    }
    // Näytä oikea vastaus jos valittiin väärin
    if (answerState === 'incorrect' && currentWord) {
      const correctAnswer = currentWord.article
        ? `${currentWord.article} ${currentWord.en}`
        : currentWord.en;
      if (choice === correctAnswer) {
        return 'correct';
      }
    }
    return 'disabled';
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
                  animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  🎮
                </motion.div>
                <motion.div
                  className="absolute bottom-20 right-10 text-8xl opacity-10"
                  animate={{ y: [0, -50, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  🕹️
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
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block mb-4"
              >
                <span className={`text-7xl md:text-8xl filter drop-shadow-xl ${!shouldReduceMotion ? 'animate-bounce-in' : ''}`}>
                  🎮
                </span>
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-3 text-outline">
                {t.play.selectCategory}
              </h1>
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
              transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
              className="mt-4"
            >
              <Button
                onClick={startGame}
                variant="success"
                size="large"
                className="px-12 text-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:-translate-y-1 transition-all"
              >
                🚀 {t.play.startGame}
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
                animate={{ y: [0, -40, 0], rotate: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              >
                🎲
              </motion.div>
              <motion.div
                className="absolute bottom-1/3 right-20 text-7xl opacity-10"
                animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                🎯
              </motion.div>
            </>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        </div>

        <ScreenHeader className="mb-6 relative z-10" />

        {/* Pelin sisältö */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10">
          {/* HUD */}
          <div className="w-full mb-8">
            <GameHUD
              correct={correctAnswers}
              incorrect={incorrectAnswers}
              total={gameWords.length}
              scoreLabel={t.play.score}
              progressLabel={t.play.progress}
            />
          </div>

          {/* Emoji + suomenkielinen sana */}
          <div className="relative h-64 w-full flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0, rotate: shouldReduceMotion ? 0 : -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: shouldReduceMotion ? 0 : 180, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
                className="flex flex-col items-center select-none absolute"
              >
                {currentWord.emoji ? (
                  <>
                    <span className="text-9xl md:text-[10rem] mb-6 filter drop-shadow-2xl">
                      {currentWord.emoji}
                    </span>
                    <span className="text-3xl md:text-4xl font-black text-gray-800 bg-white/80 backdrop-blur-sm px-8 py-3 rounded-full shadow-sm border-2 border-white/50">
                      {currentWord.fi}
                    </span>
                  </>
                ) : (
                  <span className="text-5xl md:text-6xl font-black text-gray-800 bg-white/80 backdrop-blur-sm px-10 py-16 rounded-3xl shadow-lg border-4 border-white">
                    {currentWord.fi}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Palaute */}
          <div className="h-12 mb-6 flex items-center justify-center">
            <AnimatePresence>
              {answerState !== 'default' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-3xl md:text-4xl font-black"
                >
                  {answerState === 'correct' ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 drop-shadow-sm">
                      {t.play.correct}
                    </span>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 drop-shadow-sm">
                      {t.play.incorrect}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vastausvaihtoehdot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-4">
            {choices.map((choice, index) => (
              <motion.div
                key={`${currentIndex}-${choice}`}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : index * 0.1 }}
              >
                <ChoiceButton
                  text={choice}
                  onClick={() => handleChoice(choice)}
                  state={getChoiceState(choice)}
                  disabled={answerState !== 'default'}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600 font-medium">Ladataan...</p>
        </div>
      </div>
    }>
      <PlayPageContent />
    </Suspense>
  );
}
