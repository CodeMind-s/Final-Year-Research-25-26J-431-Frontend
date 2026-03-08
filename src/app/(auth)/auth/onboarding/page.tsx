'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';
import { authController } from '@/services/auth.controller';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
  const t = useTranslations('auth');
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    if (!isLoading && user?.isOnboarded) {
      router.push('/auth/plans');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl max-w-md mx-auto">
      <div className="mb-6">
        <Image
          src="/assets/images/logo.svg"
          alt="BRINEX"
          width={140}
          height={40}
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          {t('onboarding.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('onboarding.subtitle')}
        </p>
      </div>

      {user.role === UserRole.LANDOWNER && (
        <LandownerForm onSuccess={refreshUser} t={t} />
      )}
      {user.role === UserRole.LABORATORY && (
        <LaboratoryForm onSuccess={refreshUser} t={t} />
      )}
      {user.role === UserRole.DISTRIBUTOR && (
        <DistributorForm onSuccess={refreshUser} t={t} />
      )}
    </div>
  );
}

function LandownerForm({ onSuccess, t }: { onSuccess: () => Promise<void>; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');
  const [totalBeds, setTotalBeds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authController.onboardLandowner({
        nic,
        address,
        totalBeds: parseInt(totalBeds, 10),
        docUrls: [],
      });
      await onSuccess();
      router.push('/auth/plans');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('validation.onboardingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="nic">{t('onboarding.nicNumber')}</Label>
        <Input
          id="nic"
          type='number'
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          placeholder={t('onboarding.nicPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t('onboarding.address')}</Label>
        <Input
          id="address"
          type='text'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('onboarding.addressPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalBeds">{t('onboarding.totalSaltBeds')}</Label>
        <Input
          id="totalBeds"
          type="number"
          min="1"
          value={totalBeds}
          onChange={(e) => setTotalBeds(e.target.value)}
          placeholder={t('onboarding.bedPlaceholder')}
          required
          disabled={loading}
          max={100}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
      >
        {loading ? t('onboarding.submitting') : t('onboarding.completeSetup')}
      </Button>
    </form>
  );
}

function LaboratoryForm({ onSuccess, t }: { onSuccess: () => Promise<void>; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [labName, setLabName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authController.onboardLaboratory({
        laboratoryName: labName,
        registrationNumber: regNumber,
        address,
        docUrls: [],
      });
      await onSuccess();
      router.push('/auth/plans');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('validation.onboardingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="labName">{t('onboarding.labName')}</Label>
        <Input
          id="labName"
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
          placeholder={t('onboarding.labNamePlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regNumber">{t('onboarding.regNumber')}</Label>
        <Input
          id="regNumber"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          placeholder={t('onboarding.labRegPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t('onboarding.address')}</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('onboarding.labAddressPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-blue-500 hover:bg-vision-400 font-semibold text-white"
      >
        {loading ? t('onboarding.submitting') : t('onboarding.completeSetup')}
      </Button>
    </form>
  );
}

function DistributorForm({ onSuccess, t }: { onSuccess: () => Promise<void>; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authController.onboardDistributor({
        companyName,
        registrationNumber: regNumber,
        address,
        docUrls: [],
      });
      await onSuccess();
      router.push('/auth/plans');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('validation.onboardingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="companyName">{t('onboarding.companyName')}</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder={t('onboarding.companyPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regNumber">{t('onboarding.regNumber')}</Label>
        <Input
          id="regNumber"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          placeholder={t('onboarding.distRegPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t('onboarding.address')}</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('onboarding.distAddressPlaceholder')}
          required
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-compass-500 hover:bg-compass-400 font-semibold text-white"
      >
        {loading ? t('onboarding.submitting') : t('onboarding.completeSetup')}
      </Button>
    </form>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}
