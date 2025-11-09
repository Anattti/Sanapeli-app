'use client';

import { motion } from 'framer-motion';
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
        <div className="min-h-screen p-4 md:p-8 flex flex-col">
          <ScreenHeader className="mb-8" />

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
                {t.play.selectCategory}
              </h1>
            </motion.div>
            
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Button
                onClick={startGame}
                variant="success"
                size="large"
                className="px-12"
              >
                🎮 {t.play.startGame}
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
        <div className="min-h-screen p-4 md:p-8 flex flex-col">
          <ScreenHeader className="mb-8" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl text-gray-600">Ladataan peliä...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 flex flex-col">
        <ScreenHeader className="mb-6" />
        
        {/* Pelin sisältö */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          {/* HUD */}
          <GameHUD
            correct={correctAnswers}
            incorrect={incorrectAnswers}
            total={gameWords.length}
            scoreLabel={t.play.score}
            progressLabel={t.play.progress}
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
            className="flex flex-col items-center mb-12 select-none"
          >
            {currentWord.emoji ? (
              <>
                <span className="text-8xl md:text-9xl mb-4">
                  {currentWord.emoji}
                </span>
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
          
          {/* Palaute */}
          {answerState !== 'default' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold mb-8"
            >
              {answerState === 'correct' ? (
                <span className="text-green-600">{t.play.correct}</span>
              ) : (
                <span className="text-red-600">{t.play.incorrect}</span>
              )}
            </motion.div>
          )}
          
          {/* Vastausvaihtoehdot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {choices.map((choice, index) => (
              <motion.div
                key={choice}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Ladataan...</p>
        </div>
      </div>
    }>
      <PlayPageContent />
    </Suspense>
  );
}
