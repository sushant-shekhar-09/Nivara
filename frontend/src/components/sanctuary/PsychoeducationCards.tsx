import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
} from 'lucide-react';
import {
  getPsychoeducationResources,
  type PsychoeducationResource,
  ApiClientError,
} from '../../lib/api';
import { Skeleton } from '../ui/Skeleton';

const CATEGORIES = [
  { id: 'all', label: 'All Protocols' },
  { id: 'breathing', label: 'Breathing' },
  { id: 'grounding', label: 'Grounding' },
  { id: 'sleep', label: 'Sleep Hygiene' },
  { id: 'academic_stress', label: 'Academic Stress' },
  { id: 'crisis', label: 'Crisis Contacts' },
];

export const PsychoeducationCards: React.FC = () => {
  const [resources, setResources] = useState<PsychoeducationResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await getPsychoeducationResources(categoryParam, searchQuery || undefined);
      setResources(res.resources || []);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to load psychoeducational resources.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white border border-beige rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-deep-sage" />
            <span className="text-[11px] font-semibold tracking-wider text-muted-earth uppercase">
              Evidence-Based Guides
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-earth">
            Psychoeducational Protocols
          </h2>
          <p className="text-xs sm:text-sm text-muted-earth mt-1 max-w-xl leading-relaxed">
            Curated clinical frameworks translated into practical, student-friendly micro-interventions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-earth absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search protocols..."
            className="w-full text-xs sm:text-sm bg-sand/60 border border-beige rounded-xl pl-9 pr-3 py-2 text-earth placeholder:text-muted-earth focus:outline-none focus:ring-1 focus:ring-deep-sage transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-deep-sage text-white shadow-xs'
                : 'bg-sand text-muted-earth hover:text-earth border border-beige'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs">
          {error}
        </div>
      )}

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" height={160} />
          <Skeleton variant="card" height={160} />
          <Skeleton variant="card" height={160} />
          <Skeleton variant="card" height={160} />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-beige rounded-2xl">
          <p className="text-sm text-muted-earth">No matching psychoeducational protocols found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item) => {
            const isExpanded = expandedId === item.id;
            const isCrisis = item.category === 'crisis';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCrisis
                    ? 'border-[#536044]/30 bg-[#536044]/5'
                    : 'border-beige bg-sand/30 hover:border-earth/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-beige text-muted-earth">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-earth mt-2">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="p-1.5 rounded-lg hover:bg-white/80 text-muted-earth hover:text-earth transition-colors"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-earth mt-2 leading-relaxed">
                  {item.summary}
                </p>

                {item.contact_info && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#536044]/30 text-[#1C3A13] font-semibold text-xs">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{item.contact_info}</span>
                  </div>
                )}

                {/* Expanded Details and Steps */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-beige/80 space-y-3">
                    <p className="text-xs text-earth/90 leading-relaxed">{item.details}</p>

                    {item.steps && item.steps.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-earth uppercase tracking-wider block">
                          Suggested Steps:
                        </span>
                        <ul className="space-y-1">
                          {item.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-earth">
                              <CheckCircle className="w-3.5 h-3.5 text-deep-sage flex-shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 text-[10px] text-muted-earth/80 italic flex items-center justify-between">
                      <span>Source: {item.source_attribution}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
