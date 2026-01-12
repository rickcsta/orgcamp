'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Badge,
  Avatar,
  InputAdornment,
  CircularProgress,
  Snackbar,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Category as CategoryIcon,
  Groups as GroupsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AttachFile as AttachFileIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Sports as SportsIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  OpenInNew as OpenInNewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// API functions (mantido igual)
const adminAPI = {
  async getInscricoes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`/api/admin/inscricoes?${params}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar inscrições');
    }
    return response.json();
  },

  async getEstatisticas() {
    const response = await fetch('/api/admin/estatisticas');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar estatísticas');
    }
    return response.json();
  },

  async updateStatus(inscricaoId, status, motivo = '') {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        motivo_recusa: motivo 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar status');
    }
    return response.json();
  },

  async getInscricaoDetalhes(inscricaoId) {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar detalhes');
    }
    return response.json();
  },

  async getArquivos(inscricaoId) {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}/arquivos`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar arquivos');
    }
    return response.json();
  }
};

const AdminInscricoes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [tabValue, setTabValue] = useState(0);
  const [inscricoes, setInscricoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
  const [selectedInscricao, setSelectedInscricao] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRecusaDialog, setOpenRecusaDialog] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    icon: null
  });
  const [dialogTab, setDialogTab] = useState(0);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [tabValue, filtroCategoria, searchText]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      const statusMap = {
        0: 'pendente',
        1: 'confirmado',
        2: 'recusado'
      };
      
      filters.status = statusMap[tabValue];
      
      if (filtroCategoria !== 'Todas') filters.categoria = filtroCategoria;
      if (searchText) filters.search = searchText;
      
      const data = await adminAPI.getInscricoes(filters);
      setInscricoes(data.inscricoes || []);
      
      if (!estatisticas && tabValue === 0) {
        setLoadingEstatisticas(true);
        try {
          const stats = await adminAPI.getEstatisticas();
          setEstatisticas(stats);
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
        } finally {
          setLoadingEstatisticas(false);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      showSnackbar('Erro ao carregar dados', 'error', <WarningIcon />);
    } finally {
      setLoading(false);
    }
  };

  const getBlobUrl = (blobData) => {
    if (!blobData) return '';
    
    try {
      if (typeof blobData === 'string' && blobData.startsWith('{')) {
        const parsed = JSON.parse(blobData);
        return parsed.url || parsed.downloadUrl || '';
      }
      else if (typeof blobData === 'object' && blobData !== null) {
        return blobData.url || blobData.downloadUrl || '';
      }
      else if (typeof blobData === 'string' && blobData.startsWith('http')) {
        return blobData;
      }
      return '';
    } catch (error) {
      console.error('Erro ao extrair URL do blob:', error);
      return '';
    }
  };

  const getDownloadUrl = (blobData) => {
    if (!blobData) return '';
    
    try {
      if (typeof blobData === 'string' && blobData.startsWith('{')) {
        const parsed = JSON.parse(blobData);
        return parsed.downloadUrl || parsed.url || '';
      }
      else if (typeof blobData === 'object' && blobData !== null) {
        return blobData.downloadUrl || blobData.url || '';
      }
      else if (typeof blobData === 'string' && blobData.startsWith('http')) {
        if (blobData.includes('?download=')) return blobData;
        return `${blobData}?download=1`;
      }
      return '';
    } catch (error) {
      console.error('Erro ao extrair download URL:', error);
      return '';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleViewInscricao = async (inscricao) => {
    try {
      const [detalhes, arquivos] = await Promise.all([
        adminAPI.getInscricaoDetalhes(inscricao.id),
        adminAPI.getArquivos(inscricao.id)
      ]);
      
      setSelectedInscricao({
        ...inscricao,
        detalhes: detalhes.dupla,
        arquivos: arquivos.arquivos || []
      });
      setOpenDialog(true);
      setDialogTab(0);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      showSnackbar('Erro ao carregar detalhes', 'error', <WarningIcon />);
    }
  };

  const handleAceitarInscricao = async (inscricaoId) => {
    try {
      await adminAPI.updateStatus(inscricaoId, 'confirmado');
      showSnackbar('Inscrição confirmada com sucesso!', 'success', <CheckCircleIcon />);
      
      setInscricoes(prev => prev.filter(insc => insc.id !== inscricaoId));
      
      if (estatisticas) {
        setEstatisticas(prev => ({
          ...prev,
          por_status: {
            ...prev.por_status,
            pendentes: Math.max(0, (prev.por_status?.pendentes || 0) - 1),
            confirmadas: (prev.por_status?.confirmadas || 0) + 1
          }
        }));
      }
      
      setOpenDialog(false);
      setSelectedInscricao(null);
    } catch (error) {
      console.error('Erro ao confirmar inscrição:', error);
      showSnackbar('Erro ao confirmar inscrição', 'error', <WarningIcon />);
    }
  };

  const handleRecusarInscricao = async () => {
    if (!selectedInscricao || !motivoRecusa.trim()) {
      showSnackbar('Por favor, informe o motivo da recusa', 'warning', <WarningIcon />);
      return;
    }
    
    try {
      await adminAPI.updateStatus(selectedInscricao.id, 'recusado', motivoRecusa);
      showSnackbar('Inscrição recusada com sucesso!', 'info', <InfoIcon />);
      
      setInscricoes(prev => prev.filter(insc => insc.id !== selectedInscricao.id));
      
      if (estatisticas) {
        setEstatisticas(prev => ({
          ...prev,
          por_status: {
            ...prev.por_status,
            pendentes: Math.max(0, (prev.por_status?.pendentes || 0) - 1),
            recusadas: (prev.por_status?.recusadas || 0) + 1
          }
        }));
      }
      
      setOpenRecusaDialog(false);
      setOpenDialog(false);
      setMotivoRecusa('');
      setSelectedInscricao(null);
    } catch (error) {
      console.error('Erro ao recusar inscrição:', error);
      showSnackbar('Erro ao recusar inscrição', 'error', <WarningIcon />);
    }
  };

  const showSnackbar = (message, severity = 'success', icon = null) => {
    setSnackbar({ open: true, message, severity, icon });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isMobile) {
        return date.toLocaleDateString('pt-BR');
      }
      return date.toLocaleDateString('pt-BR') + ' ' + 
             date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendente': return 'warning';
      case 'aguardando_pagamento': return 'info';
      case 'confirmado': return 'success';
      case 'recusado':
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pendente': return <PendingIcon />;
      case 'aguardando_pagamento': return <AccessTimeIcon />;
      case 'confirmado': return <CheckCircleIcon />;
      case 'recusado':
      case 'cancelado': return <CancelIcon />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'aguardando_pagamento': return isMobile ? 'PAGTO' : 'AGUARDANDO PAGAMENTO';
      case 'pendente': return isMobile ? 'ANÁLISE' : 'EM ANÁLISE';
      case 'confirmado': return isMobile ? 'OK' : 'CONFIRMADO';
      case 'recusado': return isMobile ? 'RECUSADO' : 'RECUSADO';
      case 'cancelado': return isMobile ? 'CANC' : 'CANCELADO';
      default: return status?.toUpperCase() || '';
    }
  };

  const getStatusTooltip = (status) => {
    switch(status) {
      case 'pendente': return 'Inscrição aguardando análise administrativa';
      case 'aguardando_pagamento': return 'Aguardando confirmação de pagamento';
      case 'confirmado': return 'Inscrição validada e confirmada';
      case 'recusado': return 'Inscrição recusada pela administração';
      case 'cancelado': return 'Inscrição cancelada automaticamente';
      default: return 'Status da inscrição';
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setFiltroCategoria('Todas');
  };

  const handleDialogTabChange = (event, newValue) => {
    setDialogTab(newValue);
  };

  const getFileIcon = (tipo) => {
    if (tipo.includes('pdf')) return <PdfIcon />;
    if (tipo.includes('image')) return <ImageIcon />;
    return <FileIcon />;
  };

  // Determinar número de cards por linha baseado no tamanho da tela
  const getGridSize = () => {
    if (isMobile) return 12;
    if (isTablet) return 6;
    return tabValue === 1 ? 6 : 4;
  };

  // Renderizar conteúdo baseado na tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={6} flexDirection="column">
          <CircularProgress size={isMobile ? 40 : 60} thickness={4} />
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ mt: 3 }}>
            Carregando inscrições...
          </Typography>
          {!isMobile && (
            <Typography variant="body2" color="text.secondary">
              Isso pode levar alguns segundos
            </Typography>
          )}
        </Box>
      );
    }

    const currentInscricoes = inscricoes.filter(i => {
      if (tabValue === 0) return i.status === 'pendente';
      if (tabValue === 1) return i.status === 'confirmado';
      if (tabValue === 2) return i.status === 'recusado';
      return true;
    });

    if (currentInscricoes.length === 0) {
      return (
        <Box textAlign="center" py={isMobile ? 4 : 8}>
          <SportsIcon sx={{ 
            fontSize: isMobile ? 60 : 80, 
            color: 'text.disabled', 
            mb: 2, 
            opacity: 0.5 
          }} />
          <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" gutterBottom>
            {tabValue === 0 && 'Nenhuma inscrição pendente'}
            {tabValue === 1 && 'Nenhuma inscrição confirmada'}
            {tabValue === 2 && 'Nenhuma inscrição recusada'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabValue === 0 && 'Todas as inscrições pendentes já foram processadas.'}
            {tabValue === 1 && 'As inscrições confirmadas aparecerão aqui.'}
            {tabValue === 2 && 'Nenhuma inscrição foi recusada até o momento.'}
          </Typography>
          {searchText && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
              sx={{ mt: 2 }}
              size={isMobile ? "small" : "medium"}
            >
              Limpar filtros
            </Button>
          )}
        </Box>
      );
    }

    // Cards responsivos
    return (
      <Grid container spacing={isMobile ? 2 : 3}>
        {currentInscricoes
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((inscricao) => (
            <Grid item xs={12} sm={6} md={getGridSize()} key={inscricao.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleViewInscricao(inscricao)}
              >
                <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1} flex={1} overflow="hidden">
                      <Tooltip title={getStatusTooltip(inscricao.status)} arrow>
                        <Avatar sx={{ 
                          bgcolor: `${getStatusColor(inscricao.status)}.main`,
                          width: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40
                        }}>
                          {getStatusIcon(inscricao.status)}
                        </Avatar>
                      </Tooltip>
                      <Box flex={1} minWidth={0}>
                        <Typography 
                          variant={isMobile ? "subtitle2" : "h6"} 
                          color="primary" 
                          fontWeight="bold"
                          noWrap
                        >
                          {isMobile ? inscricao.codigo.split('-')[0] : inscricao.codigo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(inscricao.dataInscricao)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Chip
                      size={isMobile ? "small" : "medium"}
                      label={getStatusLabel(inscricao.status)}
                      color={getStatusColor(inscricao.status)}
                      sx={{ 
                        fontWeight: 600,
                        ml: 1,
                        fontSize: isMobile ? '0.7rem' : '0.875rem'
                      }}
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography 
                      variant={isMobile ? "body2" : "subtitle1"} 
                      fontWeight="bold" 
                      gutterBottom
                      noWrap
                    >
                      {inscricao.responsavel}
                    </Typography>
                    
                    <Stack spacing={0.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                        <Typography 
                          variant={isMobile ? "caption" : "body2"} 
                          color="text.secondary" 
                          noWrap
                        >
                          {inscricao.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                        <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                          {inscricao.telefone}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box mb={2}>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" gutterBottom>
                      Categoria
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                      {inscricao.categoria}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        Valor
                      </Typography>
                      <Typography 
                        variant={isMobile ? "body2" : "h6"} 
                        color="primary" 
                        fontWeight="bold"
                      >
                        {formatCurrency(inscricao.valor)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        Dupla
                      </Typography>
                      <Typography variant={isMobile ? "caption" : "body2"}>
                        {inscricao.jogador1?.nome?.split(' ')[0]} & {inscricao.jogador2?.nome?.split(' ')[0]}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                {tabValue === 0 && (
                  <CardActions sx={{ 
                    p: isMobile ? 1 : 2, 
                    pt: 0, 
                    gap: isMobile ? 0.5 : 1,
                    justifyContent: 'space-between'
                  }}>
                    <Tooltip title="Aceitar inscrição" arrow>
                      <Button
                        size={isMobile ? "small" : "medium"}
                        variant="contained"
                        color="success"
                        startIcon={isMobile ? null : <CheckIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInscricao(inscricao);
                          handleAceitarInscricao(inscricao.id);
                        }}
                        fullWidth={isMobile}
                      >
                        {isMobile ? '✓' : 'Aceitar'}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Recusar inscrição" arrow>
                      <Button
                        size={isMobile ? "small" : "medium"}
                        variant="outlined"
                        color="error"
                        startIcon={isMobile ? null : <CloseIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInscricao(inscricao);
                          setOpenRecusaDialog(true);
                        }}
                        fullWidth={isMobile}
                      >
                        {isMobile ? '✕' : 'Recusar'}
                      </Button>
                    </Tooltip>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
      </Grid>
    );
  };

  const renderDialogContent = () => {
    if (!selectedInscricao) return null;

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          overflow: 'auto'
        }}>
          <Tabs 
            value={dialogTab} 
            onChange={handleDialogTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab icon={isMobile ? null : <PersonIcon />} label="Responsável" />
            <Tab icon={isMobile ? null : <GroupsIcon />} label="Dupla" />
            <Tab icon={isMobile ? null : <DescriptionIcon />} label="Inscrição" />
            <Tab 
              icon={isMobile ? null : <AttachFileIcon />} 
              label={`Arq. (${selectedInscricao.arquivos?.length || 0})`} 
            />
          </Tabs>
        </Box>
        
        <Box sx={{ pt: 2 }}>
          {dialogTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  value={selectedInscricao.responsavel}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedInscricao.email}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={selectedInscricao.telefone}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data da inscrição"
                  value={formatDateTime(selectedInscricao.dataInscricao)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
          )}
          
          {dialogTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} color="primary" gutterBottom>
                    Jogador 1
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold" gutterBottom>
                    {selectedInscricao.jogador1?.nome || 'N/A'}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Data Nasc.:</strong> {formatDate(selectedInscricao.jogador1?.nascimento)}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Idade:</strong> {selectedInscricao.jogador1?.idade || 'N/A'} anos
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Camisa:</strong> {selectedInscricao.jogador1?.camisa || 'N/A'}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} color="primary" gutterBottom>
                    Jogador 2
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold" gutterBottom>
                    {selectedInscricao.jogador2?.nome || 'N/A'}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Data Nasc.:</strong> {formatDate(selectedInscricao.jogador2?.nascimento)}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Idade:</strong> {selectedInscricao.jogador2?.idade || 'N/A'} anos
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Camisa:</strong> {selectedInscricao.jogador2?.camisa || 'N/A'}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {dialogTab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Categoria"
                  value={selectedInscricao.categoria}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor total"
                  value={formatCurrency(selectedInscricao.valor)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Status"
                  value={getStatusLabel(selectedInscricao.status)}
                  InputProps={{ 
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        {getStatusIcon(selectedInscricao.status)}
                      </InputAdornment>
                    )
                  }}
                  variant="outlined"
                  color={getStatusColor(selectedInscricao.status)}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              {selectedInscricao.motivoRecusa && (
                <Grid item xs={12}>
                  <Alert severity="error" icon={<WarningIcon />} sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>Motivo da recusa:</strong> {selectedInscricao.motivoRecusa}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
          
          {dialogTab === 3 && (
            <Box>
              {selectedInscricao.arquivos?.length > 0 ? (
                <Grid container spacing={1}>
                  {selectedInscricao.arquivos.map((arquivo, index) => (
                    <Grid item xs={12} key={index}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          p: 1.5,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main',
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40
                          }}>
                            {getFileIcon(arquivo.tipo)}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography 
                              variant={isMobile ? "caption" : "subtitle2"} 
                              fontWeight="medium"
                              noWrap
                            >
                              {arquivo.descricao || arquivo.tipo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(arquivo.criado_em)}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Button
                              size={isMobile ? "small" : "medium"}
                              variant="outlined"
                              startIcon={isMobile ? null : <OpenInNewIcon />}
                              href={getBlobUrl(arquivo.blob_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              disabled={!getBlobUrl(arquivo.blob_url)}
                            >
                              {isMobile ? 'Abrir' : 'Abrir'}
                            </Button>
                            <Button
                              size={isMobile ? "small" : "medium"}
                              variant="outlined"
                              startIcon={isMobile ? null : <DownloadIcon />}
                              href={getDownloadUrl(arquivo.blob_url)}
                              download
                              disabled={!getDownloadUrl(arquivo.blob_url)}
                            >
                              {isMobile ? 'Baixar' : 'Baixar'}
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={isMobile ? 2 : 4}>
                  <AttachFileIcon sx={{ 
                    fontSize: isMobile ? 40 : 60, 
                    color: 'text.disabled', 
                    mb: 1, 
                    opacity: 0.5 
                  }} />
                  <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" gutterBottom>
                    Nenhum arquivo
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Esta inscrição não possui arquivos anexados
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 2 : 3
      }}
    >
      {/* Header */}
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3, 
          mb: isMobile ? 2 : 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: isMobile ? 2 : 3,
          boxShadow: 2
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
            <Avatar sx={{ 
              bgcolor: 'white', 
              color: 'primary.main', 
              width: isMobile ? 40 : 56, 
              height: isMobile ? 40 : 56 
            }}>
              <DashboardIcon fontSize={isMobile ? "medium" : "large"} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h4"} fontWeight="bold">
                {isMobile ? 'Admin' : 'Painel Administrativo'}
              </Typography>
              <Typography variant={isMobile ? "caption" : "subtitle1"} sx={{ opacity: 0.9 }}>
                {isMobile ? 'Inscrições' : 'Gerenciamento de Inscrições'}
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="Atualizar todos os dados" arrow>
            <Button
              variant="contained"
              color="secondary"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              onClick={loadData}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s',
                minWidth: isMobile ? 'auto' : 'initial'
              }}
            >
              {isMobile ? (loading ? '' : 'Atualizar') : (loading ? 'Atualizando...' : 'Atualizar Dados')}
            </Button>
          </Tooltip>
        </Box>

        {/* Estatísticas */}
        <Box sx={{ mt: 3 }}>
          {loadingEstatisticas ? (
            <Box textAlign="center" py={2}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, display: 'block' }}>
                Carregando estatísticas...
              </Typography>
            </Box>
          ) : estatisticas ? (
            <Grid container spacing={1}>
              {[
                { label: 'Pendentes', value: estatisticas.por_status?.pendentes || 0, color: 'warning', icon: <PendingIcon /> },
                { label: 'Confirmadas', value: estatisticas.por_status?.confirmadas || 0, color: 'success', icon: <CheckCircleIcon /> },
                { label: 'Recusadas', value: estatisticas.por_status?.recusadas || 0, color: 'error', icon: <CancelIcon /> },
                { label: 'Total', value: estatisticas.total_inscricoes || 0, color: 'info', icon: <SpeedIcon /> }
              ].map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card
                    sx={{
                      p: isMobile ? 1 : 1.5,
                      bgcolor: `${stat.color}.main`,
                      color: 'white',
                      borderRadius: 1.5,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography 
                          variant={isMobile ? "h5" : "h3"} 
                          fontWeight="bold"
                          lineHeight={1}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant={isMobile ? "caption" : "body2"} 
                          sx={{ opacity: 0.9 }}
                        >
                          {isMobile ? stat.label.substring(0, 4) : stat.label}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'white',
                          color: `${stat.color}.main`,
                          width: isMobile ? 28 : 36,
                          height: isMobile ? 28 : 36
                        }}
                      >
                        {React.cloneElement(stat.icon, { 
                          fontSize: isMobile ? "small" : "medium" 
                        })}
                      </Avatar>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert 
              severity="info" 
              icon={<InfoIcon />} 
              sx={{ 
                bgcolor: 'white', 
                color: 'black',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              <Typography variant={isMobile ? "caption" : "body2"}>
                Clique em "Atualizar" para carregar estatísticas
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Filtros e Busca */}
      <Paper sx={{ 
        p: isMobile ? 1.5 : 2, 
        mb: isMobile ? 2 : 3, 
        borderRadius: 2 
      }}>
        <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, código, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <Tooltip title="Limpar busca" arrow>
                      <IconButton 
                        size={isMobile ? "small" : "medium"} 
                        onClick={() => setSearchText('')}
                      >
                        <ClearIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoria"
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <MenuItem value="Todas">Todas as categorias</MenuItem>
                {inscricoes
                  .map(i => i.categoria)
                  .filter((value, index, self) => self.indexOf(value) === index && value)
                  .map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={isMobile ? null : <FilterIcon />}
              onClick={handleClearSearch}
              disabled={!searchText && filtroCategoria === 'Todas'}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? 'Limpar' : 'Limpar Filtros'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ 
        mb: isMobile ? 2 : 3, 
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            minHeight: isMobile ? 48 : 64,
            '& .MuiTab-root': {
              fontWeight: 600,
              minHeight: isMobile ? 48 : 64,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              px: isMobile ? 1 : 2
            }
          }}
        >
          {[
            { 
              label: 'Em Análise', 
              icon: <PendingIcon />, 
              count: estatisticas?.por_status?.pendentes || 0,
              color: 'warning'
            },
            { 
              label: 'Confirmadas', 
              icon: <CheckCircleIcon />, 
              count: estatisticas?.por_status?.confirmadas || 0,
              color: 'success'
            },
            { 
              label: 'Recusadas', 
              icon: <CancelIcon />, 
              count: estatisticas?.por_status?.recusadas || 0,
              color: 'error'
            }
          ].map((tab, index) => (
            <Tab
              key={index}
              icon={isMobile ? null : tab.icon}
              iconPosition="start"
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {isMobile && tab.icon}
                  <span>{isMobile ? tab.label.split(' ')[0] : tab.label}</span>
                  <Badge 
                    badgeContent={tab.count} 
                    color={tab.color}
                    sx={{ 
                      ml: 0.5,
                      '& .MuiBadge-badge': {
                        fontSize: isMobile ? '0.6rem' : '0.75rem',
                        height: isMobile ? 16 : 20,
                        minWidth: isMobile ? 16 : 20
                      }
                    }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Conteúdo */}
      <Paper sx={{ 
        p: isMobile ? 1.5 : 2, 
        borderRadius: 2,
        minHeight: 400
      }}>
        {renderTabContent()}
        
        {inscricoes.length > 0 && (
          <TablePagination
            rowsPerPageOptions={isMobile ? [5, 10, 25] : [10, 25, 50]}
            component="div"
            count={inscricoes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={isMobile ? "Por página:" : "Linhas por página:"}
            labelDisplayedRows={({ from, to, count }) => 
              isMobile ? `${from}-${to}` : `${from}-${to} de ${count}`
            }
            sx={{ 
              mt: 2,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }
            }}
          />
        )}
      </Paper>

      {/* Dialog de detalhes */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setSelectedInscricao(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: isMobile ? 0 : 3,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedInscricao && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1} flex={1}>
                  <Avatar sx={{ 
                    bgcolor: `${getStatusColor(selectedInscricao.status)}.main`,
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40
                  }}>
                    {getStatusIcon(selectedInscricao.status)}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      fontWeight="bold"
                      noWrap
                    >
                      #{selectedInscricao.codigo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(selectedInscricao.dataInscricao)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getStatusLabel(selectedInscricao.status)}
                  color={getStatusColor(selectedInscricao.status)}
                  sx={{ 
                    fontWeight: 600,
                    ml: 1,
                    fontSize: isMobile ? '0.7rem' : '0.875rem'
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 2 }}>
              {renderDialogContent()}
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => {
                  setOpenDialog(false);
                  setSelectedInscricao(null);
                }}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Fechar
              </Button>
              
              {selectedInscricao.status === 'pendente' && (
                <Stack 
                  direction={isMobile ? "column" : "row"} 
                  spacing={1} 
                  sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAceitarInscricao(selectedInscricao.id)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Aceitar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setOpenDialog(false);
                      setOpenRecusaDialog(true);
                    }}
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Recusar
                  </Button>
                </Stack>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de recusa */}
      <Dialog 
        open={openRecusaDialog} 
        onClose={() => {
          setOpenRecusaDialog(false);
          setMotivoRecusa('');
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
              <WarningIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h6"} fontWeight="bold">
                Recusar Inscrição
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{selectedInscricao?.codigo}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
            <Typography variant={isMobile ? "caption" : "body2"} fontWeight="medium">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </Typography>
          </Alert>
          
          <TextField
            fullWidth
            label="Motivo da recusa *"
            multiline
            rows={isMobile ? 3 : 4}
            value={motivoRecusa}
            onChange={(e) => setMotivoRecusa(e.target.value)}
            placeholder="Descreva o motivo da recusa..."
            margin="normal"
            required
            helperText="Este motivo será enviado ao responsável"
            error={!motivoRecusa.trim()}
            sx={{ mb: 2 }}
            size={isMobile ? "small" : "medium"}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenRecusaDialog(false);
              setMotivoRecusa('');
            }}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRecusarInscricao}
            disabled={!motivoRecusa.trim()}
            startIcon={<CloseIcon />}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            Confirmar Recusa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <AlertComponent 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.icon}
          sx={{ 
            width: '100%',
            maxWidth: isMobile ? '90vw' : '400px',
            '& .MuiAlert-icon': {
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }
          }}
        >
          <Typography variant={isMobile ? "body2" : "body1"}>
            {snackbar.message}
          </Typography>
        </AlertComponent>
      </Snackbar>
    </Container>
  );
};

export default AdminInscricoes;