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

  const handleAnalysisComplete = (result: AnalysisResult | null, image: string | null) => {
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
        <CameraCapture onAnalysisComplete={(result, image) => handleAnalysisComplete(result, image)} />
      ) : (
        <PhotoUpload onAnalysisComplete={(result, image) => handleAnalysisComplete(result, image)} />
      )}

      {analysisResult && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Yüz Şekli: {analysisResult.faceType}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Güven Skoru: %{Math.min(100, (analysisResult.confidence)).toFixed(0)}
            </Typography>
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