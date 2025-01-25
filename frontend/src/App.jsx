import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <header className="app-header">
          <div className="app-header-content">
            <h1>Glassify</h1>
            <nav className="app-header-nav">
              <a href="#home">Ana Sayfa</a>
              <a href="#about">Hakkımızda</a>
              <a href="#contact">İletişim</a>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Home />
        </main>
        <footer className="app-footer">
          <div className="app-footer-content">
            <div className="app-footer-section">
              <h3>Hakkımızda</h3>
              <p>Glassify, yapay zeka teknolojisi ile yüz şeklinize en uygun gözlük modellerini bulmanızı sağlar.</p>
            </div>
            <div className="app-footer-section">
              <h3>İletişim</h3>
              <p>Email: info@glassify.com</p>
              <p>Tel: +90 (555) 123 45 67</p>
            </div>
            <div className="app-footer-section">
              <h3>Sosyal Medya</h3>
              <p>Instagram: @glassify</p>
              <p>Twitter: @glassify</p>
            </div>
          </div>
          <div className="app-footer-bottom">
            <p>&copy; 2024 Glassify. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
