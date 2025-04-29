import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassesDetails from './GlassesDetails';
import { useToast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface Glass {
  id: string;
  image: string;
  glassesType: string;
  link: string;
}

interface AllGlassesListProps {
  initialFaceType: string;
}

export const AllGlassesList: React.FC<AllGlassesListProps> = ({ initialFaceType }) => {
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

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        Tüm Gözlükler
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
        {glasses.map((glass, index) => {
          const isLastElement = index === glasses.length - 1;
          return (
            <div
              key={`${glass.id}-${index}`}
              ref={isLastElement ? lastGlassElementRef : null}
              className="flex flex-col items-center bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:border-blue-500 transition-all duration-200 cursor-pointer"
              onClick={() => handleGlassSelect(glass)}
            >
              <div className="w-full h-32 relative mb-2">
                <img
                  src={glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`}
                  alt={`Gözlük ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{glass.glassesType}</span>
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
        <p className="text-center text-gray-500 py-4">Tüm gözlükler yüklendi</p>
      )}
      {showDetails && (
        <GlassesDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          glassUrl={selectedGlassUrl}
          glassImage={selectedGlassImage}
        />
      )}
    </div>
  );
};

export default AllGlassesList; 