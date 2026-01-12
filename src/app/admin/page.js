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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  CircularProgress,
  Snackbar,
  IconButton,
  Stack,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab as MuiTab,
  Tabs as MuiTabs,
  Fade,
  Zoom,
  Slide,
  CardMedia,
  CardHeader,
  alpha,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  AccessTime as AccessTimeIcon,
  Paid as PaidIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Sports as SportsIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  DeleteOutline as DeleteOutlineIcon,
  Upload as UploadIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// API functions
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
      
      // Atualização otimizada - não recarrega tudo
      setInscricoes(prev => prev.filter(insc => insc.id !== inscricaoId));
      
      // Atualizar estatísticas localmente
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
      
      // Atualização otimizada
      setInscricoes(prev => prev.filter(insc => insc.id !== selectedInscricao.id));
      
      // Atualizar estatísticas localmente
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
      case 'aguardando_pagamento': return 'AGUARDANDO PAGAMENTO';
      case 'pendente': return 'EM ANÁLISE';
      case 'confirmado': return 'CONFIRMADO';
      case 'recusado': return 'RECUSADO';
      case 'cancelado': return 'CANCELADO';
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

  // Renderizar conteúdo baseado na tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={6} flexDirection="column">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
            Carregando inscrições...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Isso pode levar alguns segundos
          </Typography>
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
        <Box textAlign="center" py={8}>
          <SportsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {tabValue === 0 && 'Nenhuma inscrição pendente'}
            {tabValue === 1 && 'Nenhuma inscrição confirmada'}
            {tabValue === 2 && 'Nenhuma inscrição recusada'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
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
            >
              Limpar filtros
            </Button>
          )}
        </Box>
      );
    }

    // Cards para todas as abas
    return (
      <Grid container spacing={3}>
        {currentInscricoes
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((inscricao) => (
            <Grid item xs={12} sm={6} md={tabValue === 1 ? 6 : 4} key={inscricao.id}>
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
                    boxShadow: 6,
                    borderColor: 'primary.main',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleViewInscricao(inscricao)}
              >
                <CardHeader
                  avatar={
                    <Tooltip title={getStatusTooltip(inscricao.status)} arrow>
                      <Avatar sx={{ bgcolor: `${getStatusColor(inscricao.status)}.main` }}>
                        {getStatusIcon(inscricao.status)}
                      </Avatar>
                    </Tooltip>
                  }
                  action={
                    <Tooltip title="Ver detalhes" arrow>
                      <IconButton>
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {inscricao.codigo}
                      </Typography>
                      <Chip
                        size="small"
                        label={getStatusLabel(inscricao.status)}
                        color={getStatusColor(inscricao.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  }
                  subheader={formatDateTime(inscricao.dataInscricao)}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                    {inscricao.responsavel}
                  </Typography>
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {inscricao.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {inscricao.telefone}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Categoria
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {inscricao.categoria}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valor
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatCurrency(inscricao.valor)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Dupla
                      </Typography>
                      <Typography variant="body2">
                        {inscricao.jogador1?.nome?.split(' ')[0]} & {inscricao.jogador2?.nome?.split(' ')[0]}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                
                {tabValue === 0 && (
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Tooltip title="Aceitar inscrição" arrow>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInscricao(inscricao);
                          handleAceitarInscricao(inscricao.id);
                        }}
                      >
                        Aceitar
                      </Button>
                    </Tooltip>
                    <Tooltip title="Recusar inscrição" arrow>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInscricao(inscricao);
                          setOpenRecusaDialog(true);
                        }}
                      >
                        Recusar
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <MuiTabs value={dialogTab} onChange={handleDialogTabChange}>
            <MuiTab icon={<PersonIcon />} label="Responsável" />
            <MuiTab icon={<GroupsIcon />} label="Dupla" />
            <MuiTab icon={<DescriptionIcon />} label="Inscrição" />
            <MuiTab 
              icon={<AttachFileIcon />} 
              label={`Arquivos (${selectedInscricao.arquivos?.length || 0})`} 
            />
          </MuiTabs>
        </Box>
        
        <Box sx={{ pt: 3 }}>
          {dialogTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  value={selectedInscricao.responsavel}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedInscricao.email}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={selectedInscricao.telefone}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data da inscrição"
                  value={formatDateTime(selectedInscricao.dataInscricao)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
          
          {dialogTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Jogador 1
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {selectedInscricao.jogador1?.nome || 'N/A'}
                  </Typography>
                  <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Data de Nascimento:</strong> {formatDate(selectedInscricao.jogador1?.nascimento)}
                      </Typography>
                    <Typography variant="body2">
                      <strong>Idade:</strong> {selectedInscricao.jogador1?.idade || 'N/A'} anos
                    </Typography>
                    <Typography variant="body2">
                      <strong>Camisa:</strong> {selectedInscricao.jogador1?.camisa || 'N/A'}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Jogador 2
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {selectedInscricao.jogador2?.nome || 'N/A'}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                        <strong>Data de Nascimento:</strong> {formatDate(selectedInscricao.jogador2?.nascimento)}
                      </Typography>
                    <Typography variant="body2">
                      <strong>Idade:</strong> {selectedInscricao.jogador2?.idade || 'N/A'} anos
                    </Typography>
                    <Typography variant="body2">
                      <strong>Camisa:</strong> {selectedInscricao.jogador2?.camisa || 'N/A'}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {dialogTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Categoria"
                  value={selectedInscricao.categoria}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor total"
                  value={formatCurrency(selectedInscricao.valor)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                />
              </Grid>
              {selectedInscricao.motivoRecusa && (
                <Grid item xs={12}>
                  <Alert severity="error" icon={<WarningIcon />}>
                    <Typography variant="body2">
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
                <Grid container spacing={2}>
                  {selectedInscricao.arquivos.map((arquivo, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          p: 2,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getFileIcon(arquivo.tipo)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {arquivo.descricao || arquivo.tipo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(arquivo.criado_em)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<OpenInNewIcon />}
                             href={JSON.parse(arquivo.blob_url).url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            href={JSON.parse(arquivo.blob_url).downloadUrl}
                            download
                          >
                            Baixar
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <AttachFileIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhum arquivo anexado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 56, height: 56 }}>
              <DashboardIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Painel Administrativo
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Gerenciamento de Inscrições
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="Atualizar todos os dados" arrow>
            <Button
              variant="contained"
              color="secondary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={loadData}
              disabled={loading}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
          </Tooltip>
        </Box>

        {/* Estatísticas */}
        <Box sx={{ mt: 4 }}>
  {loadingEstatisticas ? (
    <Box textAlign="center" py={3}>
      <CircularProgress size={24} sx={{ color: 'white' }} />
      <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
        Carregando estatísticas...
      </Typography>
    </Box>
  ) : estatisticas ? (
    <Grid container spacing={2}>
      {[
        { label: 'Pendentes', value: estatisticas.por_status?.pendentes || 0, color: 'warning', icon: <PendingIcon />, tooltip: 'Inscrições aguardando análise' },
        { label: 'Confirmadas', value: estatisticas.por_status?.confirmadas || 0, color: 'success', icon: <CheckCircleIcon />, tooltip: 'Inscrições validadas' },
        { label: 'Recusadas', value: estatisticas.por_status?.recusadas || 0, color: 'error', icon: <CancelIcon />, tooltip: 'Inscrições recusadas' },
        { label: 'Total', value: estatisticas.total_inscricoes || 0, color: 'info', icon: <SpeedIcon />, tooltip: 'Total de inscrições' }
      ].map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Tooltip title={stat.tooltip} arrow>
            <Card
              sx={{
                p: 2,
                bgcolor: `${stat.color}.main`, // fundo sólido
                color: 'white',               // texto branco
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'white',      // avatar com fundo branco
                    color: `${stat.color}.main`
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </Card>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  ) : (
    <Alert severity="info" icon={<InfoIcon />} sx={{ bgcolor: 'white', color: 'black' }}>
      <Typography variant="body2">
        Clique em "Atualizar Dados" para carregar as estatísticas
      </Typography>
    </Alert>
  )}
</Box>

      </Paper>

      {/* Filtros e Busca */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, código, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <Tooltip title="Limpar busca" arrow>
                      <IconButton size="small" onClick={() => setSearchText('')}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
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
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearSearch}
              disabled={!searchText && filtroCategoria === 'Todas'}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              fontWeight: 600,
              minHeight: 64
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
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.icon}
                  {tab.label}
                  <Badge 
                    badgeContent={tab.count} 
                    color={tab.color}
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Conteúdo */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {renderTabContent()}
        
        {inscricoes.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={inscricoes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{ mt: 3 }}
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
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedInscricao && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: `${getStatusColor(selectedInscricao.status)}.main` }}>
                    {getStatusIcon(selectedInscricao.status)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      Inscrição #{selectedInscricao.codigo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(selectedInscricao.dataInscricao)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getStatusLabel(selectedInscricao.status)}
                  color={getStatusColor(selectedInscricao.status)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 2 }}>
              {renderDialogContent()}
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setOpenDialog(false);
                  setSelectedInscricao(null);
                }}
                variant="outlined"
              >
                Fechar
              </Button>
              
              {selectedInscricao.status === 'pendente' && (
                <Stack direction="row" spacing={2}>
                  <Tooltip title="Aceitar esta inscrição" arrow>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => handleAceitarInscricao(selectedInscricao.id)}
                    >
                      Aceitar
                    </Button>
                  </Tooltip>
                  <Tooltip title="Recusar esta inscrição" arrow>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => {
                        setOpenDialog(false);
                        setOpenRecusaDialog(true);
                      }}
                    >
                      Recusar
                    </Button>
                  </Tooltip>
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
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <WarningIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Recusar Inscrição
              </Typography>
              <Typography variant="body2" color="text.secondary">
                #{selectedInscricao?.codigo} • {selectedInscricao?.responsavel}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita e o responsável será notificado.
            </Typography>
          </Alert>
          
          <TextField
            fullWidth
            label="Motivo da recusa *"
            multiline
            rows={4}
            value={motivoRecusa}
            onChange={(e) => setMotivoRecusa(e.target.value)}
            placeholder="Descreva detalhadamente o motivo da recusa..."
            margin="normal"
            required
            helperText="Este motivo será enviado ao responsável pela inscrição"
            error={!motivoRecusa.trim()}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Dica:</strong> Seja claro e objetivo. Exemplo: "Documentação incompleta" ou "Pagamento não confirmado"
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setOpenRecusaDialog(false);
              setMotivoRecusa('');
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRecusarInscricao}
            disabled={!motivoRecusa.trim()}
            startIcon={<CloseIcon />}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <AlertComponent 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.icon}
          sx={{ 
            width: '100%',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            {snackbar.message}
          </Typography>
        </AlertComponent>
      </Snackbar>
    </Container>
  );
};

export default AdminInscricoes;