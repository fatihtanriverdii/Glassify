'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

// JWT decode helper
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Kart componenti
type StatCardProps = {
  image: string;
  type: string;
  stat: number;
  statLabel: string;
  statColor: string;
  icon: string;
  link: string;
  buttonColor: string;
};
function StatCard({ image, type, stat, statLabel, statColor, icon, link, buttonColor }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-between bg-white rounded-2xl shadow-md p-4 w-64 h-72">
      <img src={`data:image/jpeg;base64,${image}`} alt="Gözlük" className="w-24 h-16 object-contain mb-3 mt-2" />
      <div className="text-lg font-semibold text-gray-700 mb-1">{type}</div>
      <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${statColor}`}>
        <span className="text-xl">{icon}</span>
        {statLabel}: <span className="font-bold ml-1">{stat}</span>
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer"
         className={`w-full py-2 rounded-lg text-white text-base font-bold text-center transition ${buttonColor}`}>
        Ürüne Git
      </a>
    </div>
  );
}

export default function SellerDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [stats, setStats] = useState({
    totalGlasses: 0,
    activeGlasses: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [mostViewed, setMostViewed] = useState<any>(null);
  const [mostLiked, setMostLiked] = useState<any>(null);
  const [glassesLoading, setGlassesLoading] = useState(true);
  const [glassesError, setGlassesError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Token'ı localStorage'dan al
    const token = localStorage.getItem('token');
    if (!token) {
      setStatsLoading(false);
      setGlassesLoading(false);
      return;
    }
    // Token'dan email'i bul
    const decoded = parseJwt(token.replace('Bearer ', ''));
    const email = decoded?.email;
    if (!email) {
      setStatsLoading(false);
      setGlassesLoading(false);
      return;
    }
    fetch(`${API_URL}/User/statistics?email=${encodeURIComponent(email)}`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        setStats({
          totalGlasses: data.totalGlasses,
          activeGlasses: data.activeGlasses,
          totalViews: data.totalViews,
          totalLikes: data.totalLikes,
        });
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    // En çok görüntülenen ve beğenilen gözlükleri çek
    setGlassesLoading(true);
    setGlassesError(false);
    Promise.all([
      fetch(`${API_URL}/User/most-viewed?email=${encodeURIComponent(email)}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
        }
      }).then(res => res.ok ? res.json() : null),
      fetch(`${API_URL}/User/most-liked?email=${encodeURIComponent(email)}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
        }
      }).then(res => res.ok ? res.json() : null),
    ])
      .then(([viewed, liked]) => {
        setMostViewed(viewed);
        setMostLiked(liked);
        setGlassesLoading(false);
      })
      .catch(() => {
        setGlassesError(true);
        setGlassesLoading(false);
      });
  }, []);

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
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Satıcı Paneli
        </Typography>
        <button
          onClick={handleLogout}
          className="absolute top-0 right-0 text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Çıkış Yap
        </button>
      </Box>
      
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
                    value: statsLoading ? <CircularProgress size={24} /> : stats.totalGlasses,
                    color: 'primary.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12l2 2 4-4" /></svg>
                    ),
                    label: 'Aktif Gözlük',
                    value: statsLoading ? <CircularProgress size={24} /> : stats.activeGlasses,
                    color: 'success.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#f59e42" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /><path d="M12 19a3 3 0 006 0v-1" /></svg>
                    ),
                    label: 'Görüntülenme',
                    value: statsLoading ? <CircularProgress size={24} /> : stats.totalViews,
                    color: 'warning.main',
                  },
                  {
                    icon: (
                      <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    ),
                    label: 'Beğeni',
                    value: statsLoading ? <CircularProgress size={24} /> : stats.totalLikes,
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

              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <div className="flex flex-wrap justify-center items-stretch gap-8 w-full mt-2 mb-4 overflow-x-auto max-w-full">
                    {mostViewed && mostViewed.image && (
                      <div className="flex flex-col items-center rounded-2xl shadow-lg p-3 w-48 min-w-48 max-w-48 h-64 border-2 bg-white border-orange-400 dark:bg-slate-800 dark:border-orange-200">
                        <span className="mb-2 inline-block text-center px-3 py-1 rounded-full text-xs font-bold shadow bg-orange-400 text-white dark:bg-orange-200 dark:text-orange-900 dark:opacity-90">
                          En Çok Görüntülenen Gözlük
                        </span>
                        <img src={`data:image/jpeg;base64,${mostViewed.image}`} alt="Gözlük" className="w-16 h-10 object-contain my-4" />
                        <div className="text-base font-semibold text-gray-700 dark:text-slate-100 mb-2">{mostViewed.glassesType}</div>
                        <div className="flex items-center gap-2 text-sm font-bold text-orange-500 dark:text-orange-300 mb-2">
                          <span className="text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500 dark:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                              <circle cx="12" cy="12" r="3" fill="currentColor" />
                            </svg>
                          </span>
                          Görüntülenme: <span className="ml-1">{mostViewed.views}</span>
                        </div>
                        <a href={mostViewed.link} target="_blank" rel="noopener noreferrer"
                          className="w-full py-2 rounded-lg text-white text-base font-bold text-center transition bg-blue-600 hover:bg-blue-700 mt-auto dark:bg-blue-500 dark:hover:bg-blue-600">
                          Ürüne Git
                        </a>
                      </div>
                    )}
                    {mostLiked && mostLiked.image && (
                      <div className="flex flex-col items-center rounded-2xl shadow-lg p-3 w-48 min-w-48 max-w-48 h-64 border-2 bg-white border-red-400 dark:bg-slate-800 dark:border-red-200">
                        <span className="mb-2 inline-block text-center px-3 py-1 rounded-full text-xs font-bold shadow bg-red-400 text-white dark:bg-red-200 dark:text-red-900 dark:opacity-90">
                          En Çok Beğenilen Gözlük
                        </span>
                        <img src={`data:image/jpeg;base64,${mostLiked.image}`} alt="Gözlük" className="w-16 h-10 object-contain my-4" />
                        <div className="text-base font-semibold text-gray-700 dark:text-slate-100 mb-2">{mostLiked.glassesType}</div>
                        <div className="flex items-center gap-2 text-sm font-bold text-red-500 dark:text-red-300 mb-2">
                          <span className="text-lg">❤️</span>
                          Beğeni: <span className="ml-1">{mostLiked.likes}</span>
                        </div>
                        <a href={mostLiked.link} target="_blank" rel="noopener noreferrer"
                          className="w-full py-2 rounded-lg text-white text-base font-bold text-center transition bg-red-500 hover:bg-red-600 mt-auto dark:bg-red-500 dark:hover:bg-red-600">
                          Ürüne Git
                        </a>
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 