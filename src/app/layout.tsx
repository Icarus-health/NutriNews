import type { Metadata, Viewport } from 'next';
import UXProvider from '@/components/providers/UXProvider';
import CookieConsent from '@/components/compliance/CookieConsent';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import PWAUpdateHandler from '@/components/pwa/PWAUpdateHandler';
import SplashScreen from '@/components/pwa/SplashScreen';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriNews',
  description: 'Evidenzbasierte Ernährungsnews für Therapeuten',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriNews',
  },
  icons: {
    icon: [
      { url: '/RichtigesLogo.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/RichtigesLogo.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* iOS Splash-Screen Hintergrundfarbe */}
        <meta name="msapplication-TileColor" content="#2a8234" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <UXProvider>
          <SplashScreen />
          {children}
          <PWAInstallPrompt />
          <PWAUpdateHandler />
          <CookieConsent />
        </UXProvider>
      </body>
    </html>
  );
}
