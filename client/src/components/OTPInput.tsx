import { 
  useOtpInput, 
  OTPInputContext, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from 'input-otp';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const otp = useOtpInput({
    value,
    onChange,
    size: OTP_LENGTH,
  });

  return (
    <OTPInputContext.Provider value={otp}>
      <InputOTPGroup className="flex items-center justify-center gap-2">
        {[...Array(OTP_LENGTH)].map((_, i) => (
          <div key={i}>
            <InputOTPSlot
              index={i}
              className={cn(
                "w-12 h-12 text-center text-2xl rounded-md border border-input bg-background p-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={`Digit ${i + 1}`}
            />
            {i < OTP_LENGTH - 1 && i % 3 === 2 && (
              <InputOTPSeparator
                className="flex items-center justify-center w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              >
                -
              </InputOTPSeparator>
            )}
          </div>
        ))}
      </InputOTPGroup>
    </OTPInputContext.Provider>
  );
}
