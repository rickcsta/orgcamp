'use client';

import { useState, useEffect } from 'react';
import { Stack,
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar, MenuItem, Grid, Box, Card, CardContent,
  Stepper, Step, StepLabel, Avatar, Chip,
  Tooltip, Divider, LinearProgress, FormControl, InputLabel, Select,
  Checkbox, ListItemText
} from '@mui/material';
import {
  HowToReg, Person, Email, WhatsApp, Category, CalendarToday,
  AttachFile, CloudUpload, Info, CheckCircle, PersonAdd,
  QrCode, AccountBalance, ContentCopy, AccessTime, ArrowBack,
  Warning
} from '@mui/icons-material';

const steps = ['Dados da Dupla', 'Documentação', 'Pagamento', 'Confirmação'];

// FUNÇÕES AUXILIARES PARA VALIDAÇÃO DE IDADE
const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;
  
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNascimento = nascimento.getMonth();
  const diaNascimento = nascimento.getDate();
  
  // Ajusta se ainda não fez aniversário este ano
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade--;
  }
  
  return idade;
};

const validarCategoriaPorIdade = (idade, categoria) => {
  if (idade === null) return { valida: false, motivo: 'Data de nascimento inválida' };
  
  switch(categoria) {
    case 'sub17_masculino':
    case 'sub17_feminino':
      return idade <= 17 ? 
        { valida: true } : 
        { valida: false, motivo: `Idade ${idade} anos não permite jogar Sub 17 (máximo 17 anos)` };
    
    case 'sub21_masculino':
    case 'sub21_feminino':
      return idade <= 21 ? 
        { valida: true } : 
        { valida: false, motivo: `Idade ${idade} anos não permite jogar Sub 21 (máximo 21 anos)` };
    
    case 'open_masculino':
    case 'open_feminino':
      // CORREÇÃO: Open aceita QUALQUER IDADE (sem restrições)
      return { valida: true };
    
    default:
      return { valida: false, motivo: 'Categoria desconhecida' };
  }
};

// Função para validar dupla em múltiplas categorias
const validarDuplaParaCategorias = (jogador1Nascimento, jogador2Nascimento, categoriasSelecionadas) => {
  const idadeJogador1 = calcularIdade(jogador1Nascimento);
  const idadeJogador2 = calcularIdade(jogador2Nascimento);
  
  const resultados = [];
  
  categoriasSelecionadas.forEach(categoria => {
    const validacaoJogador1 = validarCategoriaPorIdade(idadeJogador1, categoria);
    const validacaoJogador2 = validarCategoriaPorIdade(idadeJogador2, categoria);
    
    resultados.push({
      categoria,
      jogador1: validacaoJogador1,
      jogador2: validacaoJogador2,
      valida: validacaoJogador1.valida && validacaoJogador2.valida
    });
  });
  
  return {
    valida: resultados.every(r => r.valida),
    detalhes: resultados,
    idades: {
      jogador1: idadeJogador1,
      jogador2: idadeJogador2
    }
  };
};

// Restante das funções auxiliares...
const addMinutesToNow = (minutes) => {
  return new Date(Date.now() + minutes * 60000).getTime();
};

const saveToDatabase = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codigoRastreio = `PNA${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      resolve({
        success: true,
        codigo_rastreio: codigoRastreio,
        expira_em: addMinutesToNow(30),
        status: 'aguardando_pagamento',
        dados: data
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
  { value: 'sub17_masculino', label: 'Sub 17 - Masculino', idade: 'Até 17 anos', valor: 150 },
  { value: 'sub17_feminino', label: 'Sub 17 - Feminino', idade: 'Até 17 anos', valor: 150 },
  { value: 'sub21_masculino', label: 'Sub 21 - Masculino', idade: 'Até 21 anos', valor: 150 },
  { value: 'sub21_feminino', label: 'Sub 21 - Feminino', idade: 'Até 21 anos', valor: 150 },
  { value: 'open_masculino', label: 'Open - Masculino', idade: 'Qualquer idade', valor: 150 },
  { value: 'open_feminino', label: 'Open - Feminino', idade: 'Qualquer idade', valor: 150 }
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
    responsavel_nome: '',
    categorias: [],
    jogador1_nome: '', jogador1_nascimento: '', jogador1_camisa: '',
    jogador2_nome: '', jogador2_nascimento: '', jogador2_camisa: ''
  });
  
  const [files, setFiles] = useState({ documento_jogador1: null, documento_jogador2: null });
  const [inscricaoData, setInscricaoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [pagamentoStatus, setPagamentoStatus] = useState('aguardando_pagamento');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errosValidacao, setErrosValidacao] = useState([]);

  // Calcular idade dos jogadores
  const idadeJogador1 = calcularIdade(form.jogador1_nascimento);
  const idadeJogador2 = calcularIdade(form.jogador2_nascimento);

  // Calcular valor total baseado nas categorias selecionadas
  const calcularValorTotal = () => {
    if (form.categorias.length === 0) return 0;
    
    const valorBase = form.categorias.reduce((total, categoriaId) => {
      const categoria = categorias.find(c => c.value === categoriaId);
      return total + (categoria?.valor || 0);
    }, 0);
    
    // Aplicar desconto para múltiplas categorias
    if (form.categorias.length > 1) {
      return valorBase * 0.9; // 10% de desconto
    }
    
    return valorBase;
  };

  const valorTotal = calcularValorTotal();
  const valorFormatado = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

  // Validar categorias quando as datas de nascimento ou categorias mudam
  useEffect(() => {
    if (form.jogador1_nascimento && form.jogador2_nascimento && form.categorias.length > 0) {
      const validacao = validarDuplaParaCategorias(
        form.jogador1_nascimento,
        form.jogador2_nascimento,
        form.categorias
      );
      
      // Filtrar apenas os erros
      const erros = validacao.detalhes
        .filter(d => !d.valida)
        .map(d => ({
          categoria: categorias.find(c => c.value === d.categoria)?.label,
          jogador1Erro: d.jogador1.motivo,
          jogador2Erro: d.jogador2.motivo
        }));
      
      setErrosValidacao(erros);
    } else {
      setErrosValidacao([]);
    }
  }, [form.jogador1_nascimento, form.jogador2_nascimento, form.categorias]);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoriasChange = (event) => {
    const { value } = event.target;
    const novasCategorias = typeof value === 'string' ? value.split(',') : value;
    
    // Validar antes de atualizar
    if (form.jogador1_nascimento && form.jogador2_nascimento) {
      const validacao = validarDuplaParaCategorias(
        form.jogador1_nascimento,
        form.jogador2_nascimento,
        novasCategorias
      );
      
      if (!validacao.valida && novasCategorias.length > 0) {
        // Mostrar alerta mas permitir seleção (usuário pode corrigir depois)
        const erros = validacao.detalhes.filter(d => !d.valida);
        if (erros.length > 0) {
          const primeiroErro = erros[0];
          const categoriaNome = categorias.find(c => c.value === primeiroErro.categoria)?.label;
          
          setSnackbar({ 
            open: true, 
            message: `⚠️ Atenção: ${primeiroErro.jogador1.motivo || primeiroErro.jogador2.motivo}`,
            severity: 'warning' 
          });
        }
      }
    }
    
    setForm({ ...form, categorias: novasCategorias });
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

  // NOVA FUNÇÃO: Verificar se o botão "Próximo" deve ser desabilitado
  const isNextButtonDisabled = () => {
    if (isLoading) return true;
    
    switch(activeStep) {
      case 0:
        // Verificar campos obrigatórios da etapa 1
        const requiredFields = ['responsavel_nome', 
                              'jogador1_nome', 'jogador1_nascimento', 'jogador1_camisa',
                              'jogador2_nome', 'jogador2_nascimento', 'jogador2_camisa'];
        
        // 1. Verificar se todos os campos obrigatórios estão preenchidos
        const camposPreenchidos = requiredFields.every(field => form[field]);
        if (!camposPreenchidos) return true;
        
        // 2. Verificar se pelo menos uma categoria foi selecionada
        if (form.categorias.length === 0) return true;
        
        // 3. Verificar validação de idade das categorias
        if (form.jogador1_nascimento && form.jogador2_nascimento) {
          const validacao = validarDuplaParaCategorias(
            form.jogador1_nascimento,
            form.jogador2_nascimento,
            form.categorias
          );
          
          if (!validacao.valida) return true;
        }
        
        return false;
        
      case 1:
        // Etapa 2: Verificar se ambos os documentos foram anexados
        return !files.documento_jogador1 || !files.documento_jogador2;
        
      case 2:
        // Etapa 3: Verificar se o comprovante foi anexado
        return !comprovanteFile;
        
      case 3:
        // Etapa 4: Botão sempre habilitado (é o "Finalizar")
        return false;
        
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const requiredFields = ['responsavel_nome', 
                            'jogador1_nome', 'jogador1_nascimento', 'jogador1_camisa',
                            'jogador2_nome', 'jogador2_nascimento', 'jogador2_camisa'];
      
      // Verificar se pelo menos uma categoria foi selecionada
      if (form.categorias.length === 0) {
        setSnackbar({ open: true, message: 'Selecione pelo menos uma categoria.', severity: 'error' });
        return;
      }
      
      // Validar idade das categorias selecionadas
      if (form.jogador1_nascimento && form.jogador2_nascimento) {
        const validacao = validarDuplaParaCategorias(
          form.jogador1_nascimento,
          form.jogador2_nascimento,
          form.categorias
        );
        
        if (!validacao.valida) {
          const primeiroErro = validacao.detalhes.find(d => !d.valida);
          const categoriaNome = categorias.find(c => c.value === primeiroErro.categoria)?.label;
          
          setSnackbar({ 
            open: true, 
            message: `❌ Não é possível se inscrever na categoria ${categoriaNome}. ${primeiroErro.jogador1.motivo || primeiroErro.jogador2.motivo}`,
            severity: 'error' 
          });
          return;
        }
      }
      
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
        const dadosInscricao = {
          ...form,
          valor_total: valorTotal,
          categorias_selecionadas: form.categorias.map(catId => {
            const cat = categorias.find(c => c.value === catId);
            return { id: catId, nome: cat?.label, valor: cat?.valor };
          })
        };
        
        const response = await saveToDatabase(dadosInscricao);
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
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="responsavel_nome"
                    value={form.responsavel_nome}
                    onChange={handleChange}
                    required
                    error={!form.responsavel_nome}
                    helperText={!form.responsavel_nome ? "Campo obrigatório" : ""}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Card Dados da Dupla */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}><PersonAdd /></Avatar>
                  <Typography variant="h6" fontWeight={600}>Dados da Dupla</Typography>
                </Box>

                {/* INFORMAÇÃO DAS IDADES */}
                {(idadeJogador1 !== null || idadeJogador2 !== null) && (
                  <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff' }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
                      Idades Calculadas
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Jogador 1:</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {idadeJogador1 !== null ? `${idadeJogador1} anos` : 'Não informada'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Jogador 2:</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {idadeJogador2 !== null ? `${idadeJogador2} anos` : 'Não informada'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {/* ALERTA DE ERROS DE VALIDAÇÃO */}
                {errosValidacao.length > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      ⚠️ Restrições de idade identificadas:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {errosValidacao.map((erro, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • <strong>{erro.categoria}:</strong> {erro.jogador1Erro || erro.jogador2Erro}
                        </Typography>
                      ))}
                    </Box>
                  </Alert>
                )}

                {/* MUDANÇA: Seleção múltipla de categorias COM VALIDAÇÃO */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Categorias</InputLabel>
                  <Select
                    multiple
                    name="categorias"
                    value={form.categorias}
                    onChange={handleCategoriasChange}
                    label="Categorias"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const categoria = categorias.find(c => c.value === value);
                          const temErro = errosValidacao.some(e => 
                            categorias.find(c => c.value === value)?.label === e.categoria
                          );
                          
                          return (
                            <Chip 
                              key={value} 
                              label={categoria?.label} 
                              size="small"
                              color={temErro ? "error" : "primary"}
                              icon={temErro ? <Warning fontSize="small" /> : undefined}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {categorias.map((cat) => {
                      // Verificar se esta categoria seria válida para ambos os jogadores
                      let validaParaJogador1 = true;
                      let validaParaJogador2 = true;
                      let motivoJogador1 = '';
                      let motivoJogador2 = '';
                      
                      if (form.jogador1_nascimento) {
                        const validacao = validarCategoriaPorIdade(idadeJogador1, cat.value);
                        validaParaJogador1 = validacao.valida;
                        motivoJogador1 = validacao.motivo;
                      }
                      
                      if (form.jogador2_nascimento) {
                        const validacao = validarCategoriaPorIdade(idadeJogador2, cat.value);
                        validaParaJogador2 = validacao.valida;
                        motivoJogador2 = validacao.motivo;
                      }
                      
                      const categoriaValida = validaParaJogador1 && validaParaJogador2;
                      // CORREÇÃO: Open NUNCA é desabilitada pois aceita qualquer idade
                      const disabled = !categoriaValida && 
                                      (form.jogador1_nascimento && form.jogador2_nascimento) &&
                                      !cat.value.includes('open'); // Open nunca é desabilitada
                      
                      return (
                        <MenuItem 
                          key={cat.value} 
                          value={cat.value}
                          disabled={disabled}
                          sx={{ 
                            opacity: disabled ? 0.6 : 1,
                            bgcolor: disabled ? '#f5f5f5' : 'transparent'
                          }}
                        >
                          <Checkbox checked={form.categorias.indexOf(cat.value) > -1} />
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography>{cat.label}</Typography>
                                {disabled && <Warning color="error" fontSize="small" />}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {cat.idade}
                                </Typography>
                                <Typography variant="caption" color="primary" sx={{ display: 'block', fontWeight: 600 }}>
                                  R$ {cat.valor.toFixed(2).replace('.', ',')}
                                </Typography>
                                {disabled && (
                                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {!validaParaJogador1 ? `Jogador 1: ${motivoJogador1}` : `Jogador 2: ${motivoJogador2}`}
                                  </Typography>
                                )}
                              </Box>
                            } 
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {form.categorias.length === 0 && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      Selecione pelo menos uma categoria
                    </Typography>
                  )}
                </FormControl>

                {/* RESUMO DA SELEÇÃO DE CATEGORIAS */}
                {form.categorias.length > 0 && (
                  <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resumo das Categorias Selecionadas:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {form.categorias.map(catId => {
                        const cat = categorias.find(c => c.value === catId);
                        const temErro = errosValidacao.some(e => cat?.label === e.categoria);
                        
                        return cat ? (
                          <Box key={catId} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: temErro ? '#ffebee' : 'transparent' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" fontWeight={600} color={temErro ? 'error' : 'inherit'}>
                                {cat.label} {temErro && <Warning fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />}
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                R$ {cat.valor.toFixed(2).replace('.', ',')}
                              </Typography>
                            </Box>
                            {temErro && errosValidacao.find(e => e.categoria === cat.label) && (
                              <Alert severity="error" sx={{ py: 0, my: 0.5 }}>
                                <Typography variant="caption">
                                  {errosValidacao.find(e => e.categoria === cat.label)?.jogador1Erro || 
                                   errosValidacao.find(e => e.categoria === cat.label)?.jogador2Erro}
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        ) : null;
                      })}
                      {form.categorias.length > 1 && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Desconto (10%)</Typography>
                            <Typography variant="body2" color="success.main" fontWeight={600}>
                              - R$ {(calcularValorTotal() * 0.1111).toFixed(2).replace('.', ',')}
                            </Typography>
                          </Box>
                        </>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight={600}>Total</Typography>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {valorFormatado}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {/* Jogador 1 */}
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                    Jogador 1
                  </Typography>
                  
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="jogador1_nome"
                      value={form.jogador1_nome}
                      onChange={handleChange}
                      required
                      error={!form.jogador1_nome}
                      helperText={!form.jogador1_nome ? "Campo obrigatório" : ""}
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
                      error={!form.jogador1_nascimento}
                      helperText={
                        !form.jogador1_nascimento ? "Campo obrigatório" : 
                        idadeJogador1 !== null ? `Idade: ${idadeJogador1} anos` : ''
                      }
                    />
                    <FormControl fullWidth error={!form.jogador1_camisa}>
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
                      {!form.jogador1_camisa && (
                        <Typography variant="caption" color="error">
                          Selecione um tamanho
                        </Typography>
                      )}
                    </FormControl>
                  </Stack>
                </Card>

                {/* Jogador 2 */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                    Jogador 2
                  </Typography>
                  
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="jogador2_nome"
                      value={form.jogador2_nome}
                      onChange={handleChange}
                      required
                      error={!form.jogador2_nome}
                      helperText={!form.jogador2_nome ? "Campo obrigatório" : ""}
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
                      error={!form.jogador2_nascimento}
                      helperText={
                        !form.jogador2_nascimento ? "Campo obrigatório" : 
                        idadeJogador2 !== null ? `Idade: ${idadeJogador2} anos` : ''
                      }
                    />
                    <FormControl fullWidth error={!form.jogador2_camisa}>
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
                      {!form.jogador2_camisa && (
                        <Typography variant="caption" color="error">
                          Selecione um tamanho
                        </Typography>
                      )}
                    </FormControl>
                  </Stack>
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
                      flexDirection: 'column',
                      borderColor: !files[`documento_jogador${num}`] ? 'error.main' : 'divider',
                      borderWidth: !files[`documento_jogador${num}`] ? 2 : 1
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
                        color={!files[`documento_jogador${num}`] ? "error" : "primary"}
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
                      
                      {!files[`documento_jogador${num}`] && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          <Typography variant="caption">
                            Documento obrigatório não anexado
                          </Typography>
                        </Alert>
                      )}
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

                      {/* VALOR E CATEGORIAS */}
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
                            {valorFormatado}
                          </Typography>
                          {form.categorias.length > 1 && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                              ✅ Inclui desconto de 10%
                            </Typography>
                          )}
                        </Card>
                        <Card variant="outlined" sx={{ p: 2.5, flex: 1, borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Categorias ({form.categorias.length})
                          </Typography>
                          <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                            {form.categorias.map(catId => {
                              const cat = categorias.find(c => c.value === catId);
                              return (
                                <Typography key={catId} variant="body2" sx={{ mb: 0.5 }}>
                                  • {cat?.label}
                                </Typography>
                              );
                            })}
                          </Box>
                        </Card>
                      </Box>

                      {/* COMPROVANTE DE PAGAMENTO */}
                      <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: !comprovanteFile ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
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
                          color={!comprovanteFile ? "error" : "primary"}
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
                        {!comprovanteFile && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              É obrigatório anexar o comprovante de pagamento
                            </Typography>
                          </Alert>
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
                        {valorFormatado}
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
                  <br />2. A equipe do evento irá validar se sua inscrição é válida
                  <br />3. Acompanhe as atualizações utilizando o código acima
                </Typography>
              </Alert>

              {/* CARDS DE INFORMAÇÕES */}
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
                      <Typography variant="caption" color="text.secondary">Nome:</Typography>
                      <Typography variant="body1" fontWeight={600}>{form.responsavel_nome}</Typography>
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
                      <Typography variant="caption" color="text.secondary">Categorias ({form.categorias.length}):</Typography>
                      <Box sx={{ maxHeight: 80, overflowY: 'auto', mt: 0.5 }}>
                        {form.categorias.map(catId => {
                          const cat = categorias.find(c => c.value === catId);
                          return (
                            <Typography key={catId} variant="body2" sx={{ mb: 0.5 }}>
                              • {cat?.label}
                            </Typography>
                          );
                        })}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Jogadores:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {form.jogador1_nome} & {form.jogador2_nome}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Valor Total:</Typography>
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {valorFormatado}
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
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={isNextButtonDisabled()} // USANDO A NOVA FUNÇÃO
          >
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