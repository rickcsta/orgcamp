'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stack,
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar, MenuItem, Grid, Box, Card, CardContent,
  Stepper, Step, StepLabel, Avatar, Chip,
  Tooltip, Divider, LinearProgress, FormControl, InputLabel, Select,
  Checkbox, ListItemText,
  FormControlLabel,
} from '@mui/material';
import {
  HowToReg, Person, 
  AttachFile, CloudUpload,  CheckCircle, PersonAdd,
  QrCode, AccountBalance, ContentCopy, AccessTime, ArrowBack,
  Warning, People, PeopleOutline, HourglassEmpty
} from '@mui/icons-material';



const formatPhone = (value) => {
  if (!value) return '';

  // remove tudo que não for número
  const numbers = value.replace(/\D/g, '');

  // (XX) XXXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(
      /(\d{2})(\d{4})(\d{0,4})/,
      '($1) $2-$3'
    );
  }

  return numbers.replace(
    /(\d{2})(\d{5})(\d{0,4})/,
    '($1) $2-$3'
  );
};


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
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade--;
  }
  
  return idade;
};

const pixInfo = {
  nome: 'Aldeneide Firmino Pereira',
  chavePix: 'c4ed3c93-0e47-4413-84a7-2ef4e167925e',
  banco: 'Cloudwalk ip Ltda',
  valor: 'R$ 150,00'
};

const tamanhosCamisa = [
  { value: 'pp', label: 'PP' },
  { value: 'p', label: 'P' },
  { value: 'm', label: 'M' },
  { value: 'g', label: 'G' },
  { value: 'gg', label: 'GG' },
  { value: 'xg', label: 'XG' }
];

const api = {
  
  async fetchCategorias() {
    try {
      const response = await fetch('/api/categorias');
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      const data = await response.json();
      return data.categorias;
    } catch (error) {
      console.error('Erro na API de categorias:', error);
      throw error;
    }
  },

  async criarInscricao(formData) {
    try {
      const categoriasParaEnviar = formData.categorias.map(cat => {
        if (typeof cat === 'object') return cat.id;
        return cat;
      });

      const payload = {
        responsavel_nome: formData.responsavel_nome,
        responsavel_email: formData.responsavel_email,
        responsavel_numero: formData.responsavel_numero,
        jogador1_nome: formData.jogador1_nome,
        jogador1_nascimento: formData.jogador1_nascimento,
        jogador1_camisa: formData.jogador1_camisa,
        jogador2_nome: formData.jogador2_nome,
        jogador2_nascimento: formData.jogador2_nascimento,
        jogador2_camisa: formData.jogador2_camisa,
        categorias: categoriasParaEnviar
      };

      const response = await fetch('/api/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Erro ao criar inscrição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API de inscrição:', error);
      throw error;
    }
  },

  async uploadFile(codigoRastreio, tipo, file) {
    try {
      console.log('=== INICIANDO UPLOAD FRONTEND ===');
      console.log('codigoRastreio:', codigoRastreio);
      console.log('tipo:', tipo);
      console.log('file:', file?.name, file?.size, file?.type);
      
      const formData = new FormData();
      formData.append('codigo_rastreio', codigoRastreio);
      formData.append('tipo', tipo);
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      return data;
    } catch (error) {
      console.error('Erro detalhado no upload:', error);
      throw error;
    }
  },

  async fetchInscricao(codigoRastreio) {
    try {
      const response = await fetch(`/api/inscricao/${codigoRastreio}`);
      if (!response.ok) throw new Error('Erro ao buscar inscrição');
      const data = await response.json();
      return data.dupla;
    } catch (error) {
      console.error('Erro na API de status:', error);
      throw error;
    }
  },

  async completarInscricao(codigoRastreio) {
    try {
      const response = await fetch(`/api/inscricao/${codigoRastreio}/completar`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao completar inscrição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API de completar:', error);
      throw error;
    }
  }
};

export default function InscricaoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    responsavel_nome: '',  responsavel_email: '',  responsavel_numero: '', 
    categorias: [],
    jogador1_nome: '', jogador1_nascimento: '', jogador1_camisa: '',
    jogador2_nome: '', jogador2_nascimento: '', jogador2_camisa: ''
  });
  

  function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Só roda no browser
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

const width = useWindowWidth();


  const router = useRouter();

  const [files, setFiles] = useState({ documento_jogador1: null, documento_jogador2: null });
  const [inscricaoData, setInscricaoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [comprovanteFile, setComprovanteFile] = useState(null);
  const [pagamentoStatus, setPagamentoStatus] = useState('aguardando_pagamento');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errosValidacao, setErrosValidacao] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [vagas, setVagas] = useState({});
  const [cienteErro, setCienteErro] = useState(false);
  const [aceitaRegulamento, setAceitaRegulamento] = useState(false);

  // Carregar categorias da API
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const categoriasDaAPI = await api.fetchCategorias();
        setCategorias(categoriasDaAPI);
        
        // Inicializar estado de vagas
        const vagasIniciais = {};
        categoriasDaAPI.forEach(cat => {
          vagasIniciais[cat.id] = {
            total: cat.limite_duplas,
            ocupadas: cat.duplas_confirmadas + cat.duplas_reservadas,
            disponiveis: cat.vagas_disponiveis,
            status: cat.status
          };
        });
        setVagas(vagasIniciais);
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Erro ao carregar categorias. Tente novamente.', 
          severity: 'error' 
        });
      }
    };
    
    loadCategorias();
  }, []);

  // Calcular idade dos jogadores
  const idadeJogador1 = calcularIdade(form.jogador1_nascimento);
  const idadeJogador2 = calcularIdade(form.jogador2_nascimento);

  // Calcular valor total baseado nas categorias selecionadas
  const calcularValorTotal = () => {
    if (form.categorias.length === 0) return 0;
    
    const valorBase = form.categorias.reduce((total, categoriaId) => {
      const categoria = categorias.find(c => c.id === categoriaId);
      return total + (categoria?.valor || 0);
    }, 0);
    
    if (form.categorias.length > 1) {
      return valorBase * 0.9; // 10% de desconto
    }
    
    return valorBase;
  };

  const valorTotal = calcularValorTotal();
  const valorFormatado = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

  /// Validar idade para uma categoria específica
const validarIdadeParaCategoria = (idade, categoria, numeroJogador = '') => {
  if (idade === null) return { 
    valida: false, 
    motivo: 'Data de nascimento inválida',
    numeroJogador 
  };
  
  // Categoria Open não tem restrição de idade
  if (categoria.nome === 'Open') {
    return { 
      valida: true,
      numeroJogador 
    };
  }
  
  const categoriaNome = categoria.nome.toUpperCase();
  const hoje = new Date();
  const anoAtual = hoje.getFullYear(); // 2026
  
  // REGRA ESPECIAL APENAS PARA SUB 21
  if (categoriaNome === 'SUB 21') {
    // Para Sub 21 em 2026: apenas nascidos em 2005 ou depois
    const anoMinimo = 2005;
    
    // Obter ano de nascimento do jogador
    const anoNascimento = new Date(form[`jogador${numeroJogador}_nascimento`]).getFullYear();
    
    if (anoNascimento < anoMinimo) {
      return { 
        valida: false, 
        motivo: `não pode participar dessa categoria`,
        numeroJogador 
      };
    }
    
    // Além disso, verificar idade máxima (21 anos)
    if (idade > 21) {
      return { 
        valida: false, 
        motivo: `não pode participar dessa categoria`,
        numeroJogador 
      };
    }
    
    return { 
      valida: true,
      numeroJogador 
    };
  }

  // REGRA ESPECIAL APENAS PARA SUB 18
  if (categoriaNome === 'SUB 18') {
    // Para Sub 18 em 2026: apenas nascidos em 2008 ou depois
    const anoMinimo = 2008;
    
    // Obter ano de nascimento do jogador
    const anoNascimento = new Date(form[`jogador${numeroJogador}_nascimento`]).getFullYear();
    
    if (anoNascimento < anoMinimo) {
      return { 
        valida: false, 
        motivo: `não pode participar dessa categoria`,
        numeroJogador 
      };
    }
    
    // Além disso, verificar idade máxima (21 anos)
    if (idade > 17) {
      return { 
        valida: false, 
        motivo: `não pode participar dessa categoria`,
        numeroJogador 
      };
    }
    
    return { 
      valida: true,
      numeroJogador 
    };
  }
  
  if (idade > categoria.idade_max) {
    const categoriaNome = categoria.nome.toUpperCase().includes('SUB') 
      ? categoria.nome.toUpperCase() 
      : categoria.nome;
    
    return { 
      valida: false, 
      motivo: ` não pode participar dessa categoria`,
      numeroJogador 
    };
  }
  
  return { 
    valida: true,
    numeroJogador 
  };
};

// Validar dupla para múltiplas categorias - APENAS UMA VEZ!
useEffect(() => {
  if (form.jogador1_nascimento && form.jogador2_nascimento && form.categorias.length > 0) {
    const erros = [];
    
    form.categorias.forEach(categoriaId => {
      const categoria = categorias.find(c => c.id === categoriaId);
      if (categoria) {
        const validacaoJogador1 = validarIdadeParaCategoria(idadeJogador1, categoria, 1);
        const validacaoJogador2 = validarIdadeParaCategoria(idadeJogador2, categoria, 2);
        
        // Verifica se AMBOS não podem jogar
        const ambosInvalidos = !validacaoJogador1.valida && !validacaoJogador2.valida;
        
        if (ambosInvalidos) {
          // Mensagem consolidada para ambos os jogadores
          const categoriaNome = categoria.nome.toUpperCase().includes('SUB') 
            ? categoria.nome.toUpperCase() 
            : categoria.nome;
          
          erros.push({
            categoria: `${categoriaNome} ${categoria.sexo}`,
            tipo: 'ambos_invalidos',
            mensagem: `AMBOS OS JOGADORES NÃO PODEM PARTICIPAR DA CATEGORIA ${categoriaNome} ${categoria.sexo}`,
            detalhesJogador1: validacaoJogador1.motivo,
            detalhesJogador2: validacaoJogador2.motivo
          });
        } else {
          // Adiciona erros individuais
          if (!validacaoJogador1.valida) {
            erros.push({
              categoria: `${categoria.nome} ${categoria.sexo}`,
              tipo: 'jogador1_invalido',
              mensagem: validacaoJogador1.motivo,
              jogador: 1
            });
          }
          
          if (!validacaoJogador2.valida) {
            erros.push({
              categoria: `${categoria.nome} ${categoria.sexo}`,
              tipo: 'jogador2_invalido',
              mensagem: validacaoJogador2.motivo,
              jogador: 2
            });
          }
        }
      }
    });
    
    setErrosValidacao(erros);
  } else {
    setErrosValidacao([]);
  }
}, [form.jogador1_nascimento, form.jogador2_nascimento, form.categorias, categorias]);

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
  const { name, value } = e.target;

  setForm(prev => ({
    ...prev,
    [name]: name === 'responsavel_numero'
      ? formatPhone(value)
      : value
  }));
};

  const handleCategoriasChange = (event) => {
    const { value } = event.target;
    const novasCategorias = typeof value === 'string' ? value.split(',') : value;
    
    // Validar idade
    if (form.jogador1_nascimento && form.jogador2_nascimento) {
      novasCategorias.forEach(categoriaId => {
        const categoria = categorias.find(c => c.id === parseInt(categoriaId));
        if (categoria) {
          const validacaoJogador1 = validarIdadeParaCategoria(idadeJogador1, categoria);
          const validacaoJogador2 = validarIdadeParaCategoria(idadeJogador2, categoria);
          
          if (!validacaoJogador1.valida) {
            setSnackbar({ 
              open: true, 
              message: `⚠️ Atenção: ${validacaoJogador1.motivo}`,
              severity: 'warning' 
            });
          }
          
          if (!validacaoJogador2.valida) {
            setSnackbar({ 
              open: true, 
              message: `⚠️ Atenção: ${validacaoJogador2.motivo}`,
              severity: 'warning' 
            });
          }
        }
      });
    }
    
    // Verificar vagas disponíveis
    novasCategorias.forEach(categoriaId => {
      const vaga = vagas[categoriaId];
      if (vaga && vaga.disponiveis === 0) {
        const categoria = categorias.find(c => c.id === parseInt(categoriaId));
        setSnackbar({ 
          open: true, 
          message: `⚠️ ${categoria?.nome} ${categoria?.sexo} está sem vagas disponíveis!`,
          severity: 'warning' 
        });
      }
    });
    
    setForm({ ...form, categorias: novasCategorias });
  };

  const MAX_SIZE = 2 * 1024 * 1024; 
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const handleFileChange = (e, fileType) => {
  const file = e.target.files[0];
  if (!file) return;

  // Tamanho
  if (file.size > MAX_SIZE) {
    setSnackbar({
      open: true,
      message: '❌ Arquivo maior que 2MB',
      severity: 'error'
    });
    e.target.value = null;
    return;
  }

  // Tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    setSnackbar({
      open: true,
      message: '❌ Tipo inválido. Use PDF, JPG ou PNG',
      severity: 'error'
    });
    e.target.value = null;
    return;
  }

  if (fileType === 'comprovante_pagamento') {
    setComprovanteFile(file);
  } else {
    setFiles(prev => ({ ...prev, [fileType]: file }));
  }
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copiado!', severity: 'success' });
  };

  // COMPONENTE: Indicador de Vagas
  const VagasIndicator = ({ categoriaId }) => {
    const vaga = vagas[categoriaId];
    if (!vaga) return null;
    
    const percentual = (vaga.ocupadas / vaga.total) * 100;
    const quaseCheio = vaga.disponiveis <= 3;
    const esgotado = vaga.disponiveis === 0;
    
    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Vagas:
          </Typography>
          <Typography 
            variant="caption" 
            fontWeight={600}
            color={esgotado ? "error" : quaseCheio ? "warning.main" : "success.main"}
          >
            {vaga.disponiveis}/{vaga.total} disponíveis
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={percentual} 
          sx={{ 
            height: 4, 
            borderRadius: 2,
            bgcolor: esgotado ? '#ffcdd2' : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: esgotado ? '#f44336' : quaseCheio ? '#ff9800' : '#4caf50'
            }
          }}
        />
        
        {esgotado && (
          <Chip 
            label="ESGOTADO" 
            size="small" 
            color="error" 
            sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
          />
        )}
        
        {quaseCheio && !esgotado && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
            ⚠️ Últimas vagas!
          </Typography>
        )}
      </Box>
    );
  };

  const isNextButtonDisabled = () => {
    if (isLoading) return true;
    
    switch(activeStep) {
      case 0:
        const requiredFields = ['responsavel_nome', 'responsavel_email', 'responsavel_numero', 
                              'jogador1_nome', 'jogador1_nascimento', 'jogador1_camisa',
                              'jogador2_nome', 'jogador2_nascimento', 'jogador2_camisa'];
        
        const camposPreenchidos = requiredFields.every(field => form[field]);
        if (!camposPreenchidos) return true;
        
        if (form.categorias.length === 0) return true;
        
        if (form.jogador1_nascimento && form.jogador2_nascimento) {
          // Verificar se há erros de validação
          if (errosValidacao.length > 0) return true;
          
          // Verificar vagas disponíveis
          const temVagas = form.categorias.every(categoriaId => {
            const vaga = vagas[categoriaId];
            return vaga && vaga.disponiveis > 0;
          });
          
          if (!temVagas) return true;
        }
        
        return false;
        
      case 1:
  return (
    !files.documento_jogador1 ||
    !files.documento_jogador2 ||
    !cienteErro ||
    !aceitaRegulamento
  );

        
      case 2:
        return !comprovanteFile;
        
      case 3:
        return false;
        
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const requiredFields = ['responsavel_nome', 'responsavel_email', 'responsavel_numero', 
                            'jogador1_nome', 'jogador1_nascimento', 'jogador1_camisa',
                            'jogador2_nome', 'jogador2_nascimento', 'jogador2_camisa'];
      
      if (form.categorias.length === 0) {
        setSnackbar({ open: true, message: 'Selecione pelo menos uma categoria.', severity: 'error' });
        return;
      }
      
      // Verificar erros de idade
      {errosValidacao.length > 0 && (
  <Alert severity="error" sx={{ mb: 3 }}>
    <Typography variant="subtitle2" fontWeight={600}>
      ⚠️ Restrições de idade identificadas:
    </Typography>
    <Box sx={{ mt: 1 }}>
      {errosValidacao.map((erro, index) => (
        <Box key={index} sx={{ mb: 1.5, p: 1.5, bgcolor: '#fff5f5', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight={600} color="error.main" sx={{ mb: 1 }}>
            {erro.categoria}
          </Typography>
          
          {erro.tipo === 'ambos_invalidos' ? (
            <>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#d32f2f' }}>
                • AMBOS OS JOGADORES NÃO PODEM PARTICIPAR
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, mb: 0.5, fontSize: '0.9rem' }}>
                ↳ {erro.detalhesJogador1}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, fontSize: '0.9rem' }}>
                ↳ {erro.detalhesJogador2}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ ml: 1 }}>
              • {erro.mensagem}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  </Alert>
)}
      
      // Verificar vagas disponíveis
      const categoriasSemVaga = form.categorias.filter(categoriaId => {
        const vaga = vagas[categoriaId];
        return !vaga || vaga.disponiveis === 0;
      });
      
      if (categoriasSemVaga.length > 0) {
        const primeiraSemVagaId = categoriasSemVaga[0];
        const categoria = categorias.find(c => c.id === parseInt(primeiraSemVagaId));
        setSnackbar({ 
          open: true, 
          message: `❌ ${categoria?.nome} ${categoria?.sexo} está sem vagas disponíveis!`,
          severity: 'error' 
        });
        return;
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
        // Criar inscrição na API
        const response = await api.criarInscricao(form);
        
        if (response.success) {
          setInscricaoData(response);
          
          // Calcular tempo restante
          if (response.expira_em) {
            const expiraEm = new Date(response.expira_em).getTime();
            setTimeLeft(calculateTimeLeft(expiraEm));
          }
          
          setPagamentoStatus('aguardando_pagamento');
          setSnackbar({ 
            open: true, 
            message: '✅ Inscrição criada com sucesso! Vagas reservadas por 30 minutos.', 
            severity: 'success' 
          });
          
          // Atualizar vagas localmente
          const novasVagas = { ...vagas };
          form.categorias.forEach(categoriaId => {
            if (novasVagas[categoriaId]) {
              novasVagas[categoriaId].ocupadas += 1;
              novasVagas[categoriaId].disponiveis = Math.max(0, novasVagas[categoriaId].disponiveis - 1);
            }
          });
          setVagas(novasVagas);
          
          // AGORA FAZ O UPLOAD DOS DOCUMENTOS AQUI MESMO
          console.log('=== UPLOAD DOS DOCUMENTOS NA ETAPA 1 ===');
          
          // 1. Upload dos documentos dos jogadores
          if (files.documento_jogador1) {
            console.log('Upload documento jogador1...');
            await api.uploadFile(
              response.codigo_rastreio, 
              'documento_jogador1', 
              files.documento_jogador1
            );
          }
          
          if (files.documento_jogador2) {
            console.log('Upload documento jogador2...');
            await api.uploadFile(
              response.codigo_rastreio, 
              'documento_jogador2', 
              files.documento_jogador2
            );
          }
          
          setSnackbar({ 
            open: true, 
            message: '✅ Documentos enviados com sucesso! Prossiga para o pagamento.', 
            severity: 'success' 
          });
          
          setActiveStep(2);
        }
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.message || 'Erro ao criar inscrição ou enviar documentos', 
          severity: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (activeStep === 2) {
      if (!comprovanteFile) {
        setSnackbar({ open: true, message: 'Anexe o comprovante.', severity: 'error' });
        return;
      }
      
      if (!inscricaoData?.codigo_rastreio) {
        setSnackbar({ open: true, message: 'Código de rastreio não encontrado.', severity: 'error' });
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('=== UPLOAD DO COMPROVANTE NA ETAPA 2 ===');
        
        // Apenas upload do comprovante (documentos já foram enviados)
        console.log('Upload comprovante...');
        await api.uploadFile(
          inscricaoData.codigo_rastreio, 
          'comprovante', 
          comprovanteFile
        );
        
        // Completar inscrição
        const response = await api.completarInscricao(inscricaoData.codigo_rastreio);
        
        if (response.success) {
          setPagamentoStatus('pendente');
          setSnackbar({ 
            open: true, 
            message: '✅ Inscrição completada com sucesso! Aguarde a confirmação.', 
            severity: 'success' 
          });
          setActiveStep(3);
        }
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.message || 'Erro ao enviar comprovante', 
          severity: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (activeStep === 3) {
  router.replace('/');
  return;
}

  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
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

                <br>
                </br>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Email que você tenha acesso"
                    name="responsavel_email"
                    value={form.responsavel_email}
                    onChange={handleChange}
                    required
                    error={!form.responsavel_email}
                    helperText={!form.responsavel_email ? "Campo obrigatório" : ""}
                  />
                </Stack>

                <br>
                </br>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Número para contato"
                    name="responsavel_numero"
                    type="tel"
                    value={form.responsavel_numero}
                    onChange={handleChange}
                    required
                    error={!form.responsavel_numero}
                    helperText={!form.responsavel_numero ? "Campo obrigatório" : ""}
                    inputProps={{ maxLength: 15 }}
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
                {/* ALERTA DE ERROS DE VALIDAÇÃO */}
{errosValidacao.length > 0 && (
  <Alert severity="error" sx={{ mb: 3 }}>
    <Typography variant="subtitle2" fontWeight={600}>
      ⚠️ RESTRIÇÕES DE IDADE IDENTIFICADAS
    </Typography>
    <Box sx={{ mt: 1 }}>
      {errosValidacao.map((erro, index) => (
        <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: '#fff5f5', borderRadius: 1, border: '1px solid #ffcdd2' }}>
          <Typography variant="body2" fontWeight={600} color="error.main" sx={{ mb: 1 }}>
            {erro.categoria}
          </Typography>
          
          {erro.tipo === 'ambos_invalidos' ? (
            <>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#d32f2f', fontSize: '0.9rem' }}>
                🚫 AMBOS OS JOGADORES NÃO PODEM PARTICIPAR
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, mb: 0.5, fontSize: '0.9rem', color: '#666' }}>
                ↳ Jogador 1: {erro.detalhesJogador1}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, fontSize: '0.9rem', color: '#666' }}>
                ↳ Jogador 2: {erro.detalhesJogador2}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ ml: 1, fontSize: '0.9rem', color: '#666' }}>
              • {erro.mensagem}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  </Alert>
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
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
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

                {/* SELEÇÃO DE CATEGORIAS */}
<FormControl fullWidth sx={{ mb: 3 }}>
  <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Categorias</InputLabel>
  <Select
    multiple
    name="categorias"
    value={form.categorias}
    onChange={handleCategoriasChange}
    label="Categorias"
    sx={{
      '& .MuiSelect-select': {
        py: { xs: 1.25, sm: 1.5 },
        fontSize: { xs: '0.875rem', sm: '1rem' }
      }
    }}
    renderValue={(selected) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: { xs: 0.5, sm: 1 } }}>
        {selected.map((categoriaId) => {
          const categoria = categorias.find(c => c.id === parseInt(categoriaId));
          const temErro = errosValidacao.some(e => e.categoria === `${categoria?.nome} ${categoria?.sexo}`);
          const vaga = vagas[categoriaId];
          const semVaga = vaga && vaga.disponiveis === 0;
          
          return categoria ? (
            <Chip 
              key={categoriaId} 
              label={`${categoria.nome} ${categoria.sexo}`} 
              size="small"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                height: { xs: 22, sm: 24 },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
              color={semVaga ? "error" : temErro ? "warning" : "primary"}
              icon={semVaga ? <PeopleOutline fontSize="small" /> : temErro ? <Warning fontSize="small" /> : undefined}
            />
          ) : null;
        })}
      </Box>
    )}
  >
    {categorias.map((cat) => {
      // Verificar idade
      let validaParaJogador1 = true;
      let validaParaJogador2 = true;
      let motivoJogador1 = '';
      let motivoJogador2 = '';
      
      if (form.jogador1_nascimento) {
        const validacao = validarIdadeParaCategoria(idadeJogador1, cat, 1);
        validaParaJogador1 = validacao.valida;
        motivoJogador1 = validacao.motivo;
      }
      
      if (form.jogador2_nascimento) {
        const validacao = validarIdadeParaCategoria(idadeJogador2, cat, 2);
        validaParaJogador2 = validacao.valida;
        motivoJogador2 = validacao.motivo;
      }
      
      const vaga = vagas[cat.id];
      const temVaga = vaga && vaga.disponiveis > 0;
      
      // Open nunca é desabilitada por idade
      const disabledPorIdade = (!validaParaJogador1 || !validaParaJogador2) && cat.nome !== 'Open';
      const disabled = disabledPorIdade || !temVaga;
      
      // Verificar se AMBOS não podem
      const ambosInvalidos = !validaParaJogador1 && !validaParaJogador2;
      
      return (
        <MenuItem 
          key={cat.id} 
          value={cat.id}
          disabled={disabled}
          sx={{ 
            opacity: disabled ? 0.6 : 1,
            bgcolor: disabled ? '#f5f5f5' : 'transparent',
            py: { xs: 1.5, sm: 2 },
            '& .MuiCheckbox-root': {
              py: 0,
              mr: { xs: 1, sm: 2 }
            }
          }}
        >
          
          <ListItemText 
            primaryTypographyProps={{ 
              component: 'div',
              sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
            secondaryTypographyProps={{ 
              component: 'div',
              sx: { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
            }}
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography component="span" sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500 
                }}>
                  {cat.nome} {cat.sexo}
                </Typography>
                {!temVaga && <PeopleOutline color="error" sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                {disabledPorIdade && cat.nome !== 'Open' && <Warning color="error" sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              </Box>
            }
            secondary={
              <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mb: 0.5 }}>
                    {cat.idade_max ? `Até ${cat.idade_max} anos` : 'Qualquer idade'}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }} component="span">
                    R$ {cat.valor.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
                
                {/* INDICADOR DE VAGAS */}
                <VagasIndicator categoriaId={cat.id} />
                
                {/* MENSAGENS DE ERRO */}
                {disabledPorIdade && (
                  <Box sx={{ mt: 1 }}>
                    {ambosInvalidos ? (
                      <>
                        <Typography variant="caption" color="error" sx={{ 
                          display: 'block', 
                          mb: 0.5, 
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          OS JOGADORES NÃO PODEM PARTICIPAR
                        </Typography>
                        <Typography variant="caption" color="error" sx={{ 
                          display: 'block', 
                          ml: 1, 
                          mb: 0.5,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          • {motivoJogador1}
                        </Typography>
                        <Typography variant="caption" color="error" sx={{ 
                          display: 'block', 
                          ml: 1,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          • {motivoJogador2}
                        </Typography>
                      </>
                    ) : (
                      <>
                        {!validaParaJogador1 && (
                          <Typography variant="caption" color="error" sx={{ 
                            display: 'block', 
                            mb: 0.5,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
                            🚫 Jogador 1: {motivoJogador1}
                          </Typography>
                        )}
                        {!validaParaJogador2 && (
                          <Typography variant="caption" color="error" sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
                            🚫 Jogador 2: {motivoJogador2}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                )}
                
                {!temVaga && (
                  <Typography variant="caption" color="error" sx={{ 
                    display: 'block', 
                    mt: 1,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    ❌ Sem vagas disponíveis
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
    <Typography variant="caption" color="error" sx={{ 
      mt: 1, 
      display: 'block',
      fontSize: { xs: '0.75rem', sm: '0.875rem' }
    }}>
      Selecione pelo menos uma categoria
    </Typography>
  )}
</FormControl>
                {/* RESUMO DE VAGAS DISPONÍVEIS */}
                {form.categorias.length > 0 && (
                  <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: '#fff8e1', borderColor: '#ffb300' }}>
                    <Typography variant="subtitle2" color="#ff9800" gutterBottom fontWeight={600}>
                      <People sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      Vagas Disponíveis nas Categorias Selecionadas
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {form.categorias.map(categoriaId => {
                        const vaga = vagas[categoriaId];
                        const categoria = categorias.find(c => c.id === parseInt(categoriaId));
                        const disponivel = vaga && vaga.disponiveis > 0;
                        
                        return categoria ? (
                          <Grid item xs={6} sm={4} key={categoriaId}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: disponivel ? '#e8f5e9' : '#ffebee',
                              borderRadius: 1,
                              border: `1px solid ${disponivel ? '#4caf50' : '#f44336'}`
                            }}>
                              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                {categoria.nome} {categoria.sexo}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={disponivel ? "success.main" : "error"}>
                                  {disponivel ? `${vaga.disponiveis} vaga(s)` : 'ESGOTADO'}
                                </Typography>
                                {disponivel ? (
                                  <CheckCircle sx={{ fontSize: 14, color: '#4caf50' }} />
                                ) : (
                                  <Warning sx={{ fontSize: 14, color: '#f44336' }} />
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  </Card>
                )}

                {/* RESUMO DA SELEÇÃO DE CATEGORIAS */}
                {form.categorias.length > 0 && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resumo das Categorias Selecionadas:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {form.categorias.map(categoriaId => {
                        const cat = categorias.find(c => c.id === parseInt(categoriaId));
                        const temErro = errosValidacao.some(e => e.categoria === `${cat?.nome} ${cat?.sexo}`);
                        const vaga = vagas[categoriaId];
                        const disponivel = vaga && vaga.disponiveis > 0;
                        
                        return cat ? (
                          <Box key={categoriaId} sx={{ 
                            mb: 1, 
                            p: 1.5, 
                            borderRadius: 1, 
                            bgcolor: !disponivel ? '#ffebee' : temErro ? '#fff3e0' : 'transparent',
                            border: `1px solid ${!disponivel ? '#f44336' : temErro ? '#ff9800' : '#e0e0e0'}`
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box>
                                <Typography variant="body2" fontWeight={600} color={!disponivel ? 'error' : temErro ? 'warning.main' : 'inherit'}>
                                  {cat.nome} {cat.sexo}
                                  {!disponivel && <Warning fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />}
                                  {temErro && disponivel && <Warning fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />}
                                </Typography>
                                {vaga && (
                                  <Typography variant="caption" color={!disponivel ? "error" : "text.secondary"}>
                                    Vagas: {vaga.disponiveis}/{vaga.total} disponíveis
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body2" fontWeight={600}>
                                R$ {cat.valor.toFixed(2).replace('.', ',')}
                              </Typography>
                            </Box>
                            
                            {temErro && disponivel && (
                              <Alert severity="warning" sx={{ py: 0.5, my: 0.5 }}>
                                <Typography variant="caption">
                                  {errosValidacao.find(e => e.categoria === `${cat.nome} ${cat.sexo}`)?.jogador1Erro || 
                                   errosValidacao.find(e => e.categoria === `${cat.nome} ${cat.sexo}`)?.jogador2Erro}
                                </Typography>
                              </Alert>
                            )}
                            
                            {!disponivel && (
                              <Alert severity="error" sx={{ py: 0.5, my: 0.5 }}>
                                <Typography variant="caption">
                                  ❌ Esta categoria está sem vagas disponíveis
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        ) : null;
                      })}
                      
                      {/* RESUMO FINANCEIRO */}
                      {form.categorias.every(categoriaId => {
                        const vaga = vagas[categoriaId];
                        return vaga && vaga.disponiveis > 0;
                      }) && (
                        <>
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
                        </>
                      )}
                      
                      {/* ALERTA SE ALGUMA CATEGORIA ESTÁ SEM VAGA */}
                      {form.categorias.some(categoriaId => {
                        const vaga = vagas[categoriaId];
                        return vaga && vaga.disponiveis === 0;
                      }) && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ❌ Uma ou mais categorias selecionadas estão sem vagas. 
                            Remova as categorias esgotadas para prosseguir.
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </Card>
                )}
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
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Anexe os documentos dos jogadores para reservar as vagas.
              </Typography>
              
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
                        Anexe um documento com foto que comprove a idade (RG, CNH) OBS: Deve ser legível
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
                        Tamanho máximo: 2MB • Formatos: PDF, JPG, PNG
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

              <Divider sx={{ my: 4 }} />

<Box>
  <FormControlLabel
    control={
      <Checkbox
        checked={cienteErro}
        onChange={(e) => setCienteErro(e.target.checked)}
        color="primary"
      />
    }
    label={
      <Typography variant="body2">
        Declaro estar ciente de que qualquer erro nas informações da inscrição,
        anexos ou dados dos atletas é de responsabilidade do usuário e pode
        resultar na <strong>recusa da inscrição</strong>.
      </Typography>
    }
  />

  <FormControlLabel
    control={
      <Checkbox
        checked={aceitaRegulamento}
        onChange={(e) => setAceitaRegulamento(e.target.checked)}
        color="primary"
      />
    }
    label={
      <Typography variant="body2">
        Li e estou de acordo com o <strong>regulamento da competição</strong>.
      </Typography>
    }
  />

  {(!cienteErro || !aceitaRegulamento) && (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <Typography variant="caption">
        Para continuar, é obrigatório confirmar ciência sobre os erros de
        inscrição e aceitar o regulamento.
      </Typography>
    </Alert>
  )}
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
  SALVE ESTE CÓDIGO!
  <br />
  Ele será utilizado para acompanhar o status da sua inscrição.
  <br /><br />

  ⚠️ Atenção: este código não será exibido novamente caso você saia ou feche esta página.
  <br />
  Salve-o ou tire um print.
  <br /><br />

  ✅ Caso a página seja fechada, você poderá finalizar a inscrição (pagamento)
  <br />
  na área “Acompanhar Inscrição”, utilizando este código.
  <br /><br />

  ❌ Se perder o código, será necessário realizar uma nova inscrição.
</Typography>

                          </Alert>
                        </CardContent>
                      </Card>

                      {/* ALERTA DE TEMPO E VAGAS */}
                      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <HourglassEmpty sx={{ fontSize: 40, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              PAGUE EM ATÉ {timeLeft ? formatTime(timeLeft) : '30:00'}
                            </Typography>
                            <Typography variant="body2">
                              Suas vagas estão <strong>reservadas temporariamente</strong>. 
                              Após 30 minutos sem pagamento, as vagas serão liberadas para outras duplas.
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {form.categorias.map(categoriaId => {
                                const categoria = categorias.find(c => c.id === parseInt(categoriaId));
                                const vaga = vagas[categoriaId];
                                return categoria && vaga ? (
                                  <Chip 
                                    key={categoriaId}
                                    label={`${categoria.nome} ${categoria.sexo}: ${vaga.disponiveis}/${vaga.total}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : null;
                              })}
                            </Box>
                          </Box>
                        </Box>
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
                            {form.categorias.map(categoriaId => {
                              const categoria = categorias.find(c => c.id === parseInt(categoriaId));
                              const vaga = vagas[categoriaId];
                              return categoria ? (
                                <Typography key={categoriaId} variant="body2" sx={{ mb: 0.5 }}>
                                  • {categoria.nome} {categoria.sexo} {vaga && `(${vaga.disponiveis} vaga${vaga.disponiveis !== 1 ? 's' : ''} disponível${vaga.disponiveis !== 1 ? 'is' : ''})`}
                                </Typography>
                              ) : null;
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
                          Após realizar o pagamento via PIX, anexe o comprovante abaixo para confirmar suas vagas.
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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2,  textAlign: 'center' }}>
                        Tamanho máximo: 2MB • Formatos: PDF, JPG, PNG
                        </Typography>
                        
                        {!comprovanteFile && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              É obrigatório anexar o comprovante de pagamento para confirmar as vagas
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
                  {pagamentoStatus === 'pendente' ? 'PENDENTE' : 'PENDENTE'}
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
                    CÓDIGO DE INSCRIÇÃO
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 2, letterSpacing: 2 }}>
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
                      <Typography variant="caption" color="text.secondary">Email:</Typography>
                      <Typography variant="body1" fontWeight={600}>{form.responsavel_mail}</Typography>
                      <Typography variant="caption" color="text.secondary">Número:</Typography>
                      <Typography variant="body1" fontWeight={600}>{form.responsavel_numero}</Typography>
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
                        {form.categorias.map(categoriaId => {
                          const categoria = categorias.find(c => c.id === parseInt(categoriaId));
                          const vaga = vagas[categoriaId];
                          return categoria ? (
                            <Box key={categoriaId} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                • {categoria.nome} {categoria.sexo}
                              </Typography>
                              {vaga && (
                                <Typography variant="caption" color="text.secondary">
                                  Vagas: {vaga.disponiveis}/{vaga.total} disponíveis
                                </Typography>
                              )}
                            </Box>
                          ) : null;
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
    <Container maxWidth="lg" sx={{ 
  mt: { xs: 2, sm: 3, md: 4 }, 
  mb: { xs: 4, sm: 6, md: 8 },
  px: { xs: 1.5, sm: 2, md: 3 }
}}>
  <Box sx={{ 
    textAlign: 'center', 
    mb: { xs: 3, sm: 4 },
    px: { xs: 1, sm: 0 }
  }}>
    <HowToReg color="primary" sx={{ 
      fontSize: { xs: 50, sm: 60, md: 80 }, 
      mb: { xs: 2, sm: 3 }
    }} />
    <Typography 
      variant="h2" 
      fontWeight={900} 
      color="primary"
      sx={{
        fontSize: { 
          xs: '1.5rem', 
          sm: '2rem', 
          md: '2.5rem',
          lg: '3rem'
        },
        lineHeight: 1.2,
        wordBreak: 'break-word'
      }}
    >
      {activeStep === 2 ? 'PAGAMENTO' : 
       activeStep === 3 ? 'CONFIRMAÇÃO' : 
       'INSCRIÇÃO DA DUPLA'}
    </Typography>
  </Box>

  {/* STEPPER RESPONSIVO */}
  <Box sx={{ 
    mb: { xs: 4, sm: 5, md: 6 },
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: 4
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#ccc',
      borderRadius: 2
    }
  }}>
    <Stepper 
      activeStep={activeStep} 
      sx={{ 
        minWidth: 400,
        px: { xs: 0, sm: 2 },
        '& .MuiStep-root': {
          px: { xs: 1, sm: 1.5, md: 2 }
        }
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { 
                  xs: '0.7rem', 
                  sm: '0.8rem', 
                  md: '0.9rem' 
                },
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: 70, sm: 90, md: 120 }
              }
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>

  <Paper 
    elevation={2} 
    sx={{ 
      p: { 
        xs: 2,
        sm: 3,  
        md: 4
      }, 
      borderRadius: 3,
      mx: { xs: 0.5, sm: 0 }
    }}
  >
    {getStepContent(activeStep)}
    
    {/* ÁREA DOS BOTÕES - RESPONSIVA */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        justifyContent: activeStep < 2 ? 'space-between' : 'center',
        alignItems: 'center',
        mt: { xs: 3, sm: 4 },
        pt: { xs: 2, sm: 3 },
        borderTop: '1px solid #e0e0e0',
        gap: { xs: 2, sm: 0 }
      }}
    >
      {/* BOTÃO VOLTAR - Ajustado para mobile */}
      {activeStep < 2 && (
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || isLoading}
          variant="outlined"
          startIcon={<ArrowBack />}
          fullWidth={activeStep === 2}
          sx={{
            width: { 
              xs: activeStep === 2 ? '100%' : 'auto', 
              sm: 'auto' 
            },
            minWidth: { xs: 0, sm: 120 },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.25, sm: 1.5 }
          }}
        >
          {/* Texto responsivo para botão Voltar */}
           {width > 600 ? 'Voltar' : 'Voltar'} 
        </Button>
      )}

      {/* BOTÃO PRINCIPAL - Ajustado para mobile */}
      <Button
        variant="contained"
        onClick={handleNext}
        disabled={isNextButtonDisabled()}
        fullWidth={activeStep === 2}
        sx={{
          width: { 
            xs: activeStep === 2 ? '100%' : 'auto', 
            sm: 'auto' 
          },
          minWidth: { xs: 0, sm: 200 },
          px: { xs: 3, sm: 4 },
          py: { xs: 1.5, sm: 1.75 },
          fontSize: { xs: '0.9rem', sm: '1rem' },
          fontWeight: 600,
          whiteSpace: 'nowrap',
          order: { xs: -1, sm: 0 }
        }}
      >
        
        {isLoading
          ? 'Processando...'
          : activeStep === steps.length - 1
          ? 'Finalizar'
          : activeStep === 1
          ? width < 600
            ? 'Reservar Vagas'
            : 'Salvar e Reservar Vagas'
          : activeStep === 2
          ? width < 600
            ? 'Enviar'
            : 'Enviar Comprovante'
          : 'Próximo'}
      </Button>
    </Box>
  </Paper>

  {/* SNACKBAR RESPONSIVA */}
  <Snackbar 
    open={snackbar.open} 
    autoHideDuration={4000} 
    onClose={handleCloseSnackbar} 
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    sx={{
      '& .MuiSnackbarContent-root': {
        flexWrap: 'nowrap',
        maxWidth: { xs: '90vw', sm: '400px' }
      }
    }}
  >
    <Alert 
      onClose={handleCloseSnackbar} 
      severity={snackbar.severity}
      sx={{ 
        width: '100%',
        alignItems: 'center',
        '& .MuiAlert-message': {
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
</Container>
  );
}