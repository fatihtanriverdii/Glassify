'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">Glassify</h3>
            <p className="text-gray-400 text-sm">
              Yüz şekli analizi ile size en uygun gözlüğü bulun.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">Hızlı Bağlantılar</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-2">İletişim</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>Email: info@glassify.com</li>
              <li>Tel: +90 (539) 814 63 29</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Glassify. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 