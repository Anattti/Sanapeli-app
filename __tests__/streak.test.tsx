import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StreakPageContent } from '@/app/streak/page';
import { generateChoices } from '@/utils/gameLogic';
import { getWordsByCategory } from '@/data/words';
import { getStreakStats, saveStreakStats } from '@/utils/storage';

function renderWithLanguage(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Streak-tila', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('näyttää aloitusnäkymän ja aloita-napin', () => {
    renderWithLanguage(<StreakPageContent />);

    expect(screen.getByText(/Streak-tila/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aloita streak/i })).toBeInTheDocument();
  });

  test('käynnistää pelin ja näyttää vaihtoehdot sekä pudotusalueen', () => {
    renderWithLanguage(<StreakPageContent />);

    const startButton = screen.getByRole('button', { name: /Aloita streak/i });
    fireEvent.click(startButton);

    expect(screen.getByTestId('streak-dropzone')).toHaveTextContent(
      /Vedä oikea kortti tähän/i,
    );
    const choices = screen.getAllByTestId('streak-choice');
    expect(choices).toHaveLength(4);
  });

  test('generateChoices palauttaa oikean vastauksen ja neljä vaihtoehtoa', () => {
    const categoryWords = getWordsByCategory('all');
    const correctWord = categoryWords[0];

    const choices = generateChoices(correctWord, categoryWords);
    const correctAnswer = correctWord.article
      ? `${correctWord.article} ${correctWord.en}`
      : correctWord.en;

    expect(choices).toHaveLength(4);
    expect(choices).toContain(correctAnswer);
  });

  test('tallentaa ja palauttaa streak-tilan localStoragesta', () => {
    saveStreakStats({ current: 3, best: 7 });
    expect(getStreakStats()).toEqual({ current: 3, best: 7 });
  });
});

