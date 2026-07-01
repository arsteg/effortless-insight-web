'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, KeyRound, RefreshCw, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVerifyOtp, useResendOtp } from '@/hooks/use-gstn';

// OTP expires in 5 minutes (300 seconds)
const OTP_EXPIRY_SECONDS = 300;

interface GstnOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gstinId: string | null;
  gstin?: string;
  otpDestination: string;
}

export function GstnOtpDialog({
  open,
  onOpenChange,
  gstinId,
  gstin,
  otpDestination,
}: GstnOtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(OTP_EXPIRY_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);
  const isVerifyingRef = useRef(false);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  // Focus input when dialog opens and reset all state
  useEffect(() => {
    if (open) {
      setOtp('');
      setError(null);
      setRemainingAttempts(null);
      setResendCooldown(0);
      setOtpExpiry(OTP_EXPIRY_SECONDS);
      isVerifyingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // OTP expiry countdown timer
  useEffect(() => {
    if (!open || otpExpiry <= 0) return;

    const timer = setTimeout(() => {
      setOtpExpiry((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [open, otpExpiry]);

  // Resend cooldown timer with proper cleanup
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const isOtpExpired = otpExpiry <= 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    // Prevent race condition from multiple clicks
    if (isVerifyingRef.current) return;
    if (!gstinId || otp.length !== 6 || isOtpExpired) return;

    isVerifyingRef.current = true;
    setError(null);
    try {
      const result = await verifyOtp.mutateAsync({ gstinId, otp });
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.errorMessage || 'Verification failed');
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts);
        }
      }
    } catch {
      // Error is handled by the hook's onError
    } finally {
      isVerifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (!gstinId || resendCooldown > 0) return;

    try {
      await resendOtp.mutateAsync(gstinId);
      setResendCooldown(60); // 60 second cooldown
      setOtpExpiry(OTP_EXPIRY_SECONDS); // Reset OTP expiry
      setOtp('');
      setError(null);
    } catch {
      // Error is handled by the hook's onError
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Enter Verification Code</DialogTitle>
              <DialogDescription>
                A 6-digit code has been sent to {otpDestination || 'your registered contact'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* OTP Expiry Warning */}
          {isOtpExpired ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <Clock className="h-4 w-4" />
              <span>OTP has expired. Please request a new code.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Code expires in {formatTime(otpExpiry)}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" id="otp-description">Verification Code</Label>
            <Input
              id="otp"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              placeholder="000000"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
              disabled={verifyOtp.isPending || isOtpExpired}
              aria-label="6-digit verification code"
              aria-describedby="otp-description"
              aria-invalid={!!error}
            />
            {error && (
              <p className="text-sm text-destructive">
                {error}
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <span className="block">
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendOtp.isPending}
            >
              {resendOtp.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Didn't receive code? Resend"}
            </Button>
          </div>

          {/* GSTIN Info */}
          {gstin && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Connecting GSTIN</p>
              <p className="text-sm font-mono font-semibold">{gstin}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || verifyOtp.isPending || isOtpExpired}
          >
            {verifyOtp.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
