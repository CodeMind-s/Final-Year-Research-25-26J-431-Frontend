'use client';

import { useState, useEffect } from 'react';
import { authController } from '@/services/auth.controller';
import { PersonalDetailsResponse } from '@/dtos/auth.dto';
import { User, Mail, Phone, MapPin, Layers, CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandownerProfilePage() {
  const [profileData, setProfileData] = useState<PersonalDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authController.getPersonalDetails();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-compass-600" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-slate-700 mb-2">Failed to Load Profile</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="px-4 py-2 bg-compass-600 text-white rounded-lg hover:bg-compass-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, landOwnerDetails } = profileData;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
          <p className="text-slate-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          {/* Header Section with Role Badge */}
          <div className="bg-linear-to-r from-compass-600 to-compass-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Landowner Profile</h2>
                  {user.isVerified && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-full text-xs font-semibold">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm">Role: {user.role}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-compass-600" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <Mail size={20} className="text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.email || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <Phone size={20} className="text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Phone</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Subscription Plan */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CreditCard size={20} className="text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 capitalize">
                      {user.plan || 'Free'}
                    </p>
                    {user.isSubscribed && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle size={20} className="text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {user.isOnboarded && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Onboarded
                      </span>
                    )}
                    {user.isTrialActive && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        Trial Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Landowner Details Card */}
        {landOwnerDetails && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 p-4 text-white">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Layers size={24} />
                Landowner Details
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIC */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    National Identity Card
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {landOwnerDetails.nic}
                  </p>
                </div>

                {/* Total Beds */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Total Salt Beds
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {landOwnerDetails.totalBeds} beds
                  </p>
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Address
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {landOwnerDetails.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
