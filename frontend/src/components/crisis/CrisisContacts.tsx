import React, { useState } from 'react';
import { Phone, Clock, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import { CRISIS_CONTACTS, type CrisisContact } from '../../lib/constants';

interface CrisisContactsProps {
  contacts?: CrisisContact[];
  className?: string;
  showHeading?: boolean;
}

export const CrisisContacts: React.FC<CrisisContactsProps> = ({
  contacts = CRISIS_CONTACTS,
  className = '',
  showHeading = true,
}) => {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className={`space-y-5 font-sans ${className}`}>
      {showHeading && (
        <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-earth">
              Verified Crisis Helplines & Immediate Support
            </h3>
            <p className="text-xs text-earth-muted mt-0.5">
              Confidential, empathetic listening services available 24/7 across India
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-stone text-forest border border-border font-mono font-semibold">
            Confidential
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact, idx) => {
          const isPhone = !contact.phone.includes('@') && !contact.phone.includes('http');
          const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                contact.isDemo
                  ? 'bg-stone/50 border-dashed border-border'
                  : 'bg-snow border-border/80 shadow-xs hover:border-forest/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif font-bold text-lg text-earth">
                      {contact.name}
                    </h4>
                    {contact.isDemo ? (
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-marigold/20 text-marigold-dark border border-marigold/30">
                        Demo Simulation
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-forest" />
                        Verified Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-earth-muted font-mono font-medium">
                    {contact.contactType}
                  </span>
                </div>
              </div>

              <p className="text-xs text-earth-muted mb-4 leading-relaxed font-sans">
                {contact.description}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-earth-muted mb-4 font-mono">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-deep-sage" />
                <span>{contact.hours}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                {isPhone ? (
                  <>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-forest hover:bg-forest-hover text-snow shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {contact.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(contact.phone)}
                      className="p-2.5 rounded-full border border-border hover:bg-stone text-earth-muted hover:text-earth transition-colors"
                      title="Copy phone number"
                    >
                      {copiedPhone === contact.phone ? (
                        <Check className="w-4 h-4 text-forest" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <a
                    href={`mailto:${contact.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-stone hover:bg-stone-dark text-earth border border-border transition-colors"
                  >
                    <span>Contact via Email</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
