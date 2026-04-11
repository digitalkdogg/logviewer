'use client';

import { useEffect, useState } from 'react';

interface LocalTimeProps {
  date: Date | string | number;
  mode?: 'toLocaleString' | 'toLocaleTimeString';
  options?: Intl.DateTimeFormatOptions;
}

export default function LocalTime({ date, mode = 'toLocaleString', options }: LocalTimeProps) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    const d = new Date(date);
    const opts = { ...options };
    if (mode === 'toLocaleTimeString') {
      setFormatted(d.toLocaleTimeString('en-US', opts));
    } else {
      setFormatted(d.toLocaleString('en-US', opts));
    }
  }, [date, mode, options]);

  // Fallback to server-side string or empty during hydration to avoid mismatch
  // Actually, to avoid hydration mismatch, we should render nothing or a placeholder on server
  if (!formatted) {
    return <span className="opacity-0">{new Date(date).toISOString()}</span>;
  }

  return <span>{formatted}</span>;
}
