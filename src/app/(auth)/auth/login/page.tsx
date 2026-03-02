'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { AlertCircle, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type LoginMethod = 'phone' | 'email';
type EmailMode = 'otp' | 'password';

export default function CommonLoginPage() {
  const t = useTranslations('auth');
  const { signIn, verifyOtp, login, error, isLoading } = useAuth();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [emailMode, setEmailMode] = useState<EmailMode>('otp');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const fullPhone = `+94${phone.replace(/^0+/, '')}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (method === 'phone' && !phone.trim()) {
      setLocalError(t('validation.enterPhone'));
      return;
    }
    if (method === 'email' && !email.trim()) {
      setLocalError(t('validation.enterEmail'));
      return;
    }

    try {
      if (method === 'phone') {
        await signIn({ phone: fullPhone });
      } else {
        await signIn({ email });
      }
      setStep('otp');
    } catch {
      // Error set by context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otp.length !== 6) {
      setLocalError(t('validation.enterOtp'));
      return;
    }

    try {
      if (method === 'phone') {
        await verifyOtp({ phone: fullPhone, code: otp });
      } else {
        await verifyOtp({ email, code: otp });
      }
    } catch {
      // Error set by context
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError(t('validation.enterEmail'));
      return;
    }
    if (!password.trim()) {
      setLocalError(t('validation.enterPassword'));
      return;
    }

    try {
      await login({ email, password });
    } catch {
      // Error set by context
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtp('');
    setLocalError(null);
  };

  const displayError = error || localError;
  const otpTarget = method === 'phone' ? fullPhone : email;

  return (
    <div className="rounded-2xl max-w-xl mx-auto w-full border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6">
        <Image
          src="/assets/images/logo.svg"
          alt="BRINEX"
          width={140}
          height={40}
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          {t('login.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('login.subtitle')}
        </p>
      </div>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}

      {step === 'input' ? (
        <Tabs
          value={method}
          onValueChange={(val: string) => {
            setMethod(val as LoginMethod);
            setLocalError(null);
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="phone" className="flex-1">
              {t('login.phoneTab')}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1">
              {t('login.emailTab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone">
            <form onSubmit={handleSendOtp} className="mt-4 space-y-5">
              <p className="text-xs text-slate-500">
                {t('login.phoneHint')}
              </p>
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
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('login.sendingOtp') : t('login.sendOtp')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            {emailMode === 'otp' ? (
              <form onSubmit={handleSendOtp} className="mt-4 space-y-5">
                <p className="text-xs text-slate-500">
                  {t('login.emailOtpHint')}
                </p>
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
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('login.sendingOtp') : t('login.sendOtp')}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  {t('login.saltSocietyMember')}{' '}
                  <button
                    type="button"
                    onClick={() => { setEmailMode('password'); setLocalError(null); }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {t('login.loginWithPassword')}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="mt-4 space-y-5">
                <p className="text-xs text-slate-500">
                  {t('login.emailPwHint')}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email-pw" className="text-sm font-medium text-slate-700">
                    {t('login.emailLabel')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="email-pw"
                      type="email"
                      placeholder={t('login.emailPwPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    {t('login.passwordLabel')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('login.signingIn') : t('login.signIn')}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => { setEmailMode('otp'); setLocalError(null); }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {t('login.loginWithOtp')}
                  </button>
                </p>
              </form>
            )}
          </TabsContent>
        </Tabs>
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
            className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('otp.verifying') : t('otp.verifyOtp')}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-slate-500">
        {t('login.noAccount')}{' '}
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:underline font-medium"
        >
          {t('login.signUp')}
        </Link>
      </div>
    </div>
  );
}
