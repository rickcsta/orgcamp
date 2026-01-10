'use client';

import { Box, Button, Typography, Container, Paper, Stack, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SecurityIcon from '@mui/icons-material/Security';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Link from 'next/link';

export default function DivulgacaoPage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* HERO COM IMAGEM */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundImage: "url('/imgprincipal.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Button
          component={Link}
          href="/inscricao"
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: { xs: 80, md: 120 },
            left: '50%',
            transform: 'translateX(-50%)',
            px: 7,
            py: 3,
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: 1,
            borderRadius: 4,
            color: '#fff',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFC400 100%)',
            boxShadow: `
              0 10px 30px rgba(0,0,0,0.35),
              inset 0 -2px 0 rgba(0,0,0,0.15)
            `,
            transition: 'all 0.35s ease',
            '&:hover': {
              transform: 'translateX(-50%) translateY(-4px)',
              boxShadow: `
                0 18px 40px rgba(0,0,0,0.45),
                0 0 25px rgba(255, 215, 0, 0.6)
              `,
              background: 'linear-gradient(135deg, #ca7300 0%, #ca7300 100%)',
            },
          }}
        >
          INSCREVA-SE AGORA
        </Button>
      </Box>

      {/* SEÇÃO SOBRE O EVENTO */}
      <Box 
        id="sobre" 
        sx={{ 
          minHeight: '100vh', 
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          backgroundColor: '#ffffff',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                color: '#1a1a1a',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              SOBRE O EVENTO
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6
              }}
            >
              Conheça a segunda edição do PERNAS NA AREIA
            </Typography>
          </Box>

          {/* CONTEÚDO PRINCIPAL COM VÍDEO E TEXTO */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={6}
            sx={{ mb: 8 }}
          >
            {/* VÍDEO */}
            <Box sx={{ flex: 1 }}>
              <Paper 
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#000',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* ESPAÇO PARA O VÍDEO */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail do vídeo ou player */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: "url('/video-thumbnail.jpg')", // Adicione uma thumbnail
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover .play-button': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(255, 215, 0, 0.9)',
                      }
                    }}
                  >
                    {/* Botão de play */}
                    <IconButton
                      className="play-button"
                      sx={{
                        backgroundColor: 'rgba(255, 215, 0, 0.8)',
                        color: '#fff',
                        width: 80,
                        height: 80,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#FFD700',
                        }
                      }}
                      onClick={() => {
                        // Adicione lógica para abrir o vídeo
                        // Ex: window.open('https://youtube.com/seu-video', '_blank')
                      }}
                    >
                      <PlayCircleOutlineIcon sx={{ fontSize: 50 }} />
                    </IconButton>
                  </Box>
                  
                  {/* Ou use um player de vídeo embutido */}
                  {/* 
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/SEU_VIDEO_ID"
                    title="Vídeo sobre o evento"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  */}
                </Box>
              </Paper>
              
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: '#666' }}>
                Assista ao vídeo da primeira edição
              </Typography>
            </Box>

            {/* INFORMAÇÕES DO EVENTO */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#1a1a1a' }}>
                SEGUNDA EDIÇÃO
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: '#555', lineHeight: 1.8 }}>
                O <strong>PERNAS NA AREIA</strong> é um evento esportivo que reúne amantes de vôlei
                em uma competição saudável e divertida. Em sua segunda edição, prometemos superar todas as expectativas.
              </Typography>
              
              <Stack spacing={3} sx={{ mb: 4 }}>
                {[
                  {
                    icon: <CalendarTodayIcon sx={{ color: '#FFD700' }} />,
                    title: 'DATA DO EVENTO',
                    description: '15-16 de Junho de 2024'
                  },
                  {
                    icon: <LocationOnIcon sx={{ color: '#FFD700' }} />,
                    title: 'LOCAL',
                    description: 'Praia do Futuro - Fortaleza/CE'
                  },
                  {
                    icon: <PeopleIcon sx={{ color: '#FFD700' }} />,
                    title: 'PARTICIPANTES',
                    description: '200 competidores + público'
                  },
                  {
                    icon: <EventIcon sx={{ color: '#FFD700' }} />,
                    title: 'DURAÇÃO',
                    description: '2 dias de competições e atividades'
                  }
                ].map((item, index) => (
                  <Box 
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#FFFDE7',
                      borderLeft: '4px solid #FFD700',
                    }}
                  >
                    <Box sx={{ fontSize: 28 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>


      {/* SEÇÃO DE REGULAMENTAÇÃO */}
      <Box 
        id="regulamentacao" 
        sx={{ 
          minHeight: '100vh', 
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          backgroundColor: '#f8f9fa',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                color: '#1a1a1a',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              REGULAMENTAÇÃO
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6
              }}
            >
              Conheça as regras oficiais do evento e garanta sua participação
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4}
            sx={{ mb: 8 }}
          >
            {/* CARTA DO DOCUMENTO PRINCIPAL */}
            <Paper 
              elevation={3}
              sx={{
                flex: 1,
                p: 5,
                borderRadius: 4,
                backgroundColor: 'white',
                border: '2px solid #FFD700',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: '#FFF9C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  border: '3px solid #FFD700'
                }}
              >
                <DescriptionIcon sx={{ fontSize: 50, color: '#F57C00' }} />
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                Documento Oficial
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                Regulamento completo da segunda edição do PERNAS NA AREIA com todas as regras, direitos e deveres dos participantes.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href="/regulamento-oficial.pdf" 
                  download="Regulamento_Pernas_Na_Areia_2024.pdf"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#1a1a1a',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: '#FFC400',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  BAIXAR PDF
                </Button>
              </Box>
              
              <Typography variant="caption" sx={{ mt: 4, color: '#999' }}>
                Tamanho: 2.5 MB
              </Typography>
            </Paper>

            {/* LISTA DE TÓPICOS IMPORTANTES */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1a1a1a' }}>
                Tópicos Importantes
              </Typography>
              
              <Stack spacing={3}>
                {[
                  {
                    icon: <ChecklistIcon sx={{ color: '#4CAF50' }} />,
                    title: 'Critérios de Avaliação',
                    description: 'Entenda como serão avaliados os participantes'
                  },
                  {
                    icon: <SecurityIcon sx={{ color: '#2196F3' }} />,
                    title: 'Segurança e Saúde',
                    description: 'Protocolos obrigatórios durante o evento'
                  },
                  {
                    icon: <ArticleIcon sx={{ color: '#FF9800' }} />,
                    title: 'Documentação Necessária',
                    description: 'Lista completa de documentos obrigatórios'
                  },
                  {
                    icon: <DescriptionIcon sx={{ color: '#9C27B0' }} />,
                    title: 'Termos e Condições',
                    description: 'Leia atentamente antes da inscrição'
                  }
                ].map((item, index) => (
                  <Paper 
                    key={index}
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#FFFDE7',
                      }
                    }}
                  >
                    <Box sx={{ fontSize: 32 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* AVISOS IMPORTANTES */}
          <Paper 
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: '#FFF3E0',
              borderLeft: '6px solid #FF9800',
              mt: 4
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#E65100' }}>
              ⚠️ ATENÇÃO
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • A leitura completa do regulamento é <strong>obrigatória</strong> para todos os participantes
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • O não cumprimento de qualquer item do regulamento poderá resultar em desclassificação
            </Typography>
            <Typography variant="body1">
              • Dúvidas sobre o regulamento devem ser encaminhadas para: 
              <strong> teste@teste.com</strong>
            </Typography>
          </Paper>

         
        </Container>
      </Box>
    </Box>
  );
}