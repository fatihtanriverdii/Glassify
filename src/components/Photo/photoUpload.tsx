import React, { useRef, useState } from 'react';
import { Button, Box, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import { Upload, Delete, CloudUpload } from '@mui/icons-material';
import { useFaceShape } from '../../contexts/FaceShapeContext';
import { detectFace } from '../../services/glassesService';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisResult {
  shape: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface PhotoUploadProps {
  onAnalysisComplete: (result: AnalysisResult | null, image: string | null) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onAnalysisComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { predictFaceShape } = useFaceShape();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      try {
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const hasFace = await detectFace(imageDataUrl);
        if (!hasFace) {
          toast({
            title: "Yüz Bulunamadı",
            description: "Yüklenen fotoğrafta yüz tespit edilemedi. Lütfen yüzünüzün görünür olduğu bir fotoğraf yükleyin.",
            variant: "destructive",
            duration: 3000,
          });
          setLoading(false);
          return;
        }
        
        setSelectedImage(imageDataUrl);
      } catch (error) {
        console.error('Yüz tespiti hatası:', error);
        toast({
          title: "Hata",
          description: "Yüz tespiti sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onAnalysisComplete) {
      onAnalysisComplete(null, null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('file', blob, 'uploaded-image.jpg');

      const result = await predictFaceShape(formData) as {
        predicted_class: string;
        confidence: string;
        class_probabilities: Record<string, string>;
      };
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          shape: result.predicted_class,
          confidence: parseFloat(result.confidence),
          probabilities: Object.fromEntries(
            Object.entries(result.class_probabilities as Record<string, string>).map(([key, value]) => [key, parseFloat(value)])
          )
        }, selectedImage);
      }
    } catch (error) {
      console.error('Yüz şekli analizi sırasında hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ position: 'relative' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        
        {selectedImage ? (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                display: 'block',
                paddingTop: '56.25%'
              }
            }}>
              <img
                src={selectedImage}
                alt="uploaded"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleClear}
                fullWidth
              >
                Fotoğrafı Kaldır
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Analiz Ediliyor...
                  </>
                ) : (
                  'Analiz Et'
                )}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: dragActive ? 'action.hover' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              },
              position: 'relative'
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '8px',
                  zIndex: 1
                }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <CircularProgress color="inherit" />
                  <Typography sx={{ mt: 2 }}>Yüz Tespiti Yapılıyor...</Typography>
                </Box>
              </Box>
            )}
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Fotoğraf Yüklemek İçin Tıklayın
            </Typography>
            <Typography variant="body2" color="text.secondary">
              veya dosyayı sürükleyip bırakın
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PhotoUpload; 