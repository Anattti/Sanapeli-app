export type Language = 'fi' | 'en';

export interface Word {
  emoji: string; // Tyhjä string jos ei sopivaa emojia
  en: string;
  fi: string;
  weight: number;
  article?: 'a' | 'an'; // Englannin kieliopin mukainen etuliite
}

export interface GameProgress {
  correctAnswers: number;
  incorrectAnswers: number;
  incorrectWords: string[]; // Englannin sanat
}

export interface Translations {
  menu: {
    title: string;
    subtitle: string;
    practice: string;
    play: string;
    switchLanguage: string;
  };
  practice: {
    title: string;
    backToMenu: string;
    clickToReveal: string;
  };
  play: {
    correct: string;
    incorrect: string;
    score: string;
    progress: string;
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

