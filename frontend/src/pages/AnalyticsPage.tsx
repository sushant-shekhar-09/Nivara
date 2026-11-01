import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { SuppressionNotice } from '../components/analytics/SuppressionNotice';
import { AggregateCharts, type UniversityStat } from '../components/analytics/AggregateCharts';
import { FairnessAuditCard } from '../components/analytics/FairnessAuditCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { getUniversityAnalytics, ApiClientError } from '../lib/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<UniversityStat[]>([]);
  const [totalScreenings, setTotalScreenings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await getUniversityAnalytics();
      if (response && response.universities) {
        setData(response.universities);
        setTotalScreenings(response.total_screenings || 0);
      } else if (Array.isArray(response)) {
        setData(response);
        setTotalScreenings(response.reduce((acc, curr) => acc + (curr.sample_size || 0), 0));
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(`Unable to load analytics: ${err.message}`);
      } else {
        setError('The analytics service is currently unreachable on localhost:8000.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="w-full bg-ivory min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse-gentle" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-earth-muted">
                Cohort Research & Governance (k ≥ 5)
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-earth">
              Institutional Cohort Analytics
            </h1>
            <p className="text-sm text-earth-muted mt-1 font-sans">
              Aggregated screening prevalence across participating university cohorts
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            Refresh Data
          </Button>
        </div>

        {/* Suppression Notice Banner */}
        <SuppressionNotice />

        {/* Error state if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Backend Connection Notice:</span>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content: Cohort Aggregates */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton variant="card" height={280} />
            <Skeleton variant="card" height={320} />
          </div>
        ) : (
          <AggregateCharts
            universities={data}
            totalScreenings={totalScreenings}
          />
        )}

        {/* Algorithmic Fairness & Model Provenance Section */}
        <FairnessAuditCard />
      </div>
    </div>
  );
};

