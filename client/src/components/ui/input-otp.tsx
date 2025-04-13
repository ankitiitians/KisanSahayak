import * as React from "react"
import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple OTP input components without relying on the input-otp library

const InputOTP = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    maxLength?: number;
    onChange?: (value: string) => void;
    containerClassName?: string;
  }
>(({ className, value = "", maxLength = 6, onChange, containerClassName, ...props }, ref) => {
  const [otp, setOtp] = React.useState<string[]>(
    value.split('').concat(Array(maxLength - value.length).fill(''))
  );
  
  const updateOTP = (newOtp: string[]) => {
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 has-[:disabled]:opacity-50",
        containerClassName
      )}
      {...props}
    >
      {Array.from({ length: maxLength }).map((_, i) => (
        <React.Fragment key={i}>
          <InputOTPSlot 
            value={otp[i] || ''} 
            index={i}
            onChange={(value: string) => {
              const newOtp = [...otp];
              newOtp[i] = value;
              updateOTP(newOtp);
              
              // Auto focus next input
              if (value && i < maxLength - 1) {
                const nextInput = document.querySelector(`[data-slot="${i + 1}"] input`) as HTMLInputElement;
                if (nextInput) nextInput.focus();
              }
            }}
            onKeyDown={(e) => {
              // Handle backspace
              if (e.key === 'Backspace' && !otp[i] && i > 0) {
                const prevInput = document.querySelector(`[data-slot="${i - 1}"] input`) as HTMLInputElement;
                if (prevInput) prevInput.focus();
              }
              // Handle arrow keys
              if (e.key === 'ArrowLeft' && i > 0) {
                const prevInput = document.querySelector(`[data-slot="${i - 1}"] input`) as HTMLInputElement;
                if (prevInput) prevInput.focus();
              }
              if (e.key === 'ArrowRight' && i < maxLength - 1) {
                const nextInput = document.querySelector(`[data-slot="${i + 1}"] input`) as HTMLInputElement;
                if (nextInput) nextInput.focus();
              }
            }}
          />
          {i < maxLength - 1 && i % 3 === 2 && (
            <InputOTPSeparator />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));

InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    index: number; 
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }
>(({ index, className, value, onChange, onKeyDown, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot={index}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border border-input rounded-md",
        className
      )}
      {...props}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="absolute inset-0 w-full h-full text-center bg-transparent text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-label={`Digit ${index + 1}`}
      />
    </div>
  );
});

InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" className="flex items-center justify-center w-4" {...props}>
    <Dot className="h-4 w-4 text-muted-foreground" />
  </div>
));

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
