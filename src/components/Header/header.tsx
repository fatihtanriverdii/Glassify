'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-transparent backdrop-blur-md shadow-lg rounded-b-xl sticky top-0 z-50 transition font-inter">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Brand with Glasses Icon and Gradient Text */}
          <Link href="/" className="flex items-center gap-2 group select-none">
            <span className="inline-block">
              {/* Gözlük SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                <circle cx="7" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="17" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 15c0-5 6-5 9-5s9 0 9 5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 bg-clip-text text-transparent tracking-tight group-hover:from-blue-700 group-hover:to-blue-500 dark:group-hover:from-blue-300 dark:group-hover:to-blue-200 transition-colors">
              Glassify
            </span>
          </Link>

          {/* Desktop Navigation with Underline Animation */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            <Link href="/" className="relative text-gray-700 dark:text-gray-300 font-medium transition group px-2">
              Ana Sayfa
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="relative text-gray-700 dark:text-gray-300 font-medium transition group px-2">
              Hakkımızda
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="relative text-gray-700 dark:text-gray-300 font-medium transition group px-2">
              İletişim
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
            
          {/* Dark Mode Toggle Button and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button
              className="md:hidden p-2 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menüyü Aç/Kapat"
            >
              <svg
                className="w-7 h-7 text-blue-600 dark:text-blue-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation with Underline Animation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'} bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow`}
        >
          <div className="flex flex-col space-y-2 px-4 py-2">
            <Link
              href="/"
              className="relative block text-gray-700 dark:text-gray-300 font-medium transition group px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Ana Sayfa
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/about"
              className="relative block text-gray-700 dark:text-gray-300 font-medium transition group px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Hakkımızda
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="relative block text-gray-700 dark:text-gray-300 font-medium transition group px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 