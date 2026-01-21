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

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];


// API SIMPLIFICADA E CORRETA
const api = {
  async buscarStatus(codigo) {
    console.log('Buscando inscrição com código:', codigo);
    try {
      const response = await fetch(`/api/inscricao/${codigo}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Tenta ler o erro da API
        let errorMessage = 'Erro ao buscar inscrição';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Se não conseguir parsear JSON, usa status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      
      // Normalizar campos
      if (data.dupla) {
        data.dupla.responsavel_telefone = data.dupla.responsavel_numero || data.dupla.responsavel_telefone;
      }
      
      return data;
    } catch (error) {
      console.error('Erro detalhado na API:', error);
      throw error;
    }
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
  nome: 'Aldeneide Firmino Pereira',
  chavePix: 'c4ed3c93-0e47-4413-84a7-2ef4e167925e',
  banco: 'Cloudwalk ip Ltda',
};

export default function StatusInscricaoPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo;
  
  const [inscricao, setInscricao] = useState(null);
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para mostrar loading
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
    console.log('Iniciando carregamento para código:', codigo);
    setIsLoading(true);
    try {
      const data = await api.buscarStatus(codigo);
      console.log('Dados carregados com sucesso:', data);
      setInscricao(data);
      
      if (data.dupla?.time_left > 0) {
        setTimeLeft(data.dupla.time_left);
      }
    } catch (error) {
      console.error('Erro ao carregar inscrição:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Erro ao carregar inscrição', 
        severity: 'error' 
      });
      setInscricao(null);
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
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleTimeExpired = () => {
    setSnackbar({ open: true, message: 'Tempo esgotado! Inscrição cancelada.', severity: 'error' });
    setTimeout(() => router.push('/inscricao/status'), 3000);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (valor) => {
    if (!valor) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  // Upload do comprovante
  const handleUploadComprovante = async () => {
    if (!comprovanteFile) {
      setSnackbar({ open: true, message: 'Selecione um arquivo', severity: 'warning' });
      return;
    }

    if (!inscricao?.dupla?.codigo_rastreio) {
      setSnackbar({ open: true, message: 'Código de inscrição não encontrado', severity: 'error' });
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
  if (!file) return;

  // 🔒 Validação de tamanho
  if (file.size > MAX_SIZE) {
    setSnackbar({
      open: true,
      message: '❌ Arquivo maior que 2MB',
      severity: 'error'
    });
    e.target.value = null;
    return;
  }

  // 🔒 Validação de tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    setSnackbar({
      open: true,
      message: '❌ Tipo inválido. Use PDF, JPG ou PNG',
      severity: 'error'
    });
    e.target.value = null;
    return;
  }

  // ✅ Arquivo válido
  setComprovanteFile(file);
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
          Buscando inscrição #{codigo}...
        </Typography>
      </Container>
    );
  }

  // Se não encontrou inscrição
  if (!inscricao || !inscricao.dupla) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Error color="error" sx={{ fontSize: 80, mb: 3 }} />
          <Typography variant="h4" color="error" gutterBottom>
            Inscrição não encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            O código <strong>#{codigo}</strong> não corresponde a nenhuma inscrição válida.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Verifique se o código está correto ou se a inscrição já expirou.
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
                 Aguardando envio do comprovante de pagamento
              </Typography>
            </Alert>
          )}
          
          {dupla.status === 'pendente' && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                📋 Sua inscrição está sendo analisada pela organização
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
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Responsável:</Typography>
            <Typography variant="body2">{dupla.responsavel_nome}</Typography>
            
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
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Jogador 1:</Typography>
            <Typography variant="body1">{dupla.jogador1_nome}</Typography>
            <Typography variant="caption" color="text.secondary">
              Camisa: {dupla.jogador1_camisa?.toUpperCase()}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Jogador 2:</Typography>
            <Typography variant="body1">{dupla.jogador2_nome}</Typography>
            <Typography variant="caption" color="text.secondary">
              Camisa: {dupla.jogador2_camisa?.toUpperCase()}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">Data da inscrição:</Typography>
          <Typography variant="body1">{formatDate(dupla.criado_em)}</Typography>
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
            {dupla.categorias?.map((cat, index) => (
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
          <Box sx={{ flex: { xs: 'none', md: 1 } }}>
                        <Card sx={{ 
                          borderRadius: 3, 
                          border: '2px solid #4CAF50',
                          height: '100%'
                        }}>
                          <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                              <Avatar sx={{ 
                                bgcolor: '#4CAF50', 
                                width: 100, 
                                height: 100, 
                                mx: 'auto', 
                                mb: 3 
                              }}>
                                <QrCode fontSize="large" />
                              </Avatar>
                              <Typography variant="h5" fontWeight={700} color="#4CAF50" gutterBottom>
                                Pagamento via PIX
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Escaneie o QR Code ou use a chave PIX abaixo
                              </Typography>
                            </Box>
          
                            {/* DADOS DO PIX */}
                            {[
                              { label: 'Nome do Beneficiário', value: pixInfo.nome },
                              { label: 'Chave PIX', value: pixInfo.chavePix }
                            ].map((item, index) => (
                              <Box key={index} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  {item.label}
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  p: 1.5, 
                                  bgcolor: '#f5f5f5', 
                                  borderRadius: 1 
                                }}>
                                  <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                                    {item.value}
                                  </Typography>
                                  <Button
                                    size="small"
                                    startIcon={<ContentCopy />}
                                    onClick={() => copyToClipboard(item.value)}
                                    variant="contained"
                                    color="primary"
                                    sx={{ ml: 1, flexShrink: 0 }}
                                  >
                                    Copiar
                                  </Button>
                                </Box>
                              </Box>
                            ))}
          
                            {/* BANCO */}
                            <Box sx={{ p: 2, bgcolor: '#E8F5E9', borderRadius: 2, mt: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Banco
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccountBalance sx={{ mr: 2, color: '#4CAF50', fontSize: 30 }} />
                                <Typography variant="body1" fontWeight={700} color="#4CAF50">
                                  {pixInfo.banco}
                                </Typography>
                              </Box>
                            </Box>
          
                            {/* QR CODE VISUAL */}
                            <Box sx={{ 
                              width: '100%', 
                              height: 300, 
                              bgcolor: '#f8f9fa', 
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mt: 4,
                              p: 2,
                              border: '1px dashed #4CAF50'
                            }}>
                              <Box sx={{ textAlign: 'center' }}>
                                {/* Substituindo o ícone pelo QR Code como imagem */}
                                <Box
                                  component="img"
                                  src="/qrcode.png" // aqui vai o caminho da sua imagem
                                  alt="QR Code PIX"
                                  sx={{
                                    width: 200,    // ajuste o tamanho conforme necessário
                                    height: 200,
                                    mb: 1
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <br></br>

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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}> Tamanho máximo: 2MB • Formatos: PDF, JPG, PNG </Typography>
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
        
        
        {dupla.status === 'recusado' && (
          <Link href="/inscricao/nova" passHref>
            <Button variant="contained" color="primary" startIcon={<Person />}>
              Nova Inscrição
            </Button>
          </Link>
        )}
      </Box>
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