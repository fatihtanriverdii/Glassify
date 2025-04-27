import React, { useState, useEffect } from 'react';
import { tryOnGlasses } from '@/services/glassesService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface AnalysisResult {
  faceType: string;
  confidence: number;
  otherProbabilities: {
    [key: string]: number;
  };
}

interface Glass {
  id: number;
  image: string;
  glassesType: string;
}

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
  const { toast } = useToast();
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchGlasses = async (pageNumber: number) => {
    try {
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

  const handleNextGlass = async () => {
    if (selectedGlassIndex < glasses.length - 1) {
      setSelectedGlassIndex(prev => prev + 1);
    } else {
      try {
        setCurrentPage(prev => prev + 1);
        await fetchGlasses(currentPage + 1);
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Daha fazla gözlük bulunamadı',
          variant: 'destructive',
          duration: 2000
        });
      }
    }
  };

  const handlePrevGlass = async () => {
    if (selectedGlassIndex > 0) {
      setSelectedGlassIndex(prev => prev - 1);
    } else if (currentPage > 1) {
      try {
        setCurrentPage(prev => prev - 1);
        await fetchGlasses(currentPage - 1);
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Önceki gözlükler getirilemedi',
          variant: 'destructive',
          duration: 2000
        });
      }
    }
  };

  useEffect(() => {
    if (analysisResult.faceType) {
      fetchGlasses(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult.faceType, currentPage]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 mt-2">
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-4 text-center">Gözlük Deneme</h1>
      {/* Gözlükler Galerisi + Pagination */}
      <div className="w-full flex flex-col items-center mb-6 min-h-[180px]">
        {glasses.length === 0 ? (
          <div className="flex items-center justify-center w-full h-32 text-gray-400 text-lg">
            Yükleniyor...
          </div>
        ) : (
          <>
            {/* Masaüstü: butonlar yanlarda, mobilde altta */}
            <div className="hidden sm:flex flex-row items-center gap-2 w-full justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (currentPage > 1) {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    await fetchGlasses(prevPage);
                    setSelectedGlassIndex(0);
                  }
                }}
                disabled={currentPage === 1}
                className="!w-12 !h-12"
              >
                <ChevronLeft className="h-7 w-7" />
              </Button>
              <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden w-full flex-nowrap min-w-0 px-2">
                {glasses.map((glass, idx) => (
                  <div key={glass.id} className={`flex flex-col items-center shadow-md p-4 bg-white min-w-[140px] rounded-xl transition-all duration-150 cursor-pointer ${selectedGlassIndex === idx ? 'border-2 border-[#1e3a8a] rounded-xl' : 'border border-gray-200 rounded-xl'}`}
                    onClick={() => setSelectedGlassIndex(idx)}
                    style={{ outline: 'none' }}
                  >
                    <img
                      src={`data:image/jpeg;base64,${glass.image}`}
                      alt={glass.glassesType}
                      className="w-24 h-16 object-contain mb-2"
                    />
                    <span className="text-base font-semibold text-[#1e3a8a]">{glass.glassesType}</span>
                    {selectedGlassIndex === idx && (
                      <Button
                        onClick={tryOnGlassesHandler}
                        disabled={loading}
                        className="w-full h-10 text-base rounded-lg bg-[#1e3a8a] hover:bg-[#2541a6] transition-colors shadow text-white font-bold mt-3"
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
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (currentPage < totalPages) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    await fetchGlasses(nextPage);
                    setSelectedGlassIndex(0);
                  }
                }}
                disabled={currentPage === totalPages}
                className="!w-12 !h-12"
              >
                <ChevronRight className="h-7 w-7" />
              </Button>
            </div>
            {/* Mobil: butonlar altta, galeri tam kaydırılabilir */}
            <div className="flex flex-col sm:hidden w-full items-center">
              <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden w-full flex-nowrap min-w-0 px-2 mb-2">
                {glasses.map((glass, idx) => (
                  <div key={glass.id} className={`flex flex-col items-center shadow-md p-2 bg-white min-w-[110px] rounded-xl transition-all duration-150 cursor-pointer ${selectedGlassIndex === idx ? 'border-2 border-[#1e3a8a] rounded-xl' : 'border border-gray-200 rounded-xl'}`}
                    onClick={() => setSelectedGlassIndex(idx)}
                    style={{ outline: 'none' }}
                  >
                    <img
                      src={`data:image/jpeg;base64,${glass.image}`}
                      alt={glass.glassesType}
                      className="w-20 h-14 object-contain mb-2"
                    />
                    <span className="text-sm font-semibold text-[#1e3a8a]">{glass.glassesType}</span>
                    {selectedGlassIndex === idx && (
                      <Button
                        onClick={tryOnGlassesHandler}
                        disabled={loading}
                        className="w-auto max-w-full px-3 h-9 text-sm rounded-lg bg-[#1e3a8a] hover:bg-[#2541a6] transition-colors shadow text-white font-bold mt-2"
                        variant="default"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            İşleniyor...
                          </div>
                        ) : 'Gözlük Dene'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-row justify-center gap-4 w-full">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    if (currentPage > 1) {
                      const prevPage = currentPage - 1;
                      setCurrentPage(prevPage);
                      await fetchGlasses(prevPage);
                      setSelectedGlassIndex(0);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="!w-10 !h-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    if (currentPage < totalPages) {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      await fetchGlasses(nextPage);
                      setSelectedGlassIndex(0);
                    }
                  }}
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
            className="w-full rounded-lg border border-gray-200 shadow-sm"
          />
        </div>
        <div className="relative">
          {processedImage ? (
            <img
              src={processedImage}
              alt="Gözlük deneme sonucu"
              className="w-full rounded-lg border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">Gözlük deneme sonucu burada görünecek</div>
          )}
        </div>
      </div>
      {/* Slider - kutu içinde, ortalanmış ve modern */}
      <div className="w-full flex justify-center mt-6">
        <div className="bg-[#f9f9f9] rounded-xl shadow p-4 max-w-md w-full flex flex-col items-center">
          <label htmlFor="size-slider" className="block text-base font-semibold text-[#1e3a8a] mb-2">
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
              if (processedImage) {
                tryOnGlassesHandler();
              }
            }}
            className="w-full h-2 bg-[#93c5fd] rounded-lg appearance-none cursor-pointer accent-[#1e3a8a]"
          />
          <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
            <span>Küçük</span>
            <span>Büyük</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">Boyut ayarını yaparak yüzünüze en uygun şekilde deneyin.</div>
        </div>
      </div>
      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mt-2 text-center max-w-md mx-auto" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
}; 