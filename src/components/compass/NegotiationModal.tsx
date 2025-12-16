import React, { useState } from 'react';
import { SellerOffer, NegotiationMessage } from '@/dtos/compass/types';
import { Button } from './Button';
import { X, TrendingUp, AlertCircle, Check } from 'lucide-react';

interface NegotiationModalProps {
  offer: SellerOffer;
  landownerName: string;
  landownerId: string;
  availableTons: number;
  onAccept: (deal: {
    sellerId: string;
    sellerName: string;
    landownerId: string;
    landownerName: string;
    quantity: number;
    pricePerTon: number;
    totalPrice: number;
  }) => void;
  onReject: () => void;
  onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  offer,
  landownerName,
  landownerId,
  availableTons,
  onAccept,
  onReject,
  onClose,
}) => {
  const [step, setStep] = useState<'review' | 'confirm'>('review');
  const [quantity, setQuantity] = useState(Math.min(offer.demandTons, availableTons));
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterPrice, setCounterPrice] = useState(offer.pricePerTon);

  const totalPrice = quantity * offer.pricePerTon;
  const maxQuantity = Math.min(offer.demandTons, availableTons);

  const handleAccept = () => {
    if (step === 'review') {
      setStep('confirm');
    } else {
      onAccept({
        sellerId: offer.sellerId,
        sellerName: offer.name,
        landownerId,
        landownerName,
        quantity,
        pricePerTon: offer.pricePerTon,
        totalPrice,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {step === 'review' ? 'Review Offer' : 'Confirm Deal'}
              </h2>
              <p className="text-blue-100 text-sm">{offer.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {step === 'review' ? (
          <div className="p-6 space-y-6">
            {/* Offer Details */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Price Offered</span>
                <span className="text-2xl font-bold text-slate-900">
                  LKR {offer.pricePerTon.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500">/ton</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Seller Needs</span>
                <span className="font-semibold text-slate-900">{offer.demandTons} tons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Reliability</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  offer.reliability === 'High' ? 'bg-emerald-100 text-emerald-700' :
                  offer.reliability === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {offer.reliability}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-700 font-medium">Quantity to Sell</label>
                <span className="text-sm text-slate-500">Max: {maxQuantity} tons</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-center mt-2">
                <span className="text-3xl font-bold text-blue-600">{quantity}</span>
                <span className="text-slate-500 ml-1">tons</span>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-800 font-medium">Total Revenue</span>
                <div className="text-right">
                  <div className="text-xs text-emerald-600">
                    {quantity} tons × LKR {offer.pricePerTon.toLocaleString()}
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    LKR {totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning if not enough */}
            {availableTons < offer.demandTons && (
              <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Partial fulfillment:</strong> You have {availableTons} tons available, 
                  but seller needs {offer.demandTons} tons.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button variant="success" fullWidth onClick={handleAccept} className="h-14 text-lg">
                <Check size={20} />
                Proceed to Confirm
              </Button>
              <Button variant="outline" fullWidth onClick={onReject}>
                Reject Offer
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Confirmation Summary */}
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm This Deal?</h3>
              <p className="text-slate-600">Review the details one last time before accepting</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border-2 border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Buyer</span>
                <span className="font-semibold text-slate-900">{offer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Quantity</span>
                <span className="font-semibold text-slate-900">{quantity} tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Price per Ton</span>
                <span className="font-semibold text-slate-900">LKR {offer.pricePerTon.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-slate-300 pt-3 flex justify-between">
                <span className="text-slate-700 font-bold">Total Amount</span>
                <span className="text-xl font-bold text-emerald-600">
                  LKR {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Note:</strong> Once confirmed, this deal will be official and both parties will be notified.
            </div>

            <div className="space-y-3 pt-2">
              <Button variant="success" fullWidth onClick={handleAccept} className="h-14 text-lg">
                <Check size={20} />
                Confirm & Accept Deal
              </Button>
              <Button variant="outline" fullWidth onClick={() => setStep('review')}>
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
