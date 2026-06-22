'use client';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function getScoreHex(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function ScoreRing({ score, size = 160, strokeWidth = 10, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = Math.min(Math.max(score, 0), 100) / 100;
  const dashoffset = circumference * (1 - fillPercent);
  const colorClass = getScoreColor(score);
  const colorHex = getScoreHex(score);

  return (
    <div className="score-ring-container">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="score-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className={`score-ring-fill ${colorClass}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ stroke: colorHex, transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          />
        </svg>
        <div className="score-ring-label">
          <span className="score-ring-number" style={{ color: colorHex }}>{score}</span>
          <span className="score-ring-max">/ 100</span>
        </div>
      </div>
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
}
