'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useRef, FormEvent } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import GameHUD from '@/components/GameHUD';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import { words } from '@/data/words';
import { Word } from '@/types';
import {
  selectWeightedWords,
  updateWeight,
  shuffleArray,
} from '@/utils/gameLogic';
import { saveProgress } from '@/utils/storage';

export default function ChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'default' | 'correct' | 'incorrect'>('default');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  
  // Alusta peli
  useEffect(() => {
    const retryParam = searchParams.get('retry');
    
    let selectedWords: Word[];
    
    if (retryParam) {
      // Harjoittelu väärinmenneillä sanoilla
      const wrongWordsList = retryParam.split(',');
      const filteredWords = words.filter(word => wrongWordsList.includes(word.en));
      selectedWords = shuffleArray(filteredWords);
    } else {
      // Normaali peli: valitse painotetusti
      selectedWords = selectWeightedWords(words, 15);
    }
    
    setGameWords(selectedWords);
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
    
    if (isCorrect) {
      setAnswerState('correct');
      setCorrectAnswers(prev => prev + 1);
      updateWeight(currentWord, true, words);
    } else {
      setAnswerState('incorrect');
      setIncorrectAnswers(prev => prev + 1);
      setIncorrectWords(prev => [...prev, currentWord.en]);
      updateWeight(currentWord, false, words);
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
  
  if (!currentWord) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-xl text-gray-600">Ladataan peliä...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 flex flex-col">
        {/* Kielivalinta */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <LanguageToggle variant="header" />
        </div>
        
        {/* Pelin sisältö */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          {/* HUD */}
          <GameHUD
            correct={correctAnswers}
            incorrect={incorrectAnswers}
            total={gameWords.length}
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
              className="text-center mb-6"
            >
              {answerState === 'correct' ? (
                <span className="text-3xl md:text-4xl font-bold text-green-600">
                  {t.challenge.correct}
                </span>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xl md:text-4xl font-bold text-red-600 block">
                    {t.challenge.incorrect}
                  </span>
                  {showCorrectAnswer && (
                    <div className="text-xl md:text-2xl text-gray-700">
                      <span className="font-semibold">{t.challenge.showAnswer}</span>{' '}
                      <span className="text-green-600 font-bold">
                        {currentWord.article ? `${currentWord.article} ${currentWord.en}` : currentWord.en}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          
          {/* Vastauskenttä */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t.challenge.placeholder}
                disabled={answerState !== 'default'}
                className={`w-full px-6 py-4 text-xl md:text-2xl text-center rounded-2xl border-4 
                  focus:outline-none focus:ring-4 transition-all duration-200
                  ${answerState === 'default' 
                    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-white' 
                    : answerState === 'correct'
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
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
                  className="w-full"
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

