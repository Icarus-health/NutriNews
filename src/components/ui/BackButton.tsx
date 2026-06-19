'use client';

import { useRouter } from 'next/navigation';

interface Props {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ fallbackHref = '/', label = '← Zurück', className }: Props) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    // Use browser history if there's a previous entry, otherwise navigate to fallback
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  );
}
