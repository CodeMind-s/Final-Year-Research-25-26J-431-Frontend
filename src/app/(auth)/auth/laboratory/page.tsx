'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LaboratoryLoginPage() {
  const { signIn, verifyOtp, error, isLoading } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    try {
      await signIn({ email, role: UserRole.LABORATORY });
      setStep('otp');
    } catch {
      // Error set by context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otp.length !== 6) {
      setLocalError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      await verifyOtp({ email, code: otp });
    } catch {
      // Error set by context
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setLocalError(null);
  };

  const displayError = error || localError;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6">
        <Image
          src="/assets/images/vision-logo.svg"
          alt="BRINEX Vision"
          width={140}
          height={40}
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          Laboratory Sign In
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email to receive an OTP
        </p>
      </div>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="lab@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full bg-blue-500 hover:bg-vision-400 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Enter OTP
            </Label>
            <p className="text-xs text-slate-500">
              We sent a 6-digit code to {email}
            </p>
            <div className="flex justify-center pt-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="h-12 w-full bg-blue-500 hover:bg-vision-400 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Login as Landowner / Distributor
        </Link>
      </div>
    </div>
  );
}
