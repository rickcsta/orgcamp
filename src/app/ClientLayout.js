'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header'; // Importação direta
import Footer from '@/components/layout/Footer'; // Importação direta
import { useEffect, useState } from 'react'; // Adicione useState

const theme = createTheme({
  palette: {
    primary: {
      main: '#dab616ff',   // Amarelo puro
      light: '#ffe600ff',
      dark: '#d89b00ff',
    },
    secondary: {
      main: '#d4af37',
      light: '#fdd243ff',
      dark: '#b89216ff',
    },
    background: {
      default: '#FFFDE7', // Amarelo quase branco
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3A3A3A', // Cinza escuro (melhor que preto)
      secondary: '#616161',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FDD835',
          background: 'linear-gradient(135deg, #FBC02D 0%, #FDD835 100%)',
        },
      },
    },
  },
});


export default function ClientLayoutLayout({ children }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Verifica se está em uma rota de admin
  const isAdminRoute = pathname?.startsWith('/admin');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Providers>
        {/* Renderiza condicionalmente no cliente */}
        {isClient && !isAdminRoute && <Header />}
        
        {/* Mantenha a estrutura do main consistente */}
        <div style={{ 
          minHeight: '70vh', 
          backgroundColor: '#F5F9F5', 
          position: 'relative'
        }}>
          {children}
        </div>
        
        {isClient && !isAdminRoute && <Footer />}
      </Providers>
    </ThemeProvider>
  );
}