import React, { useState } from 'react';
import { tryOnGlasses } from '@/services/glassesService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisResult {
  faceType: string;
  confidence: number;
  otherProbabilities: {
    [key: string]: number;
  };
}

export const FaceAnalysis: React.FC<{
  analysisResult: AnalysisResult;
  capturedImage: string;
}> = ({ analysisResult, capturedImage }) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeMultiplier, setSizeMultiplier] = useState<number>(2.5); // Default size multiplier
  const { toast } = useToast();

  const tryOnGlassesHandler = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Face type:', analysisResult.faceType);
      
      // Ensure capturedImage is in base64 format
      const base64Image = capturedImage.includes('base64,') 
        ? capturedImage 
        : `data:image/jpeg;base64,${capturedImage}`;

      console.log('Image format check:', {
        originalLength: capturedImage.length,
        processedLength: base64Image.length,
        hasBase64Prefix: base64Image.includes('base64,')
      });

      // Get glasses recommendation based on face type
      console.log('Fetching glasses recommendations...');
      const response = await fetch(`http://localhost:7289/api/Glasses/suitable/glasses?FaceType=${analysisResult.faceType}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Glasses recommendation response status:', response.status);

      if (!response.ok) {
        throw new Error('Gözlük önerileri alınamadı');
      }

      const glasses = await response.json();
      console.log('Received glasses:', glasses);

      if (!glasses || !Array.isArray(glasses) || glasses.length === 0) {
        throw new Error('Yüz tipinize uygun gözlük bulunamadı');
      }

      console.log('Selected glasses:', glasses[0]);

      // Try on the first recommended glasses with custom size multiplier
      console.log('Trying on glasses...');
      const result = await tryOnGlasses(base64Image, glasses[0].image, sizeMultiplier);
      
      if (!result) {
        throw new Error('Gözlük deneme sonucu alınamadı');
      }

      console.log('Try-on result received, length:', result.length);

      // Ensure the result is in base64 format
      const finalImage = result.includes('base64,') ? result : `data:image/jpeg;base64,${result}`;
      setProcessedImage(finalImage);
      
      toast({
        title: 'Başarılı',
        description: 'Gözlük deneme işlemi tamamlandı',
      });
    } catch (err) {
      console.error('Detailed error in tryOnGlassesHandler:', {
        error: err,
        type: err instanceof Error ? 'Error' : typeof err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      
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