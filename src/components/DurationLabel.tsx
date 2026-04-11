import React from 'react';

interface DurationLabelProps {
  durationMs: number | null;
  startedAt: Date | string | null;
  finishedAt: Date | string | null;
}

const DurationLabel: React.FC<DurationLabelProps> = ({ durationMs, startedAt, finishedAt }) => {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  let displayDuration: number | null = durationMs;

  if (displayDuration === null && startedAt && finishedAt) {
    const start = new Date(startedAt).getTime();
    const finish = new Date(finishedAt).getTime();
    displayDuration = finish - start;
  } else if (displayDuration === null && startedAt) {
    const start = new Date(startedAt).getTime();
    displayDuration = Date.now() - start;
  }

  return (
    <span className="text-gray-500 text-sm">
      {displayDuration !== null ? formatDuration(displayDuration) : '-'}
    </span>
  );
};

export default DurationLabel;
