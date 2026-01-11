'use client';

import { useState, useEffect } from 'react';
import {
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar, MenuItem, Grid, Box, Card, CardContent,
  Stepper, Step, StepLabel, Avatar, Chip,
  Tooltip, Divider, LinearProgress, FormControl, InputLabel, Select
} from '@mui/material';
import {
  HowToReg, Person, Email, WhatsApp, Category, CalendarToday,
  AttachFile, CloudUpload, Info, CheckCircle, PersonAdd,
  QrCode, AccountBalance, ContentCopy, AccessTime, ArrowBack
} from '@mui/icons-material';

const steps = ['Dados da Dupla', 'Documentação', 'Pagamento', 'Confirmação'];

// Funções auxiliares
const addMinutesToNow = (minutes) => {
  return new Date(Date.now() + minutes * 60000).getTime();
};

const saveToDatabase = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codigoRastreio = `PNA${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      resolve({
        success: true,
        codigo_rastreio: codigoRastreio,
        expira_em: addMinutesToNow(30),
        status: 'aguardando_pagamento'
      });
    }, 1000);
  });
};

const sendComprovante = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, status: 'pendente' });
    }, 1000);
  });
};

const pixInfo = {
  nome: 'Associação Pernas na Areia',
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

const tamanhosCamisa = [
  { value: 'pp', label: 'PP' },
  { value: 'p', label: 'P' },
  { value: 'm', label: 'M' },
  { value: 'g', label: 'G' },
  { value: 'gg', label: 'GG' },
  { value: 'xg', label: 'XG' }
];

export default function InscricaoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    responsavel_nome: '', responsavel_email: '', responsavel_whatsapp: '',
    categoria: '', jogador1_nome: '', jogador1_nascimento: '', jogador1_camisa: '',
    jogador2_nome: '', jogador2_nascimento: '', jogador2_camisa: ''
  });
  const [files, setFiles] = useState({ documento_jogador1: null, documento_jogador2: null });
  const [inscricaoData, setInscricaoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [pagamentoStatus, setPagamentoStatus] = useState('aguardando_pagamento');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Contador regressivo
  useEffect(() => {
    if (activeStep === 2 && inscricaoData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev <= 1 ? (clearInterval(timer), handleTimeExpired(), 0) : prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeStep, inscricaoData, timeLeft]);

  const handleTimeExpired = () => {
    setSnackbar({ open: true, message: 'Tempo esgotado!', severity: 'error' });
    setTimeout(() => {
      setActiveStep(0);
      setInscricaoData(null);
      setPagamentoStatus('aguardando_pagamento');
      setComprovanteFile(null);
    }, 3000);
  };

  const calculateTimeLeft = (expiraEmTimestamp) => {
    return Math.max(0, Math.floor((expiraEmTimestamp - Date.now()) / 1000));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    });
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
    setSnackbar({ open: true, message: 'Copiado!', severity: 'success' });
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const requiredFields = ['responsavel_nome', 
                            'categoria', 'jogador1_nome', 'jogador1_nascimento', 'jogador1_camisa',
                            'jogador2_nome', 'jogador2_nascimento', 'jogador2_camisa'];
      if (!requiredFields.every(field => form[field])) {
        setSnackbar({ open: true, message: 'Preencha todos os campos.', severity: 'error' });
        return;
      }
      setActiveStep(1);
    }
    
    if (activeStep === 1) {
      if (!files.documento_jogador1 || !files.documento_jogador2) {
        setSnackbar({ open: true, message: 'Anexe os documentos.', severity: 'error' });
        return;
      }
      setIsLoading(true);
      try {
        const response = await saveToDatabase();
        if (response.success) {
          setInscricaoData(response);
          setTimeLeft(calculateTimeLeft(response.expira_em));
          setPagamentoStatus('aguardando_pagamento');
          setSnackbar({ open: true, message: '✅ Inscrição salva!', severity: 'success' });
          setActiveStep(2);
        }
      } catch {
        setSnackbar({ open: true, message: 'Erro ao salvar.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    }

    if (activeStep === 2) {
      if (!comprovanteFile) {
        setSnackbar({ open: true, message: 'Anexe o comprovante.', severity: 'error' });
        return;
      }
      setIsLoading(true);
      try {
        const response = await sendComprovante();
        if (response.success) {
          setPagamentoStatus('pendente');
          setSnackbar({ open: true, message: '✅ Comprovante enviado!', severity: 'success' });
          setActiveStep(3);
        }
      } catch {
        setSnackbar({ open: true, message: 'Erro ao enviar.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* Card Responsável */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><Person /></Avatar>
                  <Typography variant="h6" fontWeight={600}>Responsável pela Inscrição</Typography>
                </Box>
                
                {/* Campos empilhados */}
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="responsavel_nome"
                    value={form.responsavel_nome}
                    onChange={handleChange}
                    required
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Card Dados da Dupla */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}><PersonAdd /></Avatar>
                  <Typography variant="h6" fontWeight={600}>Dados da Dupla</Typography>
                </Box>

                {/* Categoria */}
                <TextField
                  fullWidth
                  select
                  label="Categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                >
                  {categorias.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </TextField>

                {/* Jogador 1 */}
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                    Jogador 1
                  </Typography>
                  
                  {/* Campos empilhados */}
                  <Box sx={{ '& > *': { mb: 2 } }}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="jogador1_nome"
                      value={form.jogador1_nome}
                      onChange={handleChange}
                      required
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Data de Nascimento"
                      name="jogador1_nascimento"
                      value={form.jogador1_nascimento}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                    <FormControl fullWidth>
                      <InputLabel>Tamanho da Camisa</InputLabel>
                      <Select
                        name="jogador1_camisa"
                        value={form.jogador1_camisa}
                        onChange={handleChange}
                        label="Tamanho da Camisa"
                      >
                        {tamanhosCamisa.map(t => (
                          <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Card>

                {/* Jogador 2 */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                    Jogador 2
                  </Typography>
                  
                  {/* Campos empilhados */}
                  <Box sx={{ '& > *': { mb: 2 } }}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="jogador2_nome"
                      value={form.jogador2_nome}
                      onChange={handleChange}
                      required
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Data de Nascimento"
                      name="jogador2_nascimento"
                      value={form.jogador2_nascimento}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                    <FormControl fullWidth>
                      <InputLabel>Tamanho da Camisa</InputLabel>
                      <Select
                        name="jogador2_camisa"
                        value={form.jogador2_camisa}
                        onChange={handleChange}
                        label="Tamanho da Camisa"
                      >
                        {tamanhosCamisa.map(t => (
                          <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Card>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}><AttachFile /></Avatar>
                <Typography variant="h6" fontWeight={600}>Documentação Obrigatória</Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3
              }}>
                {[1, 2].map(num => (
                  <Box key={num} sx={{ flex: 1 }}>
                    <Card variant="outlined" sx={{ 
                      p: 3, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>Jogador {num}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {num === 1 ? form.jogador1_nome || 'Nome do jogador' : form.jogador2_nome || 'Nome do jogador'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Anexe documento que comprove a idade (RG, CNH ou Certidão de Nascimento)
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        component="label" 
                        fullWidth 
                        startIcon={<CloudUpload />}
                        sx={{ mt: 'auto' }}
                      >
                        {files[`documento_jogador${num}`]?.name || 'Escolher arquivo'}
                        <input 
                          type="file" 
                          hidden 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          onChange={(e) => handleFileChange(e, `documento_jogador${num}`)} 
                        />
                      </Button>
                      
                      {files[`documento_jogador${num}`] && (
                        <Chip 
                          icon={<CheckCircle />} 
                          label="Documento anexado" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 2, alignSelf: 'flex-start' }}
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Tamanho máximo: 5MB • Formatos: PDF, JPG, PNG
                      </Typography>
                    </Card>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: 3 
}}>
  {/* COLUNA ESQUERDA - INFORMAÇÕES DA INSCRIÇÃO */}
  <Box sx={{ flex: { xs: 'none', md: 2 } }}>
    <Card sx={{ borderRadius: 3, mb: 3, height: '100%' }}>
      <CardContent>
        {inscricaoData && (
          <>
            {/* CÓDIGO DE RASTREIO EM DESTAQUE */}
            <Card sx={{ 
              bgcolor: 'primary.light', 
              border: '2px solid #1976d2', 
              mb: 4, 
              borderRadius: 2 
            }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" fontWeight={800} color="white" sx={{ mb: 1.5, textAlign: 'center' }}>
                  {inscricaoData.codigo_rastreio}
                </Typography>
                <Alert severity="warning" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <Typography variant="body2" fontWeight={600} align="center">
                    ⚠️ SALVE ESTE CÓDIGO! ELE SERÁ UTILIZADO PARA VIZUALIZAR O STATUS DA INSCRIÇÃO!
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* ALERTA DE TEMPO */}
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                ⚠️ PAGUE EM ATÉ {timeLeft ? formatTime(timeLeft) : '30:00'}
              </Typography>
              <Typography variant="body2">
                Sua vaga está reservada por 30 minutos. Após este período, sua inscrição será cancelada automaticamente.
              </Typography>
            </Alert>

            {/* LINHA DE PROGRESSO */}
            <LinearProgress 
              variant="determinate" 
              value={timeLeft ? ((timeLeft / (30 * 60)) * 100) : 100} 
              sx={{ mb: 4, height: 10, borderRadius: 5 }}
              color={timeLeft && timeLeft < 300 ? "error" : "warning"}
            />

            {/* VALOR E CATEGORIA */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              mb: 4 
            }}>
              <Card variant="outlined" sx={{ p: 2.5, flex: 1, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Valor Total
                </Typography>
                <Typography variant="h3" color="primary" fontWeight={800}>
                  {pixInfo.valor}
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ p: 2.5, flex: 1, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Categoria
                </Typography>
                <Typography variant="h6" fontWeight={600} color="secondary">
                  {categorias.find(c => c.value === form.categoria)?.label}
                </Typography>
              </Card>
            </Box>

            {/* COMPROVANTE DE PAGAMENTO */}
            <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Comprovante de Pagamento
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Após realizar o pagamento via PIX, anexe o comprovante abaixo.
              </Typography>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth 
                startIcon={<CloudUpload />} 
                sx={{ py: 2.5, mb: 2, borderStyle: 'dashed' }}
              >
                {comprovanteFile?.name || 'Anexar comprovante (PDF/JPG/PNG)'}
                <input 
                  type="file" 
                  hidden 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={(e) => handleFileChange(e, 'comprovante_pagamento')} 
                />
              </Button>
              {comprovanteFile && (
                <Chip 
                  icon={<CheckCircle />} 
                  label="Comprovante anexado" 
                  color="success" 
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  </Box>

  {/* COLUNA DIREITA - DADOS DO PIX */}
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
          height: 200, 
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
            <QrCode sx={{ fontSize: 60, color: '#4CAF50', mb: 1 }} />
            <Typography variant="h6" color="#4CAF50" fontWeight={600}>
              QR Code PIX
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#4CAF50">
              {pixInfo.valor}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
</Box>
        );

      case 3:
        return (
          <Card sx={{ borderRadius: 3, p: 4 }}>
  <CardContent>
    {/* ÍCONE E STATUS */}
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Avatar sx={{ 
        bgcolor: pagamentoStatus === 'pendente' ? 'warning.main' : 'success.main', 
        width: 120, 
        height: 120, 
        mx: 'auto', 
        mb: 4 
      }}>
        {pagamentoStatus === 'pendente' ? <AccessTime fontSize="large" /> : <CheckCircle fontSize="large" />}
      </Avatar>
      <Typography variant="h3" fontWeight={800} color={pagamentoStatus === 'pendente' ? 'warning.main' : 'success.main'} gutterBottom>
        {pagamentoStatus === 'pendente' ? 'AGUARDANDO CONFIRMAÇÃO' : 'PAGAMENTO CONFIRMADO!'}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {pagamentoStatus === 'pendente' 
          ? 'Sua inscrição foi recebida e está sendo analisada' 
          : 'Sua inscrição está sendo processada'}
      </Typography>
    </Box>

    {/* CÓDIGO DE RASTREIO */}
    <Card sx={{ 
      bgcolor: 'primary.light', 
      border: '3px solid #1976d2', 
      mb: 4, 
      borderRadius: 2
    }}>
      <CardContent sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="white" gutterBottom fontWeight={700}>
          CÓDIGO DE RASTREIO
        </Typography>
        <Typography variant="h2" fontWeight={900} color="white" sx={{ mb: 2, letterSpacing: 2 }}>
          {inscricaoData?.codigo_rastreio}
        </Typography>
        <Alert severity="warning" sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            ⚠️ GUARDE ESTE CÓDIGO! Use-o para acompanhar o status da sua inscrição.
          </Typography>
        </Alert>
      </CardContent>
    </Card>

    {/* INSTRUÇÕES */}
    <Alert severity={pagamentoStatus === 'pendente' ? 'warning' : 'info'} sx={{ mb: 4, borderRadius: 2 }}>
      <Typography variant="body2">
        <strong>Próximos passos:</strong>
        <br />1. A equipe está analisando sua inscrição
        <br />2. A equipe do evento irá validar se sua inscriçao é valida
        <br />3. Acompanhe as atualizações utilizando o código acima
      </Typography>
    </Alert>

    {/* CARDS DE INFORMAÇÕES - LADO A LADO NO DESKTOP */}
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      gap: 3 
    }}>
      {/* CARD RESPONSÁVEL */}
      <Card variant="outlined" sx={{ 
        p: 3, 
        flex: 1,
        borderRadius: 2 
      }}>
        <Typography variant="subtitle1" color="primary" fontWeight={700} gutterBottom>
          Responsável
        </Typography>
        <Box sx={{ '& > *': { mb: 1.5 } }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Nome: blala</Typography>
            <Typography variant="body1" fontWeight={600}>{form.responsavel_nome}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">E-mail: adsada</Typography>
            <Typography variant="body1" fontWeight={600}>{form.responsavel_email}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">WhatsApp: sdada</Typography>
            <Typography variant="body1" fontWeight={600}>{form.responsavel_whatsapp}</Typography>
          </Box>
        </Box>
      </Card>

      {/* CARD DUPLA */}
      <Card variant="outlined" sx={{ 
        p: 3, 
        flex: 1,
        borderRadius: 2 
      }}>
        <Typography variant="subtitle1" color="primary" fontWeight={700} gutterBottom>
          Dupla
        </Typography>
        <Box sx={{ '& > *': { mb: 1.5 } }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Categoria:</Typography>
            <Typography variant="body1" fontWeight={600}>
              {categorias.find(c => c.value === form.categoria)?.label}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Jogadores:</Typography>
            <Typography variant="body1" fontWeight={600}>
              {form.jogador1_nome} & {form.jogador2_nome}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Tamanhos Camisa:</Typography>
            <Typography variant="body1" fontWeight={600}>
              {tamanhosCamisa.find(t => t.value === form.jogador1_camisa)?.label} & {tamanhosCamisa.find(t => t.value === form.jogador2_camisa)?.label}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status:</Typography>
            <Chip 
              label={pagamentoStatus === 'pendente' ? 'PENDENTE' : 'CONFIRMADO'} 
              color={pagamentoStatus === 'pendente' ? 'warning' : 'success'}
              sx={{ fontWeight: 700, mt: 0.5 }}
            />
          </Box>
        </Box>
      </Card>
    </Box>

    {/* BOTÃO DE FINALIZAR (se necessário) */}
    <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="body2" color="text.secondary" paragraph>
        Qualquer dúvida, entre em contato através do e-mail ou WhatsApp informados.
      </Typography>
      <Button 
        variant="contained" 
        href="/"
        sx={{ px: 5 }}
      >
        Finalizar
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
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <HowToReg color="primary" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h2" fontWeight={900} color="primary">{activeStep === 2 ? 'PAGAMENTO' : activeStep === 3 ? 'CONFIRMAÇÃO' : 'INSCRIÇÃO DA DUPLA'}</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || isLoading} variant="outlined" startIcon={<ArrowBack />}>Voltar</Button>
          <Button variant="contained" onClick={handleNext} disabled={isLoading || (activeStep === 2 && !comprovanteFile)}>
            {isLoading ? 'Processando...' : activeStep === steps.length - 1 ? 'Finalizar' : activeStep === 1 ? 'Salvar' : activeStep === 2 ? 'Enviar' : 'Próximo'}
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}