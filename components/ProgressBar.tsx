interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  variant?: 'brand' | 'auto';
}

function getVariant(value: number, max: number, variant: string): string {
  if (variant === 'brand') return 'brand';
  const pct = (value / max) * 100;
  if (pct >= 70) return 'high';
  if (pct >= 40) return 'medium';
  return 'low';
}

export default function ProgressBar({
  label,
  value,
  max = 100,
  showValue = true,
  variant = 'auto',
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const fillClass = getVariant(value, max, variant);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
        {showValue && (
          <span className="progress-bar-value">
            {value}/{max}
          </span>
        )}
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
