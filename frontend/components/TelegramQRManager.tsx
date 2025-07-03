'use client';

import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  MessageSquare,
  Smartphone
} from 'lucide-react';

interface TelegramQRManagerProps {
  adminId: string;
  telegramChatId?: number | null;
  onTelegramLinked?: () => void;
}

export default function TelegramQRManager({ 
  adminId, // eslint-disable-line @typescript-eslint/no-unused-vars
  telegramChatId, 
  onTelegramLinked // eslint-disable-line @typescript-eslint/no-unused-vars
}: TelegramQRManagerProps) {
  const [qrData, setQrData] = useState<{
    deep_link: string;
    token: string;
    expires_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/telegram/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR code');
      }

      const data = await response.json();
      setQrData(data);
      setSuccess('QR code generated successfully! Scan it with your Telegram app.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openTelegramLink = () => {
    if (qrData?.deep_link) {
      window.open(qrData.deep_link, '_blank');
    }
  };

  // If already linked, show status
  if (telegramChatId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Telegram Connected
          </CardTitle>
          <CardDescription>
            Your Telegram account is successfully linked and ready to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">Active Connection</p>
              <p className="text-sm text-green-600">Chat ID: {telegramChatId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Connect Telegram
        </CardTitle>
        <CardDescription>
          Link your Telegram account to receive instant reservation notifications on your phone.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {qrData ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <QRCodeCanvas
                  value={qrData.deep_link}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Scan the QR code with your phone&apos;s camera or Telegram app
              </p>
              <p className="text-xs text-gray-500">
                Expires: {new Date(qrData.expires_at).toLocaleString()}
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={openTelegramLink}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Telegram App
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-8 bg-gray-50 rounded-lg">
                <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Generate a QR code to link your Telegram account</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">How it works:</h4>
              <ol className="text-sm text-gray-600 text-left space-y-1">
                <li>1. Click &quot;Generate QR Code&quot; below</li>
                <li>2. Scan the QR code with your phone&apos;s camera</li>
                <li>3. This will open our bot in Telegram</li>
                <li>4. Tap &quot;Start&quot; to link your account</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={generateQR}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              {qrData ? 'Generate New QR Code' : 'Generate QR Code'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
