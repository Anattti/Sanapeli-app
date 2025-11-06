'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import GameHUD from '@/components/GameHUD';
import ChoiceButton from '@/components/ChoiceButton';
import PageTransition from '@/components/PageTransition';
import { words } from '@/data/words';
import { Word } from '@/types';
import {
  selectWeightedWords,
  generateChoices,
  updateWeight,
  shuffleArray,
} from '@/utils/gameLogic';
import { saveProgress } from '@/utils/storage';

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'default' | 'correct' | 'incorrect'>('default');
  
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
    
    if (selectedWords.length > 0) {
      setChoices(generateChoices(selectedWords[0], words));
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
    
    if (isCorrect) {
      setAnswerState('correct');
      setCorrectAnswers(prev => prev + 1);
      updateWeight(currentWord, true, words);
    } else {
      setAnswerState('incorrect');
      setIncorrectAnswers(prev => prev + 1);
      setIncorrectWords(prev => [...prev, currentWord.en]);
      updateWeight(currentWord, false, words);
    }
    
    // Siirry seuraavaan sanaan 1.5 sekunnin kuluttua
    setTimeout(() => {
      if (currentIndex + 1 < gameWords.length) {
        setCurrentIndex(prev => prev + 1);
        setChoices(generateChoices(gameWords[currentIndex + 1], words));
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
        router.push('/results');
      }
    }, 1500);
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
            scoreLabel={t.play.score}
            progressLabel={t.play.progress}
          />
          
          {/* Emoji */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            className="text-8xl md:text-9xl mb-12 select-none"
          >
            {currentWord.emoji}
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

