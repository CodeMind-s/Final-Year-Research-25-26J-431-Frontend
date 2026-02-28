'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { AlertCircle, Phone, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CommonLoginPage() {
  const { signIn, verifyOtp, error, isLoading } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.LANDOWNER);
  const [localError, setLocalError] = useState<string | null>(null);

  const fullPhone = `+94${phone.replace(/^0+/, '')}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!phone.trim()) {
      setLocalError('Please enter your phone number.');
      return;
    }

    try {
      await signIn({ phone: fullPhone, role: activeRole });
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
      await verifyOtp({ phone: fullPhone, code: otp });
    } catch {
      // Error set by context
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setLocalError(null);
  };

  const displayError = error || localError;

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
          Sign In
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your phone number to receive an OTP
        </p>
      </div>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}

      <Tabs
        value={activeRole}
        onValueChange={(val: string) => {
          setActiveRole(val as UserRole);
          setStep('phone');
          setOtp('');
          setLocalError(null);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value={UserRole.LANDOWNER} className="flex-1">
            Landowner
          </TabsTrigger>
          <TabsTrigger value={UserRole.DISTRIBUTOR} className="flex-1">
            Distributor
          </TabsTrigger>
        </TabsList>

        <TabsContent value={UserRole.LANDOWNER}>
          {step === 'phone' ? (
            <PhoneForm
              phone={phone}
              setPhone={setPhone}
              onSubmit={handleSendOtp}
              isLoading={isLoading}
            />
          ) : (
            <OtpForm
              otp={otp}
              setOtp={setOtp}
              onSubmit={handleVerifyOtp}
              onBack={handleBack}
              isLoading={isLoading}
              phone={fullPhone}
            />
          )}
        </TabsContent>

        <TabsContent value={UserRole.DISTRIBUTOR}>
          {step === 'phone' ? (
            <PhoneForm
              phone={phone}
              setPhone={setPhone}
              onSubmit={handleSendOtp}
              isLoading={isLoading}
            />
          ) : (
            <OtpForm
              otp={otp}
              setOtp={setOtp}
              onSubmit={handleVerifyOtp}
              onBack={handleBack}
              isLoading={isLoading}
              phone={fullPhone}
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/auth/laboratory"
          className="text-blue-600 hover:underline font-medium"
        >
          Login as Laboratory
        </Link>
      </div>
    </div>
  );
}

function PhoneForm({
  phone,
  setPhone,
  onSubmit,
  isLoading,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
          Phone Number
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
              placeholder="7X XXX XXXX"
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
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
    </form>
  );
}

function OtpForm({
  otp,
  setOtp,
  onSubmit,
  onBack,
  isLoading,
  phone,
}: {
  otp: string;
  setOtp: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  phone: string;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-5">
      <button
        type="button"
        onClick={onBack}
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
          We sent a 6-digit code to {phone}
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
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>
    </form>
  );
}
