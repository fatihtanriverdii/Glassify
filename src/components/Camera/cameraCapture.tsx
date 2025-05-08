import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Paper, Typography, Alert, useTheme as useMuiTheme, Stack, CircularProgress } from '@mui/material';
import { Camera, Refresh, CameraAlt } from '@mui/icons-material';
import { useFaceShape } from '../../contexts/FaceShapeContext';
import { detectFace } from '../../services/glassesService';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisResult {
  shape: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface CameraCaptureProps {
  onAnalysisComplete: (result: AnalysisResult | null, image: string | null) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onAnalysisComplete }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { predictFaceShape } = useFaceShape();
  const { toast } = useToast();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
  }, []);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setLoading(true);
      try {
        const hasFace = await detectFace(imageSrc);
        if (!hasFace) {
          toast({
            title: "Yüz Bulunamadı",
            description: "Fotoğrafta yüz tespit edilemedi. Lütfen yüzünüzün görünür olduğundan emin olun.",
            variant: "destructive",
            duration: 3000,
          });
          setLoading(false);
          return;
        }
        setCapturedImage(imageSrc);
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
  }, [toast]);

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('file', blob, 'webcam-capture.jpg');

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
        }, capturedImage);
      }
    } catch (error) {
      console.error('Yüz şekli analizi sırasında hata:', error);
      setError('Analiz sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setError(null);
    if (onAnalysisComplete) {
      onAnalysisComplete(null, null);
    }
  };

  return (
    <Paper elevation={3} sx={{
      p: 3,
      maxWidth: 600,
      mx: 'auto',
      bgcolor: isDark ? '#18181b' : 'background.paper',
      color: isDark ? 'grey.100' : 'text.primary',
      borderRadius: 3,
      boxShadow: isDark ? 8 : 3,
      border: isDark ? '1px solid #222' : '1px solid #e5e7eb'
    }}>
      <Box sx={{ position: 'relative', borderRadius: 3 }}>
        {error ? (
          <Box textAlign="center" p={3}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body1" gutterBottom>
              Alternatif olarak fotoğraf yüklemeyi deneyebilirsiniz.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={retake}
              sx={{ mt: 2, color: isDark ? 'grey.100' : undefined, borderColor: isDark ? 'grey.700' : undefined }}
            >
              Tekrar Dene
            </Button>
          </Box>
        ) : !capturedImage ? (
          <>
            <Box sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                display: 'block',
                paddingTop: '56.25%'
              }
            }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMediaError={handleUserMediaError}
                mirrored={true}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  background: isDark ? '#18181b' : '#fff',
                  border: isDark ? '1px solid #333' : '1px solid #e5e7eb'
                }}
              />
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
                    borderRadius: '12px',
                    zIndex: 1
                  }}
                >
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>Yüz Tespiti Yapılıyor...</Typography>
                  </Box>
                </Box>
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: isDark ? '#e0e7ef' : 'white',
                  textAlign: 'center',
                  textShadow: isDark ? '0 2px 8px #000' : '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                <CameraAlt sx={{ fontSize: 40, opacity: 0.85, color: isDark ? '#e0e7ef' : 'white' }} />
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Camera />}
              onClick={capture}
              sx={{
                mt: 2,
                bgcolor: isDark ? '#3b82f6' : 'primary.main',
                color: isDark ? '#18181b' : 'white',
                '&:hover': {
                  bgcolor: isDark ? '#60a5fa' : 'primary.dark',
                  color: isDark ? '#18181b' : 'white'
                }
              }}
              fullWidth
            >
              Fotoğraf Çek
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                display: 'block',
                paddingTop: '56.25%'
              }
            }}>
              <img
                src={capturedImage}
                alt="captured"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  background: isDark ? '#18181b' : '#fff',
                  border: isDark ? '1px solid #333' : '1px solid #e5e7eb'
                }}
              />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={retake}
                sx={{
                  color: isDark ? '#e0e7ef' : undefined,
                  borderColor: isDark ? '#e0e7ef' : undefined,
                  '&:hover': {
                    bgcolor: isDark ? '#23272f' : undefined,
                    borderColor: isDark ? '#60a5fa' : undefined,
                    color: isDark ? '#60a5fa' : undefined,
                  }
                }}
              >
                Yeniden Çek
              </Button>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                sx={{
                  bgcolor: isDark ? '#3b82f6' : 'primary.main',
                  color: isDark ? '#18181b' : 'white',
                  '&:hover': {
                    bgcolor: isDark ? '#60a5fa' : 'primary.dark',
                    color: isDark ? '#18181b' : 'white'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Analiz Et'}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CameraCapture; 