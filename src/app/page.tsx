'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import CameraCapture from '@/components/Camera/cameraCapture';
import PhotoUpload from '@/components/Photo/photoUpload';
import { FaceAnalysis } from '@/components/FaceAnalysis';

interface AnalysisResult {
  shape: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface FaceAnalysisResult {
  faceType: string;
  confidence: number;
  otherProbabilities: {
    [key: string]: number;
  };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult | null, image?: string) => {
    if (result) {
      // Convert AnalysisResult to FaceAnalysisResult
      setAnalysisResult({
        faceType: result.shape,
        confidence: result.confidence,
        otherProbabilities: result.probabilities
      });
    } else {
      setAnalysisResult(null);
    }
    
    if (image) {
      setCapturedImage(image);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Yüz Şekli Analizi
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Kamera ile Çek" />
          <Tab label="Fotoğraf Yükle" />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <CameraCapture onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <PhotoUpload onAnalysisComplete={handleAnalysisComplete} />
      )}

      {analysisResult && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analiz Sonucu
          </Typography>
          <Typography variant="body1" gutterBottom>
            Yüz Şekli: <strong>{analysisResult.faceType}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Güven Oranı: <strong>{(analysisResult.confidence * 100).toFixed(2)}%</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Diğer Olasılıklar:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {Object.entries(analysisResult.otherProbabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([shape, probability]) => (
                <Typography component="li" key={shape}>
                  {shape}: {(probability * 100).toFixed(2)}%
                </Typography>
              ))}
          </Box>
        </Paper>
      )}

      {analysisResult && capturedImage && (
        <FaceAnalysis
          analysisResult={analysisResult}
          capturedImage={capturedImage}
        />
      )}
    </Container>
  );
} 