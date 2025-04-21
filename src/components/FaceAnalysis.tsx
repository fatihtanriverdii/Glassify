import React, { useState } from 'react';
import { tryOnGlasses } from '@/services/glassesService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const fetchGlasses = async (pageNumber: number) => {
    try {
      const response = await fetch(`https://glassify-api-791546846158.europe-west1.run.app/api/Glasses/suitable/glasses?FaceType=${analysisResult.faceType}&pageNumber=${pageNumber}&pageSize=5`, {
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
        throw new Error('Yüz tipinize uygun gözlük bulunamadı');
      }

      setGlasses(data.items);
      setSelectedGlassIndex(0);
      return data.items[0];
    } catch (error) {
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
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gözlük deneme işlemi başarısız oldu';
      setError(errorMessage);
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
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
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gözlük Deneme</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Analiz edilen fotoğraf"
              className="w-full rounded-lg"
            />
          </div>

          {glasses.length > 0 && (
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevGlass}
                disabled={currentPage === 1 && selectedGlassIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <p className="font-medium">Gözlük {selectedGlassIndex + 1}/{glasses.length}</p>
                <p className="text-sm text-gray-500">Sayfa {currentPage}</p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextGlass}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {glasses.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Seçili Gözlük</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img
                  src={`data:image/jpeg;base64,${glasses[selectedGlassIndex].image}`}
                  alt={`Gözlük ${selectedGlassIndex + 1}`}
                  className="w-full h-32 object-contain"
                />
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">Tip: {glasses[selectedGlassIndex].glassesType}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="size-slider" className="block text-sm font-medium text-gray-700">
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Küçük</span>
              <span>Büyük</span>
            </div>
          </div>

          <Button
            onClick={tryOnGlassesHandler}
            disabled={loading}
            className="w-full"
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
        </div>

        <div className="space-y-4">
          {processedImage && (
            <div className="relative">
              <img
                src={processedImage}
                alt="Gözlük deneme sonucu"
                className="w-full rounded-lg"
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 