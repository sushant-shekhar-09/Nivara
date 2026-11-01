import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * Clean Root Authentication Layout Shell
 * Removes the legacy navbar, institutional header, and footer completely,
 * allowing each authentication route to render an independent split-screen composition.
 */
export const AuthLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] text-[#2F302B] font-sans antialiased selection:bg-[#1C3A13] selection:text-[#FCFCF7]">
      <Outlet />
    </div>
  );
};
