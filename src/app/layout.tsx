import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Glassify - Yüz Şekli Analizi',
  description: 'Yüz şeklinize en uygun gözlüğü bulun',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-[calc(100vh+20rem)] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <main className="flex-grow pt-6">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
} 