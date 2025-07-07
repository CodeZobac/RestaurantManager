'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TelegramQRManager from '@/components/TelegramQRManager';
import { MessageSquare, Settings, Bell } from 'lucide-react';
import Header from '@/components/Header';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('SettingsPage');

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-gray-500">{t('signInMessage')}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('description')}</p>
          </div>

          {/* Settings Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Telegram Integration Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('telegramCard.title')}
                </CardTitle>
                <CardDescription>{t('telegramCard.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <TelegramQRManager
                    adminId={session.user.id}
                    telegramChatId={session.user.telegram_chat_id}
                    onTelegramLinked={() => {
                      // Optionally refresh the session or show success message
                      window.location.reload();
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('notificationsCard.title')}
                </CardTitle>
                <CardDescription>{t('notificationsCard.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('notificationsCard.newReservations')}</p>
                      <p className="text-sm text-gray-500">{t('notificationsCard.newReservationsDescription')}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('notificationsCard.cancellations')}</p>
                      <p className="text-sm text-gray-500">{t('notificationsCard.cancellationsDescription')}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('notificationsCard.dailySummary')}</p>
                      <p className="text-sm text-gray-500">{t('notificationsCard.dailySummaryDescription')}</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('accountCard.title')}
                </CardTitle>
                <CardDescription>{t('accountCard.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('accountCard.name')}</label>
                    <p className="text-gray-900">{session.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('accountCard.email')}</label>
                    <p className="text-gray-900">{session.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('accountCard.restaurant')}</label>
                    <p className="text-gray-900">{session.user.restaurant_name || t('accountCard.notAssigned')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('accountCard.role')}</label>
                    <p className="text-gray-900 capitalize">{session.user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
