'use client';

import { useState, useEffect } from 'react';
import {
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar, MenuItem, Grid, Box, Card, CardContent,
  Stepper, Step, StepLabel, InputAdornment, Avatar, Chip,
  Tooltip, Divider, LinearProgress
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const steps = ['Dados da Dupla', 'Documentação', 'Pagamento', 'Confirmação'];

export default function InscricaoPage() {
  // Estados principais
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    responsavel_nome: '',
    responsavel_email: '',
    responsavel_whatsapp: '',
    categoria: '',
    jogador1_nome: '',
    jogador1_nascimento: '',
    jogador2_nome: '',
    jogador2_nascimento: ''
  });

  const [files, setFiles] = useState({
    documento_jogador1: null,
    documento_jogador2: null,
    comprovante_pagamento: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estados para pagamento
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [codigoInscricao, setCodigoInscricao] = useState('');

  // Dados do PIX
  const pixInfo = {
    nome: 'Associação Pernas na Areia',
    cnpj: '12.345.678/0001-90',
    chavePix: '12.345.678/0001-90',
    banco: 'Banco do Brasil (001)',
    valor: 'R$ 150,00'
  };

  const categorias = [
    { value: 'sub17_masculino', label: 'Sub 17 - Masculino', idade: 'Até 17 anos' },
    { value: 'sub17_feminino', label: 'Sub 17 - Feminino', idade: 'Até 17 anos' },
    { value: 'sub21_masculino', label: 'Sub 21 - Masculino', idade: 'Até 21 anos' },
    { value: 'sub21_feminino', label: 'Sub 21 - Feminino', idade: 'Até 21 anos' },
    { value: 'open_masculino', label: 'Open - Masculino', idade: 'Acima de 18 anos' },
    { value: 'open_feminino', label: 'Open - Feminino', idade: 'Acima de 18 anos' }
  ];

  // Gerar código de inscrição único
  useEffect(() => {
    if (activeStep >= 2 && !codigoInscricao) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCodigoInscricao(`PNA2024-${randomCode}`);
    }
  }, [activeStep, codigoInscricao]);

  // Contador regressivo para pagamento
  useEffect(() => {
    if (activeStep === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && activeStep === 2) {
      setSnackbar({
        open: true,
        message: 'Tempo esgotado! Sua reserva foi cancelada.',
        severity: 'error'
      });
      setTimeout(() => {
        setActiveStep(0);
        setTimeLeft(30 * 60);
      }, 3000);
    }
  }, [activeStep, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === 'comprovante_pagamento') {
        setComprovanteFile(file);
      } else {
        setFiles({ ...files, [fileType]: file });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copiado para a área de transferência!',
      severity: 'success'
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validação dos dados da dupla
      const requiredFields = ['responsavel_nome', 'responsavel_email', 'responsavel_whatsapp', 
                            'categoria', 'jogador1_nome', 'jogador1_nascimento', 
                            'jogador2_nome', 'jogador2_nascimento'];
      const isValid = requiredFields.every(field => form[field]);
      
      if (!isValid) {
        setSnackbar({
          open: true,
          message: 'Preencha todos os campos obrigatórios.',
          severity: 'error'
        });
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validação dos documentos
      if (!files.documento_jogador1 || !files.documento_jogador2) {
        setSnackbar({
          open: true,
          message: 'Anexe os documentos de idade de ambos os jogadores.',
          severity: 'error'
        });
        return;
      }
    }

    if (activeStep === 2) {
      // Validação do comprovante de pagamento
      if (!comprovanteFile) {
        setSnackbar({
          open: true,
          message: 'Anexe o comprovante de pagamento.',
          severity: 'error'
        });
        return;
      }
      
      // Simula envio do comprovante
      setSnackbar({
        open: true,
        message: 'Comprovante enviado! Sua inscrição será validada em até 24 horas.',
        severity: 'success'
      });
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 2) {
      // Resetar timer se voltar do pagamento
      setTimeLeft(30 * 60);
    }
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Aqui você enviaria os dados para a API
      console.log('Formulário completo enviado:', { form, files, comprovanteFile });
      
      setSnackbar({
        open: true,
        message: 'Inscrição finalizada com sucesso! Você receberá um e-mail de confirmação.',
        severity: 'success'
      });

      // Não resetamos o formulário aqui para mostrar os dados na confirmação
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao processar inscrição. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* COLUNA ESQUERDA - RESPONSÁVEL */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Responsável pela Inscrição
                    </Typography>
                  </Box>
                  
                  <Tooltip title="O responsável pode ser você (jogador da dupla) ou outra pessoa que fará o acompanhamento da inscrição">
                    <Chip 
                      icon={<InfoIcon />}
                      label="Pode ser jogador ou acompanhante"
                      size="small"
                      color="info"
                      sx={{ mb: 3 }}
                    />
                  </Tooltip>

                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="responsavel_nome"
                    value={form.responsavel_nome}
                    onChange={handleChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    label="E-mail"
                    type="email"
                    name="responsavel_email"
                    value={form.responsavel_email}
                    onChange={handleChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    label="WhatsApp"
                    name="responsavel_whatsapp"
                    value={form.responsavel_whatsapp}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="(11) 99999-9999"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WhatsAppIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* COLUNA DIREITA - DADOS DA DUPLA */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <PersonAddIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Dados da Dupla
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    select
                    label="Categoria"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  >
                    {categorias.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box>
                          <Typography>{cat.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cat.idade}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Jogador 1
                  </Typography>

                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="jogador1_nome"
                    value={form.jogador1_nome}
                    onChange={handleChange}
                    margin="normal"
                    size="small"
                    required
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Nascimento"
                    name="jogador1_nascimento"
                    value={form.jogador1_nascimento}
                    onChange={handleChange}
                    margin="normal"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  />

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Jogador 2
                  </Typography>

                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="jogador2_nome"
                    value={form.jogador2_nome}
                    onChange={handleChange}
                    margin="normal"
                    size="small"
                    required
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Nascimento"
                    name="jogador2_nascimento"
                    value={form.jogador2_nascimento}
                    onChange={handleChange}
                    margin="normal"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <AttachFileIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Documentação Obrigatória
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    Anexe os documentos que comprovem a idade dos jogadores (RG, CNH ou Certidão de Nascimento)
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          📋 Documento - Jogador 1
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {form.jogador1_nome || 'Nome do jogador'}
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                        >
                          {files.documento_jogador1 ? files.documento_jogador1.name : 'Escolher arquivo'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'documento_jogador1')}
                          />
                        </Button>
                        {files.documento_jogador1 && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Documento anexado"
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          📋 Documento - Jogador 2
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {form.jogador2_nome || 'Nome do jogador'}
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                        >
                          {files.documento_jogador2 ? files.documento_jogador2.name : 'Escolher arquivo'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'documento_jogador2')}
                          />
                        </Button>
                        {files.documento_jogador2 && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Documento anexado"
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={4}>
            {/* COLUNA ESQUERDA - INSCRIÇÃO AGENDADA */}
            <Grid item xs={12} md={8}>
              <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <AccessTimeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Inscrição Agendada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Código: {codigoInscricao}
                      </Typography>
                    </Box>
                  </Box>

                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      ⚠️ REALIZE O PAGAMENTO EM ATÉ {formatTime(timeLeft)}
                    </Typography>
                    <Typography variant="body2">
                      Sua vaga está reservada por 30 minutos. Após este período, sua inscrição será cancelada automaticamente.
                    </Typography>
                  </Alert>

                  <LinearProgress 
                    variant="determinate" 
                    value={(timeLeft / (30 * 60)) * 100} 
                    sx={{ mb: 3, height: 8, borderRadius: 4 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Valor Total
                        </Typography>
                        <Typography variant="h4" color="primary" fontWeight={800}>
                          {pixInfo.valor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Taxa de inscrição por dupla
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Categoria
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {categorias.find(c => c.value === form.categoria)?.label || 'Não selecionada'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.jogador1_nome} & {form.jogador2_nome}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* COMPROVANTE DE PAGAMENTO */}
                  <Box sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                        <AttachFileIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Comprovante de Pagamento
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Após realizar o pagamento via PIX, anexe o comprovante abaixo para confirmar sua inscrição.
                    </Typography>

                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                      sx={{ py: 2, mb: 1 }}
                    >
                      {comprovanteFile ? comprovanteFile.name : 'Anexar Comprovante (PDF/JPG/PNG)'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'comprovante_pagamento')}
                      />
                    </Button>

                    {comprovanteFile && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Comprovante anexado"
                        color="success"
                        sx={{ mb: 1 }}
                      />
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Formatos aceitos: PDF, JPG, PNG (tamanho máximo: 5MB)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* COLUNA DIREITA - DADOS DO PIX */}
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ borderRadius: 3, position: 'sticky', top: 20 }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'success.main', 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <QrCodeIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Pagamento via PIX
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Escaneie o QR Code ou use a chave PIX abaixo
                    </Typography>
                  </Box>

                  {/* QR CODE (simulado) */}
                  <Box sx={{ 
                    width: '100%', 
                    height: 200, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: '1px dashed #ccc'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <QrCodeIcon sx={{ fontSize: 60, color: '#666', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        QR Code PIX
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Valor: {pixInfo.valor}
                      </Typography>
                    </Box>
                  </Box>

                  {/* DADOS DA CONTA */}
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nome do Beneficiário
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {pixInfo.nome}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(pixInfo.nome)}
                      >
                        Copiar
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CNPJ/CPF
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {pixInfo.cnpj}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(pixInfo.cnpj)}
                      >
                        Copiar
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Chave PIX (CNPJ)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                        {pixInfo.chavePix}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(pixInfo.chavePix)}
                      >
                        Copiar
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Banco
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight={600}>
                        {pixInfo.banco}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Card elevation={3} sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <CardContent>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 3 
              }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              
              <Typography variant="h4" fontWeight={800} gutterBottom color="success.main">
                PAGAMENTO CONFIRMADO!
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Sua inscrição está sendo processada
              </Typography>

              <Card variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 400, mx: 'auto' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Código da Inscrição
                </Typography>
                <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                  {codigoInscricao}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Guarde este código para consultar o status
                </Typography>
              </Card>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Próximos passos:</strong>
                  <br />1. Você receberá um e-mail de confirmação em até 24 horas
                  <br />2. A equipe do evento validará seus documentos
                  <br />3. Acompanhe as atualizações pelo WhatsApp: {form.responsavel_whatsapp}
                </Typography>
              </Alert>

              <Grid container spacing={2} sx={{ mt: 4, textAlign: 'left' }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Responsável
                    </Typography>
                    <Typography><strong>Nome:</strong> {form.responsavel_nome}</Typography>
                    <Typography><strong>E-mail:</strong> {form.responsavel_email}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Dupla
                    </Typography>
                    <Typography><strong>Categoria:</strong> {categorias.find(c => c.value === form.categoria)?.label}</Typography>
                    <Typography><strong>Jogadores:</strong> {form.jogador1_nome} & {form.jogador2_nome}</Typography>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  href="/"
                  sx={{ mr: 2 }}
                  size="large"
                >
                  Voltar para o site
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.print()}
                  size="large"
                >
                  Imprimir Comprovante
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* HEADER */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <HowToRegIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom color="primary">
          {activeStep === 2 ? 'PAGAMENTO' : activeStep === 3 ? 'CONFIRMAÇÃO' : 'INSCRIÇÃO DA DUPLA'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {activeStep === 0 && 'Preencha os dados abaixo para participar do PERNAS NA AREIA'}
          {activeStep === 1 && 'Anexe os documentos obrigatórios para continuar'}
          {activeStep === 2 && 'Finalize sua inscrição realizando o pagamento'}
          {activeStep === 3 && 'Sua inscrição foi recebida com sucesso!'}
        </Typography>
      </Box>

      {/* STEPPER */}
      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* FORM CONTENT */}
      <Paper elevation={0} sx={{ p: activeStep === 2 ? 2 : 4, borderRadius: 3, backgroundColor: 'background.default' }}>
        {getStepContent(activeStep)}

        {/* NAVIGATION BUTTONS */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ ml: 1 }}
                size="large"
              >
                Finalizar
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ ml: 1 }}
                size="large"
                disabled={activeStep === 2 && !comprovanteFile}
              >
                {activeStep === steps.length - 2 ? 'Enviar Comprovante' : 'Próximo'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}