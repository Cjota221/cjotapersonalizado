'use client';

import { useState } from 'react';

interface CurrencyInputProps {
  value: number; // valor em centavos
  onChange: (cents: number) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = "0,00",
  className = "",
  style = {}
}: CurrencyInputProps) {
  // Converte centavos para display inicial
  const initialDisplay = value === 0 ? '' : (value / 100).toFixed(2).replace('.', ',');
  const [displayValue, setDisplayValue] = useState(initialDisplay);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove tudo que não é número ou vírgula
    input = input.replace(/[^\d,]/g, '');
    
    // Permite apenas uma vírgula
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita casas decimais a 2
    if (parts.length === 2 && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
      input = parts.join(',');
    }
    
    setDisplayValue(input);
    
    // Converte para centavos
    if (input === '' || input === '0' || input === '0,') {
      onChange(0);
    } else {
      const normalized = input.replace(',', '.');
      const floatValue = parseFloat(normalized);
      if (!isNaN(floatValue)) {
        onChange(Math.round(floatValue * 100));
      }
    }
  };

  const handleBlur = () => {
    // Formata ao perder foco
    if (displayValue && !displayValue.includes(',')) {
      const formatted = parseFloat(displayValue || '0').toFixed(2).replace('.', ',');
      setDisplayValue(formatted);
      onChange(Math.round(parseFloat(displayValue || '0') * 100));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm ${className}`}
        style={style}
      />
    </div>
  );
}
