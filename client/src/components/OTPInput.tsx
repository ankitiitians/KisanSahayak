import { useState, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';

const OTP_LENGTH = 6;

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split('').concat(Array(OTP_LENGTH - value.length).fill('')));
  
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Auto-move to next input
      if (newValue && index < OTP_LENGTH - 1) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };
  
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace when current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
    
    // Move to next input on right arrow
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    
    // Move to previous input on left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };
  
  // Handle paste event for the entire OTP
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    
    if (pastedData) {
      const newOtp = [...pastedData.split('').slice(0, OTP_LENGTH)];
      while (newOtp.length < OTP_LENGTH) newOtp.push('');
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the last input with a value or the first empty input
      const lastIndex = Math.max(0, pastedData.length - 1);
      const inputToFocus = document.querySelector(`input[data-index="${lastIndex}"]`) as HTMLInputElement;
      if (inputToFocus) inputToFocus.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <div key={index} className="relative">
          <input
            type="text"
            data-index={index}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            className="w-12 h-12 text-center text-2xl rounded-md border border-input bg-background p-2 
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Digit ${index + 1}`}
          />
          {index < OTP_LENGTH - 1 && index % 3 === 2 && (
            <span className="mx-1 text-muted-foreground">-</span>
          )}
        </div>
      ))}
    </div>
  );
}
