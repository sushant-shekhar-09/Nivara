import React from 'react';
import { ScreeningStepper } from '../components/screening/ScreeningStepper';

export const ScreeningPage: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-8rem)] py-6 sm:py-8">
      <ScreeningStepper />
    </div>
  );
};
