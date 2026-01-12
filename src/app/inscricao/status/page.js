'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar, Box, Card, CardContent,
  Avatar, CircularProgress
} from '@mui/material';
import {
  Search, QrCodeScanner, ArrowBack
} from '@mui/icons-material';
import Link from 'next/link';

export default function StatusInscricaoPage() {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const router = useRouter();

  const handleBuscar = async () => {
    if (!codigo.trim()) {
      setSnackbar({ open: true, message: 'Digite um código de inscrição', severity: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      // Redireciona para a página de status do código
      router.push(`/inscricao/${codigo.trim()}`);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao buscar inscrição', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <QrCodeScanner color="primary" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h2" fontWeight={900} color="primary">
          ACOMPANHAR INSCRIÇÃO
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Digite o código da sua inscrição
        </Typography>
      </Box>

      {/* BUSCA */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Código da Inscrição"
              variant="outlined"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: 123456"
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              disabled={isLoading}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleBuscar}
            disabled={isLoading || !codigo.trim()}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
          >
            {isLoading ? 'Buscando...' : 'Ver Status da Inscrição'}
          </Button>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Código de 6 dígitos recebido após a inscrição
            </Typography>
            
            <Link href="/inscricao/nova" passHref>
              <Button startIcon={<ArrowBack />} size="small" sx={{ mt: 2 }}>
                Fazer nova inscrição
              </Button>
            </Link>
          </Box>
        </CardContent>
      </Card>

      {/* INSTRUÇÕES */}
      <Card sx={{ mt: 4, borderRadius: 3, bgcolor: '#f0f7ff' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
            Como funciona?
          </Typography>
          <ul style={{ paddingLeft: 20, color: '#666' }}>
            <li><Typography variant="body2">Digite o código de 6 dígitos</Typography></li>
            <li><Typography variant="body2">Veja o status atual da sua inscrição</Typography></li>
            <li><Typography variant="body2">Se estiver aguardando pagamento, faça o PIX e envie o comprovante</Typography></li>
            <li><Typography variant="body2">Acompanhe a análise pela organização</Typography></li>
          </ul>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}