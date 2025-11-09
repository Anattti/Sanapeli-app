'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ComponentProps } from 'react';

type ButtonVariant = ComponentProps<typeof Button>['variant'];
type ButtonSize = ComponentProps<typeof Button>['size'];

interface ScreenHeaderProps {
  className?: string;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
}

export default function ScreenHeader({
  className = '',
  buttonVariant = 'secondary',
  buttonSize = 'small',
}: ScreenHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        onClick={() => router.push('/')}
        variant={buttonVariant}
        size={buttonSize}
      >
        ← {t.common.backToMenu}
      </Button>
      <LanguageToggle variant="header" />
    </div>
  );
}

