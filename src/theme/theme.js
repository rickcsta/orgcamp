'use client';

import { createTheme } from '@mui/material/styles';

// Tema PRAIA SUAVE
export const YellowTheme = createTheme({
  palette: {
    primary: {
      main: '#F2B705',        // amarelo dourado
      light: '#F7D300',       // amarelo sol
      dark: '#D98C00',        // laranja queimado
      contrastText: '#1E1E1C',
    },
    secondary: {
      main: '#F2A007',        // laranja suave
      light: '#E6C45A',       // areia
      dark: '#1E1E1C',        // preto quente
      contrastText: '#1E1E1C',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#ED6C02',
    },
    info: {
      main: '#0288D1',
    },
    success: {
      main: '#2E7D32',        // verde discreto (feedback positivo)
    },
    background: {
      default: '#E6C45A',     // areia clara
      paper: '#F2F2F2',       // branco suave
    },
    text: {
      primary: '#1E1E1C',
      secondary: '#2A2A2A',
    },
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2A007 !important',
          background:
            'linear-gradient(135deg, #F7D300 0%, #F2A007 100%) !important',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#F2B705 !important',
          background:
            'linear-gradient(135deg, #F7D300 0%, #F2B705 100%) !important',
          color: '#1E1E1C',
          '&:hover': {
            backgroundColor: '#D98C00 !important',
            background:
              'linear-gradient(135deg, #F2B705 0%, #D98C00 100%) !important',
          },
        },
        outlinedPrimary: {
          color: '#1E1E1C !important',
          borderColor: '#F2B705 !important',
          '&:hover': {
            backgroundColor: 'rgba(242, 183, 5, 0.12) !important',
            borderColor: '#D98C00 !important',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2F2F2 !important',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2F2F2 !important',
          border: '1px solid #E0D3A3 !important',
        },
      },
    },
  },
});

export default YellowTheme;
