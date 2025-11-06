import { Language, GameProgress } from '@/types';

// Type guard LocalStorage-datalle
function isValidLanguage(value: unknown): value is Language {
  return value === 'fi' || value === 'en';
}

// Kielivalinta
export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'fi';
  
  try {
    const saved = localStorage.getItem('language');
    if (saved && isValidLanguage(saved)) {
      return saved;
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return 'fi';
}

export function saveLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('language', language);
  } catch (error) {
    console.error('Error saving language to localStorage:', error);
  }
}

// Sanojen painot adaptiiviseen oppimiseen
export function getWeights(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem('wordWeights');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading weights from localStorage:', error);
  }
  return {};
}

export function saveWeights(weights: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('wordWeights', JSON.stringify(weights));
  } catch (error) {
    console.error('Error saving weights to localStorage:', error);
  }
}

// Pelin edistyminen
export function getProgress(): GameProgress | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('gameProgress');
    if (saved) {
      const parsed = JSON.parse(saved) as GameProgress;
      if (
        typeof parsed === 'object' &&
        typeof parsed.correctAnswers === 'number' &&
        typeof parsed.incorrectAnswers === 'number' &&
        Array.isArray(parsed.incorrectWords)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
  }
  return null;
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gameProgress', JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('gameProgress');
  } catch (error) {
    console.error('Error clearing progress from localStorage:', error);
  }
}

// Parhaat tulokset
export function getBestScore(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const saved = localStorage.getItem('bestScore');
    if (saved) {
      const score = parseInt(saved, 10);
      if (!isNaN(score)) {
        return score;
      }
    }
  } catch (error) {
    console.error('Error reading best score from localStorage:', error);
  }
  return 0;
}

export function saveBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentBest = getBestScore();
    if (score > currentBest) {
      localStorage.setItem('bestScore', score.toString());
    }
  } catch (error) {
    console.error('Error saving best score to localStorage:', error);
  }
}

