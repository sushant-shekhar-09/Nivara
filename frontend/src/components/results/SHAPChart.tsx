import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SHAPExplanationData } from '../../types';
import { DISCLAIMER } from '../../lib/constants';

interface SHAPChartProps {
  explanation?: SHAPExplanationData;
  className?: string;
}

export const SHAPChart: React.FC<SHAPChartProps> = ({
  explanation,
  className = '',
}) => {
  if (!explanation || !explanation.top_contributing_factors || explanation.top_contributing_factors.length === 0) {
    return null;
  }

  // Format data for chart
  const chartData = explanation.top_contributing_factors.map((factor) => {
    const label = factor.feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      name: label,
      rawFeature: factor.feature,
      shap: Number(factor.shap_value.toFixed(3)),
      direction: factor.direction,
      statement: factor.non_causal_statement,
    };
  });

  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-surface-raised border border-beige shadow-xs font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-earth">
            Explainable AI · TreeSHAP Attributions
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-earth">
            Why Did the Model Estimate This?
          </h3>
        </div>

        <div className="flex items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#536044]" />
            <span className="text-muted-earth">Shifted Higher</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-deep-sage" />
            <span className="text-muted-earth">Shifted Lower</span>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Causal Ethical Warning Banner */}
      <div className="p-4 rounded-2xl bg-sand/60 border border-beige mb-6 flex items-start gap-3 text-xs text-muted-earth">
        <Info className="w-4 h-4 text-deep-sage flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-earth">Statistical Attribution Notice:</strong>{' '}
          {explanation.disclaimer || DISCLAIMER.shap}
        </div>
      </div>

      {/* Chart visualization */}
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#6F6D63' }}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: '#2F302B' }}
            />
            <ReferenceLine x={0} stroke="#DAD4C8" strokeDasharray="3 3" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="p-3.5 rounded-2xl bg-earth text-ivory text-xs shadow-lg max-w-xs space-y-1.5 font-sans">
                    <p className="font-bold text-sage">{data.name}</p>
                    <p className="font-mono text-sand">
                      SHAP Weight: {data.shap > 0 ? `+${data.shap}` : data.shap}
                    </p>
                    <p className="text-sand/80 text-[11px] leading-relaxed">
                      {data.statement}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="shap" radius={[6, 6, 6, 6]} barSize={18}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shap >= 0 ? '#536044' : '#7C775F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plain Language Interpretation List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-earth">
          Factor-by-Factor Statistical Contribution
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {explanation.top_contributing_factors.map((factor, idx) => {
            const isIncrease = factor.direction === 'increased_risk';
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-beige/80 bg-sand/30 text-xs flex items-start gap-2.5"
              >
                {isIncrease ? (
                  <ArrowUpRight className="w-4 h-4 text-[#536044] flex-shrink-0 mt-0.5" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-deep-sage flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-earth block text-sm">
                    {factor.feature.replace(/_/g, ' ')}
                  </span>
                  <p className="text-muted-earth mt-0.5 leading-snug">
                    {factor.non_causal_statement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
