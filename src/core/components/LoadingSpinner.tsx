interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
