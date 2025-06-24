import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import Provider from '@/components/SessionProvider';
import { auth } from '@/auth';

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  const session = await auth();

  return (
    <html lang={locale}>
      <body>
        <Provider session={session}>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </Provider>
      </body>
    </html>
  );
}
