import { useEffect, useState } from 'react';
import { getHoneypotFieldName } from '@/utils/antispam';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Honeypot field component - invisible to users, but bots will fill it
 * If this field is filled, we know it's a bot
 */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  const [fieldName, setFieldName] = useState('');

  useEffect(() => {
    setFieldName(getHoneypotFieldName());
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor={fieldName}>
        Leave this field empty
      </label>
      <input
        type="text"
        id={fieldName}
        name={fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
