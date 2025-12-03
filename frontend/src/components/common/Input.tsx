import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${className}`}>
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
};
