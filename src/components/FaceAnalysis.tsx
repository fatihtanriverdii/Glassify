import React, { useState, useEffect, useRef } from 'react';
import { tryOnGlasses, addFavorite, removeFavorite, increaseView } from '@/services/glassesService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Glass } from '@/types/glasses';
import { AnalysisResult } from '@/types/analysis';
import GlassesDetails from './GlassesDetails';
import AllGlassesList from './AllGlassesList';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const FaceAnalysis: React.FC<{
  analysisResult: AnalysisResult;
  capturedImage: string;
}> = ({ analysisResult, capturedImage }) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeMultiplier, setSizeMultiplier] = useState<number>(2.5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [selectedGlassIndex, setSelectedGlassIndex] = useState<number>(0);
  const [favoriteGlasses, setFavoriteGlasses] = useState<Glass[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favoriteGlasses');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const { toast } = useToast();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGlassUrl, setSelectedGlassUrl] = useState<string | null>(null);
  const [selectedGlassImage, setSelectedGlassImage] = useState<string | undefined>(undefined);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [lastFavoriteAction, setLastFavoriteAction] = useState<{type: 'add' | 'remove', glass: Glass} | null>(null);

  const fetchGlasses = async (pageNumber: number) => {
    try {
      setGalleryLoading(true);
      const response = await fetch(`${API_URL}/Glasses/suitable/glasses?FaceType=${analysisResult.faceType}&pageNumber=${pageNumber}&pageSize=5`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Gözlük önerileri alınamadı');
      }

      const data = await response.json();
      if (!data || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
        setGlasses([]);
        setTotalPages(1);
        throw new Error('Yüz tipinize uygun gözlük bulunamadı');
      }

      setGlasses(data.items);
      setTotalPages(data.totalPages || 1);
      setSelectedGlassIndex(0);
      return data.items[0];
    } catch (error) {
      setGlasses([]);
      setTotalPages(1);
      console.error('Gözlük getirme hatası:', error);
      throw error;
    } finally {
      setGalleryLoading(false);
    }
  };

  const tryOnGlassesHandler = async () => {
    setLoading(true);
    setError(null);

    try {
      const base64Image = capturedImage.includes('base64,') 
        ? capturedImage 
        : `data:image/jpeg;base64,${capturedImage}`;

      let selectedGlass;
      if (glasses.length === 0) {
        selectedGlass = await fetchGlasses(currentPage);
      } else {
        selectedGlass = glasses[selectedGlassIndex];
      }

      const result = await tryOnGlasses(base64Image, selectedGlass.image, sizeMultiplier);
      
      if (!result) {
        throw new Error('Gözlük deneme sonucu alınamadı');
      }

      const finalImage = result.includes('base64,') ? result : `data:image/jpeg;base64,${result}`;
      setProcessedImage(finalImage);
      
      toast({
        title: 'Başarılı',
        description: 'Gözlük deneme işlemi tamamlandı',
        duration: 2000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gözlük deneme işlemi başarısız oldu';
      setError(errorMessage);
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextGlass = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevGlass = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleGlassSelect = (glass: Glass) => {
    setSelectedGlassIndex(glasses.indexOf(glass));
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

  const toggleFavorite = async (glass: Glass, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favoriteGlasses.some(g => g.id === glass.id);
    if (isFav) {
      // Favoriden çıkar
      setFavoriteGlasses(prev => prev.filter(g => g.id !== glass.id));
      setLastFavoriteAction({ type: 'remove', glass });
      try {
        await removeFavorite(glass.id);
      } catch (err) {
        toast({
          title: 'Hata',
          description: 'Favoriden çıkarılamadı',
          variant: 'destructive',
          duration: 2000
        });
      }
    } else {
      // Favorile
      setFavoriteGlasses(prev => [...prev.filter(g => g.id !== glass.id), glass]);
      setLastFavoriteAction({ type: 'add', glass });
      try {
        await addFavorite(glass.id);
      } catch (err) {
        toast({
          title: 'Hata',
          description: 'Favoriye eklenemedi',
          variant: 'destructive',
          duration: 2000
        });
      }
    }
  };

  const isFavorite = (glass: Glass) => favoriteGlasses.some(g => g.id === glass.id);

  useEffect(() => {
    if (analysisResult.faceType) {
      setCurrentPage(1);
    }
  }, [analysisResult.faceType]);

  useEffect(() => {
    if (analysisResult.faceType) {
      setGalleryLoading(true);
      fetchGlasses(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult.faceType, currentPage]);

  useEffect(() => {
    if (!processedImage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      tryOnGlassesHandler();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sizeMultiplier]);

  useEffect(() => {
    localStorage.setItem('favoriteGlasses', JSON.stringify(favoriteGlasses));
  }, [favoriteGlasses]);

  useEffect(() => {
    if (!lastFavoriteAction) return;
    if (lastFavoriteAction.type === 'add') {
      toast({
        title: 'Favorilere Eklendi',
        description: 'Gözlük favorilerinize eklendi',
        duration: 2000
      });
    } else if (lastFavoriteAction.type === 'remove') {
      toast({
        title: 'Favorilerden Çıkarıldı',
        description: 'Gözlük favorilerinizden çıkarıldı',
        duration: 2000
      });
    }
    setLastFavoriteAction(null);
  }, [lastFavoriteAction, toast]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-2 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-blue-300">Size Özel Gözlük Önerileri</h1>
          <p className="text-gray-500 dark:text-gray-200 text-sm mt-1">
            {analysisResult.faceType} yüz şeklinize en uygun gözlükler
          </p>
        </div>
        {/* Gözlükler Galerisi + Pagination */}
        <div className="w-full flex flex-col items-center mb-6 min-h-[180px]">
          {galleryLoading || glasses.length === 0 ? (
            <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden w-full flex-nowrap min-w-0 px-2 justify-center">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center shadow-md p-4 bg-gray-100 dark:bg-gray-900 min-w-[140px] rounded-xl border border-gray-200 dark:border-gray-800 h-[200px] justify-between animate-pulse"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex flex-col w-full gap-2 mt-4">
                    <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-lg" />
                    <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Masaüstü: butonlar yanlarda, mobilde altta */}
              <div className="hidden sm:flex flex-row items-center gap-2 w-full justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevGlass}
                  disabled={currentPage === 1}
                  className="!w-12 !h-12 flex-shrink-0"
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden flex-1 min-w-0 px-2 justify-center">
                  {glasses.map((glass, idx) => (
                    <div
                      key={glass.id}
                      className={`flex flex-col items-center shadow-sm p-4 min-w-[140px] rounded-2xl transition-all duration-150 cursor-pointer h-[200px] justify-between
                        ${glass.isRecycling
                          ? selectedGlassIndex === idx
                            ? 'border-2 border-green-600 dark:border-green-400'
                            : 'border border-green-500 dark:border-green-400'
                          : selectedGlassIndex === idx
                            ? 'border-2 border-[#1e3a8a] dark:border-blue-400'
                            : 'border border-gray-200 dark:border-gray-800'}
                        bg-white dark:bg-gray-900 relative`}
                      onClick={() => handleGlassSelect(glass)}
                    >
                      {/* Simetrik üst ikonlar */}
                      <div className="absolute top-2.5 left-1 right-1 flex flex-row justify-between w-[calc(100%-8px)] z-20">
                        {glass.isRecycling ? (
                          <span className="recycling-badge bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full text-sm font-semibold flex items-center justify-center shadow" style={{ width: 22, height: 22 }}>
                            <span className="text-green-500 dark:text-green-400 text-[15px]">♻️</span>
                          </span>
                        ) : (
                          <span style={{ width: 22, height: 22 }} />
                        )}
                        <button
                          onClick={(e) => toggleFavorite(glass, e)}
                          className="flex items-center justify-center p-0 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
                          style={{ width: 24, height: 24 }}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isFavorite(glass)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            style={{ width: 20, height: 20 }}
                          />
                        </button>
                      </div>
                      {/* Kart içeriği */}
                      <div className="flex flex-col items-center w-full">
                        <img
                          src={glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`}
                          alt={`Gözlük ${idx + 1}`}
                          className="w-24 h-16 object-contain mb-2 mt-4"
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-100 mb-0 -mt-2">{glass.glassesType}</span>
                      </div>
                      <div className="flex flex-col w-full gap-0.5">
                        {selectedGlassIndex === idx ? (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                tryOnGlassesHandler();
                              }}
                              disabled={loading}
                              className="w-full h-9 text-sm rounded-lg bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-blue-300 shadow font-bold border-0"
                              variant="default"
                            >
                              {loading ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  İşleniyor...
                                </div>
                              ) : 'Gözlük Dene'}
                            </Button>
                            <Button
                              onClick={(e) => handleViewDetails(glass, e)}
                              variant="outline"
                              className="w-full h-8 text-xs border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-blue-200 bg-transparent dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-blue-900 hover:text-black dark:hover:text-white transition-colors"
                            >
                              Detayları Gör
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full h-10 text-sm text-gray-500 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-blue-400"
                          >
                            Seç
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextGlass}
                  disabled={currentPage === totalPages}
                  className="!w-12 !h-12 flex-shrink-0"
                >
                  <ChevronRight className="h-7 w-7" />
                </Button>
              </div>
              {/* Mobil: butonlar altta, galeri tam kaydırılabilir */}
              <div className="flex flex-col sm:hidden w-full items-center">
                <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden w-full flex-nowrap min-w-0 px-2 mb-2">
                  {glasses.map((glass, idx) => (
                    <div
                      key={glass.id}
                      className={`flex flex-col items-center shadow-sm p-2 min-w-[110px] rounded-2xl transition-all duration-150 cursor-pointer h-[180px] justify-between
                        ${glass.isRecycling
                          ? selectedGlassIndex === idx
                            ? 'border-2 border-green-600 dark:border-green-400'
                            : 'border border-green-500 dark:border-green-400'
                          : selectedGlassIndex === idx
                            ? 'border-2 border-[#1e3a8a] dark:border-blue-400'
                            : 'border border-gray-200 dark:border-gray-800'}
                        bg-white dark:bg-gray-900 relative`}
                      onClick={() => handleGlassSelect(glass)}
                    >
                      <div className="flex flex-row justify-between items-start w-full px-1 pt-1">
                        {glass.isRecycling ? (
                          <span className="recycling-badge bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full text-sm font-semibold flex items-center justify-center shadow" style={{ width: 22, height: 22 }}>
                            <span className="text-green-500 dark:text-green-400 text-[15px]">♻️</span>
                          </span>
                        ) : (
                          <span style={{ width: 22, height: 22 }} />
                        )}
                        <button
                          onClick={(e) => toggleFavorite(glass, e)}
                          className="flex items-center justify-center p-0 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
                          style={{ width: 24, height: 24 }}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isFavorite(glass)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            style={{ width: 20, height: 20 }}
                          />
                        </button>
                      </div>
                      <div className="flex flex-col items-center -mt-4">
                        <img
                          src={glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`}
                          alt={`Gözlük ${idx + 1}`}
                          className="w-20 h-14 object-contain mb-2"
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-100 mb-0 -mt-2">{glass.glassesType}</span>
                      </div>
                      <div className="flex flex-col w-full gap-0.5">
                        {selectedGlassIndex === idx ? (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                tryOnGlassesHandler();
                              }}
                              disabled={loading}
                              className="w-full h-8 text-xs rounded-lg bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-blue-300 shadow font-bold border-0"
                              variant="default"
                            >
                              {loading ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  İşleniyor...
                                </div>
                              ) : 'Gözlük Dene'}
                            </Button>
                            <Button
                              onClick={(e) => handleViewDetails(glass, e)}
                              variant="outline"
                              className="w-full h-7 text-xs border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-blue-200 bg-transparent dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-blue-900 hover:text-black dark:hover:text-white transition-colors"
                            >
                              Detayları Gör
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full h-9 text-xs text-gray-500 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-blue-400"
                          >
                            Seç
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-row justify-center gap-4 w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevGlass}
                    disabled={currentPage === 1}
                    className="!w-10 !h-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextGlass}
                    disabled={currentPage === totalPages}
                    className="!w-10 !h-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Yüz ve Sonuç */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Analiz edilen fotoğraf"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900"
            />
          </div>
          <div className="relative">
            {processedImage ? (
              <img
                src={processedImage}
                alt="Gözlük deneme sonucu"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-300 text-sm">Gözlük deneme sonucu burada görünecek</div>
            )}
          </div>
        </div>
        {/* Slider - kutu içinde, ortalanmış ve modern */}
        <div className="w-full flex justify-center mt-6">
          <div className="bg-[#f9f9f9] dark:bg-gray-900 rounded-xl shadow-lg p-4 max-w-md w-full flex flex-col items-center border border-gray-100 dark:border-gray-800">
            <label htmlFor="size-slider" className="block text-base font-semibold text-[#1e3a8a] dark:text-blue-300 mb-2">
              Gözlük Boyutu
            </label>
            <input
              type="range"
              id="size-slider"
              min="1.5"
              max="3.5"
              step="0.1"
              value={sizeMultiplier}
              onChange={(e) => {
                setSizeMultiplier(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-[#93c5fd] dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-[#1e3a8a] dark:accent-blue-400"
            />
            <div className="flex justify-between w-full text-xs text-gray-400 dark:text-gray-300 mt-1">
              <span>Küçük</span>
              <span>Büyük</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-300 mt-1 text-center">Boyut ayarını yaparak yüzünüze en uygun şekilde deneyin.</div>
          </div>
        </div>
        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mt-2 text-center max-w-md mx-auto" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Glasses Details Panel */}
        <GlassesDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          glassUrl={selectedGlassUrl}
          glassImage={selectedGlassImage}
        />
      </div>

      {/* Add AllGlassesList component below the existing content */}
      <AllGlassesList 
        initialFaceType={analysisResult.faceType} 
        capturedImage={capturedImage} 
        sizeMultiplier={sizeMultiplier}
        favoriteGlasses={favoriteGlasses}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    </div>
  );
}; 