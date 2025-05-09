'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export default function SellerDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  if (loading || isNavigating) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Yükleniyor...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
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
        Satıcı Paneli
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={(theme) => ({ 
              p: 4,
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            })}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#60a5fa' : '#1e40af',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Gözlük Yönetimi
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="body1" 
                paragraph 
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#4b5563',
                  mb: 3
                })}
              >
                Gözlüklerinizi yüklemek ve yönetmek için aşağıdaki bağlantıları kullanabilirsiniz.
              </Typography>
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigation('/seller/upload')}
                  disabled={isNavigating}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 dark:from-blue-400 dark:to-blue-600 dark:text-slate-900 dark:hover:from-blue-500 dark:hover:to-blue-700 ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isNavigating ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Gözlük Yükle
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleNavigation('/seller/glasses')}
                  disabled={isNavigating}
                  className={`w-full bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 dark:bg-slate-800 dark:text-blue-200 dark:border-blue-400 dark:hover:bg-slate-700 ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isNavigating ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Gözlüklerimi Görüntüle
                    </>
                  )}
                </button>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            sx={(theme) => ({ 
              p: 4,
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            })}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#60a5fa' : '#1e40af',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                İstatistikler
              </Typography>
            </Box>
            <Box
              sx={theme => ({
                mt: 2,
                p: 4,
                backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                borderRadius: 4,
                border: '1px dashed',
                borderColor: theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
              })}
            >
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                    ),
                    label: 'Toplam Gözlük',
                    value: 0,
                    color: 'primary.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12l2 2 4-4" /></svg>
                    ),
                    label: 'Aktif Gözlük',
                    value: 0,
                    color: 'success.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#f59e42" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /><path d="M12 19a3 3 0 006 0v-1" /></svg>
                    ),
                    label: 'Görüntülenme',
                    value: 0,
                    color: 'warning.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    ),
                    label: 'Beğeni',
                    value: 0,
                    color: 'error.main',
                  },
                ].map((stat, i) => (
                  <Grid item xs={12} sm={6} md={3} key={stat.label}>
                    <Box
                      sx={theme => ({
                        p: 2.5,
                        borderRadius: 3,
                        minHeight: 180,
                        bgcolor: theme.palette.mode === 'dark' ? '#232b3a' : '#fff',
                        border: theme.palette.mode === 'dark' ? '1px solid #334155' : 'none',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 4px 24px 0 rgba(0,0,0,0.25)'
                          : '0 2px 8px 0 rgba(0,0,0,0.07)',
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.2,
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 8px 24px 0 rgba(37,99,235,0.10)',
                        },
                      })}
                    >
                      <Box sx={{ mb: 0.5 }}>{stat.icon}</Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.2 }}>{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.2 }}>{stat.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <Box sx={theme => ({
                    p: 2.5,
                    borderRadius: 3,
                    minHeight: 120,
                    bgcolor: theme.palette.mode === 'dark' ? '#232b3a' : '#fff',
                    border: theme.palette.mode === 'dark' ? '1px solid #334155' : 'none',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 24px 0 rgba(0,0,0,0.25)'
                      : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    color: theme.palette.mode === 'dark' ? '#e5e7eb' : 'inherit',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  })}>
                    <Typography variant="subtitle1" gutterBottom sx={theme => ({ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.mode === 'dark' ? '#e5e7eb' : 'inherit' })}>
                      <svg width="20" height="20" fill="none" stroke="#f59e42" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                      En Çok Görüntülenen Gözlükler
                    </Typography>
                    <Box sx={theme => ({
                      flex: 1,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                    })}>
                      <Typography variant="body2" sx={theme => ({ color: theme.palette.mode === 'dark' ? '#94a3b8' : 'text.secondary' })}>
                        Gözlük verisi yakında eklenecek
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={theme => ({
                    p: 2.5,
                    borderRadius: 3,
                    minHeight: 120,
                    bgcolor: theme.palette.mode === 'dark' ? '#232b3a' : '#fff',
                    border: theme.palette.mode === 'dark' ? '1px solid #334155' : 'none',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 24px 0 rgba(0,0,0,0.25)'
                      : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    color: theme.palette.mode === 'dark' ? '#e5e7eb' : 'inherit',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  })}>
                    <Typography variant="subtitle1" gutterBottom sx={theme => ({ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.mode === 'dark' ? '#e5e7eb' : 'inherit' })}>
                      <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      En Çok Beğenilen Gözlükler
                    </Typography>
                    <Box sx={theme => ({
                      flex: 1,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                    })}>
                      <Typography variant="body2" sx={theme => ({ color: theme.palette.mode === 'dark' ? '#94a3b8' : 'text.secondary' })}>
                        Beğeni verisi yakında eklenecek
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 