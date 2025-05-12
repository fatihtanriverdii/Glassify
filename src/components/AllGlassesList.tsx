import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassesDetails from './GlassesDetails';
import { useToast } from '@/components/ui/use-toast';
import { Heart } from 'lucide-react';
import { Glass } from '@/types/glasses';
import { addFavorite, removeFavorite, increaseView } from '@/services/glassesService';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface AllGlassesListProps {
  initialFaceType: string;
  capturedImage: string;
  sizeMultiplier: number;
  favoriteGlasses: Glass[];
  toggleFavorite: (glass: Glass, e: React.MouseEvent) => void;
  isFavorite: (glass: Glass) => boolean;
}

export const AllGlassesList: React.FC<AllGlassesListProps> = ({ initialFaceType, capturedImage, sizeMultiplier, favoriteGlasses, toggleFavorite, isFavorite }) => {
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGlassUrl, setSelectedGlassUrl] = useState<string | null>(null);
  const [selectedGlassImage, setSelectedGlassImage] = useState<string>('');
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastGlassElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber(prevPageNumber => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  const [selectedGlassIndex, setSelectedGlassIndex] = useState<{ type: 'all' | 'fav', index: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [tryOnSize, setTryOnSize] = useState<number>(2.5);
  const [showFavorites, setShowFavorites] = useState(false);

  const fetchGlasses = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/Glasses/glasses?pageNumber=${page}&pageSize=5`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gözlükler getirilemedi');
      }

      const data = await response.json();
      if (!data || !data.items || !Array.isArray(data.items)) {
        setHasMore(false);
        return;
      }

      setGlasses(prevGlasses => {
        if (page === 1) {
          return data.items;
        }
        return [...prevGlasses, ...data.items];
      });
      
      setHasMore(data.items.length === 5 && data.items.length > 0);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Gözlükler yüklenirken bir hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlasses(pageNumber);
  }, [pageNumber]);

  const handleGlassSelect = (glass: Glass) => {
    setSelectedGlassUrl(glass.link);
    setSelectedGlassImage(glass.image);
    setShowDetails(true);
  };

  const tryOnGlasses = async (glass: Glass, customSize?: number) => {
    setProcessing(true);
    try {
      const { tryOnGlasses } = await import('@/services/glassesService');
      const base64Image = capturedImage.includes('base64,') ? capturedImage : `data:image/jpeg;base64,${capturedImage}`;
      const result = await tryOnGlasses(base64Image, glass.image, customSize ?? tryOnSize);
      if (!result) throw new Error('Gözlük deneme sonucu alınamadı');
      setProcessedImage(result.includes('base64,') ? result : `data:image/jpeg;base64,${result}`);
      setShowTryOnModal(true);
    } catch (err) {
      toast({
        title: 'Hata',
        description: err instanceof Error ? err.message : 'Gözlük deneme işlemi başarısız oldu',
        variant: 'destructive',
        duration: 2000
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (glass: Glass, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await increaseView(glass.id);
    } catch (err) {
      toast({
        title: 'Hata',
        description: 'Görüntüleme arttırılamadı',
        variant: 'destructive',
        duration: 2000
      });
    }
    setSelectedGlassUrl(glass.link);
    setSelectedGlassImage(glass.image);
    setShowDetails(true);
  };

  return (
    <div className="w-full mt-8 overflow-x-hidden">
      <div className="flex justify-center sm:justify-end items-center mb-4 gap-4">
        <button
          onClick={() => setShowFavorites((prev: boolean) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold shadow hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ minWidth: 'fit-content' }}
        >
          <Heart className={showFavorites ? 'fill-red-500 text-red-500' : 'text-blue-600 dark:text-blue-400'} size={20} />
          {showFavorites ? 'Favorileri Gizle' : 'Favorileri Göster'}
          <span className="ml-1 bg-blue-600 dark:bg-blue-400 text-white rounded-full px-2 py-0.5 text-xs font-bold">{favoriteGlasses.length}</span>
        </button>
      </div>
      <div className={`favorites-transition w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700${showFavorites && favoriteGlasses.length > 0 ? ' open' : ''}`}>
        {favoriteGlasses.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-300 mb-4">Favori Gözlükleriniz</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-full overflow-x-hidden">
              {favoriteGlasses.map((glass, idx) => {
                const isSelected = selectedGlassIndex?.type === 'fav' && selectedGlassIndex.index === idx;
                return (
                  <div
                    key={glass.id + '-' + idx}
                    className={`flex flex-col items-center shadow-sm p-4 min-w-0 sm:min-w-[140px] rounded-2xl transition-all duration-150 cursor-pointer h-48 sm:h-[220px] justify-between
                      ${glass.isRecycling
                        ? selectedGlassIndex?.type === 'fav' && selectedGlassIndex.index === idx
                          ? 'border-2 border-green-500 dark:border-green-400'
                          : 'border border-green-500 dark:border-green-400'
                        : selectedGlassIndex?.type === 'fav' && selectedGlassIndex.index === idx
                          ? 'border-2 border-[#1e3a8a] dark:border-blue-400'
                          : 'border border-gray-200 dark:border-gray-800'}
                      bg-white dark:bg-gray-900 relative
                      w-full max-w-xs sm:max-w-none
                      `}
                    onClick={() => setSelectedGlassIndex({ type: 'fav', index: idx })}
                  >
                    {glass.isRecycling && (
                      <span
                        className="absolute top-2 left-2 bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full flex items-center justify-center z-20 shadow"
                        style={{ width: 24, height: 24 }}
                      >
                        <span className="text-green-500 dark:text-green-400 text-base">♻️</span>
                      </span>
                    )}
                    <div className="absolute top-2 right-2 z-20">
                      <button
                        onClick={e => { e.stopPropagation(); toggleFavorite(glass, e); }}
                        className="p-0.5 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
                        style={{ width: 24, height: 24 }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFavorite(glass)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </button>
                    </div>
                    <img
                      src={glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`}
                      alt={`Gözlük Favori ${idx + 1}`}
                      className="w-20 h-12 sm:w-24 sm:h-16 object-contain"
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-100">{glass.glassesType}</span>
                    <div className="flex flex-col w-full gap-0.5 sm:gap-1 mt-4">
                      {isSelected ? (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); tryOnGlasses(glass); }}
                            disabled={processing}
                            className="w-full h-8 text-[10px] sm:text-xs rounded-lg bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-blue-300 shadow font-bold border-0 flex items-center justify-center transition-colors sm:h-9 sm:text-base px-1"
                          >
                            {processing ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                İşleniyor...
                              </div>
                            ) : 'Gözlük Dene'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleViewDetails(glass, e); }}
                            className="w-full h-7 text-[10px] sm:text-xs border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-blue-200 bg-transparent dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-blue-900 hover:text-black dark:hover:text-white transition-colors rounded-lg sm:h-7 sm:text-sm px-1"
                          >
                            Detayları Gör
                          </button>
                        </>
                      ) : (
                        <button
                          className="w-full h-8 text-[10px] sm:text-xs text-gray-500 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-blue-400 bg-transparent border-0 sm:h-10 sm:text-sm px-1"
                        >
                          Seç
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-blue-300">
        Tüm Gözlükler
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl max-w-full overflow-x-hidden">
        {glasses.map((glass, index) => {
          const isLastElement = index === glasses.length - 1;
          const isSelected = selectedGlassIndex?.type === 'all' && selectedGlassIndex.index === index;
          return (
            <div
              key={`${glass.id}-${index}`}
              ref={isLastElement ? lastGlassElementRef : null}
              className={`flex flex-col items-center shadow-sm p-4 min-w-0 sm:min-w-[140px] rounded-2xl transition-all duration-150 cursor-pointer h-48 sm:h-[220px] justify-between
                ${glass.isRecycling
                  ? selectedGlassIndex?.type === 'all' && selectedGlassIndex.index === index
                    ? 'border-2 border-green-500 dark:border-green-400'
                    : 'border border-green-500 dark:border-green-400'
                  : selectedGlassIndex?.type === 'all' && selectedGlassIndex.index === index
                    ? 'border-2 border-[#1e3a8a] dark:border-blue-400'
                    : 'border border-gray-200 dark:border-gray-800'}
                bg-white dark:bg-gray-900 relative
                w-full max-w-xs sm:max-w-none
                `}
              onClick={() => setSelectedGlassIndex({ type: 'all', index })}
            >
              {glass.isRecycling && (
                <span
                  className="absolute top-2 left-2 bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full flex items-center justify-center z-20 shadow"
                  style={{ width: 24, height: 24 }}
                >
                  <span className="text-green-500 dark:text-green-400 text-base">♻️</span>
                </span>
              )}
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(glass, e); }}
                  className="p-0.5 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
                  style={{ width: 24, height: 24 }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(glass)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  />
                </button>
              </div>
              <img
                src={glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`}
                alt={`Gözlük ${index + 1}`}
                className="w-20 h-12 sm:w-24 sm:h-16 object-contain"
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-100">{glass.glassesType}</span>
              <div className="flex flex-col w-full gap-0.5 sm:gap-1 mt-4">
                {isSelected ? (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); tryOnGlasses(glass); }}
                      disabled={processing}
                      className="w-full h-8 text-[10px] sm:text-xs rounded-lg bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-blue-300 shadow font-bold border-0 flex items-center justify-center transition-colors sm:h-9 sm:text-base px-1"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          İşleniyor...
                        </div>
                      ) : 'Gözlük Dene'}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleViewDetails(glass, e); }}
                      className="w-full h-7 text-[10px] sm:text-xs border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-blue-200 bg-transparent dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-blue-900 hover:text-black dark:hover:text-white transition-colors rounded-lg sm:h-7 sm:text-sm px-1"
                    >
                      Detayları Gör
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full h-8 text-[10px] sm:text-xs text-gray-500 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-blue-400 bg-transparent border-0 sm:h-10 sm:text-sm px-1"
                  >
                    Seç
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {!hasMore && glasses.length > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-300 py-4">Tüm gözlükler yüklendi</p>
      )}
      {showDetails && (
        <GlassesDetails
          isOpen={showDetails}
          onClose={() => { setShowDetails(false); }}
          glassUrl={selectedGlassUrl}
          glassImage={selectedGlassImage}
        />
      )}
      {showTryOnModal && processedImage && (
        <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg w-full flex flex-col items-center relative mt-12 sm:mt-0">
            <button
              onClick={() => { setProcessedImage(null); setShowTryOnModal(false); setTryOnSize(2.5); }}
              className="absolute -top-3 -right-3 z-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 focus:outline-none p-2 rounded-full transition-colors duration-200 flex items-center justify-center group"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              aria-label="Kapat"
            >
              <svg className="w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-200 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={processedImage} alt="Gözlük Deneme Sonucu" className="w-full h-auto rounded-xl object-contain" />
            <div className="mt-4 w-full flex flex-col items-center">
              <div className="bg-[#f9f9f9] dark:bg-gray-900 rounded-xl shadow-lg p-3 sm:p-4 max-w-md w-full flex flex-col items-center border border-gray-100 dark:border-gray-800">
                <label htmlFor="tryon-size-slider" className="block text-sm sm:text-base font-semibold text-[#1e3a8a] dark:text-blue-300 mb-2">
                  Gözlük Boyutu
                </label>
                <input
                  type="range"
                  id="tryon-size-slider"
                  min="1.5"
                  max="3.5"
                  step="0.1"
                  value={tryOnSize}
                  onChange={async (e) => {
                    const newSize = parseFloat(e.target.value);
                    setTryOnSize(newSize);
                    if (selectedGlassIndex?.type === 'all' && selectedGlassIndex.index !== null) {
                      await tryOnGlasses(glasses[selectedGlassIndex.index], newSize);
                    } else if (selectedGlassIndex?.type === 'fav' && selectedGlassIndex.index !== null) {
                      await tryOnGlasses(favoriteGlasses[selectedGlassIndex.index], newSize);
                    }
                  }}
                  className="w-full h-2 bg-[#93c5fd] dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-[#1e3a8a] dark:accent-blue-400"
                />
                <div className="flex justify-between w-full text-[10px] sm:text-xs text-gray-400 dark:text-gray-300 mt-1">
                  <span>Küçük</span>
                  <span>Büyük</span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-300 mt-1 text-center">Boyut ayarını yaparak yüzünüze en uygun şekilde deneyin.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllGlassesList; 