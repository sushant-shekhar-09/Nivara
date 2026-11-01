import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Building2, Shield, EyeOff, Users, Lock } from 'lucide-react';
import { SUPPRESSION_TEXT } from '../../lib/constants';

export interface UniversityStat {
  university: string;
  student_count?: number;
  sample_size?: number;
  suppressed: boolean;
  elevated_depression?: number | null;
  elevated_anxiety?: number | null;
  pss_score?: number | null;
}

interface AggregateChartsProps {
  universities: UniversityStat[];
  totalScreenings?: number;
  className?: string;
}

export const AggregateCharts: React.FC<AggregateChartsProps> = ({
  universities,
  totalScreenings = 0,
  className = '',
}) => {
  // Filter for universities that have valid non-suppressed data for charting
  const chartableData = universities
    .filter((u) => !u.suppressed && u.elevated_depression !== null)
    .map((u) => ({
      name: u.university.split('(')[1]?.replace(')', '') || u.university.slice(0, 14),
      fullName: u.university,
      Depression: Math.round(((u.elevated_depression ?? 0) as number) * 100),
      Anxiety: Math.round(((u.elevated_anxiety ?? 0) as number) * 100),
      count: u.student_count || u.sample_size || 0,
    }));

  return (
    <div className={`space-y-8 font-sans ${className}`}>
      {/* Chart Section */}
      {chartableData.length > 0 ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-raised border border-beige shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-earth">
                Institutional Prevalence Comparison (%)
              </h3>
              <p className="text-xs text-muted-earth">
                Percentage of screened students with elevated distress indicators (PHQ-9 ≥ 10, GAD-7 ≥ 10)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-earth bg-sand/60 px-3 py-1.5 rounded-full border border-beige">
              <Users className="w-3.5 h-3.5 text-deep-sage" />
              <span>Cohorts with n ≥ 5 displayed</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartableData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6F6D63' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6F6D63' }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="p-3.5 rounded-2xl bg-earth text-ivory text-xs shadow-lg space-y-1.5 font-sans">
                        <p className="font-bold text-sage">{data.fullName}</p>
                        <p className="text-sand/80 font-mono">Cohort Sample: n = {data.count}</p>
                        <p className="text-[#A8B39A]">Depression Rate: {data.Depression}%</p>
                        <p className="text-sand/90">Anxiety Rate: {data.Anxiety}%</p>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Depression" fill="#536044" radius={[6, 6, 0, 0]} name="Depression Indicator (PHQ-9 ≥ 10)" />
                <Bar dataKey="Anxiety" fill="#E09F3E" radius={[6, 6, 0, 0]} name="Anxiety Indicator (GAD-7 ≥ 10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-raised border border-beige text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sand text-deep-sage flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-lg text-earth">
            No Non-Suppressed Cohort Data
          </h4>
          <p className="text-xs text-muted-earth max-w-md mx-auto">
            All university groups currently have fewer than 5 respondents and are suppressed to guarantee individual student confidentiality.
          </p>
        </div>
      )}

      {/* Cohort Breakdown Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-raised border border-beige shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-lg text-earth">
            All Participating Institutional Cohorts
          </h4>
          <span className="text-xs text-muted-earth font-mono">
            Total Valid Submissions: n = {totalScreenings}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-beige text-muted-earth">
                <th className="py-3 px-4 font-semibold">University</th>
                <th className="py-3 px-4 font-semibold">Sample (n)</th>
                <th className="py-3 px-4 font-semibold">Elevated Depression</th>
                <th className="py-3 px-4 font-semibold">Elevated Anxiety</th>
                <th className="py-3 px-4 font-semibold">Avg PSS Stress</th>
                <th className="py-3 px-4 font-semibold">Privacy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/60">
              {universities.map((u, idx) => (
                <tr key={idx} className="hover:bg-sand/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-earth">
                    {u.university}
                  </td>
                  <td className="py-3 px-4 font-mono text-muted-earth">
                    {u.student_count || u.sample_size || 0}
                  </td>
                  <td className="py-3 px-4">
                    {u.suppressed ? (
                      <span className="text-muted-earth/60 italic flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" /> {SUPPRESSION_TEXT}
                      </span>
                    ) : (
                      <span className="font-mono text-[#536044] font-semibold">
                        {Math.round(((u.elevated_depression ?? 0) as number) * 100)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {u.suppressed ? (
                      <span className="text-muted-earth/60 italic flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" /> {SUPPRESSION_TEXT}
                      </span>
                    ) : (
                      <span className="font-mono text-marigold-dark font-semibold">
                        {Math.round(((u.elevated_anxiety ?? 0) as number) * 100)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {u.suppressed ? (
                      <span className="text-muted-earth/60 italic font-mono">—</span>
                    ) : (
                      <span className="font-mono text-earth font-medium">
                        {(u.pss_score ?? 0).toFixed(1)} / 40
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {u.suppressed ? (
                      <span className="px-2 py-0.5 rounded-full bg-sand text-muted-earth text-[10px] font-bold uppercase tracking-wider border border-beige">
                        Suppressed (k &lt; 5)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-olive/15 text-olive text-[10px] font-bold uppercase tracking-wider border border-olive/30">
                        Published (k ≥ 5)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
