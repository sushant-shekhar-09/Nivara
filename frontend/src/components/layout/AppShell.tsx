import React from 'react';
import { PublicLayout } from './PublicLayout';

/**
 * @deprecated Use PublicLayout, AuthLayout, OrgPortalLayout, or StaffPortalLayout instead.
 * Retained for backward compatibility.
 */
export const AppShell: React.FC = () => {
  return <PublicLayout />;
};
