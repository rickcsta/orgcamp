'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Paper, Typography, Button, Alert,
  Snackbar, Box, Card, CardContent, Avatar,
  LinearProgress, Chip, Divider, CircularProgress
} from '@mui/material';
import {
  QrCode, AccountBalance, ContentCopy, CloudUpload,
  CheckCircle, ArrowBack, HourglassEmpty, Warning,
  Error, Person, People, Category, Payment,
  AccessTime, Timer, Refresh, Email, Phone,
  CalendarToday, AttachFile, Download
} from '@mui/icons-material';
import Link from 'next/link';

// API
const api = {
  async buscarInscricao(codigo) {
    const response = await fetch(`/api/inscricao/${codigo}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Inscrição não encontrada');
    }
    return await response.json();
  },

  async uploadFile(codigoRastreio, file) {
    const formData = new FormData();
    formData.append('codigo_rastreio', codigoRastreio);
    formData.append('tipo', 'comprovante');
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro no upload');
    }

    return await response.json();
  },

  async completarInscricao(codigoRastreio) {
    const response = await fetch(`/api/inscricao/${codigoRastreio}/completar`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao completar inscrição');
    }

    return await response.json();
  }
};

// Configurações de status
const statusConfig = {
  aguardando_pagamento: {
    label: 'AGUARDANDO PAGAMENTO',
    color: 'warning',
    icon: <HourglassEmpty />,
    bgColor: '#fff3e0'
  },
  pendente: {
    label: 'EM ANÁLISE',
    color: 'info',
    icon: <AccessTime />,
    bgColor: '#e3f2fd'
  },
  confirmado: {
    label: 'CONFIRMADO',
    color: 'success',
    icon: <CheckCircle />,
    bgColor: '#e8f5e9'
  },
  cancelado: {
    label: 'CANCELADO',
    color: 'error',
    icon: <Error />,
    bgColor: '#ffebee'
  },
  recusado: {
    label: 'RECUSADO',
    color: 'error',
    icon: <Warning />,
    bgColor: '#ffebee'
  }
};

// Informações PIX
const pixInfo = {
  nome: 'Associação Pernas na Areia',
  chavePix: '12.345.678/0001-90',
  banco: 'Banco do Brasil (001)'
};

export default function StatusInscricaoPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo;
  
  const [inscricao, setInscricao] = useState(null);
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Carregar inscrição
  useEffect(() => {
    if (codigo) {
      carregarInscricao();
    }
  }, [codigo]);

  const carregarInscricao = async () => {
    setIsLoading(true);
    try {
      const data = await api.buscarInscricao(codigo);
      setInscricao(data);
      
      if (data.dupla.time_left > 0) {
        setTimeLeft(data.dupla.time_left);
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Timer para pagamento
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Formatar tempo
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (valor) => {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  // Upload do comprovante
  const handleUploadComprovante = async () => {
    if (!comprovanteFile) {
      setSnackbar({ open: true, message: 'Selecione um arquivo', severity: 'warning' });
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadFile(inscricao.dupla.codigo_rastreio, comprovanteFile);
      await api.completarInscricao(inscricao.dupla.codigo_rastreio);
      
      setSnackbar({ 
        open: true, 
        message: 'Comprovante enviado com sucesso! Inscrição em análise.', 
        severity: 'success' 
      });
      
      // Recarregar dados
      setTimeout(() => carregarInscricao(), 1000);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprovanteFile(file);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copiado!', severity: 'success' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const statusInfo = inscricao?.dupla?.status ? statusConfig[inscricao.dupla.status] : null;

  // Se está carregando
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Buscando inscrição...
        </Typography>
      </Container>
    );
  }

  // Se não encontrou inscrição
  if (!inscricao) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Error color="error" sx={{ fontSize: 80, mb: 3 }} />
          <Typography variant="h4" color="error" gutterBottom>
            Inscrição não encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            O código {codigo} não corresponde a nenhuma inscrição válida.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />}
              onClick={() => router.push('/inscricao/status')}
            >
              Voltar para busca
            </Button>
            <Link href="/inscricao/nova" passHref>
              <Button variant="outlined" startIcon={<Person />}>
                Nova Inscrição
              </Button>
            </Link>
          </Box>
        </Card>
      </Container>
    );
  }

  const dupla = inscricao.dupla;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* CABEÇALHO COM STATUS */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 3,
        bgcolor: statusInfo?.bgColor,
        borderLeft: `6px solid`
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: `${statusInfo?.color}.main` }}>
              {statusInfo?.icon}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} color={`${statusInfo?.color}.main`}>
                {statusInfo?.label}
              </Typography>
              <Typography variant="body2">
                Código: <strong>#{dupla.codigo_rastreio}</strong>
              </Typography>
            </Box>
          </Box>

          {/* MENSAGEM DE STATUS */}
          {dupla.status === 'aguardando_pagamento' && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                ⚠️ Aguardando envio do comprovante de pagamento
              </Typography>
            </Alert>
          )}
          
          {dupla.status === 'pendente' && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                📋 Sua inscrição está sendo analisada pela organização
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Em breve você receberá uma confirmação por e-mail.
              </Typography>
            </Alert>
          )}
          
          {dupla.status === 'confirmado' && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                ✅ Inscrição confirmada! Tudo certo para o evento.
              </Typography>
            </Alert>
          )}
          
          {dupla.status === 'recusado' && dupla.motivo_recusa && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                ❌ Inscrição recusada
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Motivo:</strong> {dupla.motivo_recusa}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* TEMPO RESTANTE PARA PAGAMENTO */}
      {dupla.status === 'aguardando_pagamento' && timeLeft !== null && (
        <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#fff8e1' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Timer color="warning" />
              <Typography variant="h6" fontWeight={600} color="warning.main">
                TEMPO RESTANTE PARA PAGAMENTO
              </Typography>
            </Box>
            
            <Typography variant="h2" fontWeight={900} textAlign="center" color={timeLeft < 300 ? 'error' : 'warning.main'} sx={{ mb: 2 }}>
              {formatTime(timeLeft)}
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={(timeLeft / (30 * 60)) * 100} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
              color={timeLeft < 300 ? 'error' : 'warning'}
            />
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Após {formatTime(timeLeft)}, as vagas serão liberadas automaticamente
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* INFORMAÇÕES DA DUPLA */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
            Informações da Inscrição
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Responsável:</Typography>
              <Typography variant="body1" fontWeight={600}>{dupla.responsavel_nome}</Typography>
              
              {dupla.responsavel_email && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>E-mail:</Typography>
                  <Typography variant="body1">{dupla.responsavel_email}</Typography>
                </>
              )}
              
              {dupla.responsavel_telefone && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Telefone:</Typography>
                  <Typography variant="body1">{dupla.responsavel_telefone}</Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Jogador 1:</Typography>
              <Typography variant="body1">{dupla.jogador1_nome}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Jogador 2:</Typography>
              <Typography variant="body1">{dupla.jogador2_nome}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Data da inscrição:</Typography>
              <Typography variant="body1">{formatDate(dupla.criado_em)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CATEGORIAS E VALOR */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
            <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
            Categorias Selecionadas
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {dupla.categorias.map((cat, index) => (
              <Chip 
                key={index}
                label={`${cat.nome} ${cat.sexo}`}
                color="primary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">Valor Total:</Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {formatCurrency(dupla.valor_total)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* SEÇÃO DE PAGAMENTO (apenas se aguardando pagamento) */}
      {dupla.status === 'aguardando_pagamento' && (
        <>
          {/* INFORMAÇÕES PIX */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '2px solid #4CAF50' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  <QrCode fontSize="large" />
                </Avatar>
                <Typography variant="h5" fontWeight={700} color="#4CAF50">
                  PAGAMENTO VIA PIX
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Beneficiário
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.5, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body1" fontWeight={600}>
                    {pixInfo.nome}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard(pixInfo.nome)}
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    Copiar
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chave PIX (CNPJ)
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.5, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body1" fontWeight={600}>
                    {pixInfo.chavePix}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard(pixInfo.chavePix)}
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    Copiar
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Banco
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 2, color: '#4CAF50' }} />
                  <Typography variant="body1" fontWeight={700} color="#4CAF50">
                    {pixInfo.banco}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                mt: 4, 
                p: 3, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px dashed #4CAF50',
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight={800} color="#4CAF50" gutterBottom>
                  {formatCurrency(dupla.valor_total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor exato para pagamento
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* UPLOAD DO COMPROVANTE */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Enviar Comprovante
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Após realizar o pagamento via PIX, anexe o comprovante abaixo:
              </Typography>

              <Box sx={{ 
                p: 3, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2, 
                border: !comprovanteFile ? '2px dashed #1976d2' : '1px solid #4caf50',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  id="comprovante-file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <Button 
                  variant="outlined" 
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  {comprovanteFile?.name || 'Selecionar arquivo'}
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                
                {comprovanteFile && (
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      icon={<CheckCircle />}
                      label="Arquivo selecionado"
                      color="success"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      {comprovanteFile.name} • {(comprovanteFile.size / 1024).toFixed(0)}KB
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUploadComprovante}
                disabled={!comprovanteFile || isUploading}
                sx={{ mt: 3 }}
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              >
                {isUploading ? 'Enviando...' : 'Enviar Comprovante'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* BOTÕES DE AÇÃO */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={carregarInscricao}
          disabled={isLoading}
        >
          Atualizar Status
        </Button>
        
        {dupla.status === 'confirmado' && dupla.arquivos?.find(a => a.tipo === 'comprovante') && (
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => window.open(dupla.arquivos.find(a => a.tipo === 'comprovante').blob_url, '_blank')}
          >
            Baixar Comprovante
          </Button>
        )}
        
        {dupla.status === 'recusado' && (
          <Link href="/inscricao/nova" passHref>
            <Button variant="contained" color="primary" startIcon={<Person />}>
              Nova Inscrição
            </Button>
          </Link>
        )}
      </Box>

      {/* DOCUMENTOS ENVIADOS (se houver) */}
      {dupla.arquivos && dupla.arquivos.length > 0 && (
        <Card sx={{ mt: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
              <AttachFile sx={{ mr: 1, verticalAlign: 'middle' }} />
              Documentos Enviados
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dupla.arquivos.map((arquivo, index) => (
                <Chip
                  key={index}
                  icon={<AttachFile />}
                  label={
                    arquivo.tipo === 'documento_jogador1' ? 'Documento Jogador 1' :
                    arquivo.tipo === 'documento_jogador2' ? 'Documento Jogador 2' :
                    'Comprovante'
                  }
                  variant="outlined"
                  onClick={() => window.open(arquivo.blob_url, '_blank')}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* LINK PARA VOLTAR */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Link href="/inscricao/status" passHref>
          <Button startIcon={<ArrowBack />} size="small">
            Voltar para busca
          </Button>
        </Link>
      </Box>

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

// Grid component
import Grid from '@mui/material/Grid';