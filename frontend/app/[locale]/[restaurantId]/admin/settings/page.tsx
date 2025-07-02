'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TelegramQRManager from '@/components/TelegramQRManager';
import { MessageSquare, Settings, Bell } from 'lucide-react';
import Header from '@/components/Header';

export default function SettingsPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-gray-500">Please sign in to access settings.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your restaurant settings and integrations</p>
          </div>

          {/* Settings Grid */}
          <div className="grid gap-6 md:grid-cols-2">
          {/* Telegram Integration Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Telegram Integration
              </CardTitle>
              <CardDescription>
                Connect your Telegram account to receive instant notifications for new reservations and manage them directly from your phone.
              </CardDescription>
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
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Reservations</p>
                    <p className="text-sm text-gray-500">Get notified when new reservations are made</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cancellations</p>
                    <p className="text-sm text-gray-500">Get notified when reservations are cancelled</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-gray-500">Receive a daily summary of reservations</p>
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
                Account Information
              </CardTitle>
              <CardDescription>
                View and manage your account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{session.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Restaurant</label>
                  <p className="text-gray-900">{session.user.restaurant_name || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
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
