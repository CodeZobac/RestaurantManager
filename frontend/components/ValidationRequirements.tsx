'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle } from 'lucide-react';

interface ValidationRequirementsProps {
  password?: string;
  email?: string;
}

const ValidationRequirements = ({ password, email }: ValidationRequirementsProps) => {
  const t = useTranslations('Auth.validation');

  const passwordChecks = {
    minLength: !!(password && password.length >= 8),
    uppercase: !!(password && /[A-Z]/.test(password)),
    lowercase: !!(password && /[a-z]/.test(password)),
    number: !!(password && /\d/.test(password)),
    specialChar: !!(password && /[!@#$%^&*]/.test(password)),
  };

  const emailChecks = {
    valid: !!(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  };

  const Requirement = ({ label, met }: { label: string; met: boolean | undefined }) => (
    <li className={`flex items-center text-sm ${met ? 'text-green-500' : 'text-red-500'}`}>
      {met ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
      {label}
    </li>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      {email !== undefined && (
        <>
          <h3 className="font-semibold text-gray-800">{t('emailTitle')}</h3>
          <ul className="mt-2 space-y-1">
            <Requirement label={t('emailValid')} met={emailChecks.valid} />
          </ul>
        </>
      )}
      {password !== undefined && (
        <>
          <h3 className="mt-4 font-semibold text-gray-800">{t('passwordTitle')}</h3>
          <ul className="mt-2 space-y-1">
            <Requirement label={t('minLength')} met={passwordChecks.minLength} />
            <Requirement label={t('uppercase')} met={passwordChecks.uppercase} />
            <Requirement label={t('lowercase')} met={passwordChecks.lowercase} />
            <Requirement label={t('number')} met={passwordChecks.number} />
            <Requirement label={t('specialChar')} met={passwordChecks.specialChar} />
          </ul>
        </>
      )}
    </div>
  );
};

export default ValidationRequirements;
