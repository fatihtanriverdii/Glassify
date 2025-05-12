'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Chip, IconButton, Skeleton, CircularProgress } from '@mui/material';
import { getSellerGlasses, Glass, deleteGlasses, setGlassesActive, setAllGlassesActive } from '@/services/glassesService';
import { useToast } from '@/components/ui/use-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Stack from '@mui/material/Stack';

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
  const [allActiveState, setAllActiveState] = useState<'active' | 'passive' | null>(null);

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

  // Tekil gözlük aktif/pasif
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await setGlassesActive(id, isActive);
      if (response.isSuccess) {
        setGlasses(prev => prev.map(g => g.id === id ? { ...g, isActive } : g));
        toast({
          title: 'Başarılı',
          description: `Gözlük ${isActive ? 'aktif' : 'pasif'} yapıldı.`,
        });
      } else {
        toast({
          title: 'Hata',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Hata',
        description: 'Gözlük durumu güncellenemedi.',
        variant: 'destructive'
      });
    }
  };

  // Tümünü aktif/pasif yap
  const handleToggleAllActive = async (isActive: boolean) => {
    try {
      const response = await setAllGlassesActive(isActive);
      if (response.isSuccess) {
        setGlasses(prev => prev.map(g => ({ ...g, isActive })));
        toast({
          title: 'Başarılı',
          description: `Tüm gözlükler ${isActive ? 'aktif' : 'pasif'} yapıldı.`,
        });
      } else {
        toast({
          title: 'Hata',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Hata',
        description: 'Tüm gözlükler güncellenemedi.',
        variant: 'destructive'
      });
    }
  };

  if (authLoading) return null;
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, width: '100%' }}>
          <Box>
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
          <Stack direction="row" spacing={1} alignItems="center">
            <ToggleButtonGroup
              value={allActiveState}
              exclusive
              onChange={(_, value) => {
                if (value === 'active') {
                  setAllActiveState('active');
                  handleToggleAllActive(true);
                } else if (value === 'passive') {
                  setAllActiveState('passive');
                  handleToggleAllActive(false);
                }
              }}
              aria-label="Tümünü Aktif/Pasif Yap"
              sx={{
                background: isDark ? '#181f2a' : '#fff',
                boxShadow: isDark ? '0 2px 8px 0 rgba(30,41,59,0.18)' : '0 2px 8px 0 rgba(37,99,235,0.06)',
                border: isDark ? '2px solid #293040' : '2px solid #e0e7ef',
                borderRadius: 3,
                p: 0.5,
                minHeight: 40,
                gap: 1.5,
                flexDirection: 'row',
                '@media (max-width: 600px)': {
                  minHeight: 36,
                  borderRadius: 2,
                  p: 0.5,
                  gap: 1,
                }
              }}
            >
              <ToggleButton value="active" aria-label="Tümünü Aktif Yap" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5, py: 0.7, fontWeight: 600, fontSize: '1rem', borderRadius: 2,
                color: allActiveState === 'active' ? (isDark ? '#2563eb' : '#2563eb') : (isDark ? '#60a5fa' : '#2563eb'),
                background: allActiveState === 'active' ? (isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.10)') : 'transparent',
                border: 'none',
                minWidth: 0,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: allActiveState === 'active' ? (isDark ? '0 2px 8px 0 rgba(37,99,235,0.18)' : '0 2px 8px 0 rgba(37,99,235,0.10)') : 'none',
                '&:hover': {
                  background: isDark ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.13)',
                },
                outline: 'none',
                '@media (max-width: 600px)': {
                  fontSize: '0.9rem',
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  minWidth: 80,
                  gap: 0.7,
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }
              }}>
                <CheckCircleIcon sx={{ mr: 0.5, fontSize: 18, color: allActiveState === 'active' ? '#2563eb' : '#94a3b8', '@media (max-width: 600px)': { fontSize: 16, mr: 0.3 } }} />
                <span style={{ display: 'block', lineHeight: 1.1 }}>
                  Tümünü<br />Aktif Yap
                </span>
              </ToggleButton>
              <ToggleButton value="passive" aria-label="Tümünü Pasif Yap" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5, py: 0.7, fontWeight: 600, fontSize: '1rem', borderRadius: 2,
                color: allActiveState === 'passive' ? (isDark ? '#e879f9' : '#a21caf') : (isDark ? '#e879f9' : '#a21caf'),
                background: allActiveState === 'passive' ? (isDark ? 'rgba(147,51,234,0.18)' : 'rgba(147,51,234,0.10)') : 'transparent',
                border: 'none',
                minWidth: 0,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: allActiveState === 'passive' ? (isDark ? '0 2px 8px 0 rgba(147,51,234,0.18)' : '0 2px 8px 0 rgba(147,51,234,0.10)') : 'none',
                '&:hover': {
                  background: isDark ? 'rgba(147,51,234,0.22)' : 'rgba(147,51,234,0.13)',
                },
                outline: 'none',
                '@media (max-width: 600px)': {
                  fontSize: '0.9rem',
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  minWidth: 80,
                  gap: 0.7,
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }
              }}>
                <CancelIcon sx={{ mr: 0.5, fontSize: 18, color: allActiveState === 'passive' ? '#a21caf' : '#bdbdbd', '@media (max-width: 600px)': { fontSize: 16, mr: 0.3 } }} />
                <span style={{ display: 'block', lineHeight: 1.1 }}>
                  Tümünü<br />Pasif Yap
                </span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
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
            mb: 2
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, width: '100%' }}>
        <Box>
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
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            value={allActiveState}
            exclusive
            onChange={(_, value) => {
              if (value === 'active') {
                setAllActiveState('active');
                handleToggleAllActive(true);
              } else if (value === 'passive') {
                setAllActiveState('passive');
                handleToggleAllActive(false);
              }
            }}
            aria-label="Tümünü Aktif/Pasif Yap"
            sx={{
              background: isDark ? '#181f2a' : '#fff',
              boxShadow: isDark ? '0 2px 8px 0 rgba(30,41,59,0.18)' : '0 2px 8px 0 rgba(37,99,235,0.06)',
              border: isDark ? '2px solid #293040' : '2px solid #e0e7ef',
              borderRadius: 3,
              p: 0.5,
              minHeight: 40,
              gap: 1.5,
              flexDirection: 'row',
              '@media (max-width: 600px)': {
                minHeight: 36,
                borderRadius: 2,
                p: 0.5,
                gap: 1,
              }
            }}
          >
            <ToggleButton value="active" aria-label="Tümünü Aktif Yap" sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5, py: 0.7, fontWeight: 600, fontSize: '1rem', borderRadius: 2,
              color: allActiveState === 'active' ? (isDark ? '#2563eb' : '#2563eb') : (isDark ? '#60a5fa' : '#2563eb'),
              background: allActiveState === 'active' ? (isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.10)') : 'transparent',
              border: 'none',
              minWidth: 0,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: allActiveState === 'active' ? (isDark ? '0 2px 8px 0 rgba(37,99,235,0.18)' : '0 2px 8px 0 rgba(37,99,235,0.10)') : 'none',
              '&:hover': {
                background: isDark ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.13)',
              },
              outline: 'none',
              '@media (max-width: 600px)': {
                fontSize: '0.9rem',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                minWidth: 80,
                gap: 0.7,
                whiteSpace: 'normal',
                textAlign: 'center',
              }
            }}>
              <CheckCircleIcon sx={{ mr: 0.5, fontSize: 18, color: allActiveState === 'active' ? '#2563eb' : '#94a3b8', '@media (max-width: 600px)': { fontSize: 16, mr: 0.3 } }} />
              <span style={{ display: 'block', lineHeight: 1.1 }}>
                Tümünü<br />Aktif Yap
              </span>
            </ToggleButton>
            <ToggleButton value="passive" aria-label="Tümünü Pasif Yap" sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5, py: 0.7, fontWeight: 600, fontSize: '1rem', borderRadius: 2,
              color: allActiveState === 'passive' ? (isDark ? '#e879f9' : '#a21caf') : (isDark ? '#e879f9' : '#a21caf'),
              background: allActiveState === 'passive' ? (isDark ? 'rgba(147,51,234,0.18)' : 'rgba(147,51,234,0.10)') : 'transparent',
              border: 'none',
              minWidth: 0,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: allActiveState === 'passive' ? (isDark ? '0 2px 8px 0 rgba(147,51,234,0.18)' : '0 2px 8px 0 rgba(147,51,234,0.10)') : 'none',
              '&:hover': {
                background: isDark ? 'rgba(147,51,234,0.22)' : 'rgba(147,51,234,0.13)',
              },
              outline: 'none',
              '@media (max-width: 600px)': {
                fontSize: '0.9rem',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                minWidth: 80,
                gap: 0.7,
                whiteSpace: 'normal',
                textAlign: 'center',
              }
            }}>
              <CancelIcon sx={{ mr: 0.5, fontSize: 18, color: allActiveState === 'passive' ? '#a21caf' : '#bdbdbd', '@media (max-width: 600px)': { fontSize: 16, mr: 0.3 } }} />
              <span style={{ display: 'block', lineHeight: 1.1 }}>
                Tümünü<br />Pasif Yap
              </span>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
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
          mb: 2
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
                      <Switch
                        checked={glass.isActive}
                        onChange={() => handleToggleActive(glass.id, !glass.isActive)}
                        color="primary"
                        inputProps={{ 'aria-label': 'Aktiflik durumu' }}
                      />
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