import React from 'react';
import { 
  ComposedChart,
  Line, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Leaf, DollarSign, Users } from 'lucide-react';
import { Card } from './Card';
import { HarvestPrediction, PricePrediction, DemandPrediction } from '@/dtos/compass/types';

interface PredictionChartsProps {
  harvestData: HarvestPrediction[];
  priceData: PricePrediction[];
  demandData: DemandPrediction[];
}

export const PredictionCharts: React.FC<PredictionChartsProps> = ({
  harvestData,
  priceData,
  demandData
}) => {
  // Combine all data into a single dataset
  const combinedData = harvestData.map((harvest, index) => ({
    month: harvest.month,
    // Harvest data
    harvestTons: harvest.tons,
    harvestIsPrediction: harvest.isPrediction,
    // Price data
    avgPrice: priceData[index]?.avgPrice || 0,
    priceIsPrediction: priceData[index]?.isPrediction || false,
    // Demand data
    demandTons: demandData[index]?.demandTons || 0,
    demandIsPrediction: demandData[index]?.isPrediction || false,
    // Overall prediction flag (true if any metric is predicted)
    isPrediction: harvest.isPrediction,
  }));

  // Find the split point between historical and predicted data
  const splitIndex = combinedData.findIndex(d => d.isPrediction);

  // Split data into historical and predicted for rendering with different styles
  const historicalData = combinedData.slice(0, splitIndex > 0 ? splitIndex : combinedData.length);
  const predictedData = splitIndex > 0 ? combinedData.slice(splitIndex - 1) : [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-xl">
          <p className="font-bold text-slate-900 mb-3 text-base">{data.month} 2025</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-emerald-600" />
                <span className="text-sm text-slate-600">Harvest</span>
              </div>
              <span className="font-semibold text-emerald-700">{data.harvestTons} tons</span>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-blue-600" />
                <span className="text-sm text-slate-600">Price</span>
              </div>
              <span className="font-semibold text-blue-700">LKR {data.avgPrice}/ton</span>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-purple-600" />
                <span className="text-sm text-slate-600">Demand</span>
              </div>
              <span className="font-semibold text-purple-700">{data.demandTons} tons</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              {data.isPrediction ? '📊 AI Prediction' : '📈 Historical Data'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Normalize price data to fit on the same scale (divide by 30 to approximate tons scale)
  const normalizePrice = (price: number) => price / 30;
  const normalizeDemand = (demand: number) => demand / 4;

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900">Market Analytics & Predictions</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-1 bg-slate-700 rounded" />
              <span className="text-xs text-slate-600 font-medium">Historical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-1 bg-slate-700 rounded opacity-40" />
              <span className="text-xs text-slate-600 font-medium">Predicted</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Leaf size={16} className="text-emerald-600" />
              <div className="w-8 h-1 bg-emerald-600 rounded" />
            </div>
            <span className="text-sm text-slate-700 font-medium">Harvest (tons)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <DollarSign size={16} className="text-blue-600" />
              <div className="w-8 h-1 bg-blue-600 rounded" />
            </div>
            <span className="text-sm text-slate-700 font-medium">Price (LKR/ton ÷ 30)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Users size={16} className="text-purple-600" />
              <div className="w-8 h-1 bg-purple-600 rounded" />
            </div>
            <span className="text-sm text-slate-700 font-medium">Demand (tons ÷ 4)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart>
          <defs>
            {/* Gradients for areas */}
            <linearGradient id="harvestGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          <XAxis 
            dataKey="month" 
            stroke="#64748b"
            style={{ fontSize: '13px', fontWeight: 500 }}
            allowDuplicatedCategory={false}
          />
          
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            label={{ value: 'Normalized Scale', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {splitIndex > 0 && (
            <ReferenceLine 
              x={combinedData[splitIndex - 1].month} 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: 'TODAY', 
                position: 'top', 
                fill: '#f59e0b', 
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}

          {/* Historical Data - Solid Lines */}
          <Area
            data={historicalData}
            type="monotone"
            dataKey="harvestTons"
            stroke="#059669"
            strokeWidth={3}
            fill="url(#harvestGradient)"
            name="Harvest (Historical)"
          />
          <Line
            data={historicalData}
            type="monotone"
            dataKey={(d) => normalizePrice(d.avgPrice)}
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', r: 4 }}
            name="Price (Historical)"
          />
          <Line
            data={historicalData}
            type="monotone"
            dataKey={(d) => normalizeDemand(d.demandTons)}
            stroke="#9333ea"
            strokeWidth={3}
            dot={{ fill: '#9333ea', r: 4 }}
            name="Demand (Historical)"
          />

          {/* Predicted Data - Dashed Lines with Lower Opacity */}
          {predictedData.length > 0 && (
            <>
              <Area
                data={predictedData}
                type="monotone"
                dataKey="harvestTons"
                stroke="#059669"
                strokeWidth={3}
                strokeDasharray="8 4"
                fill="url(#harvestGradient)"
                fillOpacity={0.3}
                strokeOpacity={0.6}
                name="Harvest (Predicted)"
              />
              <Line
                data={predictedData}
                type="monotone"
                dataKey={(d) => normalizePrice(d.avgPrice)}
                stroke="#2563eb"
                strokeWidth={3}
                strokeDasharray="8 4"
                strokeOpacity={0.6}
                dot={{ fill: '#2563eb', r: 4, opacity: 0.6 }}
                name="Price (Predicted)"
              />
              <Line
                data={predictedData}
                type="monotone"
                dataKey={(d) => normalizeDemand(d.demandTons)}
                stroke="#9333ea"
                strokeWidth={3}
                strokeDasharray="8 4"
                strokeOpacity={0.6}
                dot={{ fill: '#9333ea', r: 4, opacity: 0.6 }}
                name="Demand (Predicted)"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">💡 How to read this chart:</span> All three metrics are displayed together for easy comparison. 
          Price and demand values are normalized to fit the scale. Solid lines show historical data, while dashed lines with lower opacity 
          represent AI-powered predictions for the next 6 months.
        </p>
      </div>
    </Card>
  );
};
