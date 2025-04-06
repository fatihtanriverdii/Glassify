import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Paper, Typography, Alert, Stack, CircularProgress } from '@mui/material';
import { Camera, Refresh, CameraAlt } from '@mui/icons-material';
import { useFaceShape } from '../../contexts/FaceShapeContext';

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

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ position: 'relative' }}>
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
              sx={{ mt: 2 }}
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
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                <CameraAlt sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Camera />}
              onClick={capture}
              sx={{ mt: 2 }}
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
                  borderRadius: '12px'
                }}
              />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={retake}
                fullWidth
              >
                Yeniden Çek
              </Button>
              <Button
                variant="contained"
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
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CameraCapture; 