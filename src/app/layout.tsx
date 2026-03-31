import type { Metadata, Viewport } from 'next';
import UXProvider from '@/components/providers/UXProvider';
import CookieConsent from '@/components/compliance/CookieConsent';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nutri News',
  description: 'Evidenzbasierte Ernaehrungsnews fuer Therapeuten',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nutri News',
  },
  icons: {
    icon: '/Gemini_Generated_Image_r9u96tr9u96tr9u9.png',
    apple: '/Gemini_Generated_Image_r9u96tr9u96tr9u9.png',
  },
};

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#2a8234',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/Gemini_Generated_Image_r9u96tr9u96tr9u9.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <UXProvider>
          {children}
          <PWAInstallPrompt />
          <CookieConsent />
        </UXProvider>
      </body>
    </html>
  );
}
