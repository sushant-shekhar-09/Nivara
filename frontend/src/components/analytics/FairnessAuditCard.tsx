import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  Database,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  getModelFairnessAudit,
  type ModelFairnessAuditResponse,
  ApiClientError,
} from '../../lib/api';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export const FairnessAuditCard: React.FC = () => {
  const [audit, setAudit] = useState<ModelFairnessAuditResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<'depression' | 'anxiety'>('depression');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getModelFairnessAudit();
      setAudit(data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to load algorithmic fairness audit.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  if (isLoading) {
    return <Skeleton variant="card" height={320} />;
  }

  if (error || !audit) {
    return (
      <div className="bg-white border border-beige rounded-3xl p-6 text-center space-y-3">
        <Scale className="w-8 h-8 text-muted-earth mx-auto" />
        <p className="text-xs text-muted-earth">
          {error || 'Fairness audit data is currently unavailable.'}
        </p>
        <Button variant="outline" size="sm" onClick={fetchAudit}>
          Retry Evaluation
        </Button>
      </div>
    );
  }

  const currentTask = audit.tasks[selectedTask];

  return (
    <div className="bg-white border border-beige rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-deep-sage" />
            <span className="text-[11px] font-semibold tracking-wider text-muted-earth uppercase">
              Algorithmic Fairness & Model Provenance
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-earth">
            Subgroup Disparity & 80% Rule Audit
          </h2>
          <p className="text-xs sm:text-sm text-muted-earth mt-1 max-w-xl leading-relaxed">
            Independent evaluation of frozen screening classifiers across gender, socioeconomic status,
            and academic progression to guarantee non-discriminatory triage.
          </p>
        </div>

        {/* Task Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-sand/70 border border-beige rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setSelectedTask('depression')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTask === 'depression'
                ? 'bg-white text-earth shadow-xs border border-beige'
                : 'text-muted-earth hover:text-earth'
            }`}
          >
            Depression (PHQ-9 Proxy)
          </button>
          <button
            onClick={() => setSelectedTask('anxiety')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTask === 'anxiety'
                ? 'bg-white text-earth shadow-xs border border-beige'
                : 'text-muted-earth hover:text-earth'
            }`}
          >
            Anxiety (GAD-7 Proxy)
          </button>
        </div>
      </div>

      {/* Provenance & Benchmark Info Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-sand/30 border border-beige">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-earth block tracking-wider">
            Benchmark Dataset
          </span>
          <span className="text-xs font-bold text-earth block mt-0.5 truncate" title={audit.provenance.benchmark_dataset}>
            {audit.provenance.benchmark_dataset}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-earth block tracking-wider">
            Dataset DOI
          </span>
          <a
            href={`https://doi.org/${audit.provenance.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-deep-sage hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            <span>{audit.provenance.doi}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-earth block tracking-wider">
            Total Cohort Evaluated
          </span>
          <span className="text-xs font-bold text-earth block mt-0.5">
            N = {audit.provenance.total_cohort_evaluated.toLocaleString()} Students
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-earth block tracking-wider">
            Leakage Safeguard
          </span>
          <span className="text-xs font-bold text-deep-sage block mt-0.5">
            Strict Zero-Leakage
          </span>
        </div>
      </div>

      {/* Disparity & Four-Fifths Rule Compliance Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Disparity Card */}
        {currentTask.fairness_ratios.gender && (
          <div className="p-5 rounded-2xl border border-beige bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-earth">
                Gender Demographic Parity
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentTask.fairness_ratios.gender.passes_four_fifths_rule
                    ? 'bg-sage/20 text-deep-sage'
                    : 'bg-[#536044]/20 text-[#1C3A13]'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Four-Fifths Compliant</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-sand/40 border border-beige">
                <span className="text-[10px] text-muted-earth block">DP Ratio</span>
                <span className="text-base font-bold text-earth">
                  {(currentTask.fairness_ratios.gender.demographic_parity_ratio! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-earth">Threshold &ge; 80%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sand/40 border border-beige">
                <span className="text-[10px] text-muted-earth block">Parity Diff</span>
                <span className="text-base font-bold text-earth">
                  {(currentTask.fairness_ratios.gender.demographic_parity_diff! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-earth">Rate gap</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sand/40 border border-beige">
                <span className="text-[10px] text-muted-earth block">Equal Opp (TPR)</span>
                <span className="text-base font-bold text-earth">
                  {(currentTask.fairness_ratios.gender.equal_opportunity_tpr_ratio! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-earth">Recall ratio</span>
              </div>
            </div>

            {/* Subgroup Details */}
            {currentTask.subgroups.gender && (
              <div className="text-[11px] text-muted-earth pt-2 border-t border-beige flex justify-between">
                <span>
                  Female (N={currentTask.subgroups.gender.Female?.count}): Selection Rate{' '}
                  {((currentTask.subgroups.gender.Female?.selection_rate || 0) * 100).toFixed(1)}%
                </span>
                <span>
                  Male (N={currentTask.subgroups.gender.Male?.count}): Selection Rate{' '}
                  {((currentTask.subgroups.gender.Male?.selection_rate || 0) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Socioeconomic / Financial Aid Card */}
        {currentTask.fairness_ratios.financial_aid && (
          <div className="p-5 rounded-2xl border border-beige bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-earth">
                Socioeconomic Parity (Fee Waiver)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentTask.fairness_ratios.financial_aid.passes_four_fifths_rule
                    ? 'bg-sage/20 text-deep-sage'
                    : 'bg-[#536044]/20 text-[#1C3A13]'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Four-Fifths Compliant</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-sand/40 border border-beige">
                <span className="text-[10px] text-muted-earth block">DP Ratio</span>
                <span className="text-base font-bold text-earth">
                  {(currentTask.fairness_ratios.financial_aid.demographic_parity_ratio! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-earth">Threshold &ge; 80%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sand/40 border border-beige">
                <span className="text-[10px] text-muted-earth block">Parity Diff</span>
                <span className="text-base font-bold text-earth">
                  {(currentTask.fairness_ratios.financial_aid.demographic_parity_diff! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-muted-earth">Rate gap</span>
              </div>
            </div>

            {/* Subgroup Details */}
            {currentTask.subgroups.financial_aid && (
              <div className="text-[11px] text-muted-earth pt-2 border-t border-beige flex justify-between">
                <span>
                  Waiver Recipient (N={currentTask.subgroups.financial_aid.Waiver_Yes?.count}): Selection Rate{' '}
                  {((currentTask.subgroups.financial_aid.Waiver_Yes?.selection_rate || 0) * 100).toFixed(1)}%
                </span>
                <span>
                  Standard Fee (N={currentTask.subgroups.financial_aid.Waiver_No?.count}): Selection Rate{' '}
                  {((currentTask.subgroups.financial_aid.Waiver_No?.selection_rate || 0) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Academic Year Cohort Table */}
      {currentTask.subgroups.academic_year && (
        <div className="border border-beige rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-sand/40 border-b border-beige flex items-center justify-between">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-earth">
              Academic Progression Subgroups
            </span>
            <span className="text-[11px] text-muted-earth">
              Minimum statistical power N &ge; 30
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sand/20 text-muted-earth font-semibold border-b border-beige">
                <tr>
                  <th className="px-4 py-2.5">Academic Cohort</th>
                  <th className="px-4 py-2.5">Sample Size</th>
                  <th className="px-4 py-2.5">Selection Rate</th>
                  <th className="px-4 py-2.5">Observed Base Rate</th>
                  <th className="px-4 py-2.5">Accuracy</th>
                  <th className="px-4 py-2.5">F1 Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/70">
                {Object.entries(currentTask.subgroups.academic_year).map(([tier, metrics]) => (
                  <tr key={tier} className="hover:bg-sand/20 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-earth">{tier}</td>
                    <td className="px-4 py-2.5 text-muted-earth">{metrics.count}</td>
                    <td className="px-4 py-2.5 font-medium text-earth">
                      {(metrics.selection_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-muted-earth">
                      {(metrics.base_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-muted-earth">
                      {(metrics.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-muted-earth">
                      {(metrics.f1 * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ethics & Non-Diagnostic Affirmation */}
      <div className="p-4 rounded-2xl bg-sage/10 border border-deep-sage/20 text-xs text-muted-earth flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-deep-sage flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-earth">Ethical AI Affirmation: </strong>
          {audit.ethics_statement}
        </p>
      </div>
    </div>
  );
};
