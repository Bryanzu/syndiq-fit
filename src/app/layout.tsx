import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Syndiq fit — Intelligent Workout Program Generator',
  description:
    'Evidence-based, personalized workout programs tailored to your gym equipment, lifting experience, fitness goals, and injury restrictions with Syndiq fit.',
  icons: {
    icon: '/syndiq-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gym-bg text-gym-silver min-h-screen flex flex-col antialiased selection:bg-gym-lime selection:text-black">
        <Navbar />
        <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
