import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface FormStatusDisplayProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  onReset?: () => void;
}

export function FormStatusDisplay({ type, title, message, onReset }: FormStatusDisplayProps) {
  const t = useTranslations('Reservation');
  const isSuccess = type === 'success';
  
  return (
    <div className={`rounded-lg p-6 text-center ${
      isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex justify-center mb-4">
        {isSuccess ? (
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        ) : (
          <XCircleIcon className="h-12 w-12 text-red-600" />
        )}
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${
        isSuccess ? 'text-green-800' : 'text-red-800'
      }`}>
        {title}
      </h3>
      
      <p className={`mb-6 ${
        isSuccess ? 'text-green-700' : 'text-red-700'
      }`}>
        {message}
      </p>
      
      {isSuccess && onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          {t('status.makeAnother')}
        </Button>
      )}
    </div>
  );
}
