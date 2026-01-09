'use client';

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema PRAIA SUAVE
const theme = createTheme({
  palette: {
    primary: {
      main: '#F7D300',   // amarelo sol
      light: '#F2B705',  // dourado
      dark: '#D98C00',   // laranja queimado
    },
    secondary: {
      main: '#F2A007',   // laranja suave
      light: '#E6C45A',  // areia
      dark: '#1E1E1C',   // preto quente
    },
    background: {
      default: '#E6C45A', // areia clara
      paper: '#F2F2F2',   // branco suave
    },
  },
});

export default function ThemeProvider({ children }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
