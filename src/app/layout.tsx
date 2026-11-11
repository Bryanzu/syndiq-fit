import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ExpandableNavDock } from '@/components/layout/ExpandableNavDock';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Syndiq fit — Intelligent Workout Program Generator',
  description:
    'Evidence-based, personalized workout programs tailored to your gym equipment, lifting experience, fitness goals, and injury restrictions with Syndiq fit.',
  icons: {
    icon: '/syndiq-logo.png',
  },
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
    <html lang="en" suppressHydrationWarning className="dark">
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
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <ExpandableNavDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
