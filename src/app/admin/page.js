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
  LinearProgress
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
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// API functions
const adminAPI = {
  // Buscar inscrições
  async getInscricoes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`/api/admin/inscricoes?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar inscrições');
    return response.json();
  },

  // Buscar estatísticas
  async getEstatisticas() {
    const response = await fetch('/api/admin/estatisticas');
    if (!response.ok) throw new Error('Erro ao buscar estatísticas');
    return response.json();
  },

  // Atualizar status da inscrição
  async updateStatus(inscricaoId, status, motivo = '') {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        motivo_recusa: motivo 
      })
    });
    if (!response.ok) throw new Error('Erro ao atualizar status');
    return response.json();
  },

  // Buscar detalhes da inscrição
  async getInscricaoDetalhes(inscricaoId) {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}`);
    if (!response.ok) throw new Error('Erro ao buscar detalhes');
    return response.json();
  },

  // Buscar arquivos da inscrição
  async getArquivos(inscricaoId) {
    const response = await fetch(`/api/admin/inscricoes/${inscricaoId}/arquivos`);
    if (!response.ok) throw new Error('Erro ao buscar arquivos');
    return response.json();
  }
};

const AdminInscricoes = () => {
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
    severity: 'success'
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [tabValue, filtroCategoria, searchText]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      // Mapear tab para status
      const statusMap = {
        0: 'pendente', // Pendentes
        1: 'confirmado', // Confirmadas
        2: 'recusado' // Recusadas
      };
      
      filters.status = statusMap[tabValue];
      if (filtroCategoria !== 'Todas') filters.categoria = filtroCategoria;
      if (searchText) filters.search = searchText;
      
      const data = await adminAPI.getInscricoes(filters);
      setInscricoes(data.inscricoes || []);
      
      // Carregar estatísticas apenas uma vez
      if (!estatisticas && tabValue === 0) {
        setLoadingEstatisticas(true);
        const stats = await adminAPI.getEstatisticas();
        setEstatisticas(stats);
        setLoadingEstatisticas(false);
      }
    } catch (error) {
      showSnackbar('Erro ao carregar dados: ' + error.message, 'error');
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
      const detalhes = await adminAPI.getInscricaoDetalhes(inscricao.id);
      const arquivos = await adminAPI.getArquivos(inscricao.id);
      setSelectedInscricao({
        ...inscricao,
        detalhes: detalhes.dupla,
        arquivos: arquivos.arquivos
      });
      setOpenDialog(true);
    } catch (error) {
      showSnackbar('Erro ao carregar detalhes: ' + error.message, 'error');
    }
  };

  const handleAceitarInscricao = async (inscricaoId) => {
    try {
      await adminAPI.updateStatus(inscricaoId, 'confirmado');
      showSnackbar('Inscrição confirmada com sucesso!', 'success');
      loadData(); // Recarregar dados
      setOpenDialog(false);
    } catch (error) {
      showSnackbar('Erro ao confirmar inscrição: ' + error.message, 'error');
    }
  };

  const handleRecusarInscricao = async () => {
    if (!selectedInscricao || !motivoRecusa.trim()) return;
    
    try {
      await adminAPI.updateStatus(selectedInscricao.id, 'recusado', motivoRecusa);
      showSnackbar('Inscrição recusada com sucesso!', 'info');
      loadData(); // Recarregar dados
      setOpenRecusaDialog(false);
      setOpenDialog(false);
      setMotivoRecusa('');
    } catch (error) {
      showSnackbar('Erro ao recusar inscrição: ' + error.message, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendente':
      case 'aguardando_pagamento':
        return 'warning';
      case 'confirmado':
        return 'success';
      case 'recusado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pendente':
      case 'aguardando_pagamento':
        return <PendingIcon />;
      case 'confirmado':
        return <CheckCircleIcon />;
      case 'recusado':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'aguardando_pagamento':
        return 'AGUARDANDO PAGAMENTO';
      case 'pendente':
        return 'EM ANÁLISE';
      case 'confirmado':
        return 'CONFIRMADO';
      case 'recusado':
        return 'RECUSADO';
      default:
        return status.toUpperCase();
    }
  };

  // Renderizar conteúdo baseado na tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    switch(tabValue) {
      case 0: // Pendentes
        return renderPendentes();
      case 1: // Confirmadas
        return renderConfirmadas();
      case 2: // Recusadas
        return renderRecusadas();
      default:
        return null;
    }
  };

  const renderPendentes = () => {
    const pendentes = inscricoes.filter(i => 
      i.status === 'pendente' || i.status === 'aguardando_pagamento'
    );

    if (pendentes.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhuma inscrição pendente no momento.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {pendentes.map((inscricao) => (
          <Grid item xs={12} sm={6} md={4} key={inscricao.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" color="primary">
                    {inscricao.codigo}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(inscricao.status)}
                    label={getStatusLabel(inscricao.status)}
                    color={getStatusColor(inscricao.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {inscricao.responsavel}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📧 {inscricao.email}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📱 {inscricao.telefone}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Categoria: {inscricao.categoria}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Valor:</strong> {formatCurrency(inscricao.valor)}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Data:</strong> {formatDateTime(inscricao.dataInscricao)}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewInscricao(inscricao)}
                    variant="outlined"
                  >
                    Ver Detalhes
                  </Button>
                  {inscricao.status === 'pendente' && (
                    <Box>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleAceitarInscricao(inscricao.id)}
                        sx={{ mr: 1 }}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                          setSelectedInscricao(inscricao);
                          setOpenRecusaDialog(true);
                        }}
                      >
                        Recusar
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderConfirmadas = () => {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Buscar..."
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoria"
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <MenuItem value="Todas">Todas as categorias</MenuItem>
                {inscricoes
                  .map(i => i.categoria)
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Dupla</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inscricoes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((inscricao) => (
                  <TableRow key={inscricao.id}>
                    <TableCell>{inscricao.codigo}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{inscricao.responsavel}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inscricao.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">• {inscricao.jogador1.nome}</Typography>
                        <Typography variant="body2">• {inscricao.jogador2.nome}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{inscricao.categoria}</TableCell>
                    <TableCell>{formatCurrency(inscricao.valor)}</TableCell>
                    <TableCell>{formatDate(inscricao.dataInscricao)}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewInscricao(inscricao)}
                      >
                        Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
        />
      </>
    );
  };

  const renderRecusadas = () => {
    if (inscricoes.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhuma inscrição recusada.
        </Alert>
      );
    }

    return (
      <List>
        {inscricoes.map((inscricao) => (
          <React.Fragment key={inscricao.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <CancelIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      {inscricao.codigo} - {inscricao.responsavel}
                    </Typography>
                    <Chip
                      label="RECUSADA"
                      color="error"
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Dupla:</strong> {inscricao.jogador1.nome} & {inscricao.jogador2.nome}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Categoria:</strong> {inscricao.categoria} • 
                      <strong> Valor:</strong> {formatCurrency(inscricao.valor)}
                    </Typography>
                    {inscricao.motivoRecusa && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Motivo:</strong> {inscricao.motivoRecusa}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  startIcon={<ViewIcon />}
                  onClick={() => handleViewInscricao(inscricao)}
                  size="small"
                >
                  Detalhes
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header com estatísticas */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <DashboardIcon sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Painel Administrativo
              </Typography>
              <Typography variant="subtitle1">
                Gerenciamento de Inscrições
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>

        {/* Estatísticas */}
        {loadingEstatisticas ? (
          <LinearProgress sx={{ mt: 2 }} />
        ) : estatisticas && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {estatisticas?.por_status?.pendentes || 0}
                    </Typography>
                    <Typography variant="h6">Pendentes</Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {estatisticas?.por_status?.confirmadas || 0}
                    </Typography>
                    <Typography variant="h6">Confirmadas</Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {estatisticas?.por_status?.recusadas || 0}
                    </Typography>
                    <Typography variant="h6">Recusadas</Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge badgeContent={estatisticas?.por_status?.pendentes || 0} color="warning">
                <Box display="flex" alignItems="center">
                  <PendingIcon sx={{ mr: 1 }} />
                  Pendentes
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={estatisticas?.por_status?.confirmadas || 0} color="success">
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  Confirmadas
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={estatisticas?.por_status?.recusadas || 0} color="error">
                <Box display="flex" alignItems="center">
                  <CancelIcon sx={{ mr: 1 }} />
                  Recusadas
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Conteúdo */}
      <Paper sx={{ p: 3 }}>
        {renderTabContent()}
      </Paper>

      {/* Dialog de detalhes */}
      {selectedInscricao && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">
                Detalhes da Inscrição - {selectedInscricao.codigo}
              </Typography>
              <Chip
                icon={getStatusIcon(selectedInscricao.status)}
                label={getStatusLabel(selectedInscricao.status)}
                color={getStatusColor(selectedInscricao.status)}
              />
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Informações do responsável */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Informações do Responsável
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={selectedInscricao.responsavel}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={selectedInscricao.email}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={selectedInscricao.telefone}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Informações da dupla */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Informações da Dupla
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Jogador 1"
                      value={selectedInscricao.jogador1.nome}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Idade: {selectedInscricao.jogador1.idade} anos • 
                      Camisa: {selectedInscricao.jogador1.camisa}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Jogador 2"
                      value={selectedInscricao.jogador2.nome}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Idade: {selectedInscricao.jogador2.idade} anos • 
                      Camisa: {selectedInscricao.jogador2.camisa}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Informações da inscrição */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Informações da Inscrição
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Categoria"
                      value={selectedInscricao.categoria}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valor"
                      value={formatCurrency(selectedInscricao.valor)}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data da Inscrição"
                      value={formatDateTime(selectedInscricao.dataInscricao)}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Status do Pagamento"
                      value={selectedInscricao.pagamento}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Arquivos */}
              {selectedInscricao.arquivos && selectedInscricao.arquivos.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Arquivos Anexados
                    </Typography>
                    <List>
                      {selectedInscricao.arquivos.map((arquivo, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar>
                              <AttachFileIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={arquivo.descricao}
                            secondary={formatDateTime(arquivo.criado_em)}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              size="small"
                              href={arquivo.blob_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Fechar
            </Button>
            {selectedInscricao.status === 'pendente' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => handleAceitarInscricao(selectedInscricao.id)}
                >
                  Aceitar Inscrição
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => {
                    setOpenDialog(false);
                    setOpenRecusaDialog(true);
                  }}
                >
                  Recusar Inscrição
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog de recusa */}
      <Dialog open={openRecusaDialog} onClose={() => setOpenRecusaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Recusar Inscrição
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Você está prestes a recusar a inscrição de <strong>{selectedInscricao?.responsavel}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Código: {selectedInscricao?.codigo}
          </Typography>
          
          <TextField
            fullWidth
            label="Motivo da Recusa"
            multiline
            rows={4}
            value={motivoRecusa}
            onChange={(e) => setMotivoRecusa(e.target.value)}
            placeholder="Digite o motivo da recusa..."
            margin="normal"
            required
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenRecusaDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRecusarInscricao}
            disabled={!motivoRecusa.trim()}
          >
            Confirmar Recusa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AlertComponent onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </AlertComponent>
      </Snackbar>
    </Container>
  );
};

export default AdminInscricoes;