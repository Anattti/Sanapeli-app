export type Language = 'fi' | 'en';

export interface Word {
  emoji: string; // Tyhjä string jos ei sopivaa emojia
  en: string;
  fi: string;
  weight: number;
  article?: 'a' | 'an'; // Englannin kieliopin mukainen etuliite
  category: string; // Kategoria: animals, food, verbs, adjectives, etc.
}

export interface GameProgress {
  correctAnswers: number;
  incorrectAnswers: number;
  incorrectWords: string[]; // Englannin sanat
}

export interface StreakRound {
  word: Word;
  choices: string[];
}

export interface StreakStats {
  current: number;
  best: number;
}

export interface Translations {
  menu: {
    title: string;
    subtitle: string;
    practice: string;
    play: string;
    challenge: string;
    streak: string;
    switchLanguage: string;
  };
  practice: {
    title: string;
    backToMenu: string;
    clickToReveal: string;
    selectCategory: string;
  };
  play: {
    correct: string;
    incorrect: string;
    score: string;
    progress: string;
    selectCategory: string;
    startGame: string;
  };
  challenge: {
    title: string;
    placeholder: string;
    submit: string;
    correct: string;
    incorrect: string;
    showAnswer: string;
    score: string;
    progress: string;
    selectCategory: string;
    startGame: string;
  };
  streak: {
    title: string;
    description: string;
    start: string;
    dragPrompt: string;
    current: string;
    best: string;
    newBest: string;
    streakLost: string;
    retry: string;
  };
  results: {
    title: string;
    scoreLabel: string;
    feedback: {
      excellent: string;
      great: string;
      good: string;
      keepTrying: string;
    };
    playAgain: string;
    practiceWrong: string;
    backToMenu: string;
  };
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

