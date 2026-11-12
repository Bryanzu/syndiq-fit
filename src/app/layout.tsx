import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/layout/TabBar';
import { Toaster } from '@/components/ui/Toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { WorkoutSessionProvider } from '@/context/WorkoutSessionContext';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { MiniPlayer } from '@/components/workout/MiniPlayer';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Syndiq Fit',
  description: 'Workout programs built around your gym, schedule and injuries, with Nigerian meal plans.',
  // Icons come from src/app/icon.png (browser tabs) and src/app/apple-icon.png (iPhone tabs and home screen)
};

// Explicit viewport: responsive width, and `cover` so env(safe-area-inset-*) works on notched phones.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090a0c' },
    { media: '(prefers-color-scheme: light)', color: '#f4f5f1' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('syndiq_theme');
                  var theme = saved === 'light' ? 'light' : 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gym-bg text-gym-silver min-h-[100dvh] flex flex-col antialiased selection:bg-gym-lime selection:text-black">
        <ThemeProvider>
          <WorkoutSessionProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <MiniPlayer />
            <TabBar />
            <WorkoutPlayer />
            <Toaster />
            <PageViewTracker />
          </WorkoutSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
