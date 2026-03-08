'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { AlertCircle, Phone, Mail, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type SignUpRole = UserRole.LANDOWNER | UserRole.DISTRIBUTOR | UserRole.LABORATORY;

export default function CommonSignUpPage() {
  const t = useTranslations('auth');
  const { signUp, verifyOtp, error, isLoading } = useAuth();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [role, setRole] = useState<SignUpRole>(UserRole.LANDOWNER);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isEmailRole = role === UserRole.LABORATORY;
  const fullPhone = `+94${phone.replace(/^0+/, '')}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isEmailRole) {
      if (!email.trim()) {
        setLocalError(t('validation.enterEmail'));
        return;
      }
      try {
        await signUp({ email, role });
        setStep('otp');
      } catch {
        // Error set by context
      }
    } else {
      if (!phone.trim()) {
        setLocalError(t('validation.enterPhone'));
        return;
      }
      try {
        await signUp({ phone: fullPhone, role });
        setStep('otp');
      } catch {
        // Error set by context
      }
    }
  };

  const submitOtp = async (code: string) => {
    setLocalError(null);
    try {
      if (isEmailRole) {
        await verifyOtp({ email, code });
      } else {
        await verifyOtp({ phone: fullPhone, code });
      }
    } catch {
      // Error set by context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setLocalError(t('validation.enterOtp'));
      return;
    }
    await submitOtp(otp);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      submitOtp(value);
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtp('');
    setLocalError(null);
  };

  const displayError = error || localError;
  const otpTarget = isEmailRole ? email : fullPhone;

  return (
    <div className="rounded-2xl max-w-xl mx-auto w-full border border-slate-200 bg-white p-8 shadow-none md:shadow-xl">
      <div className="mb-6">
        <Image
          src="/assets/images/logo.svg"
          alt="BRINEX"
          width={140}
          height={40}
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          {t('signup.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('signup.subtitle')}
        </p>
      </div>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}

      {step === 'input' ? (
        <>
          {/* Role selection */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {t('signup.iAmA')}
            </Label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.LANDOWNER)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${role === UserRole.LANDOWNER
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                {t('signup.landowner')}
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.DISTRIBUTOR)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${role === UserRole.DISTRIBUTOR
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                {t('signup.distributor')}
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.LABORATORY)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${role === UserRole.LABORATORY
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                {t('signup.laboratory')}
              </button>
            </div>
          </div>

          {/* Input form — phone or email based on role */}
          <form onSubmit={handleSendOtp} className="space-y-5">
            {isEmailRole ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  {t('login.emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  {t('login.phoneLabel')}
                </Label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-600">
                    +94
                  </span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t('login.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-11 rounded-l-none border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('login.sendingOtp') : t('login.sendOtp')}
            </Button>
          </form>
        </>
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
              {t('otp.enterOtp')}
            </Label>
            <p className="text-xs text-slate-500">
              {t('otp.otpSentTo', { target: otpTarget })}
            </p>
            <div className="flex justify-center pt-2">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
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
            className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('otp.verifying') : t('otp.verifyOtp')}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-slate-500">
        {t('signup.alreadyHaveAccount')}{' '}
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          {t('signup.signIn')}
        </Link>
      </div>
    </div>
  );
}
