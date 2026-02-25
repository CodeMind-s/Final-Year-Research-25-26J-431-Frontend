'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6">
        <Image
          src="/assets/images/logo.svg"
          alt="BRINEX"
          width={140}
          height={40}
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          Complete Your Profile
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fill in your details to get started
        </p>
      </div>

      {user.role === UserRole.LANDOWNER && (
        <LandownerForm onSuccess={refreshUser} />
      )}
      {user.role === UserRole.LABORATORY && (
        <LaboratoryForm onSuccess={refreshUser} />
      )}
      {user.role === UserRole.DISTRIBUTOR && (
        <DistributorForm onSuccess={refreshUser} />
      )}
    </div>
  );
}

function LandownerForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
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
      setError(err instanceof Error ? err.message : 'Onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="nic">NIC Number</Label>
        <Input
          id="nic"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          placeholder="200012345678"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main Street, Colombo"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalBeds">Total Salt Beds</Label>
        <Input
          id="totalBeds"
          type="number"
          min="1"
          value={totalBeds}
          onChange={(e) => setTotalBeds(e.target.value)}
          placeholder="10"
          required
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
      >
        {loading ? 'Submitting...' : 'Complete Setup'}
      </Button>
    </form>
  );
}

function LaboratoryForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
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
      setError(err instanceof Error ? err.message : 'Onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="labName">Laboratory Name</Label>
        <Input
          id="labName"
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
          placeholder="ABC Testing Lab"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regNumber">Registration Number</Label>
        <Input
          id="regNumber"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          placeholder="LAB-2024-001"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="456 Lab Avenue, Colombo"
          required
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-blue-500 hover:bg-vision-400 font-semibold text-white"
      >
        {loading ? 'Submitting...' : 'Complete Setup'}
      </Button>
    </form>
  );
}

function DistributorForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
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
      setError(err instanceof Error ? err.message : 'Onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Salt Distribution Co."
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regNumber">Registration Number</Label>
        <Input
          id="regNumber"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          placeholder="DIST-2024-001"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="789 Trade Street, Colombo"
          required
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-compass-500 hover:bg-compass-400 font-semibold text-white"
      >
        {loading ? 'Submitting...' : 'Complete Setup'}
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
