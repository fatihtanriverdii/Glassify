import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import { PhotoCamera, Upload } from '@mui/icons-material';
import CameraCapture from '../components/CameraCapture';
import PhotoUpload from '../components/PhotoUpload';

const Home = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setResult(null);
    setError(null);
    setAnalysisResult(null);
  };

  const handlePhotoSubmit = async (imageData) => {
    setLoading(true);
    setError(null);
    try {
      const formdata = new FormData();
      formdata.append('file', imageData);
      const response = await axios.post('https://fatyidha-FaceShapeAPI.hf.space/predict/', formdata, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      setError('Fotoğraf analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Analiz Sonucu
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Yüz Şekliniz
              </Typography>
              <Typography variant="body1">
                {result.faceShape}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Önerilen Gözlük Modelleri
              </Typography>
              <Stack spacing={1}>
                {result.recommendations?.map((rec, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {rec.style}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rec.description}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth={false} sx={{ flex: 1, py: 4, px: { xs: 2, sm: 4 } }}>
        <Stack spacing={4} sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #90caf9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Yüz Şeklinize Göre Gözlük Önerileri
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto', 
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Yapay zeka teknolojimiz ile yüz şeklinize en uygun gözlük modellerini keşfedin
            </Typography>
          </Box>

          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                icon={<PhotoCamera sx={{ mr: 1 }} />}
                label="Fotoğraf Çek"
                sx={{ py: 3 }}
              />
              <Tab
                icon={<Upload sx={{ mr: 1 }} />}
                label="Fotoğraf Yükle"
                sx={{ py: 3 }}
              />
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Fotoğrafınız Analiz Ediliyor...
                  </Typography>
                </Box>
              ) : (
                <>
                  {tabValue === 0 && <CameraCapture onAnalysisComplete={handleAnalysisComplete} />}
                  {tabValue === 1 && <PhotoUpload onAnalysisComplete={handleAnalysisComplete} />}
                </>
              )}

              {analysisResult && (
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Analiz Sonucu
                  </Typography>
                  <Paper sx={{ p: 3, mt: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom color="primary">
                          Yüz Şekliniz
                        </Typography>
                        <Typography variant="body1">
                          {analysisResult.shape}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="h6" gutterBottom color="primary">
                          Güven Oranı
                        </Typography>
                        <Typography variant="body1">
                          {(analysisResult.confidence).toFixed(2)}%
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="h6" gutterBottom color="primary">
                          Tüm Olasılıklar
                        </Typography>
                        <Stack spacing={1}>
                          {(() => {
                            // Olasılıkları normalize et
                            const probs = Object.entries(analysisResult.probabilities);
                            const total = probs.reduce((sum, [_, value]) => sum + value, 0);
                            
                            return probs.map(([shape, prob]) => {
                              const normalizedProb = (prob / total) * 100;
                              return (
                                <Paper key={shape} sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    {shape}: {normalizedProb.toFixed(2)}%
                                  </Typography>
                                </Paper>
                              );
                            });
                          })()}
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home; 