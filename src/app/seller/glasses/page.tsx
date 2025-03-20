'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Chip, IconButton } from '@mui/material';
import { getSellerGlasses, Glass, deleteGlasses } from '@/services/glassesService';
import { useToast } from '@/components/ui/use-toast';
import DeleteIcon from '@mui/icons-material/Delete';

export default function SellerGlasses() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchGlasses();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchGlasses = async () => {
    try {
      const response = await getSellerGlasses();
      if (response.isSuccess) {
        setGlasses(response.data);
      } else {
        toast({
          title: 'Hata',
          description: response.message,
          variant: 'destructive'
        });
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteGlasses(id);
      if (response.isSuccess) {
        toast({
          title: 'Başarılı',
          description: response.message,
        });
        // Gözlükleri yeniden yükle
        fetchGlasses();
      } else {
        toast({
          title: 'Hata',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Gözlük silinirken bir hata oluştu.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Yükleniyor...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <button
          onClick={() => router.back()}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-200 flex items-center gap-2 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri
        </button>
      </Box>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Gözlüklerim
      </Typography>

      {glasses.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 4,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            border: '1px dashed #cbd5e1'
          }}
        >
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Henüz hiç gözlük yüklemediniz.
          </Typography>
          <button
            onClick={() => router.push('/seller/upload')}
            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Gözlük Yükle
          </button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {glasses.map((glass) => (
            <Grid item xs={12} sm={6} md={4} key={glass.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={glass.image}
                  alt="Gözlük"
                  sx={{ 
                    height: 200,
                    objectFit: 'contain',
                    backgroundColor: '#f8fafc',
                    p: 2
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={glass.glassesType}
                      sx={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(glass.createdAt)}
                      </Typography>
                      <IconButton 
                        onClick={() => handleDelete(glass.id)}
                        size="small"
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 