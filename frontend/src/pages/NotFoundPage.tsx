import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full bg-ivory min-h-[calc(100vh-16rem)] flex items-center justify-center py-24 px-4 font-sans text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-stone text-forest flex items-center justify-center mx-auto shadow-xs border border-border">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest">
            Notice 404
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-earth">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-earth-muted leading-relaxed font-sans max-w-sm mx-auto">
            The requested sanctuary path could not be located. If you are seeking crisis support or a screening
            check-in, please choose below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="forest" size="md" className="w-full">
              Return to Homepage
            </Button>
          </Link>
          <Link to="/crisis" className="w-full sm:w-auto">
            <Button variant="crisis" size="md" className="w-full">
              Crisis Sanctuary (24/7)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
