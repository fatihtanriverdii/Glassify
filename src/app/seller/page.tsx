'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';

export default function SellerDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

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
            sx={{ 
              p: 4,
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1e40af',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
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
                sx={{ 
                  color: '#4b5563',
                  mb: 3
                }}
              >
                Gözlüklerinizi yüklemek ve yönetmek için aşağıdaki bağlantıları kullanabilirsiniz.
              </Typography>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/seller/upload')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Gözlük Yükle
                </button>
                <button
                  onClick={() => router.push('/seller/glasses')}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Gözlüklerimi Görüntüle
                </button>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 4,
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1e40af',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                İstatistikler
              </Typography>
            </Box>
            <Box
              sx={{ 
                mt: 2,
                p: 4,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px dashed #cbd5e1'
              }}
            >
              <Typography 
                variant="body1"
                sx={{
                  color: '#64748b',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}
              >
                Yakında burada satış ve ziyaretçi istatistiklerinizi görebileceksiniz.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 