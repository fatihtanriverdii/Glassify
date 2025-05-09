'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Chip, IconButton, Skeleton, CircularProgress } from '@mui/material';
import { getSellerGlasses, Glass, deleteGlasses } from '@/services/glassesService';
import { useToast } from '@/components/ui/use-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';

export default function SellerGlasses() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      setPage(1);
      setGlasses([]);
      setHasMore(true);
      fetchGlasses(1, true);
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchGlasses = async (pageNumber = 1, reset = false) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const response = await getSellerGlasses(pageNumber);
      if (response && Array.isArray(response.items)) {
        setGlasses(prev => {
          if (reset) return response.items;
          const existingIds = new Set(prev.map(g => g.id));
          const newItems = response.items.filter(g => !existingIds.has(g.id));
          return [...prev, ...newItems];
        });
        setPage(pageNumber);
        setHasMore(
          response.pageNumber < response.totalPages &&
          response.items.length > 0
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      if (pageNumber === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        fetchGlasses(page + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, page]);

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
        // Sadece silinen ürünü listeden çıkar
        setGlasses(prev => prev.filter(g => g.id !== id));
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <button
            onClick={() => router.back()}
            className={
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-700 flex items-center gap-2 transition-all duration-200"
                : "bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-200 flex items-center gap-2 transition-all duration-200"
            }
            style={{ boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.08)' }}
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
            background: isDark
              ? 'linear-gradient(45deg, #60a5fa, #2563eb)'
              : 'linear-gradient(45deg, #2563eb, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Gözlüklerim
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: isDark
                    ? '0 10px 24px -3px rgba(0,0,0,0.45)'
                    : '0 10px 15px -3px rgba(0,0,0,0.10)',
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{
                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="rounded" width={100} height={32} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <button
          onClick={() => router.back()}
          className={
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-700 flex items-center gap-2 transition-all duration-200"
              : "bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-200 flex items-center gap-2 transition-all duration-200"
          }
          style={{ boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.08)' }}
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
          background: isDark
            ? 'linear-gradient(45deg, #60a5fa, #2563eb)'
            : 'linear-gradient(45deg, #2563eb, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Gözlüklerim
      </Typography>

      {glasses.length === 0 && !loading ? (
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 4,
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            borderRadius: 2,
            border: isDark ? '1px dashed #334155' : '1px dashed #cbd5e1'
          }}
        >
          <Typography variant="body1" sx={{ color: isDark ? '#cbd5e1' : '#64748b' }}>
            Henüz hiç gözlük yüklemediniz.
          </Typography>
          <button
            onClick={() => router.push('/seller/upload')}
            className={
              isDark
                ? "mt-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:from-blue-800 hover:to-blue-900 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                : "mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            }
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
                  boxShadow: isDark
                    ? '0 10px 24px -3px rgba(0,0,0,0.45)'
                    : '0 10px 15px -3px rgba(0,0,0,0.10)',
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 20px 32px -5px rgba(0,0,0,0.55)'
                      : '0 20px 25px -5px rgba(0,0,0,0.12)'
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
                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                    p: 2,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={glass.glassesType}
                      sx={{
                        backgroundColor: isDark ? '#2563eb' : '#3b82f6',
                        color: 'white',
                        fontWeight: 'medium',
                        boxShadow: isDark ? '0 1px 4px rgba(30,41,59,0.25)' : '0 1px 4px rgba(59,130,246,0.10)'
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {glass.isRecycling && (
                        <span
                          className="recycling-badge bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full text-sm font-semibold flex items-center justify-center shadow"
                          style={{ width: 22, height: 22 }}
                        >
                          <span className="text-green-500 dark:text-green-400 text-[15px]">♻️</span>
                        </span>
                      )}
                      <IconButton 
                        onClick={() => handleDelete(glass.id)}
                        size="small"
                        sx={{ 
                          color: isDark ? '#f87171' : 'error.main',
                          '&:hover': {
                            backgroundColor: isDark ? '#334155' : 'error.light',
                            color: isDark ? '#ef4444' : 'error.dark'
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
          {loadingMore && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress color={isDark ? 'inherit' : 'primary'} />
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
} 