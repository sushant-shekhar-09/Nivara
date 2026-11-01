import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, ExternalLink } from 'lucide-react';
import { DISCLAIMER } from '../../lib/constants';
import nivaraLogo from '../../assets/logo/nivara-logo.svg';
import nivaraText from '../../assets/logo/nivara-text.svg';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-stone border-t border-border/80 text-earth-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <img src={nivaraLogo} alt="Nivara emblem" className="h-10 w-auto object-contain" />
              <img src={nivaraText} alt="Nivara" className="h-5 sm:h-5.5 w-auto object-contain" />
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 font-semibold">
                Botanical-Clinical
              </span>
            </div>

            <p className="text-sm text-earth-muted max-w-sm leading-relaxed font-sans">
              A privacy-conscious, explainable early distress screening framework tailored for
              higher education students. Grounded in standardized psychometrics (PSS-10, PHQ-9, GAD-7)
              and TreeSHAP local attributions.
            </p>

            <div className="flex items-start gap-3 text-xs text-earth bg-snow border border-border/80 p-3.5 rounded-xl max-w-md shadow-xs">
              <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-[11px] uppercase tracking-wide text-forest font-mono">
                  Zero Raw PII · Strict k ≥ 5 Suppression
                </span>
                <p className="text-earth-muted text-[11px] leading-relaxed">
                  Screening responses are anonymized via cryptographic hashes. Decoupled deterministic safety ensures immediate hotline support.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links / Platform */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-earth">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/screening" className="hover:text-forest transition-colors">
                  Screening Check-In
                </Link>
              </li>
              <li>
                <Link to="/sanctuary" className="hover:text-forest transition-colors">
                  Sanctuary Pacer
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-forest transition-colors">
                  Cohort Analytics
                </Link>
              </li>
              <li>
                <Link to="/crisis" className="hover:text-[#1C3A13] transition-colors flex items-center gap-1.5 text-[#536044] font-medium">
                  Crisis Support (24/7)
                </Link>
              </li>
            </ul>
          </div>

          {/* Science & Ethics */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-earth">
              Science & Ethics
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-forest transition-colors">
                  TreeSHAP Methodology
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-forest transition-colors">
                  Privacy Architecture
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-forest transition-colors">
                  Non-Diagnostic Stance
                </Link>
              </li>
              <li>
                <Link to="/crisis" className="hover:text-forest transition-colors flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-forest" />
                  <span>National Tele-MANAS (14416)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Portals */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-earth">
              Institutional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/org/dashboard" className="hover:text-forest transition-colors font-medium text-forest">
                  Organization Portal
                </Link>
              </li>
              <li>
                <Link to="/org/register" className="hover:text-forest transition-colors">
                  Request Workspace
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-forest transition-colors">
                  Staff Sign In
                </Link>
              </li>
              <li>
                <Link to="/counsellor" className="hover:text-forest transition-colors">
                  Counsellor Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-forest transition-colors">
                  Governance Admin
                </Link>
              </li>
              <li>
                <span className="text-xs text-earth-muted/70 block pt-1 font-mono">
                  Role-governed access
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Editorial Disclaimer */}
        <div className="pt-8 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-earth-muted">
          <p className="max-w-3xl leading-relaxed text-center md:text-left font-sans">
            {DISCLAIMER.full}
          </p>
          <div className="flex items-center gap-4 flex-shrink-0 font-mono text-[11px]">
            <span>© {CURRENT_YEAR} Nivara · Botanical-Clinical</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
