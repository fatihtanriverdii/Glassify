import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface GlassesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  glassUrl: string | null;
  glassImage?: string;
}

const GlassesDetails: React.FC<GlassesDetailsProps> = ({ isOpen, onClose, glassUrl, glassImage }) => {
  const { theme } = useTheme();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!glassUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/Scraper/scrape?url=${encodeURIComponent(glassUrl)}`);
        if (!response.ok) {
          throw new Error('Ürün detayları alınamadı');
        }
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ürün detayları alınamadı');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && glassUrl) {
      fetchDetails();
    }
  }, [glassUrl, isOpen]);

  const groupSpecs = (description: string[]) => {
    const groups: { [key: string]: { key: string; value: string }[] } = {
      'Temel Bilgiler': [],
      'Ölçüler': [],
      'Özellikler': [],
    };

    description.forEach(item => {
      const [key, value] = item.split('::').map(s => s.trim());
      
      if (key.toLowerCase().includes('uzunlu') || key.toLowerCase().includes('ölçü') || key.toLowerCase().includes('ebat')) {
        groups['Ölçüler'].push({ key, value });
      } else if (key.toLowerCase().includes('materyal') || key.toLowerCase().includes('polarize') || key.toLowerCase().includes('renk')) {
        groups['Özellikler'].push({ key, value });
      } else {
        groups['Temel Bilgiler'].push({ key, value });
      }
    });

    return groups;
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 z-[1001] backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[460px] max-h-[85vh] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl z-[1002] flex flex-col overflow-hidden custom-scrollbar">
        {/* Header */}
        <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ürün Detayları</h2>
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 focus:outline-none p-3 rounded-full transition-colors duration-200 flex items-center justify-center group"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              aria-label="Kapat"
            >
              <svg className="w-7 h-7 transition-colors duration-200 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-300 p-4 rounded-lg m-4 text-center">{error}</div>
          ) : details ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Ürün Görseli ve Temel Bilgiler */}
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl flex justify-center items-center">
                  <img
                    src={glassImage?.startsWith('data:') ? glassImage : `data:image/jpeg;base64,${glassImage}`}
                    alt={details?.title || 'Gözlük'}
                    className="w-56 h-auto object-contain"
                  />
                </div>

                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{details?.title || 'Ürün Adı Yok'}</h3>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {details?.price ? (details.price.includes('TL') ? details.price.replace('TL', '').trim() : details.price) : 'Fiyat bilgisi yok'}
                    </span>
                    {details?.price && <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">TL</span>}
                  </div>
                </div>

                <a
                  href={glassUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 text-center py-3.5 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-semibold shadow-md hover:shadow-lg text-lg"
                >
                  Ürüne Git
                </a>
              </div>

              {/* Tabs */}
              <div className="px-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-4 text-sm font-medium ${
                      activeTab === 'details'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                    }`}
                  >
                    Temel Bilgiler
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`flex-1 py-4 text-sm font-medium ${
                      activeTab === 'specs'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                    }`}
                  >
                    Teknik Özellikler
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' ? (
                  <div className="space-y-4">
                    {details?.description ? Object.entries(groupSpecs(details.description)).slice(0, 1).map(([group, specs]) => (
                      <div key={group}>
                        <div className="grid gap-3">
                          {specs.map((spec, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{spec.key}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="text-gray-500 dark:text-gray-400 text-center">
                        Temel bilgiler bulunamadı
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {details?.description ? Object.entries(groupSpecs(details.description)).slice(1).map(([group, specs]) => (
                      <div key={group} className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group}</h4>
                        <div className="grid gap-3">
                          {specs.map((spec, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{spec.key}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="text-gray-500 dark:text-gray-400 text-center">
                        Teknik özellikler bulunamadı
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center p-4">
              Ürün detayları bulunamadı
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GlassesDetails; 